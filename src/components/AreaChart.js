"use client";

import { useId, useState } from "react";

const W = 640, H = 260, L = 42, R = 14, T = 14, B = 30;

// series: [{ key, label, color, baseline?, area? }]   data: [{ label, [key]: number|null }]
export default function AreaChart({ data, series }) {
  const uid = useId().replace(/:/g, "");
  const [hi, setHi] = useState(null);
  const n = data.length;
  const vals = [];
  series.forEach((s) => {
    data.forEach((p) => p[s.key] != null && vals.push(p[s.key]));
    if (s.baseline != null) vals.push(Number(s.baseline));
  });
  if (!n || !vals.length) return <div className="grid h-[260px] place-items-center text-sm text-white/40">No data for this range yet.</div>;

  let lo = Math.min(...vals), top = Math.max(...vals);
  const pad = Math.max((top - lo) * 0.15, 1);
  lo = Math.floor(lo - pad); top = Math.ceil(top + pad);
  const x = (i) => L + (n === 1 ? (W - L - R) / 2 : (i / (n - 1)) * (W - L - R));
  const y = (v) => T + (1 - (v - lo) / (top - lo)) * (H - T - B);
  const ticks = [0, 1, 2, 3, 4].map((i) => lo + ((top - lo) * i) / 4);
  const every = Math.ceil(n / 8);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const vx = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round((vx - L) / ((W - L - R) / Math.max(n - 1, 1)));
    setHi(Math.max(0, Math.min(n - 1, i)));
  };

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" onMouseMove={onMove} onMouseLeave={() => setHi(null)}>
        <defs>
          {series.filter((s) => s.area).map((s) => (
            <linearGradient key={s.key} id={`${uid}-${s.key}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.45" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#4a4550" strokeWidth="1" />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="12" fill="#c9c4cc">{Math.round(t * 10) / 10}</text>
          </g>
        ))}
        {data.map((p, i) => i % every === 0 && (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="12" fill="#c9c4cc">{p.label}</text>
        ))}
        {series.map((s) => {
          const seg = data.map((p, i) => (p[s.key] == null ? null : [x(i), y(p[s.key])])).filter(Boolean);
          if (!seg.length) return null;
          const line = seg.map((q, i) => (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1)).join(" ");
          const area = `${line} L${seg[seg.length - 1][0].toFixed(1)} ${H - B} L${seg[0][0].toFixed(1)} ${H - B} Z`;
          return (
            <g key={s.key}>
              {s.baseline != null && <line x1={L} x2={W - R} y1={y(Number(s.baseline))} y2={y(Number(s.baseline))} stroke={s.color} strokeDasharray="5 5" opacity="0.6" />}
              {s.area && <path d={area} fill={`url(#${uid}-${s.key})`} />}
              <path d={line} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" />
            </g>
          );
        })}
        {hi != null && (
          <g>
            <line x1={x(hi)} x2={x(hi)} y1={T} y2={H - B} stroke="#fff" strokeWidth="1" />
            {series.map((s) => data[hi][s.key] != null && (
              <circle key={s.key} cx={x(hi)} cy={y(data[hi][s.key])} r="4" fill={s.color} stroke="#fff" strokeWidth="1.5" />
            ))}
          </g>
        )}
      </svg>
      {hi != null && (
        <div
          className="pointer-events-none absolute top-2 -translate-x-1/2 rounded-lg bg-base/95 px-3 py-2 text-xs shadow-lg"
          style={{ left: `${Math.min(88, Math.max(12, (x(hi) / W) * 100))}%` }}
        >
          <div className="mb-0.5 text-white/60">{data[hi].label}</div>
          {series.map((s) => (
            <div key={s.key}><span style={{ color: s.color }}>●</span> {s.label}: {data[hi][s.key] ?? "—"}</div>
          ))}
        </div>
      )}
    </div>
  );
}
