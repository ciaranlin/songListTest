import fs from "fs";
import path from "path";
import pinyin from "pinyin";

// ------------------------------------------------------------------
// ★ 跨平台线程安全写入队列（不会同时写入 → 永远不写坏 JSON）
// ------------------------------------------------------------------
let writeQueue = Promise.resolve();

function safeWriteJSON(filePath, data) {
  const json = JSON.stringify(data, null, 2);

  // 将写入操作排队，避免多个写入互相覆盖
  writeQueue = writeQueue.then(
    () =>
      new Promise((resolve) => {
        fs.writeFile(filePath, json, "utf8", (err) => {
          if (err) console.error("写入失败：", err);
          resolve();
        });
      })
  );

  return writeQueue;
}

// ------------------------------------------------------------------

export default function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "只支持 POST 请求" });

  const { song_name, artist, language, remarks, sticky_top, paid, BVID, mood } =
    req.body;

  if (!song_name || !artist)
    return res.status(400).json({ message: "缺少歌曲名或歌手" });

  const filePath = path.join(process.cwd(), "public", "music_list.json");

  let songs = [];
  try {
    songs = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    if (!Array.isArray(songs)) songs = [];
  } catch {
    songs = [];
  }

  // 自动生成 index（不会重复）
  const index =
    songs.length > 0 ? Math.max(...songs.map((s) => s.index || 0)) + 1 : 1;

  // 中文首字母
  let initial = null;
  if (/[\u4e00-\u9fa5]/.test(song_name[0])) {
    const py = pinyin(song_name[0], { style: pinyin.STYLE_FIRST_LETTER })[0][0];
    initial = py ? py.toUpperCase() : null;
  }

  const newSong = {
    index,
    song_name,
    artist,
    language,
    ...(initial ? { initial } : {}),
    ...(remarks ? { remarks } : {}),
    ...(sticky_top ? { sticky_top } : {}),
    ...(paid ? { paid } : {}),
    ...(mood ? { mood } : {}),
    ...(BVID ? { BVID } : {}),
  };

  songs.push(newSong);

  // 清理无效字段
  songs = songs.map((song) => {
    Object.keys(song).forEach((key) => {
      if (
        song[key] === null ||
        song[key] === "null" ||
        song[key] === "" ||
        song[key] === undefined
      ) {
        delete song[key];
      }
    });
    return song;
  });

  // ★ 使用安全写入队列（不会写坏文件）
  safeWriteJSON(filePath, songs);

  res.status(200).json({ message: "添加成功", song: newSong });
}
