import React, { useMemo } from "react";
import { Button, Form } from "react-bootstrap";

/**
 * 通用资源上传行（上传/预览/清除/返回上一版）
 *
 * props:
 * - label: 显示名称（中文）
 * - assetKey: 上传 key（后端会写入 public/uploads）
 * - value: 当前图片 URL（例如 /uploads/banner.webp）
 * - prevValue: 上一版 URL（例如 /uploads/banner.prev.webp）
 * - accept: input accept
 * - onChange: (nextValue, nextPrevValue) => void  // 更新到 form state
 * - upload: async (assetKey, file) => { path, prevPath }
 * - clear: async (assetKey) => { path, prevPath }
 * - rollback: async (assetKey) => { path, prevPath }
 */
export default function AssetUploadRow({
  label,
  assetKey,
  value,
  prevValue,
  accept = "image/*",
  onChange,
  upload,
  clear,
  rollback,
  helper,
}) {
  const previewUrl = useMemo(() => {
    if (!value) return "";
    // 防缓存：不改变原值，只用于预览
    const sep = value.includes("?") ? "&" : "?";
    return `${value}${sep}v=${Date.now()}`;
  }, [value]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px", padding: "12px 0" }}>
      <div style={{ fontWeight: 700 }}>{label}</div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <Form.Control
          type="file"
          accept={accept}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            const data = await upload(assetKey, file);
            onChange?.(data?.path || "", data?.prevPath || "");
          }}
          style={{ maxWidth: 420 }}
        />

        <Button
          variant="outline-danger"
          size="sm"
          onClick={async () => {
            const data = await clear(assetKey);
            onChange?.(data?.path || "", data?.prevPath || "");
          }}
        >
          清除
        </Button>

        <Button
          variant="outline-secondary"
          size="sm"
          disabled={!prevValue}
          onClick={async () => {
            const data = await rollback(assetKey);
            onChange?.(data?.path || "", data?.prevPath || "");
          }}
        >
          返回上一版
        </Button>

        {helper ? <div style={{ fontSize: 12, opacity: 0.75 }}>{helper}</div> : null}
      </div>

      {previewUrl ? (
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <img
            src={previewUrl}
            alt={label}
            style={{
              width: 90,
              height: 90,
              objectFit: "cover",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          />
          <div style={{ fontSize: 12, opacity: 0.8, wordBreak: "break-all" }}>{value}</div>
        </div>
      ) : null}
    </div>
  );
}
