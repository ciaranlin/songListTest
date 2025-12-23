// pages/config.js
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import styles from "../styles/Manage.module.css";

import {
  getDefaultConfig,
  getMergedConfigClient,
  saveConfigToServer,
  resetServerConfig,
  exportConfigToFile,
  importConfigFromFile,
} from "../lib/siteConfigStore";

export default function ConfigPage() {
  const router = useRouter();

  const defaultConfig = useMemo(() => getDefaultConfig(), []);
  const [form, setForm] = useState(() => getDefaultConfig());
  const [saving, setSaving] = useState(false);

  // Load server runtime config (if exists)
  useEffect(() => {
    (async () => {
      const merged = await getMergedConfigClient();
      setForm(merged);
    })();
  }, []);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

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

  const onSave = async () => {
    try {
      setSaving(true);
      await saveConfigToServer(form);
      toast.success("已保存到服务器：public/site-config.json（立即生效，刷新页面即可看到）。");
    } catch (e) {
      toast.error(String(e?.message || "保存失败"));
    } finally {
      setSaving(false);
    }
  };

  const onReset = async () => {
    if (!confirm("确认恢复为默认配置？会删除服务器上的 site-config.json 并回退到 constants.js。")) return;
    try {
      setSaving(true);
      await resetServerConfig();
      const merged = await getMergedConfigClient();
      setForm(merged);
      toast.success("已重置为默认配置。");
    } catch (e) {
      toast.error(String(e?.message || "重置失败"));
    } finally {
      setSaving(false);
    }
  };

  const onExport = () => {
    exportConfigToFile(form, "site-config.json");
    toast.success("已导出：site-config.json");
  };

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importConfigFromFile(file);
      setForm((prev) => ({ ...prev, ...data }));
      toast.success("已载入 JSON，记得点击「保存」写入服务器。");
    } catch {
      toast.error("导入失败：JSON 无效。");
    } finally {
      e.target.value = "";
    }
  };

  // ===== Upload image to /public/uploads, keep 1 previous version =====
  const uploadImage = async (key, file) => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(`/api/upload?key=${encodeURIComponent(key)}`, {
      method: "POST",
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "上传失败");
    return data;
  };

  const onPickImage = async (e, key) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSaving(true);
      const data = await uploadImage(key, file);

      setForm((prev) => {
        const prevKey = `${key}Prev`;
        const next = { ...prev, [key]: data.path };
        // keep one previous version (server returns prevPath if moved)
        if (data.prevPath) next[prevKey] = data.prevPath;
        else if (prev[key] && prev[key] !== data.path) next[prevKey] = prev[key];
        return next;
      });

      toast.success("图片已上传（已保留上一版）。记得点击「保存」。");
    } catch (err) {
      toast.error(String(err?.message || "上传失败"));
    } finally {
      setSaving(false);
      e.target.value = "";
    }
  };

  // Server-side rollback: swap current <-> prev on disk, then update form paths
  const restorePrevImage = async (key) => {
    try {
      setSaving(true);
      const res = await fetch(`/api/assets/rollback?key=${encodeURIComponent(key)}`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "回退失败");

      setForm((prev) => ({
        ...prev,
        [key]: data.path || "",
        [`${key}Prev`]: data.prevPath || "",
      }));

      toast.success("已回退到上一版图片（服务器已切换）。记得点击「保存」。");
    } catch (err) {
      toast.error(String(err?.message || "回退失败"));
    } finally {
      setSaving(false);
    }
  };

  // Server-side clear: delete current file on disk, keep prev by default
  const clearImage = async (key) => {
    try {
      setSaving(true);
      const res = await fetch(`/api/assets/clear?key=${encodeURIComponent(key)}`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "清除失败");

      setForm((prev) => ({
        ...prev,
        [key]: "",
        [`${key}Prev`]: data.prevPath || prev[`${key}Prev`] || "",
      }));

      toast.success("已清除当前图片（服务器已删除当前文件）。记得点击「保存」。");
    } catch (err) {
      toast.error(String(err?.message || "清除失败"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <Head>
        <title>配置页</title>
      </Head>

      <Container>
        <h1 className={styles.title}>⚙️ 配置页</h1>
        <div style={{ color: "#666", marginBottom: 16 }}>
          这里的修改会写入服务器文件 <code>public/site-config.json</code>，全站读取时会<strong>优先使用它</strong>；
          如果没有该文件，会自动回退到 <code>config/constants.js</code> 默认配置。
        </div>

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
                <Form.Label>Banner 文案（每行一条）</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={Array.isArray(form.BannerContent) ? form.BannerContent.join("\n") : ""}
                  onChange={(e) => update("BannerContent", e.target.value.split(/\r?\n/).filter(Boolean))}
                  placeholder={(defaultConfig.BannerContent || []).join("\n")}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <hr />
              <h3 style={{ marginBottom: 8 }}>自定义按钮（CustomButtons）</h3>
              <div style={{ color: "#666", marginBottom: 10 }}>
                每行一个按钮：名称 / 链接 / 图标路径（建议放到 public/assets 或 public/uploads）
              </div>

              {(form.CustomButtons || []).map((btn, idx) => (
                <Row key={idx} className="g-2" style={{ marginBottom: 8 }}>
                  <Col md={3}>
                    <Form.Control
                      value={btn.name || ""}
                      placeholder="名称"
                      onChange={(e) => updateButton(idx, "name", e.target.value)}
                    />
                  </Col>
                  <Col md={5}>
                    <Form.Control
                      value={btn.link || ""}
                      placeholder="https://..."
                      onChange={(e) => updateButton(idx, "link", e.target.value)}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Control
                      value={btn.image || ""}
                      placeholder="/assets/icon/xxx.png 或 /uploads/xxx.png"
                      onChange={(e) => updateButton(idx, "image", e.target.value)}
                    />
                  </Col>
                  <Col md={1}>
                    <Button variant="outline-danger" onClick={() => removeButton(idx)}>
                      删除
                    </Button>
                  </Col>
                </Row>
              ))}

              <Button variant="outline-primary" onClick={addButton}>
                + 新增按钮
              </Button>
            </Col>

            <Col md={12}>
              <hr />
              <h3 style={{ marginBottom: 12 }}>图片上传（写入 public/uploads，保留上一版）</h3>


              {/* BannerImage */}
              <Row className="g-2" style={{ alignItems: "center" }}>
                <Col md={3}>
                  <Form.Label style={{ marginBottom: 0 }}>BannerImage</Form.Label>
                </Col>
                <Col md={5}>
                  <Form.Control type="file" accept="image/*" onChange={(e) => onPickImage(e, "BannerImage")} />
                </Col>
                <Col md={4} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {form.BannerImage ? (
                    <img src={form.BannerImage} alt="BannerImage" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
                  ) : (
                    <span style={{ color: "#999" }}>未设置</span>
                  )}
                  <Button size="sm" variant="outline-danger" onClick={() => clearImage("BannerImage")}>
                    清除
                  </Button>
                  <Button size="sm" variant="outline-secondary" disabled={!form.BannerImagePrev} onClick={() => restorePrevImage("BannerImage")}>
                    返回上一版
                  </Button>
                </Col>
              </Row>

              <div style={{ height: 10 }} />

              {/* BackgroundImage */}
              <Row className="g-2" style={{ alignItems: "center" }}>
                <Col md={3}>
                  <Form.Label style={{ marginBottom: 0 }}>BackgroundImage</Form.Label>
                </Col>
                <Col md={5}>
                  <Form.Control type="file" accept="image/*" onChange={(e) => onPickImage(e, "BackgroundImage")} />
                </Col>
                <Col md={4} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {form.BackgroundImage ? (
                    <img src={form.BackgroundImage} alt="BackgroundImage" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
                  ) : (
                    <span style={{ color: "#999" }}>未设置</span>
                  )}
                  <Button size="sm" variant="outline-danger" onClick={() => clearImage("BackgroundImage")}>
                    清除
                  </Button>
                  <Button size="sm" variant="outline-secondary" disabled={!form.BackgroundImagePrev} onClick={() => restorePrevImage("BackgroundImage")}>
                    返回上一版
                  </Button>
                </Col>
              </Row>

              <div style={{ height: 10 }} />

              {/* Logo */}

              <Row className="g-2" style={{ alignItems: "center" }}>
                <Col md={3}>
                  <Form.Label style={{ marginBottom: 0 }}>LogoImage</Form.Label>
                </Col>
                <Col md={5}>
                  <Form.Control type="file" accept="image/*" onChange={(e) => onPickImage(e, "LogoImage")} />
                </Col>
                <Col md={4} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {form.LogoImage ? <img src={form.LogoImage} alt="logo" style={{ height: 44, borderRadius: 10 }} /> : <span style={{ color: "#999" }}>未设置</span>}
                  <Button size="sm" variant="outline-danger" onClick={() => clearImage("LogoImage")}>清除</Button>
                  <Button size="sm" variant="outline-secondary" disabled={!form.LogoImagePrev} onClick={() => restorePrevImage("LogoImage")}>返回上一版</Button>
                </Col>
              </Row>

              <div style={{ height: 12 }} />

              {/* Gif */}
              <Row className="g-2" style={{ alignItems: "center" }}>
                <Col md={3}>
                  <Form.Label style={{ marginBottom: 0 }}>GifImage</Form.Label>
                </Col>
                <Col md={5}>
                  <Form.Control type="file" accept="image/*" onChange={(e) => onPickImage(e, "GifImage")} />
                </Col>
                <Col md={4} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {form.GifImage ? <img src={form.GifImage} alt="gif" style={{ height: 54, borderRadius: 10 }} /> : <span style={{ color: "#999" }}>未设置</span>}
                  <Button size="sm" variant="outline-danger" onClick={() => clearImage("GifImage")}>清除</Button>
                  <Button size="sm" variant="outline-secondary" disabled={!form.GifImagePrev} onClick={() => restorePrevImage("GifImage")}>返回上一版</Button>
                </Col>
              </Row>

              <div style={{ height: 12 }} />

              {/* Favicon */}
              <Row className="g-2" style={{ alignItems: "center" }}>
                <Col md={3}>
                  <Form.Label style={{ marginBottom: 0 }}>FaviconImage</Form.Label>
                </Col>
                <Col md={5}>
                  <Form.Control type="file" accept="image/*" onChange={(e) => onPickImage(e, "FaviconImage")} />
                </Col>
                <Col md={4} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {form.FaviconImage ? <img src={form.FaviconImage} alt="favicon" style={{ height: 32, borderRadius: 8 }} /> : <span style={{ color: "#999" }}>未设置</span>}
                  <Button size="sm" variant="outline-danger" onClick={() => clearImage("FaviconImage")}>清除</Button>
                  <Button size="sm" variant="outline-secondary" disabled={!form.FaviconImagePrev} onClick={() => restorePrevImage("FaviconImage")}>返回上一版</Button>
                </Col>
              </Row>
            </Col>

            <Col md={12}>
              <hr />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button onClick={onSave} disabled={saving}>{saving ? "处理中..." : "保存"}</Button>
                <Button variant="outline-secondary" onClick={onReset} disabled={saving}>恢复默认</Button>
                <Button variant="outline-dark" onClick={onExport}>导出 JSON</Button>

                <label className="btn btn-outline-primary" style={{ marginBottom: 0 }}>
                  选择文件导入
                  <input type="file" accept="application/json" onChange={onImport} hidden />
                </label>

                <Button variant="outline-secondary" onClick={() => router.push("/")}>返回首页</Button>
              </div>

              <div style={{ marginTop: 10, color: "#888", fontSize: 12 }}>
                提示：图片会上传到 <code>public/uploads</code>，配置页保存会写入 <code>public/site-config.json</code>。
                在开发模式下刷新即可生效；生产环境同样会立即生效（无缓存时）。若你用了 CDN/反代缓存，需要为 <code>/site-config.json</code> 关闭缓存或加缓存刷新策略。
              </div>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
}
