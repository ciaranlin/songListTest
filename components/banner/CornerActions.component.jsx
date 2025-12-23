import React, { useMemo, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import styles from "../../styles/Home.module.css";

/**
 * CornerActions - 角落快捷按钮
 *
 * 支持字段（兼容旧字段）：
 * - id: string
 * - text: string（必填）
 * - type: "link" | "intro"（默认 link）
 * - href / link: 外链地址（type=link 时使用）
 * - position: "top-left" | "top-right" | "bottom-left" | "bottom-right"（默认 top-right）
 * - iconUrl / icon: 图标地址（可选）
 * - showOnMobile: boolean（默认 true）
 * - showOnDesktop: boolean（默认 true）
 *
 * config.CornerActions 示例：
 * [
 *   { "id":"intro", "text":"自我介绍", "type":"intro", "position":"top-left", "showOnDesktop": false },
 *   { "id":"live", "text":"去直播间", "type":"link", "href":"https://xxx", "position":"top-left" }
 * ]
 */
export default function CornerActions({ config }) {
  const [showIntro, setShowIntro] = useState(false);

  const actions = useMemo(() => {
    const list = Array.isArray(config?.CornerActions) ? config.CornerActions : [];
    return list
      .filter((a) => a && a.text)
      .map((a) => ({
        ...a,
        // 默认都显示（不写就显示）
        showOnMobile: a.showOnMobile !== false,
        showOnDesktop: a.showOnDesktop !== false,
      }));
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

  // ✅ 关键：不依赖 cornerTopLeft/cornerTopRight 的 media rules 来“隐藏”
  // 而是对每个按钮独立加：mobileOnly / desktopOnly
  const getDeviceClass = (showOnMobile, showOnDesktop) => {
    if (showOnMobile && showOnDesktop) return "";
    if (showOnMobile && !showOnDesktop) return styles.mobileOnly;   // 只在移动端显示
    if (!showOnMobile && showOnDesktop) return styles.desktopOnly;  // 只在桌面端显示
    return styles.hiddenAlways; // 两端都不显示（极少用，防御性）
  };

  return (
    <>
      {actions.map((a) => {
        const posClass = getPosClass(a.position);
        const deviceClass = getDeviceClass(a.showOnMobile, a.showOnDesktop);

        const iconSrc = a.iconUrl || a.icon || "";
        const isIntro = (a.type || "link") === "intro";

        const content = (
          <span className={styles.cornerBtnInner}>
            {iconSrc ? (
              <img src={iconSrc} alt="" className={styles.cornerBtnIcon} />
            ) : null}
            <span>{a.text}</span>
          </span>
        );

        // ✅ introBtn 只用于“你可能想单独给自我介绍做样式/隐藏”，不再绑定 position 做隐藏
        const className = [
          styles.cornerBtn,
          posClass,
          deviceClass,
          isIntro ? styles.introBtn : "",
        ]
          .filter(Boolean)
          .join(" ");

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

        const href = a.href || a.link || "#";

        return (
          <a
            key={a.id || a.text}
            href={href}
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
            (config.BannerContent || []).map((t, idx) => (
              <p key={`${t}-${idx}`} style={{ marginBottom: 8 }}>
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
