// lib/siteConfigStore.js
// Server-file based configuration store (no localStorage).
//
// Design:
// 1) config/constants.js provides DEFAULT_CONFIG (safe fallback).
// 2) public/site-config.json is the runtime config that the Config page writes.
// 3) Pages/components should load config at runtime (fetch) so changes apply immediately.

import { config as DEFAULT_CONFIG } from "../config/constants";

export function getDefaultConfig() {
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

/**
 * Client-side: load merged config (runtime JSON overrides + default).
 * Always use no-store to avoid browser cache.
 */
export async function getMergedConfigClient() {
  const base = getDefaultConfig();
  try {
    const res = await fetch("/site-config.json", { cache: "no-store" });
    if (!res.ok) return base;
    const override = await res.json();
    return deepMerge(base, override);
  } catch {
    return base;
  }
}

/**
 * Backward-compatible sync getter (returns default only).
 * NOTE: This does NOT include runtime overrides because fetch is async.
 */
export function getMergedConfig() {
  return getDefaultConfig();
}

/** Save entire config to server file via API. */
export async function saveConfigToServer(nextConfig) {
  const res = await fetch("/api/config/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nextConfig || {}),
  });
  if (!res.ok) {
    const data = await safeReadJson(res);
    throw new Error(data?.message || "保存失败");
  }
  return await safeReadJson(res);
}

/** Reset server config (delete runtime file). */
export async function resetServerConfig() {
  const res = await fetch("/api/config/reset", { method: "POST" });
  if (!res.ok) {
    const data = await safeReadJson(res);
    throw new Error(data?.message || "重置失败");
  }
  return await safeReadJson(res);
}

/** Export current config object to a downloadable JSON file. */
export function exportConfigToFile(data, filename = "site-config.json") {
  if (typeof window === "undefined") return;
  const blob = new Blob([JSON.stringify(data || {}, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

/** Import a JSON file (returns parsed object). */
export async function importConfigFromFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid JSON config");
  }
  return parsed;
}

async function safeReadJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function isObj(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

function deepMerge(base, override) {
  if (!isObj(base) || !isObj(override)) return override ?? base;
  const out = { ...base };
  for (const k of Object.keys(override)) {
    const bv = base[k];
    const ov = override[k];
    out[k] = isObj(bv) && isObj(ov) ? deepMerge(bv, ov) : ov;
  }
  return out;
}
