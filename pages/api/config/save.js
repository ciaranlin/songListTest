// pages/api/config/save.js
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const nextConfig = req.body && typeof req.body === "object" ? req.body : {};
    const publicDir = path.join(process.cwd(), "public");
    const target = path.join(publicDir, "site-config.json");
    const tmp = target + ".tmp";

    // Ensure public dir exists
    fs.mkdirSync(publicDir, { recursive: true });

    // Write pretty JSON (human editable)
    fs.writeFileSync(tmp, JSON.stringify(nextConfig, null, 2), "utf8");
    fs.renameSync(tmp, target);

    // Return with cache-bust hint
    return res.status(200).json({ ok: true, message: "已保存到服务器 (public/site-config.json)。" });
  } catch (e) {
    return res.status(500).json({ ok: false, message: e?.message || "写入失败" });
  }
}
