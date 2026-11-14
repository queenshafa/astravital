"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MetricCard from "./MetricCard";
import AnatomyPanel from "./AnatomyPanel";
import { Droplet, HeartPulse, Moon, Waves } from "./icons";

const METRICS = [
  { icon: HeartPulse, label: "Heart Rate", value: "78", unit: "bpm", baseline: "85", updated: "2 min ago." },
  { icon: Waves, label: "HRV", value: "64", unit: "ms", baseline: "59", updated: "2 min ago." },
  { icon: Droplet, label: "SpO", value: "97", unit: "%", baseline: "97", updated: "8 min ago." },
  { icon: Moon, label: "Sleep", value: "5.6", unit: "hrs", baseline: "7h", updated: "8 min ago." },
];

export default function Dashboard() {
  const [pain, setPain] = useState({ chest: 3, thigh_l: 1 });
  const [sel, setSel] = useState(null);
  const ids = Object.keys(pain);
  const worst = ids.reduce((m, id) => Math.max(m, pain[id]), 0);

  return (
    <div className="min-h-screen bg-base p-4 lg:p-7">
      <div className="mx-auto grid max-w-[1560px] gap-5 lg:grid-cols-[264px_1fr]">
        <Sidebar />
        <main className="flex min-w-0 flex-col gap-5">
          <Header count={ids.length} worst={worst} />
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {METRICS.map((m) => <MetricCard key={m.label} {...m} />)}
          </section>
          <AnatomyPanel pain={pain} setPain={setPain} sel={sel} setSel={setSel} />
        </main>
      </div>
    </div>
  );
}
