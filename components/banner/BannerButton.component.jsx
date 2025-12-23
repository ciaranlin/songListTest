import React from "react";
import Link from "next/link";

import styles from "../../styles/Home.module.css";

import ChevronSVG from "../ChevronSVG.component";

import { Button } from "react-bootstrap";

export default function BannerButton({
    link,
    image,
    name,
    style
}) {
  return (
    <Link href={link} target="_blank" rel="noopener noreferrer">
      <Button
          className={styles.customRandomButton}
          style={style}
        >
          <img className={styles.biliIcon} src={image} /> {name}{" "}
          <ChevronSVG />
        </Button>
    </Link>
  );
}
