const FIELDS = ["heart_rate", "hrv", "spo2", "sleep_duration", "activity_level"];
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const RANGE_DAYS = { day: 1, week: 7, month: 30 };

const pad = (n) => String(n).padStart(2, "0");

function slotKey(d, range) {
  const base = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return range === "day" ? `${base}T${pad(d.getHours())}` : base;
}

function slotLabel(d, range) {
  if (range === "day") return `${pad(d.getHours())}:00`;
  if (range === "week") return WD[d.getDay()];
  return `${d.getDate()} ${MON[d.getMonth()]}`;
}

// Mulai dari slot pertama, dipakai juga untuk query ke database
export function rangeStart(range = "week", now = new Date()) {
  const d = new Date(now);
  if (range === "day") {
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() - 23);
  } else {
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((RANGE_DAYS[range] ?? 7) - 1));
  }
  return d;
}

// readings (urutan bebas) -> bucket rata-rata: per jam (day), per hari (week / month)
// Selalu menghasilkan slot dengan jumlah tetap: 24 / 7 / 30, yang kosong bernilai null.
export function bucketize(rows, range = "week", now = new Date()) {
  const count = range === "day" ? 24 : RANGE_DAYS[range] ?? 7;

  const anchor = new Date(now);
  if (range === "day") anchor.setMinutes(0, 0, 0);
  else anchor.setHours(0, 0, 0, 0);

  const slots = new Map();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(anchor);
    if (range === "day") d.setHours(d.getHours() - i);
    else d.setDate(d.getDate() - i); // setDate aman terhadap DST
    slots.set(slotKey(d, range), { label: slotLabel(d, range), sums: {}, n: {} });
  }

  for (const r of rows || []) {
    const d = new Date(r.recorded_at);
    if (isNaN(d)) continue;
    const b = slots.get(slotKey(d, range));
    if (!b) continue; // di luar window
    for (const f of FIELDS) {
      if (r[f] == null) continue;
      const v = Number(r[f]);
      if (!Number.isFinite(v)) continue;
      b.sums[f] = (b.sums[f] || 0) + v;
      b.n[f] = (b.n[f] || 0) + 1;
    }
  }

  return [...slots.values()].map((b) => {
    const o = { label: b.label };
    for (const f of FIELDS) o[f] = b.n[f] ? +(b.sums[f] / b.n[f]).toFixed(1) : null;
    return o;
  });
}