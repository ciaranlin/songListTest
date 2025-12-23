function imageLoader({ src }) {
  if (!src) return src;

  // 完整 URL 直接返回
  if (src.startsWith("http://") || src.startsWith("https://")) return src;

  // 已经是绝对路径，别再加 /
  if (src.startsWith("/")) return src;

  // 否则补一个 /
  return `/${src}`;
}

module.exports = imageLoader;
