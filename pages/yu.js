// pages/yu.js
import { useEffect, useMemo, useState, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { Container, Table, Button } from "react-bootstrap";
import { toast } from "react-toastify";

import manageStyles from "../styles/Manage.module.css";
import homeStyles from "../styles/Home.module.css";

import AddSongForm from "../components/manage/AddSongForm";
import SongRow from "../components/manage/SongRow";
import { getMergedConfig, getMergedConfigClient } from "../lib/siteConfigStore";

export default function SongManager() {
  const [songs, setSongs] = useState([]);
  const [siteConfig, setSiteConfig] = useState(getMergedConfig());

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const merged = await getMergedConfigClient();
        if (mounted) setSiteConfig(merged);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const backgroundImageUrl = useMemo(() => {
    return siteConfig?.BackgroundImage || "/assets/images/background.webp";
  }, [siteConfig]);

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

  const handleChange = useCallback((index, key, value) => {
    setSongs((prev) => prev.map((song) => (song.index === index ? { ...song, [key]: value } : song)));
  }, []);

  const handleUpdate = useCallback(
    async (song) => {
      const res = await fetch("/api/updateSong", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(song),
      });
      const data = await res.json().catch(() => ({}));
      toast.success(data.message || "修改成功！");
      fetchSongs();
    },
    [fetchSongs]
  );

  const handleDelete = useCallback(
    async (index) => {
      if (!confirm("确定删除？")) return;
      const res = await fetch("/api/deleteSong", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index }),
      });
      const data = await res.json().catch(() => ({}));
      toast.warn(data.message || "删除成功！");
      fetchSongs();
    },
    [fetchSongs]
  );

  const handleAdd = useCallback(
    async (payload) => {
      const res = await fetch("/api/addSong", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      toast.success(data.message || "添加成功！");
      fetchSongs();
    },
    [fetchSongs]
  );

  return (
    <div
      className={manageStyles.page}
      style={{
        background: "var(--yu-bg, #111827)",
        color: "var(--yu-text, rgba(255,255,255,0.92))",
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Head>
        <title>歌单管理</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <Container className={manageStyles.container}>
        <div className={manageStyles.title}>歌单管理</div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <Link
            href="/config"
            onClick={() => {
              try {
                window.localStorage.setItem("adminEnabled", "true");
              } catch {}
            }}
            style={{ textDecoration: "none" }}
          >
            <Button variant="outline-light" size="sm">⚙️ 配置</Button>
          </Link>

          <Link href="/" style={{ textDecoration: "none" }}>
            <Button variant="outline-light" size="sm">🏠 返回首页</Button>
          </Link>
        </div>

        <section className={manageStyles.section}>
          <div className={manageStyles.sectionHeader}>
            <div>
              <div className={manageStyles.sectionTitle}>歌曲编辑</div>
              <div className={manageStyles.sectionHint}>增删改歌单数据（与首页实时同步）</div>
            </div>
          </div>

          <div className={homeStyles.songListMarco} style={{ marginTop: 10 }}>
            <AddSongForm onAdd={handleAdd} />
            <Container fluid>
              <Table responsive className={homeStyles.tableWrapper}>
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
        </section>
      </Container>
    </div>
  );
}
