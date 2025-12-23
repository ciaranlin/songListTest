// pages/yu.js
import { useEffect, useMemo, useState, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { Container, Table } from "react-bootstrap";

import styles from "../styles/Home.module.css";
import AddSongForm from "../components/manage/AddSongForm";
import SongRow from "../components/manage/SongRow";

// toast
import { toast } from "react-toastify";

import { getMergedConfig, getMergedConfigClient } from "../lib/siteConfigStore";

export default function SongManager() {
  const [songs, setSongs] = useState([]);
  const [siteConfig, setSiteConfig] = useState(getMergedConfig());

  // 加载运行时配置（与首页一致：配置页改完即可生效）
  useEffect(() => {
    let mounted = true;
    (async () => {
      const merged = await getMergedConfigClient();
      if (mounted) setSiteConfig(merged);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const backgroundImageUrl = useMemo(() => {
    return siteConfig?.BackgroundImage || "/assets/images/background.webp";
  }, [siteConfig]);

  // 加载歌单
  const fetchSongs = useCallback(async () => {
    try {
      const res = await fetch("/api/getSongs");
      const data = await res.json();
      setSongs(data.songs || []);
    } catch {
      setSongs([]);
    }
  }, []);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  // 本地更新状态
  const handleChange = useCallback((index, key, value) => {
    setSongs((prev) =>
      prev.map((song) => (song.index === index ? { ...song, [key]: value } : song))
    );
  }, []);

  // 修改
  const handleUpdate = useCallback(
    async (song) => {
      const res = await fetch("/api/updateSong", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(song),
      });
      const data = await res.json();
      toast.success(data.message || "修改成功！");
      fetchSongs();
    },
    [fetchSongs]
  );

  // 删除
  const handleDelete = useCallback(
    async (index) => {
      if (!confirm("确定删除？")) return;

      const res = await fetch("/api/deleteSong", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index }),
      });

      const data = await res.json();
      toast.warn(data.message || "删除成功！");
      fetchSongs();
    },
    [fetchSongs]
  );

  // 添加
  const handleAdd = useCallback(
    async (payload) => {
      const res = await fetch("/api/addSong", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      toast.success(data.message || "添加成功！");
      fetchSongs();
    },
    [fetchSongs]
  );

  return (
    <div
      className={styles.outerContainer}
      style={{
        paddingTop: "80px",
        paddingBottom: "40px",
        backgroundImage: `url(${backgroundImageUrl})`,
      }}
    >
      <Head>
        <title>🌟🐟の歌单管理</title>
        <meta name="robots" content="noindex,nofollow" />
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
          {/* 清理 <a href>：统一使用 Next Link（并保留你的 adminEnabled 逻辑） */}
          <Link
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
          </Link>
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
