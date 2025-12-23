// components/manage/AddSongForm.jsx
import { useState } from "react";
import styles from "../../styles/Home.module.css";

export default function AddSongForm({ onAdd }) {
  const [song_name, setName] = useState("");
  const [artist, setArtist] = useState("");
  const [language, setLanguage] = useState("国语");
  const [BVID, setBVID] = useState("");
  const [mood, setMood] = useState(""); // "" 或 "舰长点歌"

  const handleSubmit = () => {
    onAdd({
      song_name,
      artist,
      language,
      BVID,
      mood,
    });

    setName("");
    setArtist("");
    setLanguage("国语");
    setBVID("");
    setMood("");
  };

  return (
    <div className={styles.addSongRow}>
      <input
        className={styles.input}
        placeholder="歌名"
        value={song_name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className={styles.input}
        placeholder="歌手"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
      />

      <select
        className={styles.input}
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="国语">国语</option>
        <option value="日语">日语</option>
        <option value="英语">英语</option>
      </select>

      <input
        className={styles.input}
        placeholder="BVID"
        value={BVID}
        onChange={(e) => setBVID(e.target.value)}
      />

      {/* 舰长点歌 + 滑块开关 */}
      <div className={styles.addMoodWrap}>
        <span className={styles.moodLabel}>舰长点歌</span>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={mood === "舰长点歌"}
            onChange={(e) =>
              setMood(e.target.checked ? "舰长点歌" : "")
            }
          />
          <span className={styles.slider}></span>
        </label>
      </div>

      {/* 添加按钮在这一行最右侧 */}
      <button className={styles.btnBlueSmall} onClick={handleSubmit}>
        添加
      </button>
    </div>
  );
}
