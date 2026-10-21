# 富山市人口ビューアー（国勢調査 vs 住民基本台帳の検証サイト）

差がわかるサイトのプロトタイプ。

## 開き方
`index.html` をブラウザで開く（ダブルクリックでOK）。
グラフは CDN の Chart.js を使うため初回のみネット接続が必要。

## データ更新
`data/toyama_census_vs_juki.json` を編集：
```json
{"date":"2020-10-01","census":413938,"juki":412000,"note":"..."}
```
CSVも同じ内容で維持。出典は `docs/SOURCES.md` に記録。

## 全国タブ（47地点）
2015・2020・2025年の住基は、各市が公表する9月末・10月1日現在の値を使う（秋田・山形・高松は翌年1月1日、
和歌山は2015・2020年のみ翌年1月1日、東京23区は東京都の月次住基の区部）。2010年は2011年3月31日。
一覧・URL・基準日は `docs/JUKI_OCT_SOURCES.md`（2025年）と `docs/NATIONAL_JUKI_SOURCES.md`（2015・2020年）。
反映は `node tools/build_national_oct.mjs`（`data/national.json`・`index.html`・`data/students.js` を更新）。

## フォルダ
- `index.html` 本体
- `data/` JSON/CSV
- `docs/SOURCES.md` 出典メモ
- `src/` 拡張用（空）
