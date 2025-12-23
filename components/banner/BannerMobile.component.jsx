import React from "react";
import styles from "../../styles/Home.module.css";

import BannerButton from "./BannerButton.component";
import CornerActions from "./CornerActions.component";

export default function BannerMobile({ config }) {
  const bannerContent = Array.isArray(config?.BannerContent)
    ? config.BannerContent
    : [];

  const customButtons = Array.isArray(config?.CustomButtons)
    ? config.CustomButtons
    : [];

  return (
    <>
      {/* 角落按钮：fixed 贴浏览器边（由 CSS 控制） */}
      <CornerActions config={config} />

      {/* 移动端内容区：给角落按钮让出空间，避免遮挡 */}
      <div className={styles.bannerMobileWrap}>
        {bannerContent.map((cnt, index) => (
          <p className={styles.introParagraph} key={`banner-content-${index}`}>
            {cnt}
          </p>
        ))}

        {customButtons.map((btn, index) => (
          <BannerButton
            key={`banner-btn-${btn.link || btn.name || index}`}
            link={btn.link}
            image={btn.image}
            name={btn.name}
            style={{
              border: "2px solid #1D0C26",
              width: "100%",
            }}
          />
        ))}
      </div>
    </>
  );
}
