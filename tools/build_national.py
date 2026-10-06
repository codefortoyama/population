"""Build the "全国 住基×国勢" data (46 prefectural capitals, 2015/2020/2025).

Census (Oct 1) via e-Stat API, juki (Jan 1) via e-Stat file download
(総務省「住民基本台帳に基づく人口、人口動態及び世帯数」).
Outputs the NATIONAL JS array used by index.html.

Usage: python tools/build_national.py   (writes data/national.json + prints JS)
"""
import json
import os
import pathlib
import shutil
import urllib.parse
import urllib.request

import openpyxl
import xlrd

APPID = os.environ.get("ESTAT_APPID", "")
ROOT = pathlib.Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw" / "national"

CITIES = [
    ("01100", "北海道", "札幌市"), ("02201", "青森県", "青森市"), ("03201", "岩手県", "盛岡市"),
    ("04100", "宮城県", "仙台市"), ("05201", "秋田県", "秋田市"), ("06201", "山形県", "山形市"),
    ("07201", "福島県", "福島市"), ("08201", "茨城県", "水戸市"), ("09201", "栃木県", "宇都宮市"),
    ("10201", "群馬県", "前橋市"), ("11100", "埼玉県", "さいたま市"), ("12100", "千葉県", "千葉市"),
    ("14100", "神奈川県", "横浜市"), ("15100", "新潟県", "新潟市"), ("16201", "富山県", "富山市"),
    ("17201", "石川県", "金沢市"), ("18201", "福井県", "福井市"), ("19201", "山梨県", "甲府市"),
    ("20201", "長野県", "長野市"), ("21201", "岐阜県", "岐阜市"), ("22100", "静岡県", "静岡市"),
    ("23100", "愛知県", "名古屋市"), ("24201", "三重県", "津市"), ("25201", "滋賀県", "大津市"),
    ("26100", "京都府", "京都市"), ("27100", "大阪府", "大阪市"), ("28100", "兵庫県", "神戸市"),
    ("29201", "奈良県", "奈良市"), ("30201", "和歌山県", "和歌山市"), ("31201", "鳥取県", "鳥取市"),
    ("32201", "島根県", "松江市"), ("33100", "岡山県", "岡山市"), ("34100", "広島県", "広島市"),
    ("35203", "山口県", "山口市"), ("36201", "徳島県", "徳島市"), ("37201", "香川県", "高松市"),
    ("38201", "愛媛県", "松山市"), ("39201", "高知県", "高知市"), ("40130", "福岡県", "福岡市"),
    ("41201", "佐賀県", "佐賀市"), ("42201", "長崎県", "長崎市"), ("43100", "熊本県", "熊本市"),
    ("44201", "大分県", "大分市"), ("45201", "宮崎県", "宮崎市"), ("46201", "鹿児島県", "鹿児島市"),
    ("47201", "沖縄県", "那覇市"),
]

CENSUS = {"2015": ("0003149040", {"cdCat01": "00710", "cdCat02": "010"}),
          "2020": ("0003445078", {"cdCat01": "0"}),
          "2025": ("0004065881", {"cdCat01": "0"})}
JUKI = {"2015": "000030438568", "2020": "000031971203", "2025": "000040306653"}


def estat(path, **kw):
    kw.update({"appId": APPID, "lang": "J"})
    u = f"https://api.e-stat.go.jp/rest/3.0/app/json/{path}?" + urllib.parse.urlencode(kw)
    with urllib.request.urlopen(u, timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))


def census_val(sid, code, extra):
    kw = {"statsDataId": sid, "cdArea": code, "limit": 20}
    kw.update(extra)
    v = ((estat("getStatsData", **kw)["GET_STATS_DATA"]["STATISTICAL_DATA"]
          .get("DATA_INF", {}) or {}).get("VALUE", []) or [])
    if isinstance(v, dict):
        v = [v]
    return int(v[0]["$"]) if v else None


def download(sid, dest):
    if dest.exists() and dest.stat().st_size > 1000:
        return dest
    url = f"https://www.e-stat.go.jp/stat-search/file-download?statInfId={sid}&fileKind=0"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=180) as r:
        dest.write_bytes(r.read())
    return dest


def read_juki(path, datastart):
    d = {}
    if path.suffix == ".xls":
        sh = xlrd.open_workbook(path).sheet_by_index(0)
        get = lambda i, j: sh.cell_value(i, j)
        n = sh.nrows
    else:
        ws = openpyxl.load_workbook(path, data_only=True, read_only=True).active
        rows = list(ws.iter_rows(values_only=True))
        get = lambda i, j: rows[i][j]
        n = len(rows)
    for i in range(datastart, n):
        c = get(i, 0)
        if c is None:
            continue
        code = str(c).split(".")[0].strip().zfill(6)
        if len(code) >= 5:
            try:
                d[code[:5]] = int(float(get(i, 5)))
            except Exception:
                pass
    return d


def main():
    if not APPID:
        raise SystemExit("環境変数 ESTAT_APPID を設定してください（e-Stat のアプリケーションID）。")
    RAW.mkdir(parents=True, exist_ok=True)
    jmap = {}
    for year, sid in JUKI.items():
        ext = ".xlsx" if year == "2025" else ".xls"
        p = RAW / f"juki{year}{ext}"
        download(sid, p)
        jmap[year] = read_juki(p, 6 if year == "2025" else 5)

    out = []
    for code, pref, city in CITIES:
        cn = [census_val(CENSUS[y][0], code, CENSUS[y][1]) for y in ("2015", "2020", "2025")]
        jk = [jmap[y].get(code) for y in ("2015", "2020", "2025")]
        out.append({"code": code, "pref": pref, "city": city, "census": cn, "juki": jk})
        print(code, city, cn, jk)

    (ROOT / "data" / "national.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print("wrote data/national.json")
    print("--- JS array (index.html の const NATIONAL と一致させる) ---")
    print("const NATIONAL=[\n" + ",\n".join(
        '["%s","%s",[%s],[%s]]' % (r["pref"], r["city"], ",".join(map(str, r["census"])),
                                   ",".join(map(str, r["juki"]))) for r in out) + "\n];")


if __name__ == "__main__":
    main()
