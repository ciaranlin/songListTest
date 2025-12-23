import SongRow from "./SongRow";
import styles from "../../styles/Home.module.css";

export default function SongTable({ songs, onChange, onUpdate, onDelete }) {
  return (
    <div className={styles.manageCard}>
      <table className={styles.manageTable}>
        <thead>
          <tr>
            <th>Index</th>
            <th>歌名</th>
            <th>歌手</th>
            <th>语言</th>
            <th>BVID</th>
            <th>舰长点歌</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((s) => (
            <SongRow
              key={s.index}
              song={s}
              onChange={onChange}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
