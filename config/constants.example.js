// config/constants.js
// Default site configuration (used as fallback when no local overrides exist).
// Note: This project uses Next.js (pages router) and ESM imports in client code.

export const config = {
  Name: "",
  BiliLiveRoomID: "",

  NetEaseMusicId: "",
  QQMusicId: "",
  Footer: "Copyright © 2025 星鱼和她的宝宝大人",

  Cursor: true,

  LanguageCategories: ["日语", "英语"],
  RemarkCategories: [],
  MoodCategories: ["舰长点歌"],

  BannerTitle: "日常碎碎念",
  BannerContent: [
    "吃饱了躺一会很",
  ],

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

  // Optional images uploaded from Config page (stored as DataURL in localStorage)
  // These are empty by default.
  LogoImage: "",
  LogoImagePrev: "",
  GifImage: "",
  GifImagePrev: "",
  FaviconImage: "",
  FaviconImagePrev: "",
};

export default config;
