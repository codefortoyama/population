# テスト（Node のみ、追加依存なし）

ダッシュボード本体（`dashboard.html` と `data/*.js`）を Node 上で実行し、
UI ロジックとデータ整合性を検証します。ブラウザの DOM / Chart.js は
`harness.js` のスタブで代替します。

```
node tools/tests/run_overview.js     # 概要タブ: 地域4×年齢14＋ランキング8通り
node tools/tests/run_rank_full.js    # 「詳しく見る」全順位ページ 6グループ生成
node tools/tests/run_national.js     # 全国タブ: 東京除外・年ごと/全期間共通スケール
node tools/tests/verify_data.js      # データ整合（件数・合計・T=M+F・年齢系列）
node tools/tests/run_landing.js      # ランディング: 主要値・表・注意書きリンク
```

すべて成功で終了コード0、失敗時は非0。CI では5本を順に実行してください。

## 何を検証しているか
- `run_overview.js`：全市／町丁／町名集約／地区集約 × 全年齢区分で `render()` が例外なく完了すること。ランキングの並びが町丁系で差の絶対値降順であること。
- `run_rank_full.js`：各グループで全順位表の HTML が生成され、行が存在すること。
- `run_national.js`：47地点のセル生成、東京23区のスケール除外（棒は残り上限で切る）、年ごと／全期間共通スケールの最大値、絞り込みメッセージ。
- `verify_data.js`：TOWNS と年齢／国勢配列の件数一致、町丁合計が既知の市合計（2020-09〜2026-08）と一致、`T == M+F`、2010／2015／2020／2025 の5歳階級が揃っていること。全国タブの `NATIONAL` が `data/national.json` と一致し、2015/2020年が43地点、2025年が44地点で同時点（9/30・10/1）、残りは翌年1/1、東京23区が9,190,237／9,585,007／9,799,375人であること。

注意：`dashboard.html` は `data/censustown.js` を遅延読込するため、テストでは明示的に読み込んでいます。
