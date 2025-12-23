# AI 助手使用说明（针对 vup-song-list 项目）

目的：帮助 AI 编码代理快速理解本仓库架构、数据流与常见修改点，给出可执行的代码/补丁建议。

要点快照

- 框架：Next.js（pages 路由），前端与简单 API（pages/api/\*）同仓库运行。
- 数据源：单一 JSON 文件 public/music_list.json，由 API 读写（无外部 DB）。
- 写入约定：所有写入 API（addSong/updateSong/deleteSong）使用全局写入队列（safeWriteJSON），请不要直接并发写入或移除此机制。
- Node 版本：要求 Node >= 20（见 package.json engines）。开发命令：`npm run dev`（端口 5172）、`npm run build`、`npm start`。

关键文件与示例

- 前端页面：[pages/index.js](pages/index.js) —— 搜索、过滤、展示与交互入口（示例：调用 `/api/getSongs`）。
- API 层：
  - [pages/api/getSongs.js](pages/api/getSongs.js) —— 从 `public/music_list.json` 读取并返回 `songs` 数组（兼容数组或 { songs: [] } 两种结构）。
  - [pages/api/addSong.js](pages/api/addSong.js) 与 [pages/api/deleteSong.js](pages/api/deleteSong.js) —— 写入时使用写入队列；`deleteSong` 会先同步返回成功，再后台执行写入。
- 配置：`config/constants.js` 与 `lib/siteConfigStore.js` 管理站点可覆盖配置（本地覆盖可用于自定义按钮/图片）。
- 数据样例字段：`index, song_name, artist, language, initial, remarks, sticky_top, paid, mood, BVID`。
- 组件示例：`components/SongDetail.component.jsx`（表格行渲染），`components/manage/AddSongForm.jsx`（管理端表单演示）。

工程与代码修改准则（针对 AI）

- 优先通过现有 API 修改数据，而非直接写入 `public/music_list.json`；API 内有并发保护与字段清洗逻辑。
- 若需要新增后端行为，请复用写入队列模式（见 addSong.js），以避免文件损坏。
- 前端改动优先小步提交：修改 `components/` 或 `pages/`，并保持 UI 对 `getSongs` 的调用不变。
- 不要更改 `index` 自动生成与删除不重排的约定，除非同时更新所有调用方逻辑。

常见任务示例（可直接生成代码片段）

- 添加歌曲（POST JSON）

```
POST /api/addSong
Content-Type: application/json
{
  "song_name": "歌名",
  "artist": "歌手",
  "language": "日语",
  "remarks": "直播点歌",
  "paid": 0
}
```

- 读取歌曲：`GET /api/getSongs` 返回 `{ songs: [...] }`。

调试与运行建议

- 本地运行：`npm run dev`（Node >= 20）。端口与主机已在脚本中固定为 `-H 0.0.0.0 -p 5172`。
- 日志：API 会在控制台打印错误，查看终端输出以定位后端问题。
- 编辑 JSON：手动编辑 `public/music_list.json` 时务必保持合法 JSON；优先通过 API 以保持索引与字段一致性。

AI 特定行为指南

- 变更实现：使用最小修改集，保持组件接口不变（例如 `SongDetail` 接收 `filteredSongList`）。
- 使用仓库提供的工具与约定（如 pinyin 用于中文首字母、写入队列用于文件写入）。
- 编辑文件请使用仓库编辑工具（在此环境中使用 apply_patch），并在提交前运行 `npm run dev` 或至少静态检查改动。

如果这份说明有缺漏或你需要补充例如 CI、测试或额外运行步骤，请告诉我要补充的方向。谢谢！
