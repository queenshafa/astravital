"use client";

import { useHazards } from "@/lib/useHazards";

const META = {
  radiation: ["Radiation", "☢️"],
  geomagnetic: ["Geomagnetic", "🧲"],
  microgravity: ["Microgravity", "🛰️"],
  isolation: ["Isolation", "🔒"],
  closed_environment: ["Closed environment", "🧪"],
};
const COLOR = { normal: "#2f6f4f", attention: "#ffc21a", warning: "#ff8a1f", critical: "#ff3b30" };

export default function HazardsPanel() {
  const { loading, error, warning, hazards } = useHazards();
  const list = Object.keys(META).map((t) => hazards.find((h) => h.hazard_type === t)).filter(Boolean);

  return (
    <section className="rounded-2xl bg-card p-6 sm:p-8">
      <h2 className="text-2xl font-semibold tracking-tight">Space Hazards</h2>
      <p className="mt-1 text-[15px]">Live space weather from NASA DONKI, plus simulated mission conditions.</p>

      {loading && <p className="mt-5 text-sm text-white/50">Contacting NASA…</p>}
      {error && <p className="mt-5 rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-300">{error}</p>}
      {warning && <p className="mt-5 rounded-xl bg-amber-500/15 px-4 py-3 text-sm text-amber-300">{warning}</p>}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {list.map((h) => {
          const [name, icon] = META[h.hazard_type];
          return (
            <div key={h.hazard_type} className="flex flex-col rounded-xl border border-line p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[15px]">{icon} {name}</span>
                <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize" style={{ background: COLOR[h.status], color: h.status === "normal" ? "#fff" : "#1a1208" }}>{h.status}</span>
              </div>
              <p className="mt-3 flex-1 text-xs leading-relaxed text-white/60">{h.description}</p>
              <p className="mt-3 text-[11px] text-white/40">{h.source} · {new Date(h.recorded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-[11px] text-white/40">Space weather data: NASA CCMC DONKI.</p>
    </section>
  );
}