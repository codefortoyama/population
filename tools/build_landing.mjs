// ランディングページ用の軽量データを生成する。
//
// - 都市別の国勢調査人口: data/national.json
// - 富山市の長期系列・年齢区分: dashboard.html の const data（国勢調査）
//
// Usage: node tools/build_landing.mjs
// Output: data/landing.js
// 注意: index.html のヒーロー・本文・都市カードの数値は静的記述。データ更新時に手動で確認する。

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const national = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "national.json"), "utf8"));
if (national.length !== 47) throw new Error(`national.json は47地点のはずです（${national.length}）`);

const dashboard = fs.readFileSync(path.join(ROOT, "dashboard.html"), "utf8");
const m = dashboard.match(/const data=\[\s*([\s\S]*?)\n\];/);
if (!m) throw new Error("dashboard.html の const data が見つかりません");
const citySeries = JSON.parse("[" + m[1] + "]");

const CENSUS_DATES = ["2005-10-01", "2010-10-01", "2015-10-01", "2020-10-01", "2025-10-01"];
const toyama = CENSUS_DATES.map((date) => {
  const row = citySeries.find((r) => r.date === date);
  if (!row || row.census == null) throw new Error(`${date} の富山市国勢値がありません`);
  return row.census;
});

const ageRows = ["2010-10-01", "2015-10-01", "2020-10-01", "2025-10-01"].map((date) => {
  const row = citySeries.find((r) => r.date === date);
  if (!row || !row.c5) throw new Error(`${date} の富山市5歳階級がありません`);
  const known = row.c5.reduce((a, b) => a + b, 0);
  const sum = (from, to) => row.c5.slice(from, to).reduce((a, b) => a + b, 0);
  return {
    year: Number(date.slice(0, 4)),
    v: [sum(0, 3), sum(3, 13), sum(13, 15), sum(15, 21)],
    unknown: row.census - known,
    age0_4: row.c5[0],
  };
});

const latest = citySeries.find((r) => r.date === "2026-08-31");

const cities = national.map((r) => [r.pref, r.city, r.census]);
const out = `/* 自動生成: node tools/build_landing.mjs
 * 出典: data/national.json（国勢調査 2010/2015/2020/2025）と dashboard.html の富山市系列。
 * 直接編集せず、元データを更新してから再生成してください。 */
const LANDING_CITIES=${JSON.stringify(cities)};
const LANDING_TOYAMA=${JSON.stringify({
  years: [2005, 2010, 2015, 2020, 2025],
  census: toyama,
  age: ageRows,
  latestJuki: latest ? { date: latest.date, value: latest.juki } : null,
})};
`;

fs.writeFileSync(path.join(ROOT, "data", "landing.js"), out, "utf8");
console.log(`wrote data/landing.js (${cities.length} cities, Toyama ${toyama[0]} -> ${toyama[toyama.length - 1]})`);
