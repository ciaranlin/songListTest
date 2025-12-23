import fs from "fs";
import path from "path";
import pinyin from "pinyin";

export default function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "只支持 POST 请求" });

  const {
    index,
    song_name,
    artist,
    language,
    remarks,
    sticky_top,
    paid,
    BVID,
    mood,
  } = req.body;

  if (index == null)
    return res.status(400).json({ message: "缺少 index" });

  // ★ 不使用 setTimeout，立即读取文件
  const filePath = path.join(process.cwd(), "public", "music_list.json");

  let songs = [];
  try {
    songs = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (!Array.isArray(songs)) songs = [];
  } catch {
    songs = [];
  }

  const song = songs.find((s) => s.index === index);
  if (!song) return res.status(404).json({ message: "歌曲不存在" });

  // ------------------ 字段更新 ------------------
  if (song_name !== undefined) song.song_name = song_name;
  if (artist !== undefined) song.artist = artist;
  if (language !== undefined) song.language = language;
  if (remarks !== undefined) song.remarks = remarks;
  if (sticky_top !== undefined) song.sticky_top = sticky_top;
  if (paid !== undefined) song.paid = paid;

  // mood（舰长点歌）
  if (!mood) delete song.mood;
  else song.mood = "舰长点歌";

  // BVID
  if (BVID) song.BVID = BVID;
  else delete song.BVID;

  // 自动首字母
  if (song.song_name && /[\u4e00-\u9fa5]/.test(song.song_name[0])) {
    const py = pinyin(song.song_name[0], {
      style: pinyin.STYLE_FIRST_LETTER,
    })[0][0];
    song.initial = py?.toUpperCase();
  } else {
    delete song.initial;
  }

  // 清理无效字段
  songs = songs.map((s) => {
    Object.keys(s).forEach((key) => {
      if (s[key] === null || s[key] === "null" || s[key] === undefined)
        delete s[key];
    });
    return s;
  });

  // ★ 同步写入，确保前端下一次 fetchSongs() 读到最新数据
  fs.writeFileSync(filePath, JSON.stringify(songs, null, 2), "utf8");

  console.log(`updateSong 写入成功 index=${index}`);

  // ★ 现在才返回（保证数据已经落盘）
  res.status(200).json({ message: "修改成功！" });
}
