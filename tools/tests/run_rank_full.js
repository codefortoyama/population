"use strict";
/* "詳しく見る" full-page builder test for each ranking group.
 * Usage: node tools/tests/run_rank_full.js */
const vm = require("vm");
const fs = require("fs");
const path = require("path");
const { ROOT, makeSandbox } = require("./harness");

// window.open stub capturing the written HTML into the sandbox global __page
const fakeWin = { document: { write(h) { sandbox.__page = h; }, close() {} }, focus() {} };

const base = makeSandbox();
const sandbox = base.sandbox;
sandbox.__page = null;
sandbox.window.open = () => fakeWin;

const script = `
(function(){
  const out = [];
  let fail = 0;
  for (const g of ["age","agesex","lifesex","town","oaza","district"]) {
    try {
      rankYear.value = "2020";
      openRankFull(g);
      const n = (__page.match(/<tr>/g) || []).length;
      const ok = __page.includes("差ランキング") && n > 1;
      out.push("PAGE " + g + " rows=" + n + " ok=" + ok);
      if (!ok) fail++;
    } catch(e) { fail++; out.push("PAGEFAIL " + g + " :: " + e.message); }
  }
  return { out: out.join("\\n"), fail };
})()`;
const res = vm.runInContext(script, sandbox);
console.log(res.out);
console.log(res.fail === 0 ? "RANKFULL: all passed" : "RANKFULL: " + res.fail + " failures");
process.exit(res.fail === 0 ? 0 : 1);
