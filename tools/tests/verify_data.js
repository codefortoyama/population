"use strict";
/* Data integrity checks across towns.js / townage.js / censustown.js and the
 * inline city series in index.html. Usage: node tools/tests/verify_data.js */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..", "..");
const sandbox = { console };
vm.createContext(sandbox);
for (const f of ["data/towns.js", "data/townage.js", "data/censustown.js"]) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });
}
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const m = html.match(/const data=(\[[\s\S]*?\n\]);/);
sandbox.__city = vm.runInContext("(" + m[1] + ")", sandbox);

const J = (expr) => vm.runInContext(expr, sandbox);

let fail = 0;
function check(label, ok, detail) {
  console.log((ok ? "OK   " : "FAIL ") + label + (detail ? "  " + detail : ""));
  if (!ok) fail++;
}

const n = J("TOWNS.length");
check("TOWNS == TOWNAGE20/25 == CENSUS_TOWN",
  n === J("TOWNAGE20.length") && n === J("TOWNAGE25.length") &&
  n === J("CENSUS_TOWN.length") && n === J("CENSUS_TOWN_M.length"),
  "n=" + n);

const EXPECT = {
  "2020-09": 414354, "2021-09": 411956, "2022-09": 409580, "2023-09": 407058,
  "2024-09": 404401, "2025-09": 402015, "2026-08": 399759,
};
J("TOWN_YEARS").forEach((y, yi) => {
  const s = J(`TOWNS.reduce((a,t)=>a+(t[${yi + 1}]||0),0)`);
  const miss = J(`TOWNS.filter(t=>t[${yi + 1}]==null).length`);
  check("juki sum " + y, s === EXPECT[y], s + " (expect " + EXPECT[y] + ", nulls " + miss + ")");
});

const tchk = J(`TOWNS.reduce((a,t)=>{for(let y=0;y<7;y++){const T=t[1+y],M=t[8+y],F=t[15+y];if(T!=null&&M!=null&&F!=null){a.n++;if(T!==M+F)a.bad++;}}return a;},{n:0,bad:0})`);
check("towns T == M+F", tchk.bad === 0, tchk.n + " checked, " + tchk.bad + " mismatch");

const cchk = J(`CENSUS_TOWN.reduce((a,v,i)=>{const M=CENSUS_TOWN_M[i],F=CENSUS_TOWN_F[i];if(v!=null&&M!=null&&F!=null){a.n++;if(v!==M+F)a.bad++;}return a;},{n:0,bad:0})`);
check("census T == M+F", cchk.bad === 0, cchk.n + " checked, " + cchk.bad + " mismatch");

const cityOk = J(`__city.filter(r=>["2010-10-01","2015-10-01","2020-10-01"].includes(r.date)&&r.census)
  .every(r=>r.c5&&r.c5.length===21&&r.c5m&&r.c5f)
  && __city.some(r=>r.date==="2025-10-01"&&r.tag==="確定"&&r.c5&&r.c5.length===21)`);
check("city 2010/2015/2020/2025 have 5-year census", cityOk);

console.log(fail === 0 ? "DATA: all passed" : "DATA: " + fail + " failures");
process.exit(fail === 0 ? 0 : 1);
