"""List town-level census-vs-juki difference candidates (boundary mismatch or genuine gap).

Output: docs/boundary_candidates.csv
Columns: label, diff, rate_pct, census, juki, census_key, level, flag, oaza_census_sum, oaza_juki_sum, oaza_diff, note
Selection: matched towns with flag=clean and |diff| >= THRESHOLD (default 200).
Usage: python tools/list_boundary_candidates.py [threshold]
"""
import csv
import importlib.util
import io
import pathlib
import re
import sys
from collections import defaultdict

ROOT = pathlib.Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
DATA = ROOT / "data"
DOCS = ROOT / "docs"

spec = importlib.util.spec_from_file_location("bct", str(ROOT / "tools" / "build_censustown.py"))
bct = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bct)

threshold = abs(int(sys.argv[1])) if len(sys.argv) > 1 else 200

t = (RAW / "census2020_town.csv").read_bytes().decode("cp932")
rd = list(csv.reader(io.StringIO("\n".join(t.splitlines()[5:]))))
cset, clevel = set(), {}
for r in rd:
    if r[1] != "16201" or r[3] not in ("2", "3", "4"):
        continue
    k = r[9] + "|" + r[10]
    cset.add(k)
    clevel[k] = min(clevel.get(k, 9), int(r[3]))
ozlist = sorted({k.split("|")[0] for k in cset}, key=len, reverse=True)


def match(tn):
    for c in bct.variants(tn):
        m = bct.CHOMEI.match(c)
        kk = (m.group(1) + "|" + m.group(2)) if m else (c + "|")
        if kk in cset:
            return kk
    for c in bct.variants(tn):
        for oz in ozlist:
            if len(c) > len(oz) and c.startswith(oz):
                kk = oz + "|" + c[len(oz):]
                if kk in cset:
                    return kk
    return ""


txt = (DATA / "towns.js").read_text(encoding="utf-8")
labels = [lb for lb in re.findall(r'\["(.+?)",', txt) if " " in lb]
juki = {}
for lb, s in re.findall(r'\["(.+?)",([-\d,\snull]+)\],?', txt):
    if " " in lb and s.split(",")[0].strip() != "null":
        juki[lb] = int(s.split(",")[0])

ct = (DATA / "censustown.js").read_text(encoding="utf-8")
census = [None if x.strip() == "null" else int(x) for x in re.search(r"const CENSUS_TOWN=\[(.*?)\];", ct, re.S).group(1).split(",")]
flags = [x.strip().strip('"') for x in re.search(r"const CENSUS_FLAG=\[(.*?)\];", ct, re.S).group(1).split(",")]

rows = []
for i, lb in enumerate(labels):
    h = match(lb.split(" ", 1)[1])
    c, j = census[i], juki.get(lb)
    if c is None or j is None:
        continue
    rows.append({"label": lb, "key": h, "oaza": h.split("|")[0], "aza": h.split("|")[1],
                 "level": clevel.get(h, ""), "c": c, "j": j, "d": j - c, "flag": flags[i]})

g = defaultdict(list)
for r in rows:
    g[r["oaza"]].append(r)

sel = [r for r in rows if (r["flag"] or "clean") == "clean" and abs(r["d"]) >= threshold]
sel.sort(key=lambda r: -abs(r["d"]))

out = DOCS / "boundary_candidates.csv"
with out.open("w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f)
    w.writerow(["label", "diff", "rate_pct", "census", "juki", "census_key", "level", "flag",
                "oaza_census_sum", "oaza_juki_sum", "oaza_diff", "note"])
    for r in sel:
        rs = g[r["oaza"]]
        cs = sum(x["c"] for x in rs)
        js = sum(x["j"] for x in rs)
        parent_unmatched = (r["oaza"] + "|") in cset and not any(x["aza"] == "" for x in rs)
        note = []
        if parent_unmatched:
            note.append("国勢の親大字が未対応（住基側が細分）")
        if abs(js - cs) < abs(r["d"]) * 0.4:
            note.append("oaza内で相殺（境界付け替え疑い）")
        else:
            note.append("oaza全体で不一致")
        note.append("実差の可能性（施設・新築・時期差）も要確認")
        w.writerow([r["label"], r["d"], round(r["d"] / r["c"] * 100, 1) if r["c"] else "",
                    r["c"], r["j"], r["key"], r["level"], r["flag"] or "clean",
                    cs, js, js - cs, " / ".join(note)])
print(f"wrote {out} ({len(sel)} rows, threshold |diff|>={threshold})")
