import fs from "fs";
import path from "path";

// ------------------------------------------------------------
// ★ 全局写入队列（Write Queue）确保永不同时写入 JSON
// ------------------------------------------------------------
let writeQueue = Promise.resolve();

function safeWriteJSON(filePath, data) {
  const json = JSON.stringify(data, null, 2);

  // 将写任务加入队列（前一个写完，才执行下一个）
  writeQueue = writeQueue.then(
    () =>
      new Promise((resolve) => {
        fs.writeFile(filePath, json, "utf8", (err) => {
          if (err) console.error("JSON 写入失败：", err);
          resolve();
        });
      })
  );

  return writeQueue;
}

// ------------------------------------------------------------

export default function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "只支持 POST 请求" });

  const { index } = req.body;

  if (index == null)
    return res.status(400).json({ message: "缺少 index" });

  // ★ 前端立即响应（不卡 UI）
  res.status(200).json({
    message: `删除成功（后台处理中 index=${index}）`
  });

  // ★ 后台真正执行删除
  setTimeout(() => {
    try {
      const filePath = path.join(process.cwd(), "public", "music_list.json");

      let songs = [];
      try {
        songs = JSON.parse(fs.readFileSync(filePath, "utf8"));
        if (!Array.isArray(songs)) songs = [];
      } catch {
        songs = [];
      }

      // ------------------------------------------------------------
      // ★ 删除对应记录（不重排 index）
      // ------------------------------------------------------------
      let newSongs = songs.filter(song => song.index !== index);

      // 清除 null / "null"
      newSongs = newSongs.map(song => {
        const s = { ...song };
        Object.keys(s).forEach(key => {
          if (s[key] === null || s[key] === "null") delete s[key];
        });
        return s;
      });

      // ------------------------------------------------------------
      // ★ 使用全局队列写入（永不损坏 JSON）
      // ------------------------------------------------------------
      safeWriteJSON(filePath, newSongs);

      console.log(`后台删除成功 index=${index}`);
    } catch (err) {
      console.error("后台删除失败：", err);
    }
  }, 10);
}
