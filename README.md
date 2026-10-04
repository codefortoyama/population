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

## フォルダ
- `index.html` 本体
- `data/` JSON/CSV
- `docs/SOURCES.md` 出典メモ
- `src/` 拡張用（空）
