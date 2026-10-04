"use strict";

/* Toyama population viewer: AI proxy (Cloudflare Worker).
 * Forwards chat requests to OpenCode Zen, restricted to free models only.
 * Secret: OPENCODE_API_KEY (Zen or Go API key) via `wrangler secret put`.
 */

const UPSTREAM = "https://opencode.ai/zen/v1/chat/completions";

/* Verified working 2026-10-04 via API. Other -free models reject API use
 * with FreeTierError; only these two respond. */
const ALLOWED_MODELS = [
  { id: "deepseek-v4.1-flash", name: "DeepSeek V4.1 Flash（従量制・安価）" },
  { id: "space-bunny-free", name: "Space Bunny（無料）" },
];

const ALLOWED_IDS = new Set(ALLOWED_MODELS.map((m) => m.id));

const SYSTEM_PROMPT = [
  "あなたは富山市の人口データを解説するアシスタントです。日本語で簡潔に答えてください。",
  "サイト「富山市人口ビューアー」は国勢調査と住民基本台帳の人口差を可視化しています。",
  "主な数値：2025年国勢調査の富山市分は速報402,133人から確定399,197人（男195,482・女203,715）へ2,936人下方修正（水増し報告疑いで職員が告発）。",
  "2020年国勢調査は413,938人（男202,281・女211,657）。住基2020年9月414,354人。",
  "町丁データは2020年中心（1277/1448町対応）。年齢は5歳階級と学校・ライフステージ区分（近似）があります。",
  "断定的でない内容は推測と明記してください。",
].join("\n");

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 30;
const hits = new Map();

function corsHeaders(origin, env) {
  const allow = (env.ALLOWED_ORIGIN || "https://tominarievo.github.io").split(",").map((s) => s.trim());
  const o = allow.includes(origin) ? origin : "*";
  return {
    "Access-Control-Allow-Origin": o,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(data, status, origin, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin, env) },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
    }
    if (url.pathname === "/api/models" && request.method === "GET") {
      return json({ models: ALLOWED_MODELS }, 200, origin, env);
    }
    if (url.pathname === "/api/chat" && request.method === "POST") {
      const ip = request.headers.get("CF-Connecting-IP") || "local";
      const now = Date.now();
      const arr = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
      if (arr.length >= RATE_MAX) {
        return json({ error: "レート制限中です。1分ほど待ってください。" }, 429, origin, env);
      }
      arr.push(now);
      hits.set(ip, arr);
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "リクエスト形式が不正です。" }, 400, origin, env);
      }
      const model = body && body.model;
      if (!model || !ALLOWED_IDS.has(model)) {
        return json({ error: "利用可能なモデルを選択してください。" }, 400, origin, env);
      }
      const msgs = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
      const clean = msgs
        .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
        .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
      if (!clean.length || clean[clean.length - 1].role !== "user") {
        return json({ error: "質問が空です。" }, 400, origin, env);
      }
      const key = env.OPENCODE_API_KEY;
      if (!key) {
        return json({ error: "サーバのAPIキーが未設定です。管理者に連絡してください。" }, 500, origin, env);
      }
      let up;
      try {
        up = await fetch(UPSTREAM, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
          body: JSON.stringify({
            model,
            messages: [{ role: "system", content: SYSTEM_PROMPT }, ...clean],
            max_tokens: 1024,
            temperature: 0.3,
          }),
        });
      } catch (e) {
        return json({ error: "上流への接続に失敗しました。" }, 502, origin, env);
      }
      if (!up.ok) {
        if (up.status === 401 || up.status === 403) {
          return json({ error: "サーバのAPIキーが無効です。管理者に連絡してください。" }, 502, origin, env);
        }
        if (up.status === 429) {
          return json({ error: "混雑しています。少し待ってから試してください。" }, 502, origin, env);
        }
        return json({ error: "AIサービスでエラーが発生しました（" + up.status + "）。別のモデルで試してください。" }, 502, origin, env);
      }
      let data;
      try {
        data = await up.json();
      } catch {
        return json({ error: "AIサービスの応答を解釈できませんでした。" }, 502, origin, env);
      }
      const reply = data && data.choices && data.choices[0] &&
        data.choices[0].message && data.choices[0].message.content;
      if (!reply) {
        return json({ error: "AIサービスから回答が得られませんでした。別のモデルで試してください。" }, 502, origin, env);
      }
      return json({ reply, model }, 200, origin, env);
    }
    return new Response("toyama-ai-proxy: ok", {
      status: 200,
      headers: corsHeaders(origin, env),
    });
  },
};
