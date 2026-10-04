"use strict";
/* Overview (tab 1) smoke test: scopes x ages x years.
 * Usage: node tools/tests/run_overview.js   (exit 1 on any failure) */
const vm = require("vm");
const { makeSandbox } = require("./harness");

const { sandbox } = makeSandbox();
const script = `
(function(){
  const out = [];
  let fail = 0;
  const town0 = TOWNS[0][0];
  const oaza0 = Object.keys(OAZA)[0];
  const dist0 = Object.keys(DIST).sort()[0];
  const scopes = [["city",null],["town",town0],["oaza",oaza0],["district",dist0]];
  const ages = ["all","a0","a15","a65","pre","pri","jun","high","univ","w2340","w4165","w6675","w76","b3"];
  for (const [kind,key] of scopes) {
    for (const age of ages) {
      try {
        setScope(kind, key); ageMode = age; render();
        out.push("OK " + kind + "/" + (key||"-") + " " + age +
          " c=" + kCensus.textContent + " j=" + kJuki.textContent + " d=" + kDiff.textContent);
      } catch(e) { fail++; out.push("FAIL " + kind + " " + age + " :: " + e.message); }
    }
  }
  for (const [g,y] of [["age","2020"],["age","2015"],["age","2010"],["agesex","2020"],
      ["lifesex","2020"],["town","2020"],["oaza","2020"],["district","2020"]]) {
    for (const inc of [true,false]) {
      try {
        rankYear.value = y; rankSus.checked = inc; showTab("rank");
        const rows = rankRows(g, y).filter(r=>inc||!r.sus);
        let sorted = true;
        for (let i=1;i<rows.length;i++){ if (Math.abs(rows[i].d) > Math.abs(rows[i-1].d)) { sorted=false; break; } }
        out.push("RANK " + g + "/" + y + (inc?" inc":" excl") + " n=" + rows.length);
        if ((g==="town"||g==="oaza"||g==="district") && !sorted) { fail++; out.push("  NOT SORTED"); }
        if (!rows.length) { fail++; out.push("  EMPTY"); }
      } catch(e) { fail++; out.push("RANKFAIL " + g + "/" + y + " " + inc + " :: " + e.message); }
    }
  }
  return { out: out.join("\\n"), fail };
})()`;
const res = vm.runInContext(script, sandbox);
console.log(res.out);
console.log(res.fail === 0 ? "OVERVIEW: all passed" : "OVERVIEW: " + res.fail + " failures");
process.exit(res.fail === 0 ? 0 : 1);
