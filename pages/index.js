import React, { useEffect, useState } from 'react'

import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'

import styles from '../styles/Home.module.css'

import { Button, Col, Container, Form, Offcanvas, Row, Table } from 'react-bootstrap'
import { toast } from 'react-toastify'
import copy from 'copy-to-clipboard'

import Banner from '../components/banner/Banner.component'
import BannerMobile from '../components/banner/BannerMobile.component'
import SongDetail from '../components/SongDetail.component'
import BiliPlayerModal from '../components/BiliPlayerModal.component'
import SongListFilter from '../components/SongListFilter.component'

import imageLoader from '../utils/ImageLoader'
import * as utils from '../utils/utils'
import { getMergedConfig, getMergedConfigClient } from '../lib/siteConfigStore'


export default function Home() {

  // ⭐ 歌单动态加载（替代 import JSON）
  const [musicList, setMusicList] = useState([]);
  const [siteConfig, setSiteConfig] = useState(getMergedConfig());

  //状态保存
  const [categorySelection, setCategorySelection] = useState({
    lang: "",
    initial: "",
    paid: false,
    remark: "",
    mood: "",
  });

  const [searchBox, setSearchBox] = useState("");
  const [showToTopButton, setToTopShowButton] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [modalPlayerShow, setPlayerModalShow] = useState(false);
  const [modalPlayerSongName, setPlayerModalSongName] = useState("");
  const [BVID, setBVID] = useState("");


  // ⭐ 动态加载 JSON（build 后仍可更新）
  // Load local config overrides (no backend)
  useEffect(() => {
    (async () => {
      const merged = await getMergedConfigClient();
      setSiteConfig(merged);
    })();
  }, []);

  useEffect(() => {
    async function loadSongs() {
      const res = await fetch("/api/getSongs");
      const data = await res.json();
      setMusicList(data.songs || []);
    }
    loadSongs();
  }, []);


  //监听滚动
  useEffect(() => {
    window.addEventListener("scroll", () => {
      setToTopShowButton(window.pageYOffset > 600);
    });
  }, []);


  //根据条件过滤
  const filteredSongList = musicList.filter(song =>
    (utils.include(song.song_name, searchBox) ||
      utils.include(song.language, searchBox) ||
      utils.include(song.remarks, searchBox) ||
      utils.include(song.artist, searchBox)) &&

    (categorySelection.lang !== ""
      ? song.language?.includes(categorySelection.lang)
      : true) &&

    (categorySelection.initial !== ""
      ? song.initial?.includes(categorySelection.initial)
      : true) &&

    (categorySelection.remark !== ""
      ? song.remarks?.toLowerCase().includes(categorySelection.remark)
      : true) &&

    (categorySelection.paid
      ? song.paid == 1
      : true) &&

    (categorySelection.mood !== ""
      ? song.mood?.includes(categorySelection.mood)
      : true)
  );


  //复制点歌
  const handleClickToCopy = (song) => {
    if (song.paid == 1) {
      copy("点歌 ￥" + song.song_name);
      toast.success(`付费曲目 ${song.song_name} 已复制`);
    } else {
      copy("点歌 " + song.song_name);
      toast.success(`${song.song_name} 已复制`);
    }
  };


  //各类过滤按钮
  const setLanguageState = (lang) => {
    setCategorySelection(prev => ({ ...prev, lang: prev.lang === lang ? "" : lang }));
  };

  const setInitialState = (initial) => {
    setCategorySelection(prev => ({ ...prev, initial: prev.initial === initial ? "" : initial }));
  };

  const setRemarkState = (remark) => {
    setCategorySelection(prev => ({ ...prev, remark: prev.remark === remark ? "" : remark }));
  };

  const setPaidState = () => {
    setCategorySelection(prev => ({ ...prev, paid: !prev.paid }));
  };

  const setMoodState = (mood) => {
    setCategorySelection(prev => ({ ...prev, mood: prev.mood === mood ? "" : mood }));
  };


  //随机选歌
  const handleRandomSong = () => {
    if (musicList.length === 0) return;
    let random = Math.floor(Math.random() * musicList.length);
    handleClickToCopy(musicList[random]);
  };


  //自我介绍开关
  const handleCloseIntro = () => setShowIntro(false);
  const handleShowIntro = () => setShowIntro(true);


  //顶部回滚
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  //打开播放器
  const showBiliPlayer = (song) => {
    setBVID(song.BVID);
    setPlayerModalShow(true);
    setPlayerModalSongName(song.song_name);
  };


  return (
    <div className={styles.outerContainer}>

      <Link href={"https://live.bilibili.com/" + siteConfig.BiliLiveRoomID} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#1D0C26" }}>
        <div className={styles.goToLiveDiv}>
            <div className={styles.cornerToggle}>
              <Image
                loader={imageLoader}
                src="assets/icon/bilibili_logo_padded.png"
                alt="去直播间"
                width={50}
                height={50}
              />
              <b><i>去直播间</i></b>
            </div>
          </div>
              </Link>


      <div className={styles.offCanvasToggleDiv} onClick={handleShowIntro}>
        <div className={styles.cornerToggle}>
          <Image
            loader={imageLoader}
            src="assets/images/self_intro.webp"
            alt="自我介绍"
            width={50}
            height={50}
          />
          <b><i>自我介绍</i></b>
        </div>
      </div>


      <Container>
        <Head>
          <title>{siteConfig.Name}的歌单</title>
          <meta name="keywords" content="B站,bilibili,歌单" />
          <meta name="description" content={`${siteConfig.Name}的歌单`} />
          <link rel="icon" type="image/x-icon" href={siteConfig.FaviconImage || "/favicon.png"} />
        </Head>

        <section className={styles.main}>
          <Row>
            <Banner songCount={filteredSongList.length} config={siteConfig} />
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

          <Row>
            <Col xs={12} md={9}>
              <Form.Control
                className={styles.filters}
                type="search"
                placeholder="搜索"
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
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
              fill="currentColor" className="bi bi-chevron-up" viewBox="0 0 16 16">
              <path fillRule="evenodd"
                d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z" />
            </svg>
          </button>
        ) : <div></div>}


        <footer className={styles.footer}>
          {siteConfig.Footer}
        </footer>

      </Container>


      <Offcanvas show={showIntro} onHide={handleCloseIntro}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{siteConfig.Name}的自我介绍</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <BannerMobile config={siteConfig} />
        </Offcanvas.Body>
      </Offcanvas>


      <BiliPlayerModal
        show={modalPlayerShow}
        onHide={() => setPlayerModalShow(false)}
        bvid={BVID}
        modalPlayerSongName={modalPlayerSongName}
      />

    </div>
  );
}
