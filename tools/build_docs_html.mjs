import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = path.join(ROOT, "docs");
const OUTPUT = {
  "BOUNDARY.md": "boundary-notes.html",
  "JUKI_OCT_SOURCES.md": "JUKI_OCT_SOURCES.html",
  "MIGRATION.md": "MIGRATION.html",
  "NATIONAL_JUKI_SOURCES.md": "NATIONAL_JUKI_SOURCES.html",
  "SOURCES.md": "SOURCES.html",
  "VALIDATION.md": "VALIDATION.html",
};

const STYLE = `
:root{--navy:#0b3d6b;--blue:#0b5cad;--ink:#1f2933;--muted:#5b6773;--line:#d9e0e7;--bg:#f5f7fa;--accent:#e07a1f}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font-family:system-ui,"Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,sans-serif;line-height:1.85}
a{color:var(--blue);text-underline-offset:2px}
a:hover{text-decoration-thickness:2px}
header{background:var(--navy);color:#fff;padding:28px 20px 24px}
header .wrap{max-width:1200px;margin:0 auto}
.eyebrow{margin:0 0 6px;font-size:.78rem;letter-spacing:.12em;opacity:.78}
header h1{margin:0;font-size:clamp(1.35rem,3vw,1.85rem);line-height:1.45}
header .meta{margin:8px 0 0;font-size:.82rem;opacity:.78}
.site-nav{position:sticky;top:0;z-index:10;background:#fff;border-bottom:1px solid var(--line);box-shadow:0 1px 3px rgba(0,0,0,.04)}
.site-nav .wrap{max-width:1200px;margin:0 auto;padding:8px 20px;display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center}
.site-nav a{font-size:.88rem;text-decoration:none;font-weight:600}
main{max-width:1200px;margin:0 auto;padding:18px 20px 32px}
.card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:22px 26px;margin:14px 0;box-shadow:0 2px 8px rgba(15,35,60,.05)}
.toc h2{border:0;padding:0;margin:0 0 8px;font-size:1.02rem}
.toc ul{margin:0;padding-left:1.3em;columns:2;column-gap:32px}
.toc li{margin:.22em 0;break-inside:avoid}
.toc a{text-decoration:none}
.doc h2{margin:2.1em 0 .65em;padding-left:10px;border-left:6px solid var(--accent);font-size:1.28rem;line-height:1.5;scroll-margin-top:64px}
.doc h2:first-child{margin-top:0}
.doc h3{margin:1.8em 0 .55em;font-size:1.08rem;line-height:1.5;scroll-margin-top:64px}
.doc h4{margin:1.4em 0 .4em;font-size:1rem}
.doc p{margin:.7em 0}
.doc ul,.doc ol{margin:.6em 0;padding-left:1.65em}
.doc li{margin:.28em 0}
.doc li>ul,.doc li>ol{margin:.25em 0}
.doc blockquote{margin:1em 0;padding:10px 16px;background:#fff8e1;border-left:6px solid #f0a000;border-radius:0 8px 8px 0;color:#4b3a00}
.doc blockquote p{margin:0}
.doc hr{border:0;border-top:1px solid var(--line);margin:1.8em 0}
.doc code{background:#eef1f4;border:1px solid #e1e6ec;border-radius:4px;padding:.05em .35em;font-family:ui-monospace,SFMono-Regular,Consolas,"Liberation Mono",monospace;font-size:.9em;overflow-wrap:anywhere}
.doc pre{background:#0f2237;color:#eaf2fb;border-radius:10px;padding:14px 16px;overflow-x:auto;line-height:1.6}
.doc pre code{background:transparent;border:0;padding:0;color:inherit;font-size:.88rem;white-space:pre}
.table-wrap{margin:1em 0;overflow-x:auto;border:1px solid var(--line);border-radius:8px;background:#fff;-webkit-overflow-scrolling:touch}
.table-wrap.wide table{min-width:1050px}
.table-wrap a{white-space:nowrap}
table{width:100%;border-collapse:collapse;font-size:.88rem;line-height:1.65}
th,td{padding:8px 10px;border-bottom:1px solid var(--line);border-right:1px solid var(--line);vertical-align:top;text-align:left;overflow-wrap:anywhere}
th:first-child,td:first-child,.nowrap{white-space:nowrap}
td.num{font-variant-numeric:tabular-nums}
tr:last-child td{border-bottom:0}
th:last-child,td:last-child{border-right:0}
th{background:#edf3f8;color:#20364d;font-weight:700;white-space:nowrap}
tbody tr:nth-child(even){background:#fafcfd}
tbody tr:hover{background:#f1f7fc}
.back{margin:18px 0 0}
.back a{font-weight:600;text-decoration:none}
.generated{margin:18px 0 0;color:var(--muted);font-size:.8rem}
footer{text-align:center;color:#667380;font-size:.82rem;padding:18px 16px 30px}
@media (max-width:760px){
  header{padding:22px 16px 20px}
  .site-nav .wrap,main{padding-left:14px;padding-right:14px}
  .card{padding:18px 16px;border-radius:10px}
  .toc ul{columns:1}
  table{font-size:.82rem}
  th,td{padding:7px 8px}
}
@media print{
  .site-nav,.back,.generated,footer{display:none}
  body{background:#fff}
  .card{box-shadow:none;border:0;padding:0}
  .table-wrap{overflow:visible}
  .table-wrap.wide table{min-width:0}
}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition:none!important;animation:none!important}}
`;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function rewriteHref(href) {
  if (/^(?:https?:|mailto:|#)/i.test(href)) return href;
  const [rawPath, ...hashParts] = href.split("#");
  const hash = hashParts.length ? "#" + hashParts.join("#") : "";
  let base = rawPath.replace(/^\.?\//, "").replace(/^docs\//, "");
  if (!/\.md$/i.test(base)) return href;
  const name = path.basename(base);
  return "./" + (OUTPUT[name] || name.replace(/\.md$/i, ".html")) + hash;
}

function inline(raw) {
  const store = [];
  const token = (html) => "\u0000" + (store.push(html) - 1) + "\u0000";
  let text = String(raw == null ? "" : raw);

  text = text.replace(/`([^`\n]+)`/g, (_, code) => token("<code>" + escapeHtml(code) + "</code>"));

  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    const target = rewriteHref(href);
    const external = /^https?:/i.test(target);
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
    return token('<a href="' + escapeAttr(target) + '"' + attrs + ">" + inline(label) + "</a>");
  });

  text = text.replace(/https?:\/\/[^\s<>"']+/g, (rawUrl) => {
    let url = rawUrl;
    let suffix = "";
    while (/[.,;:!?、。，．）】]$/.test(url)) {
      suffix = url.slice(-1) + suffix;
      url = url.slice(0, -1);
    }
    if (!url) return rawUrl;
    return token('<a href="' + escapeAttr(url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(url) + "</a>") + suffix;
  });

  text = escapeHtml(text);
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  let previous;
  do {
    previous = text;
    text = text.replace(/\u0000(\d+)\u0000/g, (_, index) => store[Number(index)]);
  } while (text !== previous);

  return text;
}

function stripInline(value) {
  return String(value)
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/https?:\/\/[^\s]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function smartJoin(left, right) {
  if (!left) return right;
  if (!right) return left;
  if (/[A-Za-z0-9]$/.test(left) && /^[A-Za-z0-9]/.test(right)) return left + " " + right;
  return left + right;
}

function joinParagraph(lines) {
  return lines.reduce((acc, line) => smartJoin(acc, line.trim()), "");
}

function splitRow(line) {
  let value = line.trim();
  if (value.startsWith("|")) value = value.slice(1);
  if (value.endsWith("|")) value = value.slice(0, -1);
  return value.split("|").map((cell) => cell.trim());
}

function isSeparator(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line || "");
}

function isTableStart(lines, index) {
  return /^\s*\|/.test(lines[index] || "") && isSeparator(lines[index + 1] || "");
}

function alignOf(cell) {
  const value = cell.trim();
  if (/^:-+:$/.test(value)) return "center";
  if (/^-+:$/.test(value)) return "right";
  return "left";
}

function renderTable(lines, start) {
  const header = splitRow(lines[start]);
  const aligns = splitRow(lines[start + 1]).map(alignOf);
  const rows = [];
  let index = start + 2;
  while (index < lines.length && /^\s*\|/.test(lines[index])) {
    rows.push(splitRow(lines[index]));
    index += 1;
  }
  const cellClass = header.length >= 6 ? ' class="table-wrap wide"' : ' class="table-wrap"';
  const head = header.map((cell, column) => {
    const align = aligns[column] || "left";
    return '<th scope="col" style="text-align:' + align + '">' + inline(cell) + "</th>";
  }).join("");
  const body = rows.map((row) => {
    const cells = header.map((_, column) => {
      const align = aligns[column] || "left";
      const value = row[column] || "";
      const plain = stripInline(value);
      let className = "";
      if (column === 0) className = "nowrap";
      else if (/^\d{4}-\d{2}-\d{2}$/.test(plain) || /^\d{1,2}\/\d{1,2}$/.test(plain)) className = "nowrap";
      else if (/^[+\-−]?\d+(?:\.\d+)?%$/.test(plain)) className = "nowrap";
      else if (/^[\d,]+$/.test(plain)) className = "num";
      const classAttr = className ? ' class="' + className + '"' : "";
      return "<td" + classAttr + ' style="text-align:' + align + '">' + inline(value) + "</td>";
    }).join("");
    return "<tr>" + cells + "</tr>";
  }).join("");
  return {
    html: "<div" + cellClass + "><table><thead><tr>" + head + "</tr></thead><tbody>" + body + "</tbody></table></div>",
    next: index,
  };
}

function listMarker(line) {
  const match = line.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
  if (!match) return null;
  return {
    indent: match[1].length,
    ordered: /^\d+\.$/.test(match[2]),
    text: match[3],
  };
}

function parseList(lines, start, baseIndent) {
  const first = listMarker(lines[start]);
  const ordered = first.ordered;
  const tag = ordered ? "ol" : "ul";
  const items = [];
  let index = start;

  while (index < lines.length) {
    const marker = listMarker(lines[index]);
    if (!marker || marker.indent !== baseIndent || marker.ordered !== ordered) break;

    let text = marker.text;
    let nested = "";
    index += 1;

    while (index < lines.length) {
      const line = lines[index];
      if (!line.trim()) break;
      const nextMarker = listMarker(line);
      if (nextMarker) {
        if (nextMarker.indent > baseIndent) {
          const child = parseList(lines, index, nextMarker.indent);
          nested += child.html;
          index = child.next;
          continue;
        }
        break;
      }
      const indent = (line.match(/^\s*/) || [""])[0].length;
      if (indent > baseIndent) {
        text = smartJoin(text, line.trim());
        index += 1;
        continue;
      }
      break;
    }

    items.push("<li>" + inline(text) + nested + "</li>");
  }

  return { html: "<" + tag + ">" + items.join("") + "</" + tag + ">", next: index };
}

function isBlockStart(lines, index) {
  const line = lines[index];
  return /^```/.test(line)
    || /^(#{1,6})\s+/.test(line)
    || /^\s*>/.test(line)
    || /^\s*(?:[-*+]|\d+\.)\s+/.test(line)
    || /^\s*(?:---|\*\*\*|___)\s*$/.test(line)
    || isTableStart(lines, index);
}

function parseMarkdown(markdown, sourceName) {
  const lines = String(markdown).replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").split("\n");
  const html = [];
  const toc = [];
  let title = "";
  let description = "";
  let headingNumber = 0;
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (/^```/.test(line)) {
      const language = line.replace(/^```/, "").trim();
      const code = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      const langClass = language ? ' class="language-' + escapeAttr(language) + '"' : "";
      html.push("<pre><code" + langClass + ">" + escapeHtml(code.join("\n")) + "</code></pre>");
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      const level = heading[1].length;
      const rawText = heading[2];
      const plain = stripInline(rawText);
      headingNumber += 1;
      if (level === 1 && !title) {
        title = plain;
      } else {
        const id = "sec-" + headingNumber;
        html.push('<h' + level + ' id="' + id + '">' + inline(rawText) + "</h" + level + ">");
        if (level === 2) toc.push({ id, text: plain });
      }
      index += 1;
      continue;
    }

    if (/^\s*(?:---|\*\*\*|___)\s*$/.test(line)) {
      html.push("<hr>");
      index += 1;
      continue;
    }

    if (isTableStart(lines, index)) {
      const table = renderTable(lines, index);
      html.push(table.html);
      index = table.next;
      continue;
    }

    if (/^\s*>/.test(line)) {
      const quote = [];
      while (index < lines.length && /^\s*>/.test(lines[index])) {
        quote.push(lines[index].replace(/^\s*>\s?/, ""));
        index += 1;
      }
      const text = joinParagraph(quote);
      if (!description) description = text;
      html.push("<blockquote><p>" + inline(text) + "</p></blockquote>");
      continue;
    }

    if (/^\s*(?:[-*+]|\d+\.)\s+/.test(line)) {
      const indent = (line.match(/^\s*/) || [""])[0].length;
      const list = parseList(lines, index, indent);
      html.push(list.html);
      index = list.next;
      continue;
    }

    const paragraph = [];
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines, index)) {
      paragraph.push(lines[index]);
      index += 1;
    }
    if (!paragraph.length) {
      paragraph.push(lines[index]);
      index += 1;
    }
    const text = joinParagraph(paragraph);
    if (!description) description = text;
    html.push("<p>" + inline(text) + "</p>");
  }

  return {
    title: title || sourceName.replace(/\.md$/i, ""),
    description: stripInline(description).slice(0, 160),
    html: html.join("\n"),
    toc,
  };
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function renderDocument(source, output, markdown, updated) {
  const parsed = parseMarkdown(markdown, source);
  const toc = parsed.toc.length >= 2
    ? '<nav class="card toc" aria-label="目次"><h2>目次</h2><ul>' + parsed.toc
      .map((item) => '<li><a href="#' + item.id + '">' + inline(item.text) + "</a></li>")
      .join("") + "</ul></nav>\n"
    : "";
  const description = parsed.description || parsed.title + "。富山市人口ビューアーのドキュメント。";
  const pageTitle = /富山市人口ビューアー/.test(parsed.title) ? parsed.title : parsed.title + " - 富山市人口ビューアー";

  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(pageTitle)}</title>
<meta name="description" content="${escapeAttr(description)}">
<meta name="color-scheme" content="light">
<style>${STYLE}</style>
</head>
<body>
<header>
<div class="wrap">
<p class="eyebrow">富山市人口ビューアー / ドキュメント</p>
<h1>${escapeHtml(parsed.title)}</h1>
<p class="meta">HTML版 ・ ${escapeHtml(updated)} 更新</p>
</div>
</header>
<nav class="site-nav" aria-label="サイト内">
<div class="wrap">
<a href="../index.html">人口ビューアー</a>
<a href="../dashboard.html">ダッシュボード</a>
<a href="../index.html#notes">データの注意書き</a>
<a href="./SOURCES.html">出典一覧</a>
</div>
</nav>
<main>
${toc}<article class="card doc">
${parsed.html}
</article>
<p class="back"><a href="../index.html">← 人口ビューアーに戻る</a></p>
<p class="generated">このページは ${escapeHtml(source)} から生成したHTML版です。編集用のMarkdown原本: <a href="./${escapeAttr(source)}">${escapeHtml(source)}</a></p>
</main>
<footer>Copyright EvoLiNQ / Code for Toyama</footer>
</body>
</html>
`;
}

const files = fs.readdirSync(DOCS).filter((file) => file.endsWith(".md")).sort();
const outputs = [];
for (const file of files) {
  const sourcePath = path.join(DOCS, file);
  const output = OUTPUT[file] || file.replace(/\.md$/i, ".html");
  const markdown = fs.readFileSync(sourcePath, "utf8");
  const updated = formatDate(fs.statSync(sourcePath).mtime);
  fs.writeFileSync(path.join(DOCS, output), renderDocument(file, output, markdown, updated), "utf8");
  outputs.push(output);
}

console.log("DOCS HTML: " + outputs.length + " pages generated");
for (const output of outputs) console.log("  docs/" + output);
