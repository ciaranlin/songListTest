// config/constants.js
// Default site configuration (used as fallback when public/site-config.json does not exist).

export const config = {
  Name: "星鱼咪来i",
  BiliLiveRoomID: "1916955256",

  NetEaseMusicId: "",
  QQMusicId: "",
  Footer: "Copyright © 2025 星鱼和她的宝宝大人",

  $1
  // 主题配色（可在 /config 调整，写入 public/site-config.json）
  Theme: {
    mainBg: "#0f172a",      // 主站背景
    yuBg: "#111827",        // 管理页 /yu 背景
    configBg: "#0b1220",    // 配置页背景
    accent: "#22c55e",      // 强调色
  },

  // 角落快捷按钮（可在 /config 增删，支持固定位置与图标）
  // position: top-left | top-right | bottom-left | bottom-right
  // type: link | intro（intro 会弹出自我介绍）
  CornerActions: [
    {
      id: "live",
      type: "link",
      text: "去直播间",
      href: "https://live.bilibili.com/1916955256",
      position: "top-right",
      icon: "", // 可上传：/uploads/corner_live.webp
    },
    {
      id: "intro",
      type: "intro",
      text: "自我介绍",
      href: "",
      position: "top-left",
      icon: "", // 可上传：/uploads/corner_intro.webp
    },
  ],

  LanguageCategories: ["日语", "英语"],
  RemarkCategories: [],
  MoodCategories: ["舰长点歌"],

  BannerTitle: "日常碎碎念",
  BannerContent: ["吃饱了躺一会很"],

  // Custom buttons shown on banner (name/link/icon image path)
  CustomButtons: [
    {
      id: "fans",
      link: "https://qm.qq.com/q/7pEtKkMQml/",
      name: "粉丝群",
      image: "/assets/icon/tapechat.png",
    },
    {
      id: "rec",
      link: "https://space.bilibili.com/",
      name: "录播组",
      image: "",
    },
  ],

  // Image paths (can be overridden by public/site-config.json).
  // Uploading via /config will write to /public/uploads and update site-config.json.
  LogoImage: "/assets/images/self_intro.webp",
  LogoImagePrev: "",

  GifImage: "/assets/images/my.gif",
  GifImagePrev: "",

  FaviconImage: "/favicon.png",
  FaviconImagePrev: "",

  // New: banner/background images
  BannerImage: "/assets/images/banner_image.webp",
  BannerImagePrev: "",

  BackgroundImage: "/assets/images/background.webp",
  BackgroundImagePrev: "",
};

export default config;
