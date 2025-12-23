// pages/config.js
import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Button, Col, Container, Form, Row, Alert } from 'react-bootstrap';
import styles from '../styles/Manage.module.css';

import { getDefaultConfig, exportConfigToFile, importConfigFromFile, getMergedConfig, replaceConfig } from '../lib/siteConfigStore';

export default function ConfigPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(true);
  const [status, setStatus] = useState({ type: '', msg: '' });

  // Light gate (no login): require localStorage.adminEnabled === 'true'
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ok = window.localStorage.getItem('adminEnabled') === 'true';
    setAllowed(ok);
    if (!ok) {
      setStatus({ type: 'warning', msg: '未启用管理员入口。请从 yu.js 进入配置页。' });
    }
  }, []);

  const initialConfig = useMemo(() => getMergedConfig(), []);
  const [form, setForm] = useState(() => ({
    Name: initialConfig.Name || '',
    BiliLiveRoomID: initialConfig.BiliLiveRoomID || '',
    Footer: initialConfig.Footer || '',
    NetEaseMusicId: initialConfig.NetEaseMusicId || '',
    QQMusicId: initialConfig.QQMusicId || '',
    BannerTitle: initialConfig.BannerTitle || '',
    BannerContentText: (initialConfig.BannerContent || []).join('\n'),
    CustomButtons: Array.isArray(initialConfig.CustomButtons) ? initialConfig.CustomButtons : []
  }));

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = () => {
    const next = {
      Name: form.Name,
      BiliLiveRoomID: form.BiliLiveRoomID,
      Footer: form.Footer,
      NetEaseMusicId: form.NetEaseMusicId,
      QQMusicId: form.QQMusicId,
      BannerTitle: form.BannerTitle,
      BannerContent: form.BannerContentText
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean),
      CustomButtons: form.CustomButtons
    };
    replaceConfig(next);
    setStatus({ type: 'success', msg: '保存成功：刷新任意页面即可看到全站生效。' });
  };

  const reset = () => {
    replaceConfig({});
    const defaults = getDefaultConfig();
    setForm({
      Name: defaults.Name || '',
      BiliLiveRoomID: defaults.BiliLiveRoomID || '',
      Footer: defaults.Footer || '',
      NetEaseMusicId: defaults.NetEaseMusicId || '',
      QQMusicId: defaults.QQMusicId || '',
      BannerTitle: defaults.BannerTitle || '',
      BannerContentText: (defaults.BannerContent || []).join('\n'),
      CustomButtons: Array.isArray(defaults.CustomButtons) ? defaults.CustomButtons : []
    });
    setStatus({ type: 'info', msg: '已恢复默认配置。' });
  };

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importConfigFromFile(file);
      const merged = getMergedConfig();
      setForm({
        Name: merged.Name || '',
        BiliLiveRoomID: merged.BiliLiveRoomID || '',
        Footer: merged.Footer || '',
        NetEaseMusicId: merged.NetEaseMusicId || '',
        QQMusicId: merged.QQMusicId || '',
        BannerTitle: merged.BannerTitle || '',
        BannerContentText: (merged.BannerContent || []).join('\n'),
        CustomButtons: Array.isArray(merged.CustomButtons) ? merged.CustomButtons : []
      });
      setStatus({ type: 'success', msg: '导入成功。' });
    } catch (err) {
      setStatus({ type: 'danger', msg: err?.message || '导入失败：JSON 无效。' });
    } finally {
      e.target.value = '';
    }
  };

  const updateButton = (idx, patch) => {
    setForm((prev) => {
      const next = [...prev.CustomButtons];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, CustomButtons: next };
    });
  };

  const addButton = () => {
    setForm((prev) => ({
      ...prev,
      CustomButtons: [
        ...prev.CustomButtons,
        { link: '', name: '新按钮', image: '' }
      ]
    }));
  };

  const removeButton = (idx) => {
    setForm((prev) => ({
      ...prev,
      CustomButtons: prev.CustomButtons.filter((_, i) => i !== idx)
    }));
  };

  return (
    <div style={{ paddingTop: 60, paddingBottom: 40 }}>
      <Head>
        <title>配置页 - vup-song-list</title>
      </Head>

      <Container style={{ maxWidth: 980 }}>
        <h1 style={{ fontWeight: 900, letterSpacing: 0.5, marginBottom: 18 }}>
          ⚙️ 配置页
        </h1>

        <p style={{ color: '#666', marginBottom: 20 }}>
          这里修改的内容会保存到浏览器 localStorage，并在全站生效（无需后台、无需登录）。
        </p>

        {status?.msg ? (
          <Alert variant={status.type || 'info'}>{status.msg}</Alert>
        ) : null}

        {!allowed ? (
          <Alert variant="warning">
            当前未启用管理员入口。请前往 <b>/yu</b> 页面点击「配置」进入。
          </Alert>
        ) : null}

        <div className={styles.songListMarco} style={{ padding: 20 }}>
          <Row className="g-3">
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>主播名（Name）</Form.Label>
                <Form.Control
                  value={form.Name}
                  onChange={(e) => setField('Name', e.target.value)}
                  placeholder="例如：星鱼咪来i"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>B站直播间ID（BiliLiveRoomID）</Form.Label>
                <Form.Control
                  value={form.BiliLiveRoomID}
                  onChange={(e) => setField('BiliLiveRoomID', e.target.value)}
                  placeholder="例如：1916955256"
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Label>页脚文案（Footer）</Form.Label>
                <Form.Control
                  value={form.Footer}
                  onChange={(e) => setField('Footer', e.target.value)}
                  placeholder="例如：Copyright © 2025 ..."
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>网易云歌手ID（NetEaseMusicId，可选）</Form.Label>
                <Form.Control
                  value={form.NetEaseMusicId}
                  onChange={(e) => setField('NetEaseMusicId', e.target.value)}
                  placeholder="例如：123456"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>QQ音乐歌手ID（QQMusicId，可选）</Form.Label>
                <Form.Control
                  value={form.QQMusicId}
                  onChange={(e) => setField('QQMusicId', e.target.value)}
                  placeholder="例如：004ABCD"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Banner 标题（BannerTitle）</Form.Label>
                <Form.Control
                  value={form.BannerTitle}
                  onChange={(e) => setField('BannerTitle', e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Label>Banner 文案（每行一条）</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={form.BannerContentText}
                  onChange={(e) => setField('BannerContentText', e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <hr style={{ margin: '24px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontWeight: 800 }}>自定义按钮（CustomButtons）</h3>
            <Button variant="outline-primary" onClick={addButton}>+ 新增按钮</Button>
          </div>

          <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
            {form.CustomButtons.map((btn, idx) => (
              <div key={idx} style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
                <Row className="g-2">
                  <Col xs={12} md={3}>
                    <Form.Control
                      value={btn.name || ''}
                      onChange={(e) => updateButton(idx, { name: e.target.value })}
                      placeholder="按钮名称"
                    />
                  </Col>
                  <Col xs={12} md={5}>
                    <Form.Control
                      value={btn.link || ''}
                      onChange={(e) => updateButton(idx, { link: e.target.value })}
                      placeholder="按钮链接（URL）"
                    />
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Control
                      value={btn.image || ''}
                      onChange={(e) => updateButton(idx, { image: e.target.value })}
                      placeholder="图标路径/URL（可选）"
                    />
                  </Col>
                  <Col xs={12} md={1} style={{ display: 'flex' }}>
                    <Button variant="outline-danger" onClick={() => removeButton(idx)} style={{ width: '100%' }}>
                      删除
                    </Button>
                  </Col>
                </Row>
              </div>
            ))}
          </div>

          <hr style={{ margin: '24px 0' }} />

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={save}>保存</Button>
            <Button variant="outline-secondary" onClick={reset}>恢复默认</Button>
            <Button variant="outline-dark" onClick={() => exportConfigToFile()}>导出 JSON</Button>
            <Form.Label style={{ margin: 0 }}>
              <Form.Control type="file" accept="application/json" onChange={onImport} />
            </Form.Label>
            <Button variant="outline-secondary" onClick={() => router.push('/')}>返回首页</Button>
          </div>

          <div style={{ marginTop: 10, color: '#777', fontSize: 13 }}>
            提示：导入会覆盖当前配置；导出仅包含你的覆盖配置（默认值不会写入）。
          </div>
        </div>
      </Container>
    </div>
  );
}
