"""Rebuild data/censustown.js from data/raw (2020 census small areas).

Self-contained (no external temp files). Boundary dispositions:
- dup: same census key matched by multiple towns -> the town closest in 2020
  juki keeps the value, others become null (flag "dup")
- adj: parent key minus its matched child keys (totals, M/F, age bands)
- boundary: parent with unmatched children, or adj <= 0 -> null (flag "boundary")
- order follows towns.js labels

Usage: python tools/build_censustown.py   (run from anywhere; paths are relative)
"""
import csv
import io
import json
import pathlib
import re
from collections import defaultdict

ROOT = pathlib.Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
DATA = ROOT / "data"
DOCS = ROOT / "docs"

K2K = str.maketrans("０１２３４５６７８９", "〇一二三四五六七八九")
CHOMEI = re.compile(r"^(.*?)((一|二|三|四|五|六|七|八|九|十|百|[0-9０-９])+丁目)$")

# towns whose census-area and juki-town names match but the counts diverge enough
# that a boundary difference (or a genuine facility/housing gap) is plausible.
SUSPECT_DIFF = 200


def num(v):
    if v in ("X", "", None):
        return None
    if v == "-":
        return 0
    return int(v)


def variants(town):
    cands = [town, town.replace("ケ", "ヶ"), town.replace("ヶ", "ケ"),
             town.translate(K2K), town.translate(K2K).replace("ケ", "ヶ")]
    # orthographic variants seen in Toyama town names
    extra = []
    for c in cands:
        if "舘" in c:
            extra.append(c.replace("舘", "館"))
        if "館" in c:
            extra.append(c.replace("館", "舘"))
        if "ノ" in c:
            extra.append(c.replace("ノ", "之"))
        if "之" in c:
            extra.append(c.replace("之", "ノ"))
    out = []
    for c in cands + extra:
        if c not in out:
            out.append(c)
    return out


def load319full():
    """key -> (total, male, female)."""
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
        out[k] = tuple(None if all(v is None for v in col(i)) else sum(v or 0 for v in col(i))
                       for i in (1, 2, 3))
    return out


def load320full():
    """(key, sex) -> 21 bands."""
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


def main():
    cmap = load319full()
    amage = load320full()
    cset = set(cmap.keys())
    ozlist = sorted({k.split("|")[0] for k in cset}, key=len, reverse=True)

    def match(tn):
        for c in variants(tn):
            m = CHOMEI.match(c)
            kk = (m.group(1) + "|" + m.group(2)) if m else (c + "|")
            if kk in cset:
                return kk, "whole"
        for c in variants(tn):
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
    for lb, vals_ in trows:
        if " " not in lb:
            continue
        v = [None if x.strip() == "null" else int(x) for x in vals_.split(",")]
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

    INVSEX = {0: "総数", 1: "男", 2: "女"}
    vals = {}
    stat = defaultdict(int)
    for lb in labels:
        h, how = hits[lb]
        if not h:
            vals[lb] = ([None, None, None], None, None, None, "")
            stat["unmatched"] += 1
            continue
        mates = [l2 for l2 in bykey[h] if l2 != lb]
        if mates:
            c0 = cmap[h][0]
            cand = [(lb, juki.get(lb))] + [(m, juki.get(m)) for m in mates]
            scored = sorted(((abs(j - c0) if (j is not None and c0 is not None) else None, l)
                             for l, j in cand), key=lambda x: (x[0] is None, x[0]))
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
            for col in (0, 1, 2):
                if tot[col] is None:
                    continue
                tot[col] -= sum((cmap[k][col] or 0) for k in chm)
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
        jv = juki.get(lb)
        fl = "suspect" if (v[0] is not None and jv is not None and abs(jv - v[0]) >= SUSPECT_DIFF) else ""
        vals[lb] = ([v[0], v[1], v[2]], a[0], a[1], a[2], fl)
        stat["clean"] += 1
        if fl:
            stat["suspect"] += 1

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
    for key, nm in (("T", "CENSUS_TOWN"), ("M", "CENSUS_TOWN_M"), ("F", "CENSUS_TOWN_F"),
                    ("A", "CENSUS_TOWNAGE"), ("AM", "CENSUS_TOWNAGE_M"), ("AF", "CENSUS_TOWNAGE_F"),
                    ("FL", "CENSUS_FLAG")):
        out.append(f"const {nm}=[")
        out.append(",\n".join(arr[key]))
        out.append("];")
    (DATA / "censustown.js").write_text("\n".join(out) + "\n", encoding="utf-8")
    print("censustown.js written")

    rep = []
    for lb in labels:
        (t3, aT, aM, aF, fl) = vals[lb]
        if fl:
            h, _ = hits[lb]
            rep.append({"label": lb, "flag": fl, "ckey": h, "census": t3[0], "juki": juki.get(lb)})
    (DOCS / "flags.json").write_text(json.dumps(rep, ensure_ascii=False, indent=1), encoding="utf-8")
    print("flagged:", len(rep))


if __name__ == "__main__":
    main()
