import styles from "../../styles/Home.module.css";

export default function SongRow({ song, onChange, onUpdate, onDelete }) {
  // ⭐ 修复滑块跳回去的问题：只要非空就算开启
  const isCaptainSong =
    song.mood !== undefined &&
    song.mood !== null &&
    String(song.mood).trim() !== "";

  return (
    <tr>
      <td>{song.index}</td>

      <td>
        <input
          className={styles.input}
          value={song.song_name}
          onChange={(e) => onChange(song.index, "song_name", e.target.value)}
        />
      </td>

      <td>
        <input
          className={styles.input}
          value={song.artist}
          onChange={(e) => onChange(song.index, "artist", e.target.value)}
        />
      </td>

      <td>
        <select
          className={styles.input}
          value={song.language}
          onChange={(e) => onChange(song.index, "language", e.target.value)}
        >
          <option value="国语">国语</option>
          <option value="日语">日语</option>
          <option value="英语">英语</option>
        </select>
      </td>

      <td>
        <input
          className={styles.input}
          value={song.BVID || ""}
          onChange={(e) => onChange(song.index, "BVID", e.target.value)}
        />
      </td>

      {/* 舰长点歌滑块 */}
      <td className={styles.actionCell}>
        <div className={styles.switchWrapper}>
          <input
            type="checkbox"
            className={styles.switchInput}
            checked={isCaptainSong}                               // ⭐ 修复点
            onChange={(e) =>
              onChange(
                song.index,
                "mood",
                e.target.checked ? "舰长点歌" : ""                 // ⭐ 空字符串代表关闭
              )
            }
          />
        </div>
      </td>

      {/* 操作按钮 */}
      <td className={styles.actionCell}>
        <div className={styles.actionButtons}>
          <button className={styles.btnBlueSmall} onClick={() => onUpdate(song)}>
            修改
          </button>
          <button
            className={styles.btnRedSmall}
            onClick={() => onDelete(song.index)}
          >
            删除
          </button>
        </div>
      </td>
    </tr>
  );
}
