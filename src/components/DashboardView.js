"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Header from "./Header";
import MetricCard from "./MetricCard";
import AnatomyPanel from "./AnatomyPanel";
import HazardsPanel from "./HazardsPanel";
import { useAstronaut } from "@/lib/astronaut";
import { buildMetrics } from "@/lib/metrics";
import { CATEGORIES, levelIndex, riskToPain } from "@/lib/risk";

export default function DashboardView() {
  const { loading, error, astronaut, baseline, latest, analyses } = useAstronaut();
  const [pain, setPain] = useState({}); // marks added manually on the body
  const [sel, setSel] = useState(null);

  const riskPain = useMemo(() => riskToPain(analyses), [analyses]);
  const shown = useMemo(() => {
    const m = { ...riskPain };
    Object.keys(pain).forEach((id) => (m[id] = Math.max(m[id] || 0, pain[id])));
    return m;
  }, [riskPain, pain]);

  let status = "Your health status is generally stable 👌";
  const worst = analyses.reduce((a, r) => (levelIndex(r.risk_level) > levelIndex(a?.risk_level) ? r : a), null);
  if (loading) status = "Loading your data…";
  else if (error) status = error;
  else if (!astronaut) status = "No baseline yet. Tap the + button to fill in the form.";
  else if (worst && levelIndex(worst.risk_level) > 0) status = `${CATEGORIES[worst.risk_category]?.label ?? worst.risk_category} risk: ${worst.risk_level}`;

  return (
    <>
      <Header name={astronaut?.name} status={status} />
      {!loading && !astronaut && !error && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand/40 bg-card p-6">
          <p className="text-[15px]">Start by entering the astronaut&apos;s personal baseline. All dashboards compare new readings against it.</p>
          <Link href="/baseline" className="rounded-xl bg-brand px-6 py-3 text-[15px] font-medium text-white">Fill baseline form</Link>
        </div>
      )}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {buildMetrics(baseline, latest).map((m) => <MetricCard key={m.label} {...m} />)}
      </section>
      <HazardsPanel />
      <AnatomyPanel pain={pain} setPain={setPain} shown={shown} analyses={analyses} sel={sel} setSel={setSel} />
    </>
  );
}
