import { supabase } from "./supabase";

// risk_category -> body hotspots on the 3D model
export const CATEGORIES = {
  cardiovascular: { label: "Cardiovascular", icon: "🫀", parts: ["chest"] },
  musculoskeletal: { label: "Musculoskeletal", icon: "🦴", parts: ["sh_l", "sh_r", "knee_l", "knee_r"] },
  behavioral: { label: "Behavioral", icon: "🧠", parts: ["head"] },
  immune: { label: "Immune", icon: "🛡️", parts: ["neck", "abdomen"] },
};
export const LEVELS = ["normal", "attention", "warning", "critical"];
export const levelIndex = (l) => Math.max(0, LEVELS.indexOf(l));

const num = (v) => (v == null || Number.isNaN(Number(v)) ? null : Number(v));
const pct = (cur, base) => (num(cur) == null || !num(base) ? 0 : ((cur - base) / base) * 100);
const level = (bad, [a, w, c]) => (bad >= c ? 3 : bad >= w ? 2 : bad >= a ? 1 : 0);

const CONCERN = {
  cardiovascular: "Heart rate / HRV drifting from personal baseline",
  musculoskeletal: "Activity level dropping versus baseline (deconditioning)",
  behavioral: "Sleep duration shorter than baseline (fatigue, mood)",
  immune: "Lower SpO2 or higher body temperature than baseline",
};
const ADVICE = [
  "Continue routine monitoring.",
  "Monitor closely over the next 24 hours.",
  "Reduce workload, re-check vitals and notify the flight surgeon.",
  "Escalate to the medical team immediately.",
];

// Simple rule-based risk engine: latest reading vs personal baseline.
export function computeRisk(base, cur) {
  const hr = pct(cur.heart_rate, base.heart_rate), hrv = pct(cur.hrv, base.hrv);
  const sleep = pct(cur.sleep_duration, base.sleep_duration), act = pct(cur.activity_level, base.activity_level);
  const spo2 = num(cur.spo2) != null && num(base.spo2) != null ? cur.spo2 - base.spo2 : 0;
  const temp = num(cur.body_temperature) != null && num(base.body_temperature) != null ? cur.body_temperature - base.body_temperature : 0;
  const rows = [
    ["cardiovascular", level(Math.max(hr, -hrv, 0), [10, 20, 30]), { heart_rate_change: +hr.toFixed(1), hrv_change: +hrv.toFixed(1) }],
    ["musculoskeletal", level(Math.max(-act, 0), [15, 30, 50]), { activity_change: +act.toFixed(1) }],
    ["behavioral", level(Math.max(-sleep, 0), [10, 20, 35]), { sleep_change: +sleep.toFixed(1) }],
    ["immune", level(Math.max(-spo2 * 5, temp * 20, 0), [5, 10, 15]), { spo2_change: +spo2.toFixed(1), temp_change: +temp.toFixed(2) }],
  ];
  return rows.map(([cat, lv, ind]) => ({
    risk_category: cat,
    risk_level: LEVELS[lv],
    possible_concern: lv ? CONCERN[cat] : "No notable change from baseline",
    key_indicators: ind,
    recommendation: ADVICE[lv],
  }));
}

// Insert a fresh set of analyses only when there is a reading newer than the last analysis.
export async function ensureRiskAnalyses(astronautId, baseline, latest, lastAnalyzedAt) {
  if (!baseline || !latest) return false;
  if (lastAnalyzedAt && new Date(lastAnalyzedAt) >= new Date(latest.recorded_at)) return false;
  const rows = computeRisk(baseline, latest).map((r) => ({ ...r, astronaut_id: astronautId }));
  const { error } = await supabase.from("risk_analyses").insert(rows);
  if (error) throw error;
  return true;
}

export function latestPerCategory(rows) {
  const seen = new Set();
  return rows.filter((r) => (seen.has(r.risk_category) ? false : seen.add(r.risk_category)));
}

// analyses -> { bodyPartId: level(0..3) } for the 3D body
export function riskToPain(analyses) {
  const out = {};
  analyses.forEach((a) => {
    const lv = levelIndex(a.risk_level);
    if (!lv) return;
    (CATEGORIES[a.risk_category]?.parts || []).forEach((p) => (out[p] = Math.max(out[p] || 0, lv)));
  });
  return out;
}
