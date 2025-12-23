function imageLoader({ src }) {
  // src 可能是 "/assets/xx"、"assets/xx"、"/uploads/xx" 或完整 URL
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/")) return src; // 避免变成 //assets/... 导致请求到 http(s)://assets/
  return `/${src}`;
}

module.exports = imageLoader;
