# テスト（Node のみ、追加依存なし）

サイト本体（`index.html` と `data/*.js`）を Node 上で実行し、
UI ロジックとデータ整合性を検証します。ブラウザの DOM / Chart.js は
`harness.js` のスタブで代替します。

```
node tools/tests/run_overview.js     # 概要タブ: 地域4×年齢14＋ランキング8通り
node tools/tests/run_rank_full.js    # 「詳しく見る」全順位ページ 6グループ生成
node tools/tests/verify_data.js      # データ整合（件数・合計・T=M+F・年齢系列）
```

すべて成功で終了コード0、失敗時は非0。CI では3本を順に実行してください。

## 何を検証しているか
- `run_overview.js`：全市／町丁／町名集約／地区集約 × 全年齢区分で `render()` が例外なく完了すること。ランキングの並びが町丁系で差の絶対値降順であること。
- `run_rank_full.js`：各グループで全順位表の HTML が生成され、行が存在すること。
- `verify_data.js`：TOWNS と年齢／国勢配列の件数一致、町丁合計が既知の市合計（2020-09〜2026-08）と一致、`T == M+F`、2010／2015／2020／2025 の5歳階級が揃っていること。

注意：`index.html` は `data/censustown.js` を遅延読込するため、テストでは明示的に読み込んでいます。
