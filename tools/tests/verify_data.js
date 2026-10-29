"use strict";
/* Data integrity checks across towns.js / townage.js / censustown.js and the
 * inline city series in dashboard.html. Usage: node tools/tests/verify_data.js */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..", "..");
const sandbox = { console };
vm.createContext(sandbox);
for (const f of ["data/towns.js", "data/townage.js", "data/censustown.js"]) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });
}
const html = fs.readFileSync(path.join(ROOT, "dashboard.html"), "utf8");
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
  && __city.some(r=>r.date==="2025-10-01"&&r.c5&&r.c5.length===21)`);
check("city 2010/2015/2020/2025 have 5-year census", cityOk);

// 全国タブ: dashboard.html の NATIONAL と data/national.json の一致、2025年の基準日
const nm = html.match(/const NATIONAL=\[([\s\S]*?)\n\];/);
const NATIONAL = vm.runInNewContext("[" + nm[1] + "]", {});
const national = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "national.json"), "utf8"));
check("NATIONAL has 47 rows", NATIONAL.length === 47 && national.length === 47, "n=" + NATIONAL.length);
check("NATIONAL matches national.json",
  NATIONAL.every((r, i) => r[0] === national[i].pref && r[1] === national[i].city &&
    JSON.stringify(r[2]) === JSON.stringify(national[i].census) &&
    JSON.stringify(r[3]) === JSON.stringify(national[i].juki) &&
    JSON.stringify(r[4]) === JSON.stringify(national[i].jukiDate)));
for (const [yi, year] of [[1, "2015"], [2, "2020"], [3, "2025"]]) {
  const same = NATIONAL.filter((r) => r[4][yi].startsWith(year)).length;
  const fallback = NATIONAL.filter((r) => !r[4][yi].startsWith(year)).map((r) => r[1]);
  check(year + " same-date juki", same === (yi === 3 ? 44 : 43),
    same + " same-date, fallback=" + fallback.join("/"));
}
const tokyo = national.find((r) => r.code === "13100");
check("Tokyo 23 wards", tokyo.juki[1] === 9190237 && tokyo.juki[2] === 9585007 && tokyo.juki[3] === 9799375,
  tokyo.juki.slice(1).join("/"));
for (const yi of [1, 2, 3]) {
  const rate = NATIONAL.reduce((mx, r) => {
    const v = Math.abs((r[2][yi] - r[3][yi]) / r[2][yi] * 100);
    return Math.max(mx, v);
  }, 0);
  check(["2015", "2020", "2025"][yi - 1] + " |diff| < 5%", rate < 5, "max=" + rate.toFixed(2) + "%");
}

console.log(fail === 0 ? "DATA: all passed" : "DATA: " + fail + " failures");
process.exit(fail === 0 ? 0 : 1);
