const FIELDS = ["heart_rate", "hrv", "spo2", "sleep_duration", "activity_level"];
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const RANGE_DAYS = { day: 1, week: 7, month: 30 };

// readings (ascending) -> averaged buckets: hourly (day), daily (week / month)
export function bucketize(rows, range) {
  const map = new Map();
  for (const r of rows) {
    const d = new Date(r.recorded_at);
    const key = range === "day" ? `${d.toDateString()}-${d.getHours()}` : d.toDateString();
    const label = range === "day" ? String(d.getHours()).padStart(2, "0") + ":00" : range === "week" ? WD[d.getDay()] : `${d.getDate()} ${MON[d.getMonth()]}`;
    if (!map.has(key)) map.set(key, { label, sums: {}, n: {} });
    const b = map.get(key);
    FIELDS.forEach((f) => { if (r[f] != null) { b.sums[f] = (b.sums[f] || 0) + Number(r[f]); b.n[f] = (b.n[f] || 0) + 1; } });
  }
  return [...map.values()].map((b) => {
    const o = { label: b.label };
    FIELDS.forEach((f) => (o[f] = b.n[f] ? +(b.sums[f] / b.n[f]).toFixed(1) : null));
    return o;
  });
}
