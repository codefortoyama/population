"""Parse town1509.xlsx (H27.9) and emit data/towns15.js aligned to TOWNS order.

Match by 通称 exact; duplicates summed; missing -> null.
"""
import openpyxl
import pathlib
import re
from collections import defaultdict

RAW = pathlib.Path(r"C:\Users\tomin\work\富山人口\data\raw")
DATA = pathlib.Path(r"C:\Users\tomin\work\富山人口\data")

wb = openpyxl.load_workbook(RAW / "town1509.xlsx", data_only=True, read_only=True)
ws = wb.active
t15 = defaultdict(int)
havenull = defaultdict(int)
for i, row in enumerate(ws.iter_rows(values_only=True)):
    if i < 3:
        continue
    c, v = row[2], row[6]
    if c is None or "計" in str(c):
        continue
    t = str(c).strip()
    if t in ("", "0"):
        continue
    if isinstance(v, int):
        t15[t] += v
    else:
        havenull[t] += 1
wb.close()

txt = (DATA / "towns.js").read_text(encoding="utf-8")
labels = [lb for lb in re.findall(r'\["(.+?)",', txt) if " " in lb]
rows = re.findall(r'\["(.+?)",([-\d,\snull]+)\],?', txt)
juki20 = {}
for lb, vals in rows:
    if " " not in lb:
        continue
    v = [None if x.strip() == "null" else int(x) for x in vals.split(",")]
    juki20[lb] = v[0]
# same 通称 shared by multiple current towns -> assign to max 2020 juki only
byt = defaultdict(list)
for lb in labels:
    byt[lb.split(" ", 1)[1]].append(lb)
assign = {}
for t, lbs in byt.items():
    if t not in t15:
        continue
    if len(lbs) == 1:
        assign[lbs[0]] = t
    else:
        lbs.sort(key=lambda l: (juki20.get(l) is None, -(juki20.get(l) or 0)))
        assign[lbs[0]] = t
vals = []
n_hit = n_miss = 0
for lb in labels:
    if lb in assign:
        vals.append(str(t15[assign[lb]]))
        n_hit += 1
    else:
        vals.append("null")
        n_miss += 1
print(f"assigned {n_hit}, null {n_miss}")
s = sum(int(v) for v in vals if v != "null")
print("covered sum:", s)
(DATA / "towns15.js").write_text(
    "const TOWNS15_YEARS=[\"2015-09\"];\nconst TOWNS15=[\n" + ",\n".join(vals) + "\n];\n",
    encoding="utf-8")
print("towns15.js written")
