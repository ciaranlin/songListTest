import React, { useMemo, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import styles from "../../styles/Home.module.css";

/**
 * 角落快捷按钮：
 * - type=link: 外链
 * - type=intro: 弹出自我介绍（使用 config.BannerTitle + BannerContent）
 *
 * config.CornerActions 示例：
 * [
 *   { "id":"intro", "text":"自我介绍", "type":"intro", "position":"top-left" },
 *   { "id":"live", "text":"去直播间", "type":"link", "href":"https://xxx", "position":"top-right" }
 * ]
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

  const getPosClass = (position) => {
    switch (position) {
      case "top-left":
        return styles.cornerTopLeft;
      case "bottom-left":
        return styles.cornerBottomLeft;
      case "bottom-right":
        return styles.cornerBottomRight;
      case "top-right":
      default:
        return styles.cornerTopRight;
    }
  };

  return (
    <>
      {actions.map((a) => {
        const posClass = getPosClass(a.position);
        const iconSrc = a.iconUrl || a.icon || "";

        const content = (
          <span className={styles.cornerBtnInner}>
            {iconSrc ? (
              <img src={iconSrc} alt="" className={styles.cornerBtnIcon} />
            ) : null}
            <span>{a.text}</span>
          </span>
        );

        const isIntro = (a.type || "link") === "intro";

        // ✅ 关键：给 intro 单独加 styles.introBtn，方便桌面端隐藏“自我介绍”而不影响其他左上角按钮
        const className = `${styles.cornerBtn} ${posClass} ${isIntro ? styles.introBtn : ""}`;

        if (isIntro) {
          return (
            <button
              key={a.id || a.text}
              type="button"
              className={className}
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
            href={a.href || a.link || "#"}
            target="_blank"
            rel="noreferrer"
            className={className}
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
            <div style={{ opacity: 0.7 }}>
              （暂无介绍内容，可在配置里设置 BannerTitle / BannerContent）
            </div>
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
