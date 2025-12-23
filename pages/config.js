// pages/config.js
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Button, Container, Form } from "react-bootstrap";
import { toast } from "react-toastify";

import styles from "../styles/Manage.module.css";
import AssetUploadRow from "../components/manage/AssetUploadRow";

import {
  getMergedConfigClient,
  getDefaultConfig,
  saveConfigToServer,
  resetServerConfig,
  exportConfigToFile,
  importConfigFromFile,
} from "../lib/siteConfigStore";

const POSITIONS = [
  { value: "top-left", label: "左上" },
  { value: "top-right", label: "右上" },
  { value: "bottom-left", label: "左下" },
  { value: "bottom-right", label: "右下" },
];

const THEME_PRESETS = [
  { name: "深海蓝", mainBg: "#0f172a", yuBg: "#111827", configBg: "#0b1220", accent: "#22c55e" },
  { name: "雾紫夜", mainBg: "#130b1e", yuBg: "#120a1b", configBg: "#0c0712", accent: "#a855f7" },
  { name: "暖灰砂", mainBg: "#18181b", yuBg: "#111113", configBg: "#0c0c0e", accent: "#f59e0b" },
  { name: "青黑森", mainBg: "#061a17", yuBg: "#071614", configBg: "#04110f", accent: "#2dd4bf" },
];

const LANG_QUICK = ["国语", "粤语", "日语", "英语", "韩语"];

export default function ConfigPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  // ========== API wrappers ==========
  const uploadImage = async (key, file) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/upload?key=${encodeURIComponent(key)}`, { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "上传失败");
    return data; // {path, prevPath}
  };

  const clearImage = async (key) => {
    const res = await fetch(`/api/assets/clear?key=${encodeURIComponent(key)}`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "清除失败");
    return data;
  };

  const rollbackImage = async (key) => {
    const res = await fetch(`/api/assets/rollback?key=${encodeURIComponent(key)}`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "回退失败");
    return data;
  };

  // ========== load ==========
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const merged = await getMergedConfigClient();
        if (!mounted) return;
        setForm(merged);
      } catch (e) {
        toast.error("读取配置失败");
        setForm(getDefaultConfig());
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const patch = (updater) => {
    setForm((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return { ...prev, ...next };
    });
  };

  const onSave = async () => {
    try {
      setSaving(true);
      await saveConfigToServer(form);
      toast.success("已保存到服务器（刷新页面即可看到效果）");
    } catch (e) {
      toast.error(String(e?.message || "保存失败"));
    } finally {
      setSaving(false);
    }
  };

  const onReset = async () => {
    if (!confirm("确认恢复默认？会删除服务器上的 site-config.json 并回退到 constants.js 默认值。")) return;
    try {
      await resetServerConfig();
      const merged = await getMergedConfigClient();
      setForm(merged);
      toast.success("已恢复默认");
    } catch (e) {
      toast.error(String(e?.message || "恢复失败"));
    }
  };

  const onExport = () => {
    exportConfigToFile(form);
    toast.success("已导出 JSON");
  };

  const onImport = async (e) => {
    try {
      const next = await importConfigFromFile(e.target.files?.[0]);
      setForm(next);
      toast.success("已导入（别忘了点保存）");
    } catch (err) {
      toast.error(String(err?.message || "导入失败"));
    } finally {
      e.target.value = "";
    }
  };

  const onBackHome = () => router.push("/");

  const theme = form?.Theme || {};
  const cornerActions = form?.CornerActions || [];
  const customButtons = form?.CustomButtons || [];
  const languageCategories = form?.LanguageCategories || [];

  // 帮你自动兜底：保证数组字段是数组
  useEffect(() => {
    if (!form) return;
    patch((prev) => ({
      CornerActions: Array.isArray(prev?.CornerActions) ? prev.CornerActions : [],
      CustomButtons: Array.isArray(prev?.CustomButtons) ? prev.CustomButtons : [],
      LanguageCategories: Array.isArray(prev?.LanguageCategories) ? prev.LanguageCategories : [],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const setThemeField = (k, v) => patch((prev) => ({ Theme: { ...(prev.Theme || {}), [k]: v } }));

  const addLang = (v) => {
    const val = String(v || "").trim();
    if (!val) return;
    patch((prev) => {
      const cur = Array.isArray(prev.LanguageCategories) ? prev.LanguageCategories : [];
      if (cur.includes(val)) return prev;
      return { LanguageCategories: [...cur, val] };
    });
  };

  const removeLang = (v) => patch((prev) => ({ LanguageCategories: (prev.LanguageCategories || []).filter((x) => x !== v) }));

  const addCornerAction = () => {
    patch((prev) => {
      const id = `a_${Date.now()}`;
      return {
        CornerActions: [
          ...(prev.CornerActions || []),
          { id, type: "link", text: "新按钮", href: "", position: "top-right", icon: "" },
        ],
      };
    });
  };

  const updateCornerAction = (id, updater) => {
    patch((prev) => ({
      CornerActions: (prev.CornerActions || []).map((a) => (a.id === id ? { ...a, ...updater } : a)),
    }));
  };

  const removeCornerAction = (id) => {
    patch((prev) => ({ CornerActions: (prev.CornerActions || []).filter((a) => a.id !== id) }));
  };

  const addCustomButton = () => {
    patch((prev) => {
      return {
        CustomButtons: [
          ...(prev.CustomButtons || []),
          { id: `b_${Date.now()}`, name: "新按钮", link: "", image: "" },
        ],
      };
    });
  };

  const updateCustomButton = (id, updater) => {
    patch((prev) => ({
      CustomButtons: (prev.CustomButtons || []).map((b) => (b.id === id ? { ...b, ...updater } : b)),
    }));
  };

  const removeCustomButton = (id) => patch((prev) => ({ CustomButtons: (prev.CustomButtons || []).filter((b) => b.id !== id) }));

  const presetsMemo = useMemo(() => THEME_PRESETS, []);

  if (loading || !form) {
    return (
      <div className={styles.page}>
        <Container className={styles.container}>
          <div className={styles.title}>配置中心</div>
          <div style={{ opacity: 0.75 }}>正在加载…</div>
        </Container>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Head>
        <title>配置中心</title>
      </Head>

      <Container className={styles.container}>
        <div className={styles.title}>配置中心（移动端适配）</div>

        {/* 角落快捷按钮 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionTitle}>角落快捷按钮</div>
              <div className={styles.sectionHint}>可配置“去直播间 / 自我介绍 / 外链”等，支持固定位置与图标上传</div>
            </div>
            <Button size="sm" variant="outline-light" onClick={addCornerAction}>
              + 新增
            </Button>
          </div>

          {(cornerActions || []).map((a) => (
            <div key={a.id} style={{ borderTop: "1px dashed rgba(255,255,255,0.15)", paddingTop: 12, marginTop: 12 }}>
              <div className={styles.grid2}>
                <Form.Group>
                  <Form.Label>按钮文案</Form.Label>
                  <Form.Control
                    value={a.text || ""}
                    onChange={(e) => updateCornerAction(a.id, { text: e.target.value })}
                    placeholder="例如：去直播间 / 自我介绍"
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>类型</Form.Label>
                  <Form.Select value={a.type || "link"} onChange={(e) => updateCornerAction(a.id, { type: e.target.value })}>
                    <option value="link">外链按钮</option>
                    <option value="intro">自我介绍（弹窗）</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group>
                  <Form.Label>固定位置</Form.Label>
                  <Form.Select value={a.position || "top-right"} onChange={(e) => updateCornerAction(a.id, { position: e.target.value })}>
                    {POSITIONS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group>
                  <Form.Label>跳转链接（外链按钮才需要）</Form.Label>
                  <Form.Control
                    value={a.href || ""}
                    onChange={(e) => updateCornerAction(a.id, { href: e.target.value })}
                    placeholder="https://..."
                    disabled={(a.type || "link") !== "link"}
                  />
                </Form.Group>
              </div>

              <AssetUploadRow
                label="按钮图标（可选）"
                assetKey={`corner_${a.id}`}
                value={a.icon || ""}
                prevValue={a.iconPrev || ""}
                helper="上传后会写入 public/uploads（支持清除/回退上一版）"
                upload={uploadImage}
                clear={clearImage}
                rollback={rollbackImage}
                onChange={(next, prev) => updateCornerAction(a.id, { icon: next, iconPrev: prev })}
              />

              <Button size="sm" variant="outline-danger" onClick={() => removeCornerAction(a.id)}>
                删除该按钮
              </Button>
            </div>
          ))}
        </section>

        {/* 图片资源：头图 / 背景 / LOGO / GIF / favicon */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionTitle}>图片资源</div>
              <div className={styles.sectionHint}>所有图片均支持：上传 / 清除 / 返回上一版</div>
            </div>
          </div>

          <AssetUploadRow
            label="头图（BannerImage）"
            assetKey="BannerImage"
            value={form.BannerImage || ""}
            prevValue={form.BannerImagePrev || ""}
            upload={uploadImage}
            clear={clearImage}
            rollback={rollbackImage}
            onChange={(next, prev) => patch({ BannerImage: next, BannerImagePrev: prev })}
          />

          {/* GIF：独立出来，并隐藏在 BannerImage 下方 */}
          <AssetUploadRow
            label="装饰 GIF（独立）"
            assetKey="GifImage"
            accept="image/gif,image/*"
            value={form.GifImage || ""}
            prevValue={form.GifImagePrev || ""}
            helper="GIF 会显示在头图下方（更隐蔽，不与粉丝群/录播组混在一起）"
            upload={uploadImage}
            clear={clearImage}
            rollback={rollbackImage}
            onChange={(next, prev) => patch({ GifImage: next, GifImagePrev: prev })}
          />

          <AssetUploadRow
            label="背景图片（BackgroundImage）"
            assetKey="BackgroundImage"
            value={form.BackgroundImage || ""}
            prevValue={form.BackgroundImagePrev || ""}
            upload={uploadImage}
            clear={clearImage}
            rollback={rollbackImage}
            onChange={(next, prev) => patch({ BackgroundImage: next, BackgroundImagePrev: prev })}
          />

          <AssetUploadRow
            label="LOGO/头像（LogoImage）"
            assetKey="LogoImage"
            value={form.LogoImage || ""}
            prevValue={form.LogoImagePrev || ""}
            upload={uploadImage}
            clear={clearImage}
            rollback={rollbackImage}
            onChange={(next, prev) => patch({ LogoImage: next, LogoImagePrev: prev })}
          />

          <AssetUploadRow
            label="网站图标（Favicon）"
            assetKey="FaviconImage"
            accept="image/x-icon,image/vnd.microsoft.icon,image/*"
            value={form.FaviconImage || ""}
            prevValue={form.FaviconImagePrev || ""}
            helper="保存后全站生效（所有页面共享）"
            upload={uploadImage}
            clear={clearImage}
            rollback={rollbackImage}
            onChange={(next, prev) => patch({ FaviconImage: next, FaviconImagePrev: prev })}
          />
        </section>

        {/* 自定义按钮（粉丝群/录播组等） */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionTitle}>自定义按钮（粉丝群 / 录播组等）</div>
              <div className={styles.sectionHint}>每个按钮支持：名称 / 链接 / 图标上传</div>
            </div>
            <Button size="sm" variant="outline-light" onClick={addCustomButton}>
              + 新增按钮
            </Button>
          </div>

          {(customButtons || []).map((b) => (
            <div key={b.id || b.name} style={{ borderTop: "1px dashed rgba(255,255,255,0.15)", paddingTop: 12, marginTop: 12 }}>
              <div className={styles.grid2}>
                <Form.Group>
                  <Form.Label>名称</Form.Label>
                  <Form.Control value={b.name || ""} onChange={(e) => updateCustomButton(b.id, { name: e.target.value })} />
                </Form.Group>

                <Form.Group>
                  <Form.Label>链接</Form.Label>
                  <Form.Control value={b.link || ""} onChange={(e) => updateCustomButton(b.id, { link: e.target.value })} placeholder="https://..." />
                </Form.Group>
              </div>

              <AssetUploadRow
                label="按钮图标（可选）"
                assetKey={`custombtn_${b.id || b.name}`}
                value={b.image || ""}
                prevValue={b.imagePrev || ""}
                upload={uploadImage}
                clear={clearImage}
                rollback={rollbackImage}
                onChange={(next, prev) => updateCustomButton(b.id, { image: next, imagePrev: prev })}
              />

              <Button size="sm" variant="outline-danger" onClick={() => removeCustomButton(b.id)}>
                删除
              </Button>
            </div>
          ))}
        </section>

        {/* 主页语言过滤器（点击添加） */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionTitle}>主页语言过滤器</div>
              <div className={styles.sectionHint}>主页筛选按钮来自这里（点击快速添加）</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {LANG_QUICK.map((v) => (
              <Button key={v} size="sm" variant="outline-light" onClick={() => addLang(v)}>
                + {v}
              </Button>
            ))}
          </div>

          <Form.Group style={{ marginTop: 10 }}>
            <Form.Label>自定义添加</Form.Label>
            <Form.Control
              placeholder="输入后回车添加（例如：西语）"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLang(e.currentTarget.value);
                  e.currentTarget.value = "";
                }
              }}
            />
          </Form.Group>

          <div className={styles.chipRow}>
            {(languageCategories || []).map((v) => (
              <span className={styles.chip} key={v}>
                {v}
                <button className={styles.chipBtn} onClick={() => removeLang(v)} title="删除">
                  ×
                </button>
              </span>
            ))}
          </div>
        </section>

        {/* 主题配色 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionTitle}>主题配色</div>
              <div className={styles.sectionHint}>主站 / yu / config 背景色 + 强调色（支持预设与自定义）</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {presetsMemo.map((p) => (
              <Button
                key={p.name}
                size="sm"
                variant="outline-light"
                onClick={() => patch({ Theme: { mainBg: p.mainBg, yuBg: p.yuBg, configBg: p.configBg, accent: p.accent } })}
              >
                使用预设：{p.name}
              </Button>
            ))}
          </div>

          <div className={styles.grid2} style={{ marginTop: 12 }}>
            <Form.Group>
              <Form.Label>主站背景色</Form.Label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Form.Control value={theme.mainBg || ""} onChange={(e) => setThemeField("mainBg", e.target.value)} />
                <Form.Control type="color" value={theme.mainBg || "#0f172a"} onChange={(e) => setThemeField("mainBg", e.target.value)} style={{ width: 56, padding: 2 }} />
              </div>
            </Form.Group>

            <Form.Group>
              <Form.Label>yu 背景色</Form.Label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Form.Control value={theme.yuBg || ""} onChange={(e) => setThemeField("yuBg", e.target.value)} />
                <Form.Control type="color" value={theme.yuBg || "#111827"} onChange={(e) => setThemeField("yuBg", e.target.value)} style={{ width: 56, padding: 2 }} />
              </div>
            </Form.Group>

            <Form.Group>
              <Form.Label>config 背景色</Form.Label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Form.Control value={theme.configBg || ""} onChange={(e) => setThemeField("configBg", e.target.value)} />
                <Form.Control type="color" value={theme.configBg || "#0b1220"} onChange={(e) => setThemeField("configBg", e.target.value)} style={{ width: 56, padding: 2 }} />
              </div>
            </Form.Group>

            <Form.Group>
              <Form.Label>强调色</Form.Label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Form.Control value={theme.accent || ""} onChange={(e) => setThemeField("accent", e.target.value)} />
                <Form.Control type="color" value={theme.accent || "#22c55e"} onChange={(e) => setThemeField("accent", e.target.value)} style={{ width: 56, padding: 2 }} />
              </div>
            </Form.Group>
          </div>
        </section>

        {/* 操作区 */}
        <section className={styles.section}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button onClick={onSave} disabled={saving}>
              保存
            </Button>
            <Button variant="outline-light" onClick={onReset}>
              恢复默认
            </Button>
            <Button variant="outline-light" onClick={onExport}>
              导出 JSON
            </Button>
            <Form.Label style={{ margin: 0 }}>
              <input type="file" accept="application/json" onChange={onImport} style={{ display: "none" }} />
              <Button as="span" variant="outline-light">
                导入 JSON
              </Button>
            </Form.Label>
            <Button variant="outline-light" onClick={onBackHome}>
              返回首页
            </Button>
          </div>
        </section>
      </Container>
    </div>
  );
}
