function imageLoader({ src }) {
  if (!src) return src;

  // 完整 URL 直接返回
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("//")) return src;

  // 已经是绝对路径就别再加 /
  if (src.startsWith("/")) return src;

  return `/${src}`;
}

module.exports = imageLoader;
