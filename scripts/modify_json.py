import json
import os

json_path = "../public/music_list.json"
backup_path = "../public/music_list_backup.json"

print("脚本开始执行…")
print("JSON 路径 =", os.path.abspath(json_path))

# 检查文件是否存在
if not os.path.exists(json_path):
    print("❌ 找不到 JSON 文件！")
    exit()

print("✔ 找到 JSON 文件，正在读取…")

with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

print("✔ JSON 读取成功，共有", len(data), "首歌")

# 添加字段
for song in data:
    song.setdefault("mood", "舰长点歌")

print("✔ 字段添加完毕，准备写入…")

# 写入备份
with open(backup_path, "w", encoding="utf-8") as b:
    json.dump(data, b, ensure_ascii=False, indent=2)

print("✔ 备份生成成功:", os.path.abspath(backup_path))

# 写回原文件
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("🎉 JSON 修改成功！")
