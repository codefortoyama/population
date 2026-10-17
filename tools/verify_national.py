"""Cross-check data/national.json (全国 国勢×住基タブ) against independent e-Stat files.

Checks per city (46 prefectural capitals + 東京23区＝特別区部 13100):
  1. 住基: the row found by code in the juki file has the expected city name (男+女≠計 is noted).
  2. 住基: the value equals the 総数 of the same-date 年齢階級別人口 file (a separate table).
  3. 国勢: each year equals the next census's Table 1 value
     (2015 file: 2015 and 2010組替 / 2025 file: 2025 and 2020組替).
     A mismatch on a 組替 value can be a legitimate boundary change, so it is reported, not hidden.
  4. index.html の NATIONAL 配列が national.json と一致。
  5. 差（国勢−住基）の比率が他都市から大きく外れていないか（参考表示）。

Inputs live in data/raw/national/ (untracked). Verification-only files are in data/raw/national/verify/:
  census2015_t1.csv   平成27年 人口等基本集計 第1表 (statInfId=000031473210, fileKind=1)
  census2025_t1.xlsx  令和7年 人口等基本集計 表1-1 確定 (statInfId=000040506423, fileKind=0)
  jukiage2011.xls / jukiage2016.xls / jukiage2021.xlsx / jukiage2026.xlsx
    住基 市区町村別年齢(階級)別人口 (000011437959 / 000031429218 / 000040306661 / 000040479050)

Usage: python tools/verify_national.py   (exit 1 if a hard check fails)
"""
import csv
import json
import pathlib
import re
import sys

import openpyxl
import xlrd

ROOT = pathlib.Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw" / "national"
VER = RAW / "verify"
YEARS = ("2010", "2015", "2020", "2025")
JUKI_FILES = {"2010": "juki2011.xls", "2015": "juki2016.xls", "2020": "juki2021.xlsx", "2025": "juki2026.xlsx"}
AGE_FILES = {"2010": "jukiage2011.xls", "2015": "jukiage2016.xls", "2020": "jukiage2021.xlsx", "2025": "jukiage2026.xlsx"}
CODE2010 = {"43100": "43201"}  # 熊本市 (designated city from 2012)
WARDS23 = [f"131{i:02d}" for i in range(1, 24)]
CENSUS_NAME = {"13100": "特別区部"}  # 国勢の表での23区の名前


def rows_of(path):
    if path.suffix == ".xls":
        sh = xlrd.open_workbook(path).sheet_by_index(0)
        return [sh.row_values(i) for i in range(sh.nrows)]
    return [list(r) for r in openpyxl.load_workbook(path, read_only=True, data_only=True).active.iter_rows(values_only=True)]


def code5(v):
    return str(v).split(".")[0].strip().zfill(6)[:5] if v not in (None, "", "-") else ""


def name(v):
    return re.sub(r"[\s　*]", "", str(v or ""))


def juki_main(path):
    d = {}
    for r in rows_of(path):
        c = code5(r[0])
        if len(c) == 5 and c not in d and isinstance(r[5], (int, float)):
            d[c] = (name(r[2]), int(r[3]), int(r[4]), int(r[5]))
    # 23区は区の行を合計（区名がすべて「〜区」であることも確認）
    if all(w in d and d[w][0].endswith("区") for w in WARDS23):
        d["13100"] = ("23区",) + tuple(sum(d[w][k] for w in WARDS23) for k in (1, 2, 3))
    return d


def juki_age(path):
    d = {}
    for r in rows_of(path):
        c = code5(r[0])
        if len(c) == 5 and name(r[3]) == "計" and c not in d:
            d[c] = int(r[4])
    if all(w in d for w in WARDS23):
        d["13100"] = sum(d[w] for w in WARDS23)
    return d


def census2015():
    d = {}
    for r in csv.reader((VER / "census2015_t1.csv").read_text(encoding="cp932").splitlines()):
        if len(r) > 8 and r[4] == "2015" and len(r[2]) == 5 and r[2] not in d:
            d[r[2]] = (name(r[6]), int(r[7]), int(r[8]) if r[8].lstrip("-").isdigit() else None)
    return d


def census2025():
    d = {}
    for r in rows_of(VER / "census2025_t1.xlsx"):
        c = str(r[5] or "")  # 列5=現在の地域コード（列2は2000年市町村コード）
        # 地域識別コード 1=政令市 2=市 3=町村（9=2000年市町村、0=区 は除外）
        if str(r[0]) in ("1", "2", "3") and len(c) == 5 and isinstance(r[7], (int, float)) and c not in d:
            d[c] = (name(str(r[6]).split("_", 1)[-1]), int(r[7]), int(r[10]) if isinstance(r[10], (int, float)) else None)
    return d


def main():
    nat = json.loads((ROOT / "data" / "national.json").read_text(encoding="utf-8"))
    jm = {y: juki_main(RAW / f) for y, f in JUKI_FILES.items()}
    ja = {y: juki_age(VER / f) for y, f in AGE_FILES.items()}
    c15, c25 = census2015(), census2025()
    fails, notes = [], []

    for r in nat:
        code, city = r["code"], r["city"]
        for i, y in enumerate(YEARS):
            jc = CODE2010.get(code, code) if y == "2010" else code
            j = r["juki"][i]
            row = jm[y].get(jc)
            if not row:
                fails.append(f"{city} {y} 住基: コード{jc}が住基ファイルに無い")
                continue
            nm, m, f, t = row
            if nm != city:
                fails.append(f"{city} {y} 住基: コード{jc}の市名が「{nm}」")
            if m + f != t:  # 性別の記載がない住民がいると男+女<計になる（公表値のまま）
                notes.append(f"{city} {y} 住基: 男{m:,}+女{f:,}={m+f:,} ≠ 計{t:,}（差{t-m-f}）")
            if t != j:
                fails.append(f"{city} {y} 住基: json {j} ≠ ファイル {t}")
            a = ja[y].get(jc)
            if a != j:
                fails.append(f"{city} {y} 住基: 年齢別ファイル総数 {a} ≠ {j}")

        cn = r["census"]
        # 2015 file: own 2015 value and 2010 recombined to 2015 boundaries
        s = c15.get(code)
        if not s:
            fails.append(f"{city} 国勢2015: コード{code}が第1表に無い")
        else:
            if s[0] != CENSUS_NAME.get(code, city):
                fails.append(f"{city} 国勢2015: 第1表の市名が「{s[0]}」")
            if s[1] != cn[1]:
                fails.append(f"{city} 国勢2015: json {cn[1]} ≠ 第1表 {s[1]}")
            if s[2] != cn[0]:
                notes.append(f"{city} 国勢2010: json {cn[0]} ≠ 2015年境域組替 {s[2]}（差 {s[2]-cn[0]:+,}）→ 2010→2015間の境域変更の可能性")
        s = c25.get(code)
        if not s:
            fails.append(f"{city} 国勢2025: コード{code}が表1-1に無い")
        else:
            if s[0] != CENSUS_NAME.get(code, city):
                fails.append(f"{city} 国勢2025: 表1-1の市名が「{s[0]}」")
            if s[1] != cn[3]:
                fails.append(f"{city} 国勢2025: json {cn[3]} ≠ 表1-1 {s[1]}")
            if s[2] != cn[2]:
                notes.append(f"{city} 国勢2020: json {cn[2]} ≠ 2025年境域組替 {s[2]}（差 {s[2]-cn[2]:+,}）→ 2020→2025間の境域変更の可能性")

    # index.html の埋め込み配列
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    m = re.search(r"const NATIONAL=(\[.*?\n\]);", html, re.S)
    emb = json.loads(m.group(1)) if m else None
    want = [[r["pref"], r["city"], r["census"], r["juki"]] for r in nat]
    if emb != want:
        fails.append("index.html の NATIONAL が national.json と不一致")

    # 参考：差の比率の外れ値（全都市・年ごとの中央値から±2pt超）
    for i, y in enumerate(YEARS):
        rat = sorted((r["census"][i] - r["juki"][i]) / r["census"][i] * 100 for r in nat)
        med = rat[len(rat) // 2]
        for r in nat:
            p = (r["census"][i] - r["juki"][i]) / r["census"][i] * 100
            if abs(p - med) > 2:
                notes.append(f"{r['city']} {y}: 差率 {p:+.2f}%（全市中央値 {med:+.2f}%）")

    print(f"都市数 {len(nat)} / 年 {len(YEARS)} / 不一致 {len(fails)} / 要確認 {len(notes)}")
    for x in fails:
        print("NG", x)
    for x in notes:
        print("注", x)
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
