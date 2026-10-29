"use strict";
/* ランディングページ: データ整合・主要な表示値・注意書きの移動を検証。
 * Usage: node tools/tests/run_landing.js */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..", "..");
let fail = 0;
function check(label, ok, detail) {
  console.log((ok ? "OK   " : "FAIL ") + label + (detail ? "  " + detail : ""));
  if (!ok) fail++;
}

const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const dashboard = fs.readFileSync(path.join(ROOT, "dashboard.html"), "utf8");
const students = fs.readFileSync(path.join(ROOT, "students.html"), "utf8");
const national = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "national.json"), "utf8"));

function makeEl() {
  const el = {
    textContent: "", innerHTML: "", style: {}, dataset: {},
    addEventListener() {}, appendChild() {},
    querySelectorAll() { return []; },
    getAttribute() { return null; },
    _children: {},
  };
  el.querySelector = (sel) => (el._children[sel] ||= makeEl());
  return el;
}

const ids = {};
const charts = [];
class Chart {
  constructor(canvas, cfg) { charts.push({ canvas, cfg }); }
}

const sandbox = {
  console,
  document: {
    readyState: "loading",
    getElementById(id) { if (!ids[id]) ids[id] = makeEl(); return ids[id]; },
    querySelector() { return makeEl(); },
    querySelectorAll() { return []; },
    addEventListener(ev, cb) { if (ev === "DOMContentLoaded") cb(); },
  },
  Chart,
};
Chart.defaults = { font: {}, color: "" };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, "data", "landing.js"), "utf8"), sandbox, { filename: "landing.js" });

const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const main = scripts.find((s) => s.includes("function init()"));
check("landing main script found", !!main);
if (main) {
  try {
    vm.runInContext(main, sandbox, { filename: "landing-inline" });
    check("landing init runs", true);
  } catch (e) {
    check("landing init runs", false, e.message);
  }
}

const cities = vm.runInContext("LANDING_CITIES", sandbox);
const toyama = vm.runInContext("LANDING_TOYAMA", sandbox);
check("47 cities", cities.length === 47 && cities[15][1] === "富山市");
check("Toyama census series", JSON.stringify(toyama.census) === JSON.stringify([421239, 421953, 418686, 413938, 399197]), toyama.census.join("/"));
check("Toyama age years", toyama.age.length === 4 && toyama.age[3].year === 2025);
check("Toyama 2025 age groups", JSON.stringify(toyama.age[3].v) === JSON.stringify([42744, 230923, 47812, 73358]), toyama.age[3].v.join("/"));
check("latest juki reference", toyama.latestJuki && toyama.latestJuki.value === 399759);

const natToyama = national.find((r) => r.city === "富山市");
check("national.json Toyama matches landing", JSON.stringify(natToyama.census) === JSON.stringify(toyama.census.slice(1)));

check("rank2025 rendered", ids.rank2025 && ids.rank2025.textContent === "−3.6%", ids.rank2025 && ids.rank2025.textContent);
check("rankPop rendered", ids.rankPop && ids.rankPop.textContent === "23位", ids.rankPop && ids.rankPop.textContent);
check("rank1025 rendered", ids.rank1025 && ids.rank1025.textContent === "−5.4%", ids.rank1025 && ids.rank1025.textContent);
check("latest juki note rendered", ids.latestJukiNote && ids.latestJukiNote.textContent.includes("399,759"), ids.latestJukiNote && ids.latestJukiNote.textContent);
const tbody = ids.cityTable && ids.cityTable._children.tbody;
check("table contains Toyama", tbody && tbody.innerHTML.includes("富山市"));
check("table contains Tokyo 23 wards", tbody && tbody.innerHTML.includes("東京23区"));
check("three charts created", charts.length === 3, "n=" + charts.length);

const chipMismatch = [];
for (const m of html.matchAll(/<li class="chip[^"]*">([^<]+) <b>([^<]+)<\/b><\/li>/g)) {
  const label = m[1].trim();
  const cityName = label === "東京23区" ? "23区" : label.endsWith("市") ? label : label + "市";
  const row = cities.find((r) => r[1] === cityName);
  if (!row) { chipMismatch.push(label + "(not found)"); continue; }
  const actual = ((row[2][3] - row[2][0]) / row[2][0]) * 100;
  const shown = Number(m[2].replace("−", "-").replace("%", ""));
  if (Math.abs(actual - shown) > 0.05) chipMismatch.push(label + " " + m[2] + " != " + actual.toFixed(1) + "%");
}
check("city chips match data", chipMismatch.length === 0, chipMismatch.join(", "));

check("landing notes section", /id="notes"/.test(html) && /id="notes-national"/.test(html));
check("dashboard links to landing notes", /index\.html#notes/.test(dashboard));
check("old ?tab= redirect", /location\.replace\('\.\/dashboard\.html'\+q\+location\.hash\)/.test(html));
check("no misconduct wording", !/不正|改ざん|捏造/.test(html + dashboard + students));
check("sitemap includes dashboard", fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8").includes("dashboard.html"));
check("eyecatch image exists", fs.existsSync(path.join(ROOT, "assets", "eyecatch.jpg")) && /assets\/eyecatch\.jpg/.test(html));
check("eyecatch og image", /assets\/eyecatch-og\.jpg/.test(html + dashboard + students));
const boundaryHtml = fs.readFileSync(path.join(ROOT, "docs", "boundary.html"), "utf8");
check("site docs links use html", !/href=["'][^"']+\.md/.test(html + dashboard + students + boundaryHtml));
const docsGenerated = ["SOURCES.html", "JUKI_OCT_SOURCES.html", "NATIONAL_JUKI_SOURCES.html", "boundary-notes.html", "MIGRATION.html", "VALIDATION.html"];
const docsMissing = docsGenerated.filter((f) => !fs.existsSync(path.join(ROOT, "docs", f)));
check("docs html pages exist", docsMissing.length === 0, docsMissing.join(", "));
const sourcesHtml = fs.readFileSync(path.join(ROOT, "docs", "SOURCES.html"), "utf8");
const jukiHtml = fs.readFileSync(path.join(ROOT, "docs", "JUKI_OCT_SOURCES.html"), "utf8");
const nationalJukiHtml = fs.readFileSync(path.join(ROOT, "docs", "NATIONAL_JUKI_SOURCES.html"), "utf8");
const boundaryNotesHtml = fs.readFileSync(path.join(ROOT, "docs", "boundary-notes.html"), "utf8");
check("sources html has tables", /<table>/.test(sourcesHtml) && /2015年全市5歳/.test(sourcesHtml));
check("juki html has 47 cities", /札幌市/.test(jukiHtml) && /那覇市/.test(jukiHtml) && (jukiHtml.match(/<tr>/g) || []).length >= 49);
check("national juki html has values", /1,941,078/.test(nationalJukiHtml) && /9,190,237/.test(nationalJukiHtml));
check("boundary notes html", /境界不一致/.test(boundaryNotesHtml));

if (main) {
  const noIds = {};
  const noChart = {
    console,
    document: {
      readyState: "loading",
      getElementById(id) { if (!noIds[id]) noIds[id] = makeEl(); return noIds[id]; },
      querySelector() { return makeEl(); },
      querySelectorAll() { return []; },
      addEventListener(ev, cb) { if (ev === "DOMContentLoaded") cb(); },
    },
  };
  vm.createContext(noChart);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "data", "landing.js"), "utf8"), noChart, { filename: "landing.js" });
  try {
    vm.runInContext(main, noChart, { filename: "landing-inline-no-chart" });
    check("landing init runs without Chart", true);
  } catch (e) {
    check("landing init runs without Chart", false, e.message);
  }
  const noTbody = noIds.cityTable && noIds.cityTable._children.tbody;
  check("table renders without Chart", noTbody && noTbody.innerHTML.includes("富山市"));
}

console.log(fail === 0 ? "LANDING: all passed" : "LANDING: " + fail + " failures");
process.exit(fail === 0 ? 0 : 1);
