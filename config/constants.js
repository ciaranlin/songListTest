// config/constants.js
// Default site configuration (used as fallback when public/site-config.json does not exist).

export const config = {
  Name: "星鱼咪来i",
  BiliLiveRoomID: "1916955256",

  NetEaseMusicId: "",
  QQMusicId: "",
  Footer: "Copyright © 2025 星鱼和她的宝宝大人",

  Cursor: true,

  LanguageCategories: ["日语", "英语"],
  RemarkCategories: [],
  MoodCategories: ["舰长点歌"],

  BannerTitle: "日常碎碎念",
  BannerContent: ["吃饱了躺一会很"],

  // Custom buttons shown on banner (name/link/icon image path)
  CustomButtons: [
    {
      link: "https://qm.qq.com/q/7pEtKkMQml/",
      name: "粉丝群",
      image: "/assets/icon/tapechat.png",
    },
    {
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
