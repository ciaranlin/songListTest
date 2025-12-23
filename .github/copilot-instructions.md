# AI 助手使用说明（vup-song-list 项目）

目的：帮助 AI 编码代理快速上手本仓库，做出安全、最小变更并遵守项目约定的代码/补丁。

要点速览

- 框架：Next.js（pages 路由）。前端页面与轻量 API 共存于 `pages/` 下（例：`pages/index.js`, `pages/api/*`）。
- 数据主源：`public/music_list.json`（单文件 JSON），API 负责读写并保证一致性；请勿直接并发写入该文件。
- 写入约定：所有写入操作应通过现有 API 的写入队列（safe write pattern）执行，避免直接修改 JSON。参见 `pages/api/addSong.js` 的实现样式。
- Node 要求：Node >= 20（参见 `package.json` 的 engines 字段）。开发脚本：`npm run dev`、`npm run build`、`npm start`。

关键位置与典型调用示例

- 页面入口：`pages/index.js` — 搜索、过滤与展示入口，调用 `GET /api/getSongs` 获取歌曲列表。
- 读取 API：`pages/api/getSongs.js` — 从 `public/music_list.json` 读取并返回 `{ songs: [...] }`（兼容文件直接为数组或为对象）。
- 写入 API：`pages/api/addSong.js`, `pages/api/deleteSong.js` 等 — 使用写入队列（safeWriteJSON）或相同模式以序列化磁盘写入；`deleteSong` 有时会先返回成功再异步写盘。
- 配置与覆盖：`config/constants.js`、`lib/siteConfigStore.js` 与 `public/site-config.json` 支持站点级可配置项（本地覆盖会被优先读取）。
- 重要组件：`components/SongDetail.component.jsx`、`components/SongListFilter.component.jsx`、`components/manage/AddSongForm.jsx`。

项目约定（必须遵守）

- 永远通过 API 变更歌曲数据，除非在受控脚本中明确需要直接修改 `public/music_list.json` 并且处理了并发与索引。
- 保持 `index` 字段的生成/顺序约定：不要随意重排索引；若需要改变索引规则，必须修改所有依赖方（前端过滤/排序、导出脚本等）。
- 写入流程复用：新增或修改后端写入逻辑时，复用 `pages/api/addSong.js` 的写入队列/锁模式，避免并发覆盖。
- 字段清洗与默认值：API 层会做基本字段清洗（如 `song_name`, `artist`, `language`, `paid`）；遵循现有字段格式以避免前端异常。

快速示例：添加歌曲

POST /api/addSong
Content-Type: application/json

{
  "song_name": "歌名",
  "artist": "歌手",
  "language": "日语",
  "remarks": "直播点歌",
  "paid": 0
}

返回：标准 JSON 响应（参见 `pages/api/addSong.js`）

调试与常用命令

- 启动开发：`npm run dev`（项目 README 与 package.json 已声明 Node >= 20，默认端口/主机可在脚本中查看）。
- 构建：`npm run build`；运行生产：`npm start`。
- 查看日志：后端 API 在控制台输出错误，可通过开发终端观察请求与写入流程。

其他有用位置（快速索引）

- 数据：`public/music_list.json`、`public/music_list_backup.json`
- API：`pages/api/getSongs.js`、`pages/api/addSong.js`、`pages/api/deleteSong.js`
- 组件：`components/SongDetail.component.jsx`、`components/manage/AddSongForm.jsx`
- 配置：`config/constants.js`、`lib/siteConfigStore.js`、`public/site-config.json`
- 辅助脚本：`scripts/modify_json.py`、`scripts/converter.py`（数据转换/批处理脚本）

注意事项与禁忌（针对自动修改）

- 不要直接并发写 `public/music_list.json` 或移除写入队列；若需要新增写入端点，复用现有写队列实现。
- 避免大规模一次性变更索引或字段命名。若必须变更，提供迁移脚本并更新前端/API 依赖。
- 保持最小改动集：优先修改单一组件或 API，并手动或通过 CI 运行 `npm run dev` 验证主要页面（`pages/index.js`）是否仍能加载。

如何扩展/新增功能（建议步骤）

1. 在本地分支中实现小步改动（只改一个 API 或一个组件）。
2. 在 API 中复用写入队列/锁模式，添加字段验证/清洗。参考 `pages/api/addSong.js`。
3. 本地运行 `npm run dev` 并在浏览器验证 `GET /api/getSongs` 与相关页面行为。
4. 提交补丁时提供简短说明（变更范围、为何需要、是否影响索引）。

反馈与迭代

请审阅此文档并指出缺漏（例如 CI、测试流程或特殊部署步骤）。我会根据你的反馈调整内容或补充示例代码片段。

