import React from "react";
import Link from "next/link";
import { Button } from "react-bootstrap";

import styles from "../../styles/Home.module.css";
import ChevronSVG from "../ChevronSVG.component";

export default function BannerButton({ link, image, name, style }) {
  const hasIcon = typeof image === "string" && image.trim().length > 0;

  return (
    <Link href={link || "#"} target="_blank" rel="noopener noreferrer">
      <Button className={styles.bannerBtn} style={style}>
        <span className={styles.bannerBtnInner}>
          {hasIcon ? (
            <img
              className={styles.bannerBtnIcon}
              src={image}
              alt=""
              loading="lazy"
              draggable={false}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : null}

          <span className={styles.bannerBtnText}>{name}</span>

          <span className={styles.bannerBtnChevron} aria-hidden="true">
            <ChevronSVG />
          </span>
        </span>
      </Button>
    </Link>
  );
}
