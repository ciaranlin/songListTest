import json
import pandas as pd
import math


def safe(v):
    if v is None:
        return None
    if isinstance(v, float) and math.isnan(v):
        return None
    return v


song_df = pd.read_excel("./music.xlsx")
song_df = song_df.where(pd.notnull(song_df), None)

song_list = []

for index, row in song_df.iterrows():
    song_data = {
        "index": index,
        "song_name": safe(row[0]),
        "artist": safe(row[1]),
        "language": safe(row[2]),
        "remarks": safe(row[3]),
        "initial": safe(row[4]),
        "sticky_top": safe(row[5]),
        "paid": safe(row[6]),
        "BVID": safe(row[7]),
        "captain": safe(row[8]),  # ← 新增字段
    }

if row[5] == 1:
    song_list.insert(0, song_data)
else:
    song_list.append(song_data)

with open("../public/music_list.json", "w", encoding="utf-8") as f:
    json.dump(song_list, f, ensure_ascii=False)
