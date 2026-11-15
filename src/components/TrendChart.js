"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { useHazardHistory } from "@/lib/useHazardHistory";

const LINES = [
  { key: "flares", name: "Solar Flare", color: "#ffc21a" },
  { key: "particles", name: "Particle", color: "#4da3ff" },
  { key: "storms", name: "Geomagnetic Storm", color: "#ff5c8a" },
];

const shortDate = (d) => {
  const [, m, day] = String(d).split("-");
  return `${day}/${m}`;
};

export default function TrendChart({ days = 14 }) {
  const { loading, error, warning, days: data } = useHazardHistory(days);

  const total = data.reduce(
    (sum, d) => sum + LINES.reduce((s, l) => s + (d[l.key] || 0), 0),
    0
  );

  return (
    <div className="flex h-full min-h-[278px] flex-col rounded-xl bg-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-white">
          Space Hazard Trends
        </h2>
        <span className="text-[11px] text-white/40">
          Last {days} days · events/day
        </span>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-white/30">Loading trend data...</p>
        </div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center text-center">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      ) : (
        <>
          <div className="relative mt-4">
            {/* tinggi eksplisit supaya ResponsiveContainer tidak collapse */}
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={shortDate}
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={16}
                  />
                  <YAxis
                    allowDecimals={false}
                    domain={[0, (max) => Math.max(max, 3)]}
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    labelFormatter={shortDate}
                    contentStyle={{
                      background: "#14161c",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {LINES.map((l) => (
                    <Line
                      key={l.key}
                      type="monotone"
                      dataKey={l.key}
                      name={l.name}
                      stroke={l.color}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {total === 0 && (
              <p className="pointer-events-none absolute inset-x-0 top-1/3 text-center text-xs text-white/40">
                No space weather events in the last {days} days.
              </p>
            )}
          </div>

          {warning && <p className="mt-2 text-[11px] text-yellow-400">{warning}</p>}
        </>
      )}
    </div>
  );
}