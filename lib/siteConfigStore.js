// lib/siteConfigStore.js
// Local-only configuration store (no backend, no login).
// Safe for Next.js pages router: only touches localStorage in the browser.

import { config as DEFAULT_CONFIG } from "../config/constants";

const STORAGE_KEY = "vup_song_list_site_config_v1";

/** Only allow known keys to be stored/imported to avoid breaking the app. */
const ALLOWED_KEYS = new Set(Object.keys(DEFAULT_CONFIG));

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getDefaultConfig() {
  // Return a deep-ish clone to avoid accidental mutation
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

export function getStoredConfig() {
  if (!isBrowser()) return {};
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = safeJsonParse(raw);
  if (!parsed || typeof parsed !== "object") return {};
  const cleaned = {};
  for (const [k, v] of Object.entries(parsed)) {
    if (ALLOWED_KEYS.has(k)) cleaned[k] = v;
  }
  return cleaned;
}

export function getMergedConfig() {
  return { ...getDefaultConfig(), ...getStoredConfig() };
}

/**
 * Save a partial update into localStorage.
 * Note: this stores ONLY overrides (not the entire merged config).
 */
export function saveConfig(partial) {
  if (!isBrowser()) return;
  const current = getStoredConfig();
  const next = { ...current };

  if (partial && typeof partial === "object") {
    for (const [k, v] of Object.entries(partial)) {
      if (!ALLOWED_KEYS.has(k)) continue;
      next[k] = v;
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

/**
 * Replace local overrides completely (after sanitizing keys).
 */
export function replaceConfig(nextConfig) {
  if (!isBrowser()) return;
  const cleaned = {};
  if (nextConfig && typeof nextConfig === "object") {
    for (const [k, v] of Object.entries(nextConfig)) {
      if (!ALLOWED_KEYS.has(k)) continue;
      cleaned[k] = v;
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
}

export function resetConfig() {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Export ONLY the stored overrides as a downloadable JSON file.
 */
export function exportConfigToFile(filename = "vup-song-list-config.json") {
  if (!isBrowser()) return;
  const data = getStoredConfig();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
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

/**
 * Import a JSON file and replace overrides (sanitized).
 */
export async function importConfigFromFile(file) {
  const text = await file.text();
  const parsed = safeJsonParse(text);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid JSON config");
  }
  replaceConfig(parsed);
  return parsed;
}
