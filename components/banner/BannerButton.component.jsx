import React from "react";
import Link from "next/link";
import { Button } from "react-bootstrap";

import styles from "../../styles/Home.module.css";
import ChevronSVG from "../ChevronSVG.component";

export default function BannerButton({ link, image, name, style }) {
  const hasIcon = typeof image === "string" && image.trim().length > 0;

  return (
    <Link href={link || "#"} target="_blank" rel="noopener noreferrer">
      <Button className={styles.customRandomButton} style={style}>
        {/* ✅ 没图标就不渲染，避免出现占位小方块 */}
        {hasIcon ? (
          <img
            className={styles.bannerBtnIcon}
            src={image}
            alt=""
            loading="lazy"
            draggable={false}
            onError={(e) => {
              // ✅ 图片加载失败也隐藏，避免破图/占位
              e.currentTarget.style.display = "none";
            }}
          />
        ) : null}

        <span className={styles.bannerBtnText}>{name}</span>

        <span className={styles.bannerBtnChevron}>
          <ChevronSVG />
        </span>
      </Button>
    </Link>
  );
}
