"use client";

import { useEffect, useMemo, useState } from "react";
import MetricCard from "./MetricCard";
import AreaChart from "./AreaChart";
import { useAstronaut } from "@/lib/astronaut";
import { buildMetrics } from "@/lib/metrics";
import { RANGE_DAYS, bucketize } from "@/lib/trends";

const BRAND = "#f97a35";
const RANGES = [["day", "Day"], ["week", "Week"], ["month", "Month"]];

function ChartCard({ title, data, series }) {
  return (
    <section className="rounded-2xl bg-card p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {series.length > 1 && (
          <div className="flex gap-3 text-xs text-white/60">
            {series.map((s) => <span key={s.key}><span style={{ color: s.color }}>●</span> {s.label}</span>)}
          </div>
        )}
      </div>
      <AreaChart data={data} series={series} />
    </section>
  );
}

export default function HealthTrendsView() {
  const [range, setRange] = useState("week");
  const [now, setNow] = useState(null);

  // new Date() hanya dipanggil di browser, setelah mount
  useEffect(() => {
    setNow(new Date());
  }, []);

  const { error, baseline, latest, readings } = useAstronaut({ days: RANGE_DAYS[range] });
  const data = useMemo(() => bucketize(readings, range, now), [readings, range, now]);
  const b = baseline || {};

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-card px-8 py-10">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight sm:text-[32px]">Health Trends</h1>
          <p className="mt-1 text-[15px]">Track your health metrics over time and compare with baseline.</p>
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </div>
        <div className="flex">
          {RANGES.map(([k, label]) => (
            <button
              key={k}
              onClick={() => setRange(k)}
              className={"rounded-md px-6 py-2.5 text-[15px] transition-colors " + (range === k ? "bg-brand text-white" : "text-white/90 hover:text-brand")}
            >{label}</button>
          ))}
        </div>
      </header>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {buildMetrics(baseline, latest).map((m) => <MetricCard key={m.label} {...m} />)}
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Heart Rate & HRV" data={data} series={[
          { key: "heart_rate", label: "Heart rate (bpm)", color: BRAND, baseline: b.heart_rate, area: true },
          { key: "hrv", label: "HRV (ms)", color: "#ffd2b5", baseline: b.hrv },
        ]} />
        <ChartCard title="Sleep Quality" data={data} series={[{ key: "sleep_duration", label: "Sleep (hrs)", color: BRAND, baseline: b.sleep_duration, area: true }]} />
        <ChartCard title="Activity Level" data={data} series={[{ key: "activity_level", label: "Activity", color: BRAND, baseline: b.activity_level, area: true }]} />
        <ChartCard title="SpO₂" data={data} series={[{ key: "spo2", label: "SpO₂ (%)", color: BRAND, baseline: b.spo2, area: true }]} />
      </div>
    </>
  );
}