# 富山市人口ビューアー

富山市の人口を、全国の県庁所在地との比較や年齢・地域別のデータから見るサイトです。

## ページ構成

- `index.html` ランディングページ（富山市の人口推移・全国比較・都市の考察・データの注意書き）
- `dashboard.html` ダッシュボード（年齢×地域のAND検索、差ランキング、全国の国勢×住基、大学生×差）
- `students.html` 大学生の割合と国勢・住基の差

`index.html` をブラウザで開いてください（ダブルクリックでOK）。グラフは CDN の Chart.js を使うため、初回のみネット接続が必要です。
旧URLの `index.html?tab=rank` / `?tab=national` は `dashboard.html` に引き継がれます。

## データ更新

- 全国47地点の国勢調査・住基：`data/national.json` と `dashboard.html` の `const NATIONAL`、`data/students.js` を更新します。住基の反映は `node tools/build_national_oct.mjs`。
- 富山市の年齢別住基：`python tools/build_juki_age.py`（`dashboard.html` のデータ行を更新）。
- ランディングページ用データ：`node tools/build_landing.mjs`（`data/national.json` と `dashboard.html` から `data/landing.js` を再生成）。ヒーロー・各節・都市カードの文章と数値は静的記述なので、データ更新時に内容も確認してください。
- 出典は `docs/SOURCES.md` に記録しています。サイトに表示するHTML版は `node tools/build_docs_html.mjs` で `docs/*.md` から再生成します（`docs/boundary-notes.html` など）。

## 検証

`tools/tests/README.md` の5本（概要・全順位・全国・データ整合・ランディング）を Node で実行します。

## フォルダ

- `index.html` ランディングページ
- `dashboard.html` ダッシュボード本体
- `students.html` 大学生×差
- `assets/` アイキャッチ画像（`eyecatch.jpg`、OGP用`eyecatch-og.jpg`）
- `data/` JSON/CSV/JS
- `docs/` 出典・境界・検証メモ（HTML版とMarkdown原本）
- `tools/` データ生成・検証スクリプト
- `worker/` 旧AIチャット用（未使用）
