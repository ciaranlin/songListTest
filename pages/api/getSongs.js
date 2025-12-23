import fs from "fs";
import path from "path";

export default function handler(req, res) {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "music_list.json"
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        songs: [],
        error: "music_list.json not found",
      });
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    // 兼容两种结构：
    // 1) 直接是数组
    // 2) { songs: [] }
    const songs = Array.isArray(data)
      ? data
      : Array.isArray(data.songs)
      ? data.songs
      : [];

    return res.status(200).json({ songs });
  } catch (err) {
    console.error("getSongs error:", err);
    return res.status(500).json({
      songs: [],
      error: "failed to load songs",
    });
  }
}
