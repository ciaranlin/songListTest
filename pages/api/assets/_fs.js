// pages/api/assets/_fs.js
// Shared helpers for asset upload/rollback/clear.

import fs from "fs";
import path from "path";

export function ensureUploadsDir() {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  fs.mkdirSync(uploadsDir, { recursive: true });
  return uploadsDir;
}

export function findCurrentFile(uploadsDir, key) {
  if (!fs.existsSync(uploadsDir)) return null;
  const files = fs.readdirSync(uploadsDir);
  const hit = files.find((f) => f.startsWith(key + ".") && !f.startsWith(key + ".prev."));
  return hit ? path.join(uploadsDir, hit) : null;
}

export function findPrevFile(uploadsDir, key) {
  if (!fs.existsSync(uploadsDir)) return null;
  const files = fs.readdirSync(uploadsDir);
  const hit = files.find((f) => f.startsWith(key + ".prev."));
  return hit ? path.join(uploadsDir, hit) : null;
}

export function toPublicPath(absPath) {
  if (!absPath) return "";
  return `/uploads/${path.basename(absPath)}`;
}
