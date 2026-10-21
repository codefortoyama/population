"use strict";
/* 全国タブ: 47地点の描画、東京23区のスケール除外、年ごと/全期間共通スケール。
 * Usage: node tools/tests/run_national.js */
const { makeSandbox, ROOT } = require("./harness");
const fs = require("fs");
const path = require("path");

let fail = 0;
function check(label, ok, detail) {
  console.log((ok ? "OK   " : "FAIL ") + label + (detail ? "  " + detail : ""));
  if (!ok) fail++;
}

const htmlSrc = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
check("default scale is all-period", /<select id="natScaleMode">[\s\S]*?<option value="all" selected>/.test(htmlSrc));

const { sandbox } = makeSandbox();
const grid = sandbox.document.getElementById("natGrid");
const scale = sandbox.document.getElementById("natScale");
const msg = sandbox.document.getElementById("natFilterMsg");
const mode = sandbox.document.getElementById("natScaleMode");

mode.value = "year";
sandbox.natScaleNoTokyo = false;
sandbox.renderNational();
let html = grid.innerHTML;
check("47 cells", (html.match(/class="natcell"/g) || []).length === 47);
check("no hidden cells", (html.match(/ hidden>/g) || []).length === 0);
check("year scale", scale.textContent.includes("年ごとのスケール"), scale.textContent);

sandbox.natScaleNoTokyo = true;
sandbox.renderNational();
html = grid.innerHTML;
check("Tokyo still visible", (html.match(/ hidden>/g) || []).length === 0 &&
  (html.match(/class="natcell" data-i="12" hidden/g) || []).length === 0);
check("scale without Tokyo", !scale.textContent.includes("387,453"), scale.textContent);
check("cap marker", (html.match(/▲/g) || []).length > 0);
check("filter message", msg.textContent.includes("スケールから除外"), msg.textContent);

mode.value = "all";
sandbox.renderNational();
check("all-period scale", scale.textContent.includes("全期間共通"), scale.textContent);
check("all-period max excludes Tokyo", scale.textContent.includes("127,394"), scale.textContent);

mode.value = "year";
sandbox.natScaleNoTokyo = false;
sandbox.renderNational();
check("Tokyo scale restored", !scale.textContent.includes("東京23区を除く") &&
  (grid.innerHTML.match(/ hidden>/g) || []).length === 0);

console.log(fail === 0 ? "NATIONAL: all passed" : "NATIONAL: " + fail + " failures");
process.exit(fail === 0 ? 0 : 1);
