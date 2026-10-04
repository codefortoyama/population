var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
var UPSTREAM = "https://opencode.ai/zen/v1/chat/completions";
var FREE_MODELS = [
  { id: "nemotron-3.5-lightning-free", name: "Nemotron 3.5 Lightning\uFF08\u7121\u6599\u30FB\u63A8\u5968\uFF09" },
  { id: "nemotron-3-ultra-free", name: "Nemotron 3 Ultra\uFF08\u7121\u6599\uFF09" },
  { id: "mimo-v2.5-free", name: "MiMo V2.5\uFF08\u7121\u6599\uFF09" },
  { id: "mimo-v2.6-flash-free", name: "MiMo V2.6 Flash\uFF08\u7121\u6599\uFF09" },
  { id: "ling-3.0-flash-fin-free", name: "Ling 3.0 Flash Fin\uFF08\u7121\u6599\uFF09" },
  { id: "ling-3.1-flash-free", name: "Ling 3.1 Flash\uFF08\u7121\u6599\uFF09" },
  { id: "muse-spark-1.3-contributor-free", name: "Muse Spark 1.3\uFF08\u7121\u6599\u30FB\u4E0D\u5B89\u5B9A\u306A\u5834\u5408\u3042\u308A\uFF09" },
  { id: "muse-spark-1.2-contributor-free", name: "Muse Spark 1.2\uFF08\u7121\u6599\u30FB\u4E0D\u5B89\u5B9A\u306A\u5834\u5408\u3042\u308A\uFF09" },
  { id: "space-bunny-free", name: "Space Bunny\uFF08\u7121\u6599\u30FB\u671F\u9593\u9650\u5B9A\uFF09" },
  { id: "longcat-2.5-preview-free", name: "LongCat 2.5 Preview\uFF08\u7121\u6599\u30FB\u671F\u9593\u9650\u5B9A\uFF09" },
  { id: "deepseek-v4-flash-free", name: "DeepSeek V4 Flash\uFF08\u7121\u6599\u30FB\u7D42\u4E86\u306E\u53EF\u80FD\u6027\u3042\u308A\uFF09" }
];
var FREE_IDS = new Set(FREE_MODELS.map((m) => m.id));
var SYSTEM_PROMPT = [
  "\u3042\u306A\u305F\u306F\u5BCC\u5C71\u5E02\u306E\u4EBA\u53E3\u30C7\u30FC\u30BF\u3092\u89E3\u8AAC\u3059\u308B\u30A2\u30B7\u30B9\u30BF\u30F3\u30C8\u3067\u3059\u3002\u65E5\u672C\u8A9E\u3067\u7C21\u6F54\u306B\u7B54\u3048\u3066\u304F\u3060\u3055\u3044\u3002",
  "\u30B5\u30A4\u30C8\u300C\u5BCC\u5C71\u5E02\u4EBA\u53E3\u30D3\u30E5\u30FC\u30A2\u30FC\u300D\u306F\u56FD\u52E2\u8ABF\u67FB\u3068\u4F4F\u6C11\u57FA\u672C\u53F0\u5E33\u306E\u4EBA\u53E3\u5DEE\u3092\u53EF\u8996\u5316\u3057\u3066\u3044\u307E\u3059\u3002",
  "\u4E3B\u306A\u6570\u5024\uFF1A2025\u5E74\u56FD\u52E2\u8ABF\u67FB\u306E\u5BCC\u5C71\u5E02\u5206\u306F\u901F\u5831402,133\u4EBA\u304B\u3089\u78BA\u5B9A399,197\u4EBA\uFF08\u7537195,482\u30FB\u5973203,715\uFF09\u30782,936\u4EBA\u4E0B\u65B9\u4FEE\u6B63\uFF08\u6C34\u5897\u3057\u5831\u544A\u7591\u3044\u3067\u8077\u54E1\u304C\u544A\u767A\uFF09\u3002",
  "2020\u5E74\u56FD\u52E2423,938\u4EBA\u2192\u4EE4\u548C2\u5E74413,938\u4EBA\uFF08\u7537202,281\u30FB\u5973211,657\uFF09\u3002\u4F4F\u57FA2020\u5E749\u6708414,354\u4EBA\u3002",
  "\u753A\u4E01\u30C7\u30FC\u30BF\u306F2020\u5E74\u4E2D\u5FC3\uFF081277/1448\u753A\u5BFE\u5FDC\uFF09\u3002\u5E74\u9F62\u306F5\u6B73\u968E\u7D1A\u3068\u5B66\u6821\u30FB\u30E9\u30A4\u30D5\u30B9\u30C6\u30FC\u30B8\u533A\u5206\uFF08\u8FD1\u4F3C\uFF09\u304C\u3042\u308A\u307E\u3059\u3002",
  "\u65AD\u5B9A\u7684\u3067\u306A\u3044\u5185\u5BB9\u306F\u63A8\u6E2C\u3068\u660E\u8A18\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
].join("\n");
var RATE_WINDOW_MS = 6e4;
var RATE_MAX = 30;
var hits = /* @__PURE__ */ new Map();
function corsHeaders(origin, env) {
  const allow = (env.ALLOWED_ORIGIN || "https://tominarievo.github.io").split(",").map((s) => s.trim());
  const o = allow.includes(origin) ? origin : allow[0];
  return {
    "Access-Control-Allow-Origin": o,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
}
__name(corsHeaders, "corsHeaders");
function json(data, status, origin, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin, env) }
  });
}
__name(json, "json");
var src_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
    }
    if (url.pathname === "/api/models" && request.method === "GET") {
      return json({ models: FREE_MODELS }, 200, origin, env);
    }
    if (url.pathname === "/api/chat" && request.method === "POST") {
      const ip = request.headers.get("CF-Connecting-IP") || "local";
      const now = Date.now();
      const arr = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
      if (arr.length >= RATE_MAX) {
        return json({ error: "\u30EC\u30FC\u30C8\u5236\u9650\u4E2D\u3067\u3059\u30021\u5206\u307B\u3069\u5F85\u3063\u3066\u304F\u3060\u3055\u3044\u3002" }, 429, origin, env);
      }
      arr.push(now);
      hits.set(ip, arr);
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "\u30EA\u30AF\u30A8\u30B9\u30C8\u5F62\u5F0F\u304C\u4E0D\u6B63\u3067\u3059\u3002" }, 400, origin, env);
      }
      const model = body && body.model;
      if (!model || !FREE_IDS.has(model)) {
        return json({ error: "\u7121\u6599\u30E2\u30C7\u30EB\u306E\u307F\u5229\u7528\u3067\u304D\u307E\u3059\u3002" }, 400, origin, env);
      }
      const msgs = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
      const clean = msgs.filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string").map((m) => ({ role: m.role, content: m.content.slice(0, 4e3) }));
      if (!clean.length || clean[clean.length - 1].role !== "user") {
        return json({ error: "\u8CEA\u554F\u304C\u7A7A\u3067\u3059\u3002" }, 400, origin, env);
      }
      const key = env.OPENCODE_API_KEY;
      if (!key) {
        return json({ error: "\u30B5\u30FC\u30D0\u306EAPI\u30AD\u30FC\u304C\u672A\u8A2D\u5B9A\u3067\u3059\u3002\u7BA1\u7406\u8005\u306B\u9023\u7D61\u3057\u3066\u304F\u3060\u3055\u3044\u3002" }, 500, origin, env);
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
            temperature: 0.3
          })
        });
      } catch (e) {
        return json({ error: "\u4E0A\u6D41\u3078\u306E\u63A5\u7D9A\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002" }, 502, origin, env);
      }
      if (!up.ok) {
        if (up.status === 401 || up.status === 403) {
          return json({ error: "\u30B5\u30FC\u30D0\u306EAPI\u30AD\u30FC\u304C\u7121\u52B9\u3067\u3059\u3002\u7BA1\u7406\u8005\u306B\u9023\u7D61\u3057\u3066\u304F\u3060\u3055\u3044\u3002" }, 502, origin, env);
        }
        if (up.status === 429) {
          return json({ error: "\u6DF7\u96D1\u3057\u3066\u3044\u307E\u3059\u3002\u5C11\u3057\u5F85\u3063\u3066\u304B\u3089\u8A66\u3057\u3066\u304F\u3060\u3055\u3044\u3002" }, 502, origin, env);
        }
        return json({ error: "AI\u30B5\u30FC\u30D3\u30B9\u3067\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\uFF08" + up.status + "\uFF09\u3002\u5225\u306E\u30E2\u30C7\u30EB\u3067\u8A66\u3057\u3066\u304F\u3060\u3055\u3044\u3002" }, 502, origin, env);
      }
      let data;
      try {
        data = await up.json();
      } catch {
        return json({ error: "AI\u30B5\u30FC\u30D3\u30B9\u306E\u5FDC\u7B54\u3092\u89E3\u91C8\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002" }, 502, origin, env);
      }
      const reply = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (!reply) {
        return json({ error: "AI\u30B5\u30FC\u30D3\u30B9\u304B\u3089\u56DE\u7B54\u304C\u5F97\u3089\u308C\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u5225\u306E\u30E2\u30C7\u30EB\u3067\u8A66\u3057\u3066\u304F\u3060\u3055\u3044\u3002" }, 502, origin, env);
      }
      return json({ reply, model }, 200, origin, env);
    }
    return new Response("toyama-ai-proxy: ok", {
      status: 200,
      headers: corsHeaders(origin, env)
    });
  }
};

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-KWIiAc/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-KWIiAc/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
