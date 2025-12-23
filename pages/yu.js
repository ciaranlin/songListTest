// pages/yu.js
import { useEffect, useState } from "react";
import Head from "next/head";
import { Container, Table } from "react-bootstrap";

import styles from "../styles/Home.module.css";
import AddSongForm from "../components/manage/AddSongForm";
import SongRow from "../components/manage/SongRow";

// toast
import { toast } from "react-toastify";

export default function SongManager() {
  const [songs, setSongs] = useState([]);

  // 加载歌单
  const fetchSongs = async () => {
    const res = await fetch("/api/getSongs");
    const data = await res.json();
    setSongs(data.songs || []);
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  // 本地更新状态
  const handleChange = (index, key, value) => {
    setSongs((prev) =>
      prev.map((song) =>
        song.index === index ? { ...song, [key]: value } : song
      )
    );
  };

  // 修改
  const handleUpdate = async (song) => {
    const res = await fetch("/api/updateSong", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(song),
    });
    const data = await res.json();
    toast.success(data.message || "修改成功！");
    fetchSongs();
  };

  // 删除
  const handleDelete = async (index) => {
    if (!confirm("确定删除？")) return;

    const res = await fetch("/api/deleteSong", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index }),
    });

    const data = await res.json();
    toast.warn(data.message || "删除成功！");
    fetchSongs();
  };

  // 添加
  const handleAdd = async (payload) => {
    const res = await fetch("/api/addSong", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    toast.success(data.message || "添加成功！");
    fetchSongs();
  };

  return (
    <div
      style={{
        paddingTop: "80px",
        paddingBottom: "40px",
      }}
      className={styles.outerContainer}
    >
      <Head>
        <title>🌟🐟の歌单管理</title>
      </Head>

      <Container>
        {/* 大标题（后台专用） */}
        <h1
          style={{
            textAlign: "center",
            fontSize: "38px",
            fontWeight: 900,
            marginBottom: "50px",
            letterSpacing: "1px",
            color: "#333",
          }}
        >
          🌟🐟の歌单管理
        </h1>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <a
            href="/config"
            onClick={() => {
              // Enable config access (no login, local-only)
              try {
                window.localStorage.setItem("adminEnabled", "true");
              } catch {}
            }}
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: 10,
              textDecoration: "none",
              color: "#333",
              fontWeight: 700,
            }}
          >
            ⚙️ 配置
          </a>
        </div>

        {/* 白色卡片区域 */}
        <div className={styles.songListMarco}>
          <AddSongForm onAdd={handleAdd} />

          <Container fluid>
            <Table responsive className={styles.tableWrapper}>
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>Index</th>
                  <th>歌名</th>
                  <th>歌手</th>
                  <th>语言</th>
                  <th>BVID</th>
                  <th style={{ textAlign: "center" }}>舰长点歌</th>
                  <th style={{ width: "140px" }}>操作</th>
                </tr>
              </thead>

              <tbody>
                {songs.map((song) => (
                  <SongRow
                    key={song.index}
                    song={song}
                    onChange={handleChange}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </Table>
          </Container>
        </div>
      </Container>

    </div>
  );
}
