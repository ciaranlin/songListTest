import React from "react";
import Image from "next/image";

import styles from "../../styles/Home.module.css";
import { Col } from "react-bootstrap";

import imageLoader from "../../utils/ImageLoader";
import { getCursor } from "../../utils/utils";

import BannerButton from "./BannerButton.component";
import CornerActions from "./CornerActions.component";

export default function Banner({ songCount, config }) {
  const netEaseMusicComponent = (id) => {
    return id ? (
      <a
        href={"https://music.163.com/#/artist?id=" + id}
        target="_blank"
        rel="noopener noreferrer"
        title={config?.Name + "的网易云音乐主页"}
        style={{ marginRight: "1rem", cursor: getCursor() }}
      >
        <Image
          loader={imageLoader}
          src="/assets/icon/163_music.ico"
          alt={(config?.Name || "") + "的网易云音乐主页链接"}
          width={24}
          height={24}
        />
      </a>
    ) : (
      ""
    );
  };

  const qqMusicComponent = (id) => {
    return id ? (
      <a
        href={"https://y.qq.com/n/ryqq/singer/" + id}
        target="_blank"
        rel="noopener noreferrer"
        title={config?.Name + "的QQ音乐主页"}
        style={{ cursor: getCursor() }}
      >
        <Image
          loader={imageLoader}
          src="/assets/icon/qq_music.ico"
          alt={(config?.Name || "") + "的QQ音乐主页链接"}
          width={24}
          height={24}
        />
      </a>
    ) : (
      ""
    );
  };

  const bannerImg = config?.BannerImage || "/assets/images/banner_image.webp";
  const gifImg = config?.GifImage || "/assets/images/my.gif";

  return (
    <Col className={styles.titleCol}>
      {/* 顶部头像标题区 */}
      <div className={"pt-3 " + styles.titleBox}>
        <CornerActions config={config} />
        <Image
          loader={imageLoader}
          className={styles.avatar}
          src={bannerImg}
          alt="头图"
          width={250}
          height={250}
          priority
        />

        {gifImg ? (
          <img
            src={gifImg}
            alt="装饰GIF"
            className={styles.bannerGif}
          />
        ) : null}

        <h1 className={"display-6 text-center pt-3 " + styles.grandTitle}>
          {config?.Name}
        </h1>
        <h1 className={"display-6 text-center " + styles.grandTitle}>
          和她拿手的<b>{songCount}</b>首歌
        </h1>

        <p className="text-center py-3 mb-xl-5 text-muted">
          可以点击歌名复制哦
        </p>
      </div>

      {/* Banner 内部卡片 */}
      <div className={styles.introBox}>
        <div className={styles.introBoxInnerDiv}>
          <div className={styles.introTitle}>
            <h5>{config?.BannerTitle}</h5>

            {/* 网易云 & QQ音乐按钮 */}
            <div className="d-flex">
              {netEaseMusicComponent(config?.NetEaseMusicId)}
              {qqMusicComponent(config?.QQMusicId)}
            </div>
          </div>

          {/* 首页文本 */}
          {(config?.BannerContent || []).map((cnt) => (
            <p className={styles.introParagraph} key={cnt}>
              {cnt}
            </p>
          ))}

          {/* 自定义按钮 */}
          <div className="d-flex flex-nowrap justify-content-evenly">
            {(config?.CustomButtons || []).map((btn) => (
              <BannerButton
                key={btn.link}
                link={btn.link}
                image={btn.image}
                name={btn.name}
                style={{ marginTop: 0, border: "2px solid #DFD1E3" }}
              />
            ))}
          </div>

          {/* GIF 卡片 */}
          <div
            className="extra-card"
            style={{ textAlign: "center", marginTop: "20px" }}
          >
            <img
              src={gifImg}
              alt="gif-card"
              className="gif-image"
              style={{ width: "180px", borderRadius: "12px" }}
            />
          </div>
        </div>
      </div>
    </Col>
  );
}
