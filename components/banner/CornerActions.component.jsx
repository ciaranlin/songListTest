import React, { useMemo, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import styles from "../../styles/Home.module.css";

/**
 * 角落快捷按钮：
 * - type=link: 外链
 * - type=intro: 弹出自我介绍（使用 config.BannerTitle + BannerContent）
 */
export default function CornerActions({ config }) {
  const [showIntro, setShowIntro] = useState(false);

  const actions = useMemo(() => {
    const list = Array.isArray(config?.CornerActions) ? config.CornerActions : [];
    return list.filter((a) => a && a.text);
  }, [config]);

  if (!actions.length) return null;

  const openIntro = () => setShowIntro(true);
  const closeIntro = () => setShowIntro(false);

  return (
    <>
      {actions.map((a) => {
        const posClass =
          a.position === "top-left"
            ? styles.cornerTopLeft
            : a.position === "bottom-left"
            ? styles.cornerBottomLeft
            : a.position === "bottom-right"
            ? styles.cornerBottomRight
            : styles.cornerTopRight;

        const content = (
          <span className={styles.cornerBtnInner}>
            {a.icon ? <img src={a.icon} alt="" className={styles.cornerBtnIcon} /> : null}
            <span>{a.text}</span>
          </span>
        );

        if ((a.type || "link") === "intro") {
          return (
            <button
              key={a.id || a.text}
              type="button"
              className={`${styles.cornerBtn} ${posClass}`}
              onClick={openIntro}
              title={a.text}
            >
              {content}
            </button>
          );
        }

        return (
          <a
            key={a.id || a.text}
            href={a.href || "#"}
            target="_blank"
            rel="noreferrer"
            className={`${styles.cornerBtn} ${posClass}`}
            title={a.text}
          >
            {content}
          </a>
        );
      })}

      <Modal show={showIntro} onHide={closeIntro} centered>
        <Modal.Header closeButton>
          <Modal.Title>{config?.BannerTitle || "自我介绍"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {(config?.BannerContent || []).length ? (
            (config.BannerContent || []).map((t) => (
              <p key={t} style={{ marginBottom: 8 }}>
                {t}
              </p>
            ))
          ) : (
            <div style={{ opacity: 0.7 }}>（暂无介绍内容，可在配置里设置 BannerTitle / BannerContent）</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeIntro}>
            关闭
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
