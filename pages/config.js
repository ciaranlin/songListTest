// pages/config.js
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Alert, Button, Col, Container, Form, Row } from "react-bootstrap";
import styles from "../styles/Manage.module.css";

import {
  getDefaultConfig,
  getMergedConfig,
  replaceConfig,
  exportConfigToFile,
  importConfigFromFile,
  resetConfig,
} from "../lib/siteConfigStore";

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("read file failed"));
    reader.readAsDataURL(file);
  });
}

export default function ConfigPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(true);
  const [status, setStatus] = useState({ type: "", msg: "" });

  const defaultConfig = useMemo(() => getDefaultConfig(), []);
  const [form, setForm] = useState(() => getMergedConfig());

  // Light gate (no login): require localStorage.adminEnabled === 'true'
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ok = localStorage.getItem("adminEnabled") === "true";
    setAllowed(ok);
    if (!ok) {
      // keep the page simple: redirect home
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    setForm(getMergedConfig());
  }, []);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateButton = (idx, key, value) => {
    const next = Array.isArray(form.CustomButtons) ? [...form.CustomButtons] : [];
    next[idx] = { ...(next[idx] || { name: "", link: "", image: "" }), [key]: value };
    update("CustomButtons", next);
  };

  const addButton = () => {
    const next = Array.isArray(form.CustomButtons) ? [...form.CustomButtons] : [];
    next.push({ name: "", link: "", image: "" });
    update("CustomButtons", next);
  };

  const removeButton = (idx) => {
    const next = (form.CustomButtons || []).filter((_, i) => i !== idx);
    update("CustomButtons", next);
  };

  const onSave = () => {
    // Store only overrides (replaceConfig will sanitize keys)
    replaceConfig(form);
    setStatus({ type: "success", msg: "已保存，刷新/返回首页即可看到效果。" });
  };

  const onReset = () => {
    if (!confirm("确认恢复为默认配置？这会清空本地覆盖配置。")) return;
    resetConfig();
    setForm(getMergedConfig());
    setStatus({ type: "success", msg: "已恢复默认（已清空本地覆盖配置）。" });
  };

  const onExport = () => {
    exportConfigToFile();
    setStatus({ type: "success", msg: "已导出 JSON（仅包含本地覆盖配置）。" });
  };

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importConfigFromFile(file);
      setForm(getMergedConfig());
      setStatus({ type: "success", msg: "导入成功。" });
    } catch (err) {
      setStatus({ type: "danger", msg: "导入失败：JSON 无效或字段不合法。" });
    } finally {
      e.target.value = "";
    }
  };

  // ===== Image upload with previous version kept once =====
  const onPickImage = async (e, key, maxKB) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const kb = Math.round(file.size / 1024);
    if (maxKB && kb > maxKB) {
      setStatus({
        type: "warning",
        msg: `图片过大：${kb}KB，建议小于 ${maxKB}KB（localStorage 容量有限）。`,
      });
      e.target.value = "";
      return;
    }

    try {
      const dataUrl = await readFileAsDataURL(file);
      setForm((prev) => {
        const prevKey = `${key}Prev`;
        const current = prev[key] || "";
        // keep one previous version only when uploading a new different image
        const next = { ...prev, [key]: dataUrl };
        if (current && current !== dataUrl) {
          next[prevKey] = current;
        }
        return next;
      });
      setStatus({ type: "success", msg: "图片已读取，记得点击「保存」。" });
    } catch {
      setStatus({ type: "danger", msg: "读取图片失败，请重试。" });
    } finally {
      e.target.value = "";
    }
  };

  const restorePrevImage = (key) => {
    const prevKey = `${key}Prev`;
    setForm((prev) => {
      const cur = prev[key] || "";
      const old = prev[prevKey] || "";
      if (!old) return prev;
      // swap current and previous
      return { ...prev, [key]: old, [prevKey]: cur };
    });
    setStatus({ type: "success", msg: "已恢复上一版图片，记得点击「保存」。" });
  };

  const clearImage = (key) => {
    setForm((prev) => ({ ...prev, [key]: "" }));
    setStatus({ type: "success", msg: "已清除当前图片，记得点击「保存」。" });
  };

  if (!allowed) return null;

  return (
    <div className={styles.wrapper}>
      <Head>
        <title>配置页</title>
      </Head>

      <Container>
        <h1 className={styles.title}>⚙️ 配置页</h1>
        <div style={{ color: "#666", marginBottom: 16 }}>
          这里的修改会保存到浏览器 localStorage，并在全站生效（无需后台、无需登录）。
        </div>

        {status?.msg ? (
          <Alert variant={status.type || "info"} onClose={() => setStatus({ type: "", msg: "" })} dismissible>
            {status.msg}
          </Alert>
        ) : null}

        {/* ===== Basic fields ===== */}
        <Form>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>主播名（Name）</Form.Label>
                <Form.Control
                  value={form.Name || ""}
                  onChange={(e) => update("Name", e.target.value)}
                  placeholder={defaultConfig.Name || ""}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>B站直播间ID（BiliLiveRoomID）</Form.Label>
                <Form.Control
                  value={form.BiliLiveRoomID || ""}
                  onChange={(e) => update("BiliLiveRoomID", e.target.value)}
                  placeholder={defaultConfig.BiliLiveRoomID || ""}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>页脚文案（Footer）</Form.Label>
                <Form.Control
                  value={form.Footer || ""}
                  onChange={(e) => update("Footer", e.target.value)}
                  placeholder={defaultConfig.Footer || ""}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>网易云歌手ID（NetEaseMusicId，可选）</Form.Label>
                <Form.Control
                  value={form.NetEaseMusicId || ""}
                  onChange={(e) => update("NetEaseMusicId", e.target.value)}
                  placeholder={defaultConfig.NetEaseMusicId || ""}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>QQ音乐歌手ID（QQMusicId，可选）</Form.Label>
                <Form.Control
                  value={form.QQMusicId || ""}
                  onChange={(e) => update("QQMusicId", e.target.value)}
                  placeholder={defaultConfig.QQMusicId || ""}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Banner 标题（BannerTitle）</Form.Label>
                <Form.Control
                  value={form.BannerTitle || ""}
                  onChange={(e) => update("BannerTitle", e.target.value)}
                  placeholder={defaultConfig.BannerTitle || ""}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Banner 文案（每行一条，BannerContent）</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={(form.BannerContent || []).join("\n")}
                  onChange={(e) =>
                    update(
                      "BannerContent",
                      e.target.value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
                    )
                  }
                  placeholder={(defaultConfig.BannerContent || []).join("\n")}
                />
              </Form.Group>
            </Col>
          </Row>

          <hr style={{ margin: "22px 0" }} />

          {/* ===== Images upload (with one previous version kept) ===== */}
          <h4 style={{ fontWeight: 800, marginBottom: 12 }}>图片上传（保存到本地，可恢复上一版）</h4>
          <div style={{ color: "#777", marginBottom: 12, fontSize: 13 }}>
            注意：localStorage 容量有限，建议图片压缩后再上传（Logo &lt; 300KB，GIF &lt; 800KB，Favicon &lt; 80KB）。
          </div>

          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Logo 图片（LogoImage）</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={(e) => onPickImage(e, "LogoImage", 300)} />
                {form.LogoImage ? (
                  <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <img src={form.LogoImage} alt="logo" style={{ height: 44, borderRadius: 10 }} />
                    <Button size="sm" variant="outline-danger" onClick={() => clearImage("LogoImage")}>
                      清除当前
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      disabled={!form.LogoImagePrev}
                      onClick={() => restorePrevImage("LogoImage")}
                    >
                      恢复上一版
                    </Button>
                  </div>
                ) : (
                  <div style={{ marginTop: 8, color: "#888", fontSize: 13 }}>当前未设置</div>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>GIF 卡片图片（GifImage）</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={(e) => onPickImage(e, "GifImage", 800)} />
                {form.GifImage ? (
                  <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <img src={form.GifImage} alt="gif" style={{ height: 60, borderRadius: 10 }} />
                    <Button size="sm" variant="outline-danger" onClick={() => clearImage("GifImage")}>
                      清除当前
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      disabled={!form.GifImagePrev}
                      onClick={() => restorePrevImage("GifImage")}
                    >
                      恢复上一版
                    </Button>
                  </div>
                ) : (
                  <div style={{ marginTop: 8, color: "#888", fontSize: 13 }}>当前未设置（将使用默认 /assets/images/my.gif）</div>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Favicon 图片（FaviconImage）</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={(e) => onPickImage(e, "FaviconImage", 80)} />
                {form.FaviconImage ? (
                  <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <img src={form.FaviconImage} alt="favicon" style={{ height: 28, width: 28, borderRadius: 8 }} />
                    <Button size="sm" variant="outline-danger" onClick={() => clearImage("FaviconImage")}>
                      清除当前
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      disabled={!form.FaviconImagePrev}
                      onClick={() => restorePrevImage("FaviconImage")}
                    >
                      恢复上一版
                    </Button>
                  </div>
                ) : (
                  <div style={{ marginTop: 8, color: "#888", fontSize: 13 }}>当前未设置（将使用 /favicon.png）</div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <hr style={{ margin: "22px 0" }} />

          {/* ===== Custom buttons ===== */}
          <h4 style={{ fontWeight: 800, marginBottom: 12 }}>自定义按钮（CustomButtons）</h4>

          {(form.CustomButtons || []).map((btn, idx) => (
            <Row className="g-2" key={idx} style={{ marginBottom: 10 }}>
              <Col md={3}>
                <Form.Control
                  placeholder="按钮名称"
                  value={btn.name || ""}
                  onChange={(e) => updateButton(idx, "name", e.target.value)}
                />
              </Col>
              <Col md={5}>
                <Form.Control
                  placeholder="跳转链接 URL"
                  value={btn.link || ""}
                  onChange={(e) => updateButton(idx, "link", e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  placeholder="图标路径（/assets/...）或 URL"
                  value={btn.image || ""}
                  onChange={(e) => updateButton(idx, "image", e.target.value)}
                />
              </Col>
              <Col md={1} style={{ display: "flex" }}>
                <Button variant="outline-danger" onClick={() => removeButton(idx)} style={{ width: "100%" }}>
                  删除
                </Button>
              </Col>
            </Row>
          ))}

          <Button variant="outline-primary" onClick={addButton}>
            + 新增按钮
          </Button>

          <hr style={{ margin: "22px 0" }} />

          {/* ===== actions ===== */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Button variant="primary" onClick={onSave}>
              保存
            </Button>
            <Button variant="outline-secondary" onClick={onReset}>
              恢复默认
            </Button>
            <Button variant="outline-secondary" onClick={onExport}>
              导出 JSON
            </Button>
            <Form.Label style={{ margin: 0 }}>
              <Form.Control type="file" accept="application/json" onChange={onImport} />
            </Form.Label>
            <Button variant="outline-secondary" onClick={() => router.push("/")}>
              返回首页
            </Button>
          </div>

          <div style={{ marginTop: 10, color: "#777", fontSize: 13 }}>
            提示：导入会覆盖当前配置；导出仅包含你的本地覆盖配置（默认值不会写入）。
          </div>
        </Form>
      </Container>
    </div>
  );
}
