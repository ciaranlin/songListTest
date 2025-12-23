// pages/api/assets/clear.js
// Clear current asset file for a given key. (Does NOT delete prev by default.)

import fs from "fs";
import { ensureUploadsDir, findCurrentFile, findPrevFile, toPublicPath } from "./_fs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const key = String(req.query.key || "").trim();
  if (!key) return res.status(400).json({ message: "Missing key" });

  const deletePrev = String(req.query.deletePrev || "").toLowerCase() === "true";

  try {
    const uploadsDir = ensureUploadsDir();
    const cur = findCurrentFile(uploadsDir, key);
    const prev = findPrevFile(uploadsDir, key);

    if (cur && fs.existsSync(cur)) {
      try {
        fs.unlinkSync(cur);
      } catch {}
    }

    if (deletePrev && prev && fs.existsSync(prev)) {
      try {
        fs.unlinkSync(prev);
      } catch {}
    }

    const prevAfter = deletePrev ? null : findPrevFile(uploadsDir, key);
    return res.status(200).json({
      ok: true,
      message: "已清除当前文件",
      path: "",
      prevPath: toPublicPath(prevAfter),
    });
  } catch (e) {
    return res.status(500).json({ message: e?.message || "Clear failed" });
  }
}
