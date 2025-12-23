// pages/api/upload.js
import fs from "fs";
import path from "path";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function findExistingFile(dir, baseName) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir);
  const hit = files.find((f) => f.startsWith(baseName + ".") && !f.startsWith(baseName + ".prev."));
  return hit ? path.join(dir, hit) : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const key = String(req.query.key || "").trim();
  if (!key) return res.status(400).json({ message: "Missing key" });

  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    ensureDir(uploadsDir);

    const form = formidable({
      multiples: false,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) return res.status(400).json({ message: err.message || "Upload failed" });

      const file = files.file;
      if (!file) return res.status(400).json({ message: "No file field named 'file'" });

      const f = Array.isArray(file) ? file[0] : file;
      const originalName = f.originalFilename || "upload";
      const ext = path.extname(originalName) || path.extname(f.filepath) || ".png";

      // Keep one previous version (rename current -> prev, overwriting old prev)
      const existing = findExistingFile(uploadsDir, key);
      let prevPublicPath = "";
      if (existing && fs.existsSync(existing)) {
        const prevPath = path.join(uploadsDir, `${key}.prev${path.extname(existing) || ext}`);
        try {
          if (fs.existsSync(prevPath)) fs.unlinkSync(prevPath);
          fs.renameSync(existing, prevPath);
          prevPublicPath = `/uploads/${path.basename(prevPath)}`;
        } catch {
          // ignore
        }
      }

      const targetPath = path.join(uploadsDir, `${key}${ext}`);
      try {
        // If target exists (same ext), move it to prev too
        if (fs.existsSync(targetPath)) {
          const prevPath2 = path.join(uploadsDir, `${key}.prev${ext}`);
          if (fs.existsSync(prevPath2)) fs.unlinkSync(prevPath2);
          fs.renameSync(targetPath, prevPath2);
          prevPublicPath = `/uploads/${path.basename(prevPath2)}`;
        }

        fs.copyFileSync(f.filepath, targetPath);
        // cleanup tmp
        try { fs.unlinkSync(f.filepath); } catch {}

        return res.status(200).json({
          ok: true,
          path: `/uploads/${key}${ext}`,
          prevPath: prevPublicPath,
        });
      } catch (e2) {
        return res.status(500).json({ message: e2.message || "Write failed" });
      }
    });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Upload failed" });
  }
}
