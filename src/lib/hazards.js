// Pure helpers: turn NASA DONKI events into hazard rows for the space_hazards table.
const LEVELS = ["normal", "attention", "warning", "critical"];
const FLUX = { A: 1e-8, B: 1e-7, C: 1e-6, M: 1e-5, X: 1e-4 }; // W/m2 per class letter
const hours = (iso) => (Date.now() - new Date(iso).getTime()) / 36e5;
const worse = (a, b) => (LEVELS.indexOf(a) >= LEVELS.indexOf(b) ? a : b);
const fluxOf = (c) => {
  const m = /^([ABCMX])(\d+(\.\d+)?)/.exec(c || "");
  return m ? FLUX[m[1]] * parseFloat(m[2]) : 0;
};

// flr / sep / gst = arrays returned by DONKI for the last 7 days
export function summarize({ flr, sep, gst }) {
  const now = new Date().toISOString();

  // Solar flares (last 72 h): X = warning, X10+ = critical, M = attention
  let best = null;
  flr.filter((e) => hours(e.peakTime || e.beginTime) <= 72).forEach((e) => {
    if (!best || fluxOf(e.classType) > fluxOf(best.classType)) best = e;
  });
  const f = best ? fluxOf(best.classType) : 0;
  const flrStatus = f >= 1e-3 ? "critical" : f >= 1e-4 ? "warning" : f >= 1e-5 ? "attention" : "normal";

  // Solar energetic particle events: any in 72 h = warning, any in 7 d = attention
  const sepRecent = sep.filter((e) => hours(e.eventTime) <= 72).length;
  const sepStatus = sepRecent ? "warning" : sep.length ? "attention" : "normal";

  // Geomagnetic storms: Kp >= 5 attention, >= 7 warning, >= 8 critical (last 72 h)
  let kp = 0;
  gst.forEach((e) => (e.allKpIndex || []).forEach((k) => { if (hours(k.observedTime) <= 72) kp = Math.max(kp, k.kpIndex); }));
  const kpStatus = kp >= 8 ? "critical" : kp >= 7 ? "warning" : kp >= 5 ? "attention" : "normal";

  return [
    { hazard_type: "radiation", status: worse(flrStatus, sepStatus), value: f, source: "NASA DONKI", recorded_at: now,
      description: `Strongest flare (72 h): ${best?.classType ?? "none"} · SEP events (7 d): ${sep.length}` },
    { hazard_type: "geomagnetic", status: kpStatus, value: kp, source: "NASA DONKI", recorded_at: now,
      description: `Max Kp (72 h): ${kp || "n/a"} · storms (7 d): ${gst.length}` },
    { hazard_type: "microgravity", status: "normal", value: null, source: "Simulated", recorded_at: now, description: "Continuous microgravity exposure (simulated)" },
    { hazard_type: "isolation", status: "normal", value: null, source: "Simulated", recorded_at: now, description: "Crew isolation stress index (simulated)" },
    { hazard_type: "closed_environment", status: "normal", value: null, source: "Simulated", recorded_at: now, description: "Cabin air and habitat conditions (simulated)" },
  ];
}
