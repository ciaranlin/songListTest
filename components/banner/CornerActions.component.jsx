import React, { useMemo, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import styles from "../../styles/Home.module.css";

export default function CornerActions({ config }) {
  const [showIntro, setShowIntro] = useState(false);

  const actions = useMemo(() => {
    const list = Array.isArray(config?.CornerActions) ? config.CornerActions : [];
    return list
      .filter((a) => a && a.text)
      .map((a) => ({
        ...a,
        position: a.position || "top-right",
        showOnMobile: a.showOnMobile !== false,
        showOnDesktop: a.showOnDesktop !== false,
        type: a.type || "link",
      }));
  }, [config]);

  const grouped = useMemo(() => {
    const g = {
      "top-left": [],
      "top-right": [],
      "bottom-left": [],
      "bottom-right": [],
    };
    actions.forEach((a) => {
      if (!g[a.position]) g[a.position] = [];
      g[a.position].push(a);
    });
    return g;
  }, [actions]);

  const getDeviceClass = (showOnMobile, showOnDesktop) => {
    if (showOnMobile && showOnDesktop) return "";
    if (showOnMobile && !showOnDesktop) return styles.mobileOnly;
    if (!showOnMobile && showOnDesktop) return styles.desktopOnly;
    return styles.hiddenAlways;
  };

  const getStackClass = (position) => {
    switch (position) {
      case "top-left":
        return styles.cornerStackTopLeft;
      case "top-right":
        return styles.cornerStackTopRight;
      case "bottom-left":
        return styles.cornerStackBottomLeft;
      case "bottom-right":
      default:
        return styles.cornerStackBottomRight;
    }
  };

  if (!actions.length) return null;

  const openIntro = () => setShowIntro(true);
  const closeIntro = () => setShowIntro(false);

  const renderAction = (a) => {
    const iconSrc = a.iconUrl || a.icon || "";
    const isIntro = a.type === "intro";
    const deviceClass = getDeviceClass(a.showOnMobile, a.showOnDesktop);

    const className = [
      styles.cornerBtn,
      deviceClass,
      isIntro ? styles.introBtn : "",
    ]
      .filter(Boolean)
      .join(" ");

    const content = (
      <span className={styles.cornerBtnInner}>
        {iconSrc ? <img src={iconSrc} alt="" className={styles.cornerBtnIcon} /> : null}
        <span>{a.text}</span>
      </span>
    );

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
  };

  return (
    <>
      {Object.entries(grouped).map(([pos, list]) => {
        if (!list.length) return null;
        return (
          <div key={pos} className={getStackClass(pos)}>
            {list.map(renderAction)}
          </div>
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