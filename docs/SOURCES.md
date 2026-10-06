# 出典一覧（富山市人口ビューアー）

取得時期：2026年10月（特記なき限り）。ライセンス：富山市オープンデータはCC-BY、
e-Stat掲載データはe-Stat利用規約に従い出典を記載して利用。

原料ファイル（`data/raw/`）はリポジトリに含めていません。`python tools/fetch_raw.py` で再取得できます
（国勢2010年・2025年の年齢は e-Stat API からの取得のため同スクリプトには含まれず、下表 C7/C9 を参照）。

## 国勢調査（総務省統計局、e-Stat）

| # | 内容 | 原典・ID | 基準日 | 利用箇所 |
|---|------|----------|--------|----------|
| C1 | 2015年全市5歳・性別（表4-3） | e-Statファイル `statInfId=000031472200&fileKind=1`（`https://www.e-stat.go.jp/stat-search/file-download`） | 2015-10-01 | 全市c5m/c5f |
| C2 | 2020年全市5歳（表2-7） | e-Statファイル `statInfId=000032142410&fileKind=0` | 2020-10-01 | 全市c5（小地域320の市行と一致確認） |
| C3 | 2020年町丁合計（小地域） | e-Statファイル `statInfId=000032163319&fileKind=1`（Shift-JIS CSV、16201抽出） | 2020-10-01 | `censustown.js` 合計 |
| C4 | 2020年町丁5歳×性別（小地域） | e-Statファイル `statInfId=000032163320&fileKind=1`（総数・男・女の3表） | 2020-10-01 | `censustown.js` 年齢・M/F |
| C5 | 2025年速報（男女別・市区町村） | e-Stat API `statsDataId=0004050397`（`https://api.e-stat.go.jp/rest/3.0/app/json/`） | 2025-10-01 | 速報402,133（男197,015・女205,118） |
| C6 | 2025年確定（人口等基本集計 表1-1-1） | e-Stat API 統計表ID `0004065881` | 2025-10-01 | 確定399,197（男195,482・女203,715） |
| C7 | 2010年全市5歳・性別 | 0003038591（年齢5歳階級,出生の月,国籍,男女別人口・市区町村。全域/総数/国籍総数/出生総数で抽出） | 2010-10-01 | 全市c5/c5m/c5f（不詳を除く。不詳2,690を加算し総数421,953と一致） |
| C9 | 2025年全市各歳・性別 | 0004065943（年齢各歳・国籍総数/男女別人口・市区町村） | 2025-10-01 | 全市c5/c5m/c5f（各歳を5歳階級に集計。年齢不詳4,360を除き総数399,197と一致） |
| C8 | 2015/2020年小地域の2010年・2015年町丁年齢 | 未取得 | — | 町丁年齢は住基のみ |

結果表ポータル：`https://www.stat.go.jp/data/kokusei/2025/kekka.html`、
`https://www.stat.go.jp/data/kokusei/2020/index.html`、
`https://www.stat.go.jp/data/kokusei/2015/kekka.html`

## 住民基本台帳（富山市オープンデータ、CC-BY）

| # | 内容 | ファイル・リソース | 基準日 | 利用箇所 |
|---|------|-------------------|--------|----------|
| J1 | 全市5歳×性別（各年9月末） | `nennreibetsu2309.xlsx`（dataset `3462aeb4-…` / resource `ca5e485c-…`） | 1980-2023年各9月末 | 全市j5m/j5f（2005年以降を組込、T系列・合計と検証済み） |
| J2 | 全市人口・世帯推移 | `jinko2309.xlsx`（resource `92e7c50c-…`）、`jinko.xlsx`（dataset `baa8838e-…` / resource `d5852ca6-…`） | 各年 | 補助検証用 |
| J3 | 町丁合計 R2.9 | `town2009.xlsx`（`shukei2009.xlsx`、dataset `38de10a1-…` / resource `8e342632-…`） | 2020-09-30 | `towns.js` 2020年列 |
| J4 | 町丁合計 R3.9 | `town2109.xlsx`（dataset `23bdc2ba-…` / resource `b3c5b362-…`） | 2021-09-30 | `towns.js` 2021年列 |
| J5 | 町丁合計 R4.9 | `town2209.xlsx`（`shukei2209.xlsx`、dataset `f873dcc3-…` / resource `814ffd74-…`） | 2022-09-30 | `towns.js` 2022年列 |
| J6 | 町丁合計 R5.9 | `shukei2309.xlsx`（dataset `123e3f6c-…` / resource `70d19448-…`） | 2023-09-30 | `towns.js` 2023年列（町丁順の基準） |
| J7 | 町丁合計 R6.9 | `town2409.xlsx`（`shukei2409.xlsx`、dataset `897788a5-…` / resource `d7ef31c7-…`） | 2024-09-30 | `towns.js` 2024年列 |
| J8 | 町丁合計 R7.9 | `town2509.xlsx`（`shukei2509.xlsx`、dataset `bd48b15b-…` / resource `65f56321-…`） | 2025-09-30 | `towns.js` 2025年列 |
| J9 | 町丁合計 R8.8 | `town2608.xlsx`（`shukei2608.xlsx`、dataset `1087963b-…` / resource `ae28511c-…`） | 2026-08-31 | `towns.js` 2026年列 |
| J10 | 町丁年齢 R2.3（富山地域1・2） | `ta_r2_t1.xlsx`（`r2-1.xlsx`）、`ta_r2_t2.xlsx`（`r2-2.xlsx`、dataset `4850d965-…`） | 2020-03-31 | `townage.js` 2020年 |
| J11 | 町丁年齢 R2.3（6地域） | `townage_r2_6.xlsx`（`r2-3.xlsx`、dataset `33d5a4e0-…` / resource `9c5a4ce4-…`） | 2020-03-31 | `townage.js` 2020年 |
| J12 | 町丁年齢 R7.3（富山地域1・2） | `ta_r7_t1.xlsx`（`tyotyonenrei2503-1.xlsx`）、`ta_r7_t2.xlsx`（`-2.xlsx`、dataset `4850d965-…`） | 2025-03-31 | `townage.js` 2025年 |
| J13 | 町丁年齢 R7.3（6地域） | `ta_r7_6.xlsx`（`tyotyonenrei2503-3.xlsx`、dataset `33d5a4e0-…` / resource `563436c6-…`） | 2025-03-31 | `townage.js` 2025年 |
| J14 | 町丁合計 H27.9 | `town1509.xlsx`（`kosyobetsusyukei1509.xlsx`、`https://opdt.city.toyama.lg.jp/dataset/toukei09`） | 2015-09-30 | `towns15.js`（通称突合、将来用） |
| J15 | 外国人住基 | `gaikoku2009.xlsx`（`jyuuminsuu2009.xlsx`＝R2.9、dataset `28c40c5d-…`）、`gaikoku1509.xlsx`（`jyuuminsuu1509.xlsx`＝H27.9、dataset `5536e9cf-…`） | 2015年・2020年9月 | CSV注記のみ（2015年9月5,270人、2020年9月7,393人） |
| J16 | 富山市TOP R8.8末 399,759 | `town2608.xlsx`（dataset `1087963b-…` / resource `ae28511c-…`、町丁合計と一致を確認） | 2026-08-31 | CSV/JSONの参考値 |

ダウンロード基点：`https://opdt.city.toyama.lg.jp/dataset/toukei09`（公称別・町丁別集計表）ほか各データセット。
全ファイルは `data/raw/` に保存。町丁合計は市合計と全7年一致で検証済み。

## 2025年国勢調査の水増し問題（報道）

- 総務省が2026-09-29に確定値399,197人を公表（速報402,133人から2,936人下方修正）。
  富山市職員の水増し報告疑いで統計法違反容疑の告発・家宅捜索あり。
- 参考：`https://www.fnn.jp/articles/-/1123340`、
  `https://www.jiji.com/jc/article?g=pol&k=2026092900671`
- 本サイトは2025-10-01に速報・確定の2行を併記。
- 年齢の2025年確定値は、2026-09-29公表の人口等基本集計（確定値・原数値）で取得済み（C6/C9）。
  公表スケジュール：速報2026-05-29、人口等基本集計2026-09-29。
- 小地域集計（町丁・字等）の2025年確定値は未公表（そのため町丁別2025は住基のみ）。

## 境界不一致の対応

`docs/BOUNDARY.md`（dup/adj/boundary、1277→1232件）。突合表の作成手順と検証結果を記録。

## AIチャット機能（v1.7で廃止、記録のみ）

- `worker/`（Cloudflare Worker）が中継予定だった。動作確認済みはDeepSeek V4.1 Flash（従量制）とSpace Bunny（無料）のみ。
- 他の `-free` モデルは提供者側でAPI利用を拒否。参考：`https://opencode.ai/docs/zen/`
- 詳細は `worker/README.md`。

## 全国 住基×国勢タブ（東京を除く46県庁所在地）

- 国勢調査（各年10月1日、市区町村別人口総数）: 2015=e-Stat API `0003149040`（cdCat01=00710, cdCat02=010）、
  2020=`0003445078`、2025=`0004065881`（いずれもcdCat01=0）。
- 住基（各年1月1日、総務省「住民基本台帳に基づく人口、人口動態及び世帯数」・市区町村別【総計】）:
  2015=`statInfId=000030438568`、2020=`000031971203`、2025=`000040306653`
  （e-Stat ファイルダウンロード `https://www.e-stat.go.jp/stat-search/file-download?statInfId=...&fileKind=0`）。
- 差＝住基(1/1)−国勢(10/1)。**基準日が約9か月ずれている**ため、差にはその間の人口変動を含む。
- 生データは `data/raw/national/`（未追跡）。生成は `tools/build_national.py`。

## 加工スクリプト

`tools/build_towns.py`（町丁合計・年齢・性別）、`tools/build_censustown.py`（国勢町丁・境界修正）、
`tools/build_towns15.py`（2015年住基・将来用）。再現手順は各スクリプトの冒頭コメント参照。
