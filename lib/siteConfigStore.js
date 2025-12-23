// lib/siteConfigStore.js
// Local-only configuration store (no backend, no login).
// Safe for Next.js pages router: only touches localStorage in the browser.

import { config as DEFAULT_CONFIG } from '../config/constants';

const STORAGE_KEY = 'vup_song_list_site_config_v1';

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function getDefaultConfig() {
  return DEFAULT_CONFIG;
}

export function loadConfigOverrides() {
  if (typeof window === 'undefined') return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? safeJsonParse(raw) : null;
  return parsed && typeof parsed === 'object' ? parsed : {};
}

export function getMergedConfig() {
  const overrides = loadConfigOverrides();
  // Shallow merge is intentional (MVP): nested arrays/objects can be overwritten wholesale.
  return { ...DEFAULT_CONFIG, ...overrides };
}

export function saveConfig(overrides) {
  if (typeof window === 'undefined') return;
  const current = loadConfigOverrides();
  const next = { ...current, ...overrides };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function replaceConfig(nextConfig) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfig || {}));
}

export function resetConfig() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function exportConfigToFile() {
  if (typeof window === 'undefined') return;
  const data = window.localStorage.getItem(STORAGE_KEY) || '{}';
  const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'vup-song-list-config.json';
  a.click();

  URL.revokeObjectURL(url);
}

export async function importConfigFromFile(file) {
  const text = await file.text();
  const parsed = safeJsonParse(text);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid JSON config');
  }
  replaceConfig(parsed);
  return parsed;
}
