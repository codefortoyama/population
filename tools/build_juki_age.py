"""Fill 住基 5歳階級×男女 (j5/j5m/j5f) into dashboard.html's data entries from the monthly
「富山市年齢別・性別人口」files (富山市オープンデータ、CC-BY).

nennreibetsu2309.xlsx (年次の推移表) は2023年9月末までなので、それ以降は月次ファイルの
《a〜b》小計行（総計＝日本人＋外国人）から作る:
  2024-09-30 ← nenreibetsu2409.xlsx, 2025-10-01 ← nenreibetsu2509.xlsx,
  2026-08-31 ← nenreibetsu2608.xlsx
合計が各行の juki / jm / jf と一致しない場合は中止する。

Usage: python tools/fetch_raw.py && python tools/build_juki_age.py
"""
import json
import pathlib
import re

import openpyxl

ROOT = pathlib.Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
TARGETS = {"2024-09-30": "nenreibetsu2409.xlsx", "2025-10-01": "nenreibetsu2509.xlsx",
           "2026-08-31": "nenreibetsu2608.xlsx"}


def read(path):
    """21区分（0〜4歳 … 95〜99歳, 100歳以上）の [計], [男], [女] と合計"""
    ws = openpyxl.load_workbook(path, read_only=True, data_only=True).active
    t, m, f, tot = [], [], [], None
    for r in ws.iter_rows(values_only=True):
        lab = str(r[0] or "")
        if lab.startswith("《"):  # 小計行。列7〜9＝総計の男・女・計
            m.append(int(r[7])); f.append(int(r[8])); t.append(int(r[9]))
        elif lab == "【合計】":
            tot = (int(r[9]), int(r[7]), int(r[8]))
    if len(t) != 21 or tot is None or sum(t) != tot[0] or sum(m) != tot[1] or sum(f) != tot[2]:
        raise SystemExit(f"{path.name}: 小計 {len(t)} 区分・合計不一致")
    return t, m, f, tot


def main():
    p = ROOT / "dashboard.html"
    s = p.read_text(encoding="utf-8")
    for date, name in TARGETS.items():
        t, m, f, (tot, tm, tf) = read(RAW / name)

        def fill(mo):
            e = json.loads(mo.group(0))
            if (e.get("juki"), e.get("jm", tm), e.get("jf", tf)) != (tot, tm, tf):
                raise SystemExit(f"{date}: 住基合計 {e.get('juki')} がファイル {tot} と不一致")
            e["j5"], e["j5m"], e["j5f"] = t, m, f
            e.setdefault("jm", tm)
            e.setdefault("jf", tf)
            return json.dumps(e, ensure_ascii=False, separators=(",", ":"))

        s, n = re.subn(r'\{"date":"%s"[^{}]*\}' % date, fill, s)
        if not n:
            raise SystemExit(f"{date}: dashboard.html に行が無い")
        print(date, name, "→", n, "行", tot)
    p.write_text(s, encoding="utf-8")


if __name__ == "__main__":
    main()
