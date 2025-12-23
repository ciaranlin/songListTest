import React from "react";
import styles from "../../styles/Home.module.css";

import BannerButton from "./BannerButton.component";
import CornerActions from "./CornerActions.component";

export default function BannerMobile({ config }) {
  const bannerTitle = config?.BannerTitle || "日常碎碎念";
  const bannerContent = Array.isArray(config?.BannerContent) ? config.BannerContent : [];
  const customButtons = Array.isArray(config?.CustomButtons) ? config.CustomButtons : [];

  const gifImg =
    typeof config?.GifImage === "string" && config.GifImage.trim()
      ? config.GifImage.trim()
      : "";

  return (
    <>
      {/* 角落按钮：fixed 贴浏览器边（由 CSS 控制） */}
      <CornerActions config={config} />

      {/* 移动端内容区：把“碎碎念 + 按钮 + GIF”组合成同样的卡片（参考 vup-song-list 的移动端收纳思路） */}
      <div className={styles.bannerMobileWrap}>
        {/* 碎碎念卡片 */}
        <div className={styles.introBox}>
          <div className={styles.introBoxInnerDiv}>
            <div className={styles.introTitle}>
              <h5>{bannerTitle}</h5>
            </div>

            {bannerContent.map((cnt, index) => (
              <p className={styles.introParagraph} key={`banner-content-${index}`}>
                {cnt}
              </p>
            ))}

            <div className={styles.introButtonsRow}>
              {customButtons.map((btn, index) => (
                <BannerButton
                  key={`banner-btn-${btn.link || btn.name || index}`}
                  link={btn.link}
                  image={btn.image}
                  name={btn.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* GIF 卡片 */}
        {gifImg ? (
          <div className={styles.gifBox}>
            <div className={styles.gifBoxInnerDiv}>
              <img
                src={gifImg}
                alt="装饰GIF"
                className={styles.bannerGif}
                loading="lazy"
                draggable={false}
              />
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
