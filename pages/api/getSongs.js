import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), "public", "music_list.json");
  try {
    const songs = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.status(200).json({ songs });
  } catch (err) {
    res.status(200).json({ songs: [] });
  }
}
