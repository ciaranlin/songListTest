// pages/api/assets/rollback.js
// Swap current asset with its previous version for a given key.
// Files are stored as:
//   current: <key>.<ext>
//   prev:    <key>.prev.<ext>

import fs from "fs";
import path from "path";
import { ensureUploadsDir, findCurrentFile, findPrevFile, toPublicPath } from "./_fs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const key = String(req.query.key || "").trim();
  if (!key) return res.status(400).json({ message: "Missing key" });

  try {
    const uploadsDir = ensureUploadsDir();
    const cur = findCurrentFile(uploadsDir, key);
    const prev = findPrevFile(uploadsDir, key);

    if (!prev || !fs.existsSync(prev)) {
      return res.status(400).json({ message: "没有上一版可回退" });
    }

    // If current does not exist, just promote prev -> current
    if (!cur || !fs.existsSync(cur)) {
      const prevExt = path.extname(prev) || ".png";
      const target = path.join(uploadsDir, `${key}${prevExt}`);
      // ensure no leftover
      try { if (fs.existsSync(target)) fs.unlinkSync(target); } catch {}
      fs.renameSync(prev, target);
      return res.status(200).json({
        ok: true,
        message: "已回退到上一版",
        path: toPublicPath(target),
        prevPath: "",
      });
    }

    // Swap cur <-> prev via temp
    const tmp = path.join(uploadsDir, `${key}.swap.${Date.now()}.tmp`);
    fs.renameSync(cur, tmp);
    fs.renameSync(prev, cur);
    fs.renameSync(tmp, prev);

    return res.status(200).json({
      ok: true,
      message: "已回退到上一版",
      path: toPublicPath(cur),
      prevPath: toPublicPath(prev),
    });
  } catch (e) {
    return res.status(500).json({ message: e?.message || "Rollback failed" });
  }
}
