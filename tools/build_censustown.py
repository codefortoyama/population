"""Rebuild censustown.js with boundary fixes + CENSUS_FLAG.

dup: same census key matched by multiple towns -> closest keeps value, others null
adj: parent key minus matched children (totals, M/F, age bands; null propagates)
boundary: parent with unmatched children, or adj<=0 -> null
Order follows towns.js labels (1448).
"""
import csv
import io
import importlib.util
import json
import pathlib
import re
from collections import defaultdict

RAW = pathlib.Path(r"C:\Users\tomin\work\富山人口\data\raw")
DATA = pathlib.Path(r"C:\Users\tomin\work\富山人口\data")

spec = importlib.util.spec_from_file_location(
    "bct", "C:/Users/tomin/AppData/Local/Temp/opencode/build_censustown.py")
bct = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bct)
num = bct.num


def load319full():
    t = (RAW / "census2020_town.csv").read_bytes().decode("cp932")
    rd = list(csv.reader(io.StringIO("\n".join(t.splitlines()[5:]))))
    pool = defaultdict(list)
    for r in rd:
        if r[1] != "16201" or r[3] not in ("2", "3", "4"):
            continue
        pool[r[9] + "|" + r[10]].append((int(r[3]), num(r[11]), num(r[12]), num(r[13])))
    out = {}
    for k, vs in pool.items():
        best = min(v[0] for v in vs)
        c = [v for v in vs if v[0] == best]
        col = lambda i: [v[i] for v in c]
        T = col(1)
        out[k] = (
            None if all(v is None for v in T) else sum(v or 0 for v in T),
            None if all(v is None for v in col(2)) else sum(v or 0 for v in col(2)),
            None if all(v is None for v in col(3)) else sum(v or 0 for v in col(3)),
        )
    return out


def load320full():
    t = (RAW / "census2020_town_320.bin").read_bytes().decode("cp932")
    rd = list(csv.reader(io.StringIO("\n".join(t.splitlines()[5:]))))
    pool = defaultdict(list)
    for r in rd:
        if r[2] != "16201" or r[4] not in ("2", "3", "4") or r[1] not in ("総数", "男", "女"):
            continue
        pool[(r[10] + "|" + r[11], r[1])].append((int(r[4]), [num(x) for x in r[13:34]]))
    out = {}
    for (k, sex), vs in pool.items():
        best = min(v[0] for v in vs)
        c = [v for v in vs if v[0] == best]
        bands = []
        for i in range(21):
            col = [v[1][i] for v in c]
            bands.append(None if any(v is None for v in col) else sum(col))
        out[(k, sex)] = None if all(b is None for b in bands) else bands
    return out


cmap = load319full()
amage = load320full()
cset = set(cmap.keys())
ozlist = sorted({k.split("|")[0] for k in cset}, key=len, reverse=True)


def match(tn):
    for c in bct.variants(tn):
        m = bct.CHOMEI.match(c)
        kk = (m.group(1) + "|" + m.group(2)) if m else (c + "|")
        if kk in cset:
            return kk, "whole"
    for c in bct.variants(tn):
        for oz in ozlist:
            if len(c) > len(oz) and c.startswith(oz):
                kk = oz + "|" + c[len(oz):]
                if kk in cset:
                    return kk, "split"
    return "", "none"


txt = (DATA / "towns.js").read_text(encoding="utf-8")
labels = [lb for lb in re.findall(r'\["(.+?)",', txt) if " " in lb]
trows = re.findall(r'\["(.+?)",([-\d,\snull]+)\],?', txt)
juki = {}
for lb, vals in trows:
    if " " not in lb:
        continue
    v = [None if x.strip() == "null" else int(x) for x in vals.split(",")]
    juki[lb] = v[0]

hits, bykey = {}, defaultdict(list)
for lb in labels:
    h, how = match(lb.split(" ", 1)[1])
    hits[lb] = (h, how)
    if h:
        bykey[h].append(lb)
children = defaultdict(list)
for k in cset:
    o, a = k.split("|")
    if a != "":
        children[o + "|"].append(k)

SEXMAP = {"総数": 0, "男": 1, "女": 2}
INVSEX = {0: "総数", 1: "男", 2: "女"}

vals = {}   # label -> ([T,M,F], ageT, ageM, ageF, flag)
stat = defaultdict(int)
for lb in labels:
    h, how = hits[lb]
    if not h:
        vals[lb] = ([None, None, None], None, None, None, "")
        stat["unmatched"] += 1
        continue
    mates = [l2 for l2 in bykey[h] if l2 != lb]
    if mates:
        # dup: closest keeps
        c0 = cmap[h][0]
        cand = [(lb, juki.get(lb))] + [(m, juki.get(m)) for m in mates]
        scored = [(abs(j - c0) if (j is not None and c0 is not None) else None, l)
                  for l, j in cand]
        scored.sort(key=lambda x: (x[0] is None, x[0]))
        if scored[0][1] == lb:
            v = cmap[h]
            a = {s: amage.get((h, INVSEX[s])) for s in (0, 1, 2)}
            vals[lb] = ([v[0], v[1], v[2]], a[0], a[1], a[2], "")
            stat["dup-winner"] += 1
        else:
            vals[lb] = ([None, None, None], None, None, None, "dup")
            stat["dup-loser"] += 1
        continue
    ch = children.get(h, [])
    chm = [c for c in ch if any(hits.get(l2, ("", ""))[0] == c for l2 in labels if l2 != lb)]
    chu = [c for c in ch if c not in chm]
    if chm and not chu:
        tot = list(cmap[h])
        ok = True
        for col in (0, 1, 2):
            s = sum((cmap[k][col] or 0) for k in chm)
            if tot[col] is None:
                tot[col] = None
            else:
                tot[col] = tot[col] - s
        ages = {}
        for s, sx in ((0, "総数"), (1, "男"), (2, "女")):
            base = amage.get((h, sx))
            subs = [amage.get((k, sx)) for k in chm]
            if base is None or any(x is None for x in subs):
                ages[s] = None
            else:
                ages[s] = [b - sum(x[i] for x in subs) for i, b in enumerate(base)]
        if tot[0] is not None and tot[0] <= 0:
            vals[lb] = ([None, None, None], None, None, None, "boundary")
            stat["adj-zero"] += 1
        else:
            vals[lb] = (tot, ages[0], ages[1], ages[2], "adj")
            stat["adj"] += 1
        continue
    if chm or chu:
        vals[lb] = ([None, None, None], None, None, None, "boundary")
        stat["boundary"] += 1
        continue
    v = cmap[h]
    a = {s: amage.get((h, INVSEX[s])) for s in (0, 1, 2)}
    vals[lb] = ([v[0], v[1], v[2]], a[0], a[1], a[2], "")
    stat["clean"] += 1

print(dict(stat))
arr = {"T": [], "M": [], "F": [], "A": [], "AM": [], "AF": [], "FL": []}


def jsarr(a):
    return "null" if a is None else "[" + ",".join("null" if x is None else str(x) for x in a) + "]"


for lb in labels:
    (t3, aT, aM, aF, fl) = vals[lb]
    arr["T"].append("null" if t3[0] is None else str(t3[0]))
    arr["M"].append("null" if t3[1] is None else str(t3[1]))
    arr["F"].append("null" if t3[2] is None else str(t3[2]))
    arr["A"].append(jsarr(aT))
    arr["AM"].append(jsarr(aM))
    arr["AF"].append(jsarr(aF))
    arr["FL"].append('"' + fl + '"')

nval = sum(1 for v in arr["T"] if v != "null")
print("non-null totals:", nval, "sum:", sum(int(v) for v in arr["T"] if v != "null"))
out = ['const CENSUS_TOWN_YEAR="2020-10-01";']
for key, nm in (("T", "CENSUS_TOWN"), ("M", "CENSUS_TOWN_M"), ("F", "CENSUS_TOWN_F")):
    out.append(f"const {nm}=[")
    out.append(",\n".join(arr[key]))
    out.append("];")
for key, nm in (("A", "CENSUS_TOWNAGE"), ("AM", "CENSUS_TOWNAGE_M"), ("AF", "CENSUS_TOWNAGE_F")):
    out.append(f"const {nm}=[")
    out.append(",\n".join(arr[key]))
    out.append("];")
out.append("const CENSUS_FLAG=[")
out.append(",\n".join(arr["FL"]))
out.append("];")
(DATA / "censustown.js").write_text("\n".join(out) + "\n", encoding="utf-8")
print("censustown.js written")
# disposition report for docs
rep = []
for lb in labels:
    (t3, aT, aM, aF, fl) = vals[lb]
    if fl:
        h, how = hits[lb]
        rep.append({"label": lb, "flag": fl, "ckey": h,
                    "census": t3[0], "juki": juki.get(lb)})
pathlib.Path("C:/Users/tomin/AppData/Local/Temp/opencode/flags.json").write_text(
    json.dumps(rep, ensure_ascii=False, indent=1), encoding="utf-8")
print("flagged:", len(rep))
