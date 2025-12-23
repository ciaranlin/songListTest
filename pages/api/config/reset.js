// pages/api/config/reset.js
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const target = path.join(process.cwd(), "public", "site-config.json");
    if (fs.existsSync(target)) fs.unlinkSync(target);
    return res.status(200).json({ ok: true, message: "已重置：已删除 public/site-config.json（将回退到 constants.js）。" });
  } catch (e) {
    return res.status(500).json({ ok: false, message: e?.message || "重置失败" });
  }
}
