# 外部検証レポート（2026-10-04）

対象：https://codefortoyama.github.io/population/
手法：Lighthouse 13.5（Chrome headless、複数回計測）、W3C HTML Validator（Nu）、
W3C CSS Validator、外部・内部リンク疎通、独自ランタイムテスト。

## 結果サマリ

| 種別 | 結果 |
|------|------|
| Lighthouse Accessibility | 100 / 100 |
| Lighthouse Best Practices | 100 / 100 |
| Lighthouse SEO | 100 / 100 |
| Lighthouse Performance | 84〜87（計測変動あり、下記参照） |
| W3C HTML Validator | エラー0 |
| W3C CSS Validator | 有効・エラー0・警告0 |
| 外部リンク12件 | すべて HTTP 200 |
| 内部リンク4件 | すべて HTTP 200 |
| ランタイムテスト | 概要56通り・ランキング9通り・全順位ページ5通り 合格 |

計測値（代表）：FCP 1.7〜1.9s、LCP 2.9〜3.1s、TBT 290〜350ms、CLS 0。

## 検証で発見し修正した事項

1. W3C HTML：`main` 要素の重複（error 119）→ 単一 `main` に統合。
2. W3C HTML：favicon の data URI に空白（Illegal character）→ パーセントエンコード。
3. Lighthouse Best Practices：favicon 404 のコンソールエラー → インライン SVG favicon を追加し解消（96→100）。
4. Lighthouse SEO：meta description 欠落（90→100）→ 追加。
5. Performance（レンダリングブロック）：head の同期スクリプトが 1,350ms 相当を阻害 → 全スクリプトを `defer` 化し、初期描画を `DOMContentLoaded` に移動。
6. Performance（アニメーション）：Chart.js アニメーションがメインスレッドを占有 → `animation:false`。
7. Performance（レイアウト再計算）：キャンバスのレスポンシブ再計算 → コンテナ高さ固定＋`maintainAspectRatio:false`。
8. Performance（初回読込）：国勢町丁データ（68KB）を初期読込から外し、町丁・町名・地区・ランキング表示時に遅延読込（`ensureCensus`）。
9. Performance（LCP）：KPIカードがJS描画のためLCPが遅延 → 初期HTMLに同一の既定値を静的配置。
10. データ不整合：R8.8末の日付が `2025-08-31` と誤記（正：`2026-08-31`）→ JSON/CSV を修正。CSVの日付列をISO形式に統一。
11. KPIの基準日不一致（住基2026-08-31／差2025-10-01）→ 国勢・住基・差とも最新の共通基準日に統一。
12. 警告文の誤り（境界修正後も「17地区は親子重複」と記載）→ 現状（重複なし、町丁合計＝地区合計387,556）に更新。
13. 出典の未確認表記（R8.8末「要原典確認」）→ `town2608.xlsx` を明記。
14. セキュリティ：Chart.js に SRI（integrity/crossorigin）を付与。
15. Performance：初期グラフ描画を `requestAnimationFrame` まで遅延（初回のみ）。

## 残る課題（外部要因・トレードオフ）

- Performance は 84〜87 で変動します。GitHub Pages のCDN応答（TTFB）と Lighthouse のスロットリング、
  および Chart.js の描画コストに依存します。CLS は 0 を維持。
- 「Style & Layout」が依然として最大のコスト（1.0〜1.9s）。Chart.js の描画・レイアウト由来で、
  これ以上の削減はデータ形式変更（JSON遅延読込）が必要です。
- キャッシュ TTL は GitHub Pages 固定（600秒）のため、Cache insight は常に指摘されます（対応不可）。

## 再現コマンド

```
npx lighthouse https://codefortoyama.github.io/population/ \
  --chrome-flags="--headless=new" \
  --only-categories=performance,accessibility,best-practices,seo
```

```
curl "https://validator.w3.org/nu/?out=json&doc=https%3A%2F%2Fcodefortoyama.github.io%2Fpopulation%2F"
curl "https://jigsaw.w3.org/css-validator/validator?output=json&uri=https%3A%2F%2Fcodefortoyama.github.io%2Fpopulation%2F"
```
