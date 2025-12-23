// pages/yu.js
import { useEffect, useMemo, useState, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { Container, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";

import styles from "../styles/Manage.module.css";
import homeStyles from "../styles/Home.module.css"; // ✅ 复用主页同款 backToTop 样式
import { getMergedConfig, getMergedConfigClient } from "../lib/siteConfigStore";

export default function SongManager() {
  const [songs, setSongs] = useState([]);
  const [siteConfig, setSiteConfig] = useState(getMergedConfig());

  // 语言筛选（仅影响列表展示，不改变功能）
  const [langFilter, setLangFilter] = useState("全部");

  // 新增行
  const [newSong, setNewSong] = useState({
    song_name: "",
    artist: "",
    language: "国语",
    BVID: "",
    mood: "",
  });

  // ✅ 返回顶部按钮显示控制（与主页行为一致）
  const [showTop, setShowTop] = useState(false);

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

  const languageOptions = useMemo(() => {
    const cfg = Array.isArray(siteConfig?.LanguageCategories)
      ? siteConfig.LanguageCategories
      : [];
    const base = ["国语"];
    const merged = [...base, ...cfg].filter(Boolean);
    // 去重
    return Array.from(new Set(merged));
  }, [siteConfig]);

  useEffect(() => {
    // 配置变了，默认语言兜底
    setNewSong((prev) => ({
      ...prev,
      language: prev.language || (languageOptions[0] || "国语"),
    }));
  }, [languageOptions]);

  const fetchSongs = useCallback(async () => {
    try {
      const res = await fetch("/api/getSongs");
      const data = await res.json();
      setSongs(data.songs || []);
    } catch (e) {
      toast.error("获取歌单失败");
    }
  }, []);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  const handleChange = useCallback((index, key, value) => {
    setSongs((prev) =>
      prev.map((song) =>
        song.index === index ? { ...song, [key]: value } : song
      )
    );
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
    async () => {
      const payload = {
        song_name: (newSong.song_name || "").trim(),
        artist: (newSong.artist || "").trim(),
        language: (newSong.language || "").trim(),
        BVID: (newSong.BVID || "").trim(),
        mood: (newSong.mood || "").trim(),
      };

      if (!payload.song_name) return toast.info("请填写歌名");
      if (!payload.artist) return toast.info("请填写歌手");
      if (!payload.language) return toast.info("请选择语言");

      const res = await fetch("/api/addSong", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      toast.success(data.message || "添加成功！");
      setNewSong({
        song_name: "",
        artist: "",
        language: languageOptions[0] || "国语",
        BVID: "",
        mood: "",
      });
      fetchSongs();
    },
    [newSong, fetchSongs, languageOptions]
  );

  const filteredSongs = useMemo(() => {
    if (langFilter === "全部") return songs;
    return songs.filter((s) => (s.language || "") === langFilter);
  }, [songs, langFilter]);

  // ✅ 监听滚动：超过 300px 显示（与主页同逻辑）
  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 300);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const backToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={styles.yuPage}>
      <Head>
        <title>歌单管理</title>
      </Head>

      <Container className={styles.container}>
        <div className={styles.title}>歌单管理</div>
        <div className={styles.yuHint}>增删改歌单数据（与首页实时同步）</div>

        <div className={styles.toolbar}>
          <Link
            href="/config"
            onClick={() => {
              try {
                window.localStorage.setItem("adminEnabled", "true");
              } catch {}
            }}
            style={{ textDecoration: "none" }}
          >
            <Button variant="outline-light" size="sm">
              ⚙️ 配置
            </Button>
          </Link>

          <Link href="/" style={{ textDecoration: "none" }}>
            <Button variant="outline-light" size="sm">
              🏠 返回首页
            </Button>
          </Link>

          <div style={{ flex: 1 }} />

          <Form.Select
            size="sm"
            className={styles.inputLite} // ✅ 让下拉也吃到你日间输入框样式
            style={{ maxWidth: 220 }}
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
          >
            <option value="全部">全部语言</option>
            {languageOptions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </Form.Select>
        </div>

        <div className={styles.kpiRow}>
          <div className={styles.kpi}>总歌曲：{songs.length}</div>
          <div className={styles.kpi}>当前显示：{filteredSongs.length}</div>
          <div className={styles.kpi}>语言选项：{languageOptions.length}</div>
        </div>

        {/* 新增（卡片内一行表单，视觉与配置页一致） */}
        <section className={styles.section} style={{ marginTop: 14 }}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionTitle}>新增歌曲</div>
              <div className={styles.sectionHint}>填写后点击添加</div>
            </div>
          </div>

          <div className={styles.tableCard}>
            <div className={styles.tableHead}>
              <div className={styles.yuHint}>快速新增</div>
            </div>

            <div className={styles.tableBody}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: 70 }}>Index</th>
                    <th>歌名</th>
                    <th>歌手</th>
                    <th style={{ width: 120 }}>语言</th>
                    <th style={{ width: 170 }}>BVID</th>
                    <th style={{ width: 140 }}>舰长点歌</th>
                    <th style={{ width: 160, textAlign: "right" }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={styles.rowAlt}>
                    <td style={{ color: "rgba(255,255,255,0.55)" }}>新增</td>

                    <td>
                      <input
                        className={styles.inputLite}
                        value={newSong.song_name}
                        placeholder="歌名"
                        onChange={(e) =>
                          setNewSong((p) => ({ ...p, song_name: e.target.value }))
                        }
                      />
                    </td>

                    <td>
                      <input
                        className={styles.inputLite}
                        value={newSong.artist}
                        placeholder="歌手"
                        onChange={(e) =>
                          setNewSong((p) => ({ ...p, artist: e.target.value }))
                        }
                      />
                    </td>

                    <td>
                      <select
                        className={styles.inputLite}
                        value={newSong.language}
                        onChange={(e) =>
                          setNewSong((p) => ({ ...p, language: e.target.value }))
                        }
                      >
                        {languageOptions.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <input
                        className={styles.inputLite}
                        value={newSong.BVID}
                        placeholder="BV..."
                        onChange={(e) =>
                          setNewSong((p) => ({ ...p, BVID: e.target.value }))
                        }
                      />
                    </td>

                    <td>
                      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input
                          type="checkbox"
                          checked={newSong.mood === "舰长点歌"}
                          onChange={(e) =>
                            setNewSong((p) => ({
                              ...p,
                              mood: e.target.checked ? "舰长点歌" : "",
                            }))
                          }
                        />
                        <span className={styles.yuHint}>是</span>
                      </label>
                    </td>

                    <td>
                      <div className={styles.actionRow}>
                        <Button size="sm" variant="success" onClick={handleAdd}>
                          添加
                        </Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 列表编辑 */}
        <section className={styles.section} style={{ marginTop: 14 }}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionTitle}>歌曲编辑</div>
              <div className={styles.sectionHint}>直接编辑后点击“修改”，支持删除</div>
            </div>
          </div>

          <div className={styles.tableCard}>
            <div className={styles.tableHead}>
              <div className={styles.yuHint}>按语言筛选仅影响展示，不会改数据</div>
              <Button size="sm" variant="outline-light" onClick={fetchSongs}>
                刷新
              </Button>
            </div>

            <div className={styles.tableBody}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: 70 }}>Index</th>
                    <th>歌名</th>
                    <th>歌手</th>
                    <th style={{ width: 120 }}>语言</th>
                    <th style={{ width: 170 }}>BVID</th>
                    <th style={{ width: 140 }}>舰长点歌</th>
                    <th style={{ width: 160, textAlign: "right" }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSongs.map((song, i) => (
                    <tr key={song.index} className={i % 2 === 1 ? styles.rowAlt : ""}>
                      <td>{song.index}</td>

                      <td>
                        <input
                          className={styles.inputLite}
                          value={song.song_name}
                          onChange={(e) => handleChange(song.index, "song_name", e.target.value)}
                        />
                      </td>

                      <td>
                        <input
                          className={styles.inputLite}
                          value={song.artist}
                          onChange={(e) => handleChange(song.index, "artist", e.target.value)}
                        />
                      </td>

                      <td>
                        <select
                          className={styles.inputLite}
                          value={song.language}
                          onChange={(e) => handleChange(song.index, "language", e.target.value)}
                        >
                          {languageOptions.map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <input
                          className={styles.inputLite}
                          value={song.BVID || ""}
                          onChange={(e) => handleChange(song.index, "BVID", e.target.value)}
                        />
                      </td>

                      <td>
                        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input
                            type="checkbox"
                            checked={song.mood === "舰长点歌"}
                            onChange={(e) =>
                              handleChange(song.index, "mood", e.target.checked ? "舰长点歌" : "")
                            }
                          />
                          <span className={styles.yuHint}>是</span>
                        </label>
                      </td>

                      <td>
                        <div className={styles.actionRow}>
                          <Button
                            size="sm"
                            variant="outline-light"
                            onClick={() => handleUpdate(song)}
                          >
                            修改
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(song.index)}
                          >
                            删除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </Container>

      {/* ✅ 返回顶部（与主页同一个样式 class：Home.module.css 里的 backToTop） */}
      {showTop ? (
        <button
          type="button"
          className={homeStyles.backToTop}
          onClick={backToTop}
          title="返回顶部"
          aria-label="返回顶部"
        >
          ↑
        </button>
      ) : null}
    </div>
  );
}
