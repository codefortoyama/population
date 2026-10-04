"""Download all raw source files into data/raw.

Usage: python tools/fetch_raw.py
Files already present (size > 1000) are skipped. Sources are CC-BY (Toyama open
data) and e-Stat; see docs/SOURCES.md for provenance.
"""
import pathlib
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"

URLS = {
    # 住基 町丁合計（各年9月末、2026年のみ8月末）
    "town2009.xlsx": "https://opdt.city.toyama.lg.jp/dataset/38de10a1-d7b2-4053-a6b3-2bb19a472b6a/resource/8e342632-170e-46e1-8f2d-8c58977a3be2/download/shukei2009.xlsx",
    "town2109.xlsx": "https://opdt.city.toyama.lg.jp/dataset/23bdc2ba-9d52-4b4c-a553-abed28d81cb7/resource/b3c5b362-d620-438d-910a-11ac18f30540/download/intfs01.int.toyama-city.localredirect111015downloadsshukei2109.xlsx",
    "town2209.xlsx": "https://opdt.city.toyama.lg.jp/dataset/f873dcc3-35d4-4af2-ac3d-e9242ecfc54c/resource/814ffd74-894a-49bd-b3e7-f02ee06f0875/download/shukei2209.xlsx",
    "shukei2309.xlsx": "https://opdt.city.toyama.lg.jp/dataset/123e3f6c-8925-4903-b87b-1d1cac50aa1b/resource/70d19448-4e22-47a7-b635-07e3665a8d77/download/shukei2309.xlsx",
    "town2409.xlsx": "https://opdt.city.toyama.lg.jp/dataset/897788a5-d778-464d-bab2-0019ac8f8dd5/resource/d7ef31c7-a506-4a45-b266-32651c6efc8b/download/shukei2409.xlsx",
    "town2509.xlsx": "https://opdt.city.toyama.lg.jp/dataset/bd48b15b-bbb8-4aff-b610-7cc682849b1c/resource/65f56321-1a46-4334-9a29-ad13ed05e837/download/shukei2509.xlsx",
    "town2608.xlsx": "https://opdt.city.toyama.lg.jp/dataset/1087963b-6947-4f79-8b8a-ca352addbafb/resource/ae28511c-392c-4700-8971-735aa1af1015/download/shukei2608.xlsx",
    # 住基 町丁合計 H27.9（2015年突合用）
    "town1509.xlsx": "https://opdt.city.toyama.lg.jp/dataset/958bab29-eb5a-4926-842c-9f68def130f5/resource/7fcca612-c593-4c58-9163-3caf4fb817ac/download/kosyobetsusyukei1509.xlsx",
    # 住基 町丁×年齢（3月末）
    "ta_r2_t1.xlsx": "https://opdt.city.toyama.lg.jp/dataset/4850d965-1f58-413d-8cbe-4859a4578fb3/resource/899696f4-c01d-410e-9a2a-3a1befc419de/download/r2-1.xlsx",
    "ta_r2_t2.xlsx": "https://opdt.city.toyama.lg.jp/dataset/4850d965-1f58-413d-8cbe-4859a4578fb3/resource/916783c9-84aa-4e43-8357-5950d90c40b8/download/r2-2.xlsx",
    "townage_r2_6.xlsx": "https://opdt.city.toyama.lg.jp/dataset/33d5a4e0-7340-4193-b2ae-f85c66c7062c/resource/9c5a4ce4-fbdf-4453-891e-ba8fafd2913d/download/r2-3.xlsx",
    "ta_r7_t1.xlsx": "https://opdt.city.toyama.lg.jp/dataset/4850d965-1f58-413d-8cbe-4859a4578fb3/resource/1d9495d5-c6f2-4f1d-b519-41c292c58343/download/tyotyonenrei2503-1.xlsx",
    "ta_r7_t2.xlsx": "https://opdt.city.toyama.lg.jp/dataset/4850d965-1f58-413d-8cbe-4859a4578fb3/resource/b45b7418-e8cf-484f-bb99-07bdb588c2d6/download/tyotyonenrei2503-2.xlsx",
    "ta_r7_6.xlsx": "https://opdt.city.toyama.lg.jp/dataset/33d5a4e0-7340-4193-b2ae-f85c66c7062c/resource/563436c6-a3ac-4956-9fcc-199366b186bb/download/tyotyonenrei2503-3.xlsx",
    # 住基 全市 年齢×性別・人口
    "nennreibetsu2309.xlsx": "https://opdt.city.toyama.lg.jp/dataset/3462aeb4-7ccc-4f8c-8442-f59bb86a4b78/resource/ca5e485c-62a8-4025-970a-08efb91c31f9/download/nennreibetsu2309.xlsx",
    "jinko2309.xlsx": "https://opdt.city.toyama.lg.jp/dataset/3462aeb4-7ccc-4f8c-8442-f59bb86a4b78/resource/92e7c50c-67bc-423e-8317-35e90515eb11/download/jinko2309.xlsx",
    "jinko.xlsx": "https://opdt.city.toyama.lg.jp/dataset/baa8838e-59c4-47ae-9bc7-f253d7f001ca/resource/d5852ca6-eae9-4146-aff5-f1a25a97ecf8/download/jinko.xlsx",
    # 国勢 2020 小地域（合計・5歳）
    "census2020_town.csv": "https://www.e-stat.go.jp/stat-search/file-download?statInfId=000032163319&fileKind=1",
    "census2020_town_320.bin": "https://www.e-stat.go.jp/stat-search/file-download?statInfId=000032163320&fileKind=1",
    # 国勢 2015 全市 5歳（表4-3）
    "H27_age43_k1.bin": "https://www.e-stat.go.jp/stat-search/file-download?statInfId=000031472200&fileKind=1",
}

RAW.mkdir(parents=True, exist_ok=True)
ok = skip = fail = 0
for name, url in URLS.items():
    dest = RAW / name
    if dest.exists() and dest.stat().st_size > 1000:
        print("skip", name, dest.stat().st_size)
        skip += 1
        continue
    try:
        print("get ", name)
        urllib.request.urlretrieve(url, dest)
        ok += 1
    except Exception as e:
        print("FAIL", name, e)
        fail += 1
print(f"done: downloaded={ok} skipped={skip} failed={fail}")
print("NOTE: 2010/2025 の国勢年齢は e-Stat API から取得（docs/SOURCES.md の C7/C9 参照）。")
