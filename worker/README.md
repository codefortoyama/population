# AI proxy (Cloudflare Worker) — 未使用（アーカイブ）

> **注意：この Worker は現在のサイトでは使用していません。**
> サイトの「AIに聞く」タブは v1.7 で廃止しました。以下は当時の実装記録です。
> 再びチャット機能を付ける場合の参考として残しています（削除しても構いません）。

GitHub Pages からはブラウザ制限（CORS）で OpenCode 系 API に直接接続できないため、
この Worker が中継します。**動作確認済みの2モデルのみ**利用可能（サーバ側で制限）。

- `deepseek-v4.1-flash`（従量制・安価、2026-10-04にAPI疎通確認）
- `space-bunny-free`（無料・キー不要でも応答あり）
- 他の `-free` モデルは提供者側でAPI利用を拒否されるため除外

## 準備

1. OpenCode Zen または Go の API キーを取得（Zen は従量制、Go は月額制。無料モデル自体は $0）
2. ログインとデプロイ：
   ```
   cd worker
   wrangler login
   wrangler secret put OPENCODE_API_KEY
   wrangler deploy
   ```
3. 表示された `https://toyama-ai-proxy.<subdomain>.workers.dev` を
   サイトの「AIに聞く」タブの接続先入力欄に保存（ブラウザに記憶されます）

## ローカル開発

```
cd worker
echo "OPENCODE_API_KEY=dummy" > .dev.vars   # 上流疎通テスト用（401が返れば配線OK）
wrangler dev --port 8787
curl http://localhost:8787/api/models
```

`.dev.vars` はコミットしないこと（`.gitignore` 済み）。
