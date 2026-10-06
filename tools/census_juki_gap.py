"""2015/2020/2025 の国勢確定値と住基9月末の差を要因分解する材料を出力。
観点:
- 国勢10/1 と住基9月末の差分（時期差）
- 年齢不詳の大きさ
- 人口集中地区や外国人
出力: docs/census_juki_gap.csv と標準出力
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
html = (ROOT / "index.html").read_text(encoding="utf-8")
rows = json.loads(re.search(r"const data=(\[[\s\S]*?\n\]);", html).group(1))

print("date,label,census,juki,diff(juki-census),census5_sum,census_unaccounted")
for r in rows:
    c, j = r.get("census"), r.get("juki")
    c5 = r.get("c5")
    c5s = sum(c5) if c5 else None
    unacct = (c - c5s) if (c is not None and c5s is not None) else None
    label = r.get("tag", "") or ""
    print(f"{r['date']},{label},{c},{j},"
          f"{(j-c) if (c is not None and j is not None) else ''},{c5s},{unacct}")
