"use strict";
/* Shared DOM/Chart stubs so the site scripts can run under Node for tests. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..", "..");

function makeEl() {
  return {
    textContent: "", innerHTML: "", disabled: false, value: "2020", checked: false,
    style: {}, dataset: {}, classList: { toggle() {}, add() {}, remove() {} },
    addEventListener() {}, appendChild() {},
  };
}

function makeSandbox(opts) {
  opts = opts || {};
  const ids = {};
  const made = [];
  const sandbox = {
    console,
    __made: made,
    document: {
      getElementById(id) { if (!ids[id]) ids[id] = makeEl(); return ids[id]; },
      querySelector: () => ({ innerHTML: "", appendChild() {} }),
      querySelectorAll: () => [],
      createElement: () => makeEl(),
      head: { appendChild() {} },
    },
    Chart: class { constructor(canvas, cfg) { made.push({ canvas, cfg }); } destroy() {} },
    window: {
      addEventListener(ev, cb) { if (ev === "DOMContentLoaded") cb(); },
      matchMedia: () => ({ matches: false }),
    },
  };
  vm.createContext(sandbox);
  const domIds = [
    "kCensusLabel", "kJukiLabel", "kDiffLabel", "kCensus", "kCensusDate", "kJuki", "kJukiDate",
    "kDiff", "kDiffDate", "scopeNote", "ageFilter", "townSearch", "townList", "townGo",
    "townClear", "g5", "trend", "diff", "tabOverview", "tabRank", "rankYear",
    "rankCount-age", "rankCount-agesex", "rankCount-lifesex", "rankCount-town",
    "rankCount-oaza", "rankCount-district", "viewOverview", "viewRank", "warnDyn",
  "rankSus", "rankSusNote",
  ];
  domIds.forEach((id) => { sandbox[id] = sandbox.document.getElementById(id); });

  const files = opts.dataFiles || ["data/towns.js", "data/townage.js", "data/censustown.js"];
  for (const f of files) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });
  }
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
  vm.runInContext(inline, sandbox, { filename: "index-inline" });
  return { sandbox, made, ids };
}

module.exports = { ROOT, makeSandbox };
