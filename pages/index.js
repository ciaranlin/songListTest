// pages/index.js
import React, { useEffect, useState, useMemo, useCallback } from "react";
import Head from "next/head";
import { Button, Col, Container, Form, Row, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import copy from "copy-to-clipboard";

import styles from "../styles/Home.module.css";

import Banner from "../components/banner/Banner.component";
import BannerMobile from "../components/banner/BannerMobile.component";
import SongDetail from "../components/SongDetail.component";
import BiliPlayerModal from "../components/BiliPlayerModal.component";
import SongListFilter from "../components/SongListFilter.component";

import * as utils from "../utils/utils";
import { getMergedConfig, getMergedConfigClient } from "../lib/siteConfigStore";

export default function Home() {
  // 歌单
  const [musicList, setMusicList] = useState([]);

  // 配置（SSR 先给默认，客户端再合并）
  const [siteConfig, setSiteConfig] = useState(getMergedConfig());

  // 过滤条件
  const [categorySelection, setCategorySelection] = useState({
    lang: "",
    initial: "",
    paid: false,
    remark: "",
    mood: "",
  });

  const [searchBox, setSearchBox] = useState("");
  const [showToTopButton, setToTopShowButton] = useState(false);

  // 播放器
  const [modalPlayerShow, setPlayerModalShow] = useState(false);
  const [modalPlayerSongName, setPlayerModalSongName] = useState("");
  const [BVID, setBVID] = useState("");

  // 客户端加载 config（保持 build 后仍可更新）
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const merged = await getMergedConfigClient();
        if (mounted) setSiteConfig(merged);
      } catch (e) {
        // 静默
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 动态加载 songs
  useEffect(() => {
    let aborted = false;
    async function loadSongs() {
      try {
        const res = await fetch("/api/getSongs");
        const data = await res.json();
        if (!aborted) setMusicList(data.songs || []);
      } catch (e) {
        if (!aborted) setMusicList([]);
      }
    }
    loadSongs();
    return () => {
      aborted = true;
    };
  }, []);

  // 监听滚动
  useEffect(() => {
    const onScroll = () => setToTopShowButton(window.pageYOffset > 600);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 背景图（配置优先）
  const backgroundImageUrl =
    siteConfig?.BackgroundImage || "/assets/images/background.webp";

  // 过滤歌曲
  const filteredSongList = useMemo(() => {
    return (musicList || []).filter((song) => {
      const hitSearch =
        utils.include(song.song_name, searchBox) ||
        utils.include(song.language, searchBox) ||
        utils.include(song.remarks, searchBox) ||
        utils.include(song.artist, searchBox);

      const hitLang =
        categorySelection.lang !== ""
          ? song.language?.includes(categorySelection.lang)
          : true;

      const hitInitial =
        categorySelection.initial !== ""
          ? song.initial?.includes(categorySelection.initial)
          : true;

      const hitRemark =
        categorySelection.remark !== ""
          ? (song.remarks || "").toLowerCase().includes(categorySelection.remark)
          : true;

      const hitPaid = categorySelection.paid ? song.paid == 1 : true;

      const hitMood =
        categorySelection.mood !== ""
          ? song.mood?.includes(categorySelection.mood)
          : true;

      return (
        hitSearch && hitLang && hitInitial && hitRemark && hitPaid && hitMood
      );
    });
  }, [musicList, searchBox, categorySelection]);

  // 复制点歌
  const handleClickToCopy = useCallback((song) => {
    if (song?.paid == 1) {
      copy("点歌 ￥" + song.song_name);
      toast.success(`付费曲目 ${song.song_name} 已复制`);
    } else {
      copy("点歌 " + song.song_name);
      toast.success(`${song.song_name} 已复制`);
    }
  }, []);

  // 各类过滤按钮
  const setLanguageState = useCallback((lang) => {
    setCategorySelection((prev) => ({
      ...prev,
      lang: prev.lang === lang ? "" : lang,
    }));
  }, []);

  const setInitialState = useCallback((initial) => {
    setCategorySelection((prev) => ({
      ...prev,
      initial: prev.initial === initial ? "" : initial,
    }));
  }, []);

  const setRemarkState = useCallback((remark) => {
    setCategorySelection((prev) => ({
      ...prev,
      remark: prev.remark === remark ? "" : remark,
    }));
  }, []);

  const setPaidState = useCallback(() => {
    setCategorySelection((prev) => ({ ...prev, paid: !prev.paid }));
  }, []);

  const setMoodState = useCallback((mood) => {
    setCategorySelection((prev) => ({
      ...prev,
      mood: prev.mood === mood ? "" : mood,
    }));
  }, []);

  // 随机选歌
  const handleRandomSong = useCallback(() => {
    if (!musicList || musicList.length === 0) return;
    const random = Math.floor(Math.random() * musicList.length);
    handleClickToCopy(musicList[random]);
  }, [musicList, handleClickToCopy]);

  // 顶部回滚
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // 打开播放器
  const showBiliPlayer = useCallback((song) => {
    setBVID(song.BVID);
    setPlayerModalShow(true);
    setPlayerModalSongName(song.song_name);
  }, []);

  return (
    <div
      className={styles.outerContainer}
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <Container>
        <Head>
          <title>{siteConfig?.Name || "歌单"}</title>
          <meta name="keywords" content="B站,bilibili,歌单" />
          <meta
            name="description"
            content={`${siteConfig?.Name || ""}的歌单`}
          />
          {/* 如果你已经在 _app.js 全局注入 favicon，这里可以删除 */}
          {/* <link rel="icon" href={siteConfig?.FaviconImage || "/favicon.ico"} /> */}
        </Head>

        <section className={styles.main}>
          <Row>
            <div className={styles.desktopOnly}>
              <Banner songCount={filteredSongList.length} config={siteConfig} />
            </div>
            <div className={styles.mobileOnly}>
              <BannerMobile config={siteConfig} />
            </div>
          </Row>

          <Row>
            <SongListFilter
              config={siteConfig}
              categorySelection={categorySelection}
              setLanguageState={setLanguageState}
              setRemarkState={setRemarkState}
              setPaidState={setPaidState}
              setInitialState={setInitialState}
              setMoodState={setMoodState}
            />
          </Row>

          <Row className="align-items-center">
            <Col xs={12} md={9} className="mb-2 mb-md-0">
              <Form.Control
                className={styles.filters}
                type="search"
                placeholder="搜索"
                value={searchBox}
                onChange={(e) => setSearchBox(e.target.value)}
              />
            </Col>
            <Col xs={12} md={3}>
              <div className="d-grid">
                <Button
                  className={styles.customRandomButton}
                  onClick={handleRandomSong}
                >
                  随便听听
                </Button>
              </div>
            </Col>
          </Row>

          <Row>
            <Col>
              <div className={styles.songListMarco}>
                <Container fluid>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th></th>
                        <th>歌名</th>
                        <th></th>
                        <th>歌手</th>
                        <th>语言</th>
                        <th>备注</th>
                      </tr>
                    </thead>
                    <tbody className="songList">
                      <SongDetail
                        filteredSongList={filteredSongList}
                        handleClickToCopy={handleClickToCopy}
                        showBiliPlayer={showBiliPlayer}
                      />
                    </tbody>
                  </Table>
                </Container>
              </div>
            </Col>
          </Row>
        </section>

        {showToTopButton ? (
          <button onClick={scrollToTop} className={styles.backToTopBtn}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-chevron-up"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"
              />
            </svg>
          </button>
        ) : null}

        <footer className={styles.footer}>{siteConfig?.Footer}</footer>

        <BiliPlayerModal
          show={modalPlayerShow}
          onHide={() => setPlayerModalShow(false)}
          bvid={BVID}
          modalPlayerSongName={modalPlayerSongName}
        />
      </Container>
    </div>
  );
}
