"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

function StatusBadge({ status = "Normal" }) {
  return (
    <span className="rounded-full bg-brand px-3 py-1 text-[11px] font-medium text-white">
      {status}
    </span>
  );
}

function MetricCard({ icon, label, value, unit, status = "Normal", loading }) {
  return (
    <div className="rounded-xl bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="text-3xl">{icon}</div>

        <p className="text-right text-sm text-white/70">
          {label}
        </p>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="text-2xl font-medium text-white">
            {loading ? "—" : value}
          </div>

          <p className="mt-3 text-[11px] text-white/40">
            {unit}
          </p>
        </div>

        <StatusBadge status={status} />
      </div>
    </div>
  );
}

function getStatus(hazard) {
  if (!hazard) return "Normal";
  return hazard.status || "Normal";
}

function getEventIcon(type) {
  if (type === "Solar Flare") return "☀";
  if (type === "Solar Particle Activity") return "☄";
  if (type === "Geomagnetic Storm") return "🧲";

  return "⚠";
}

export default function SpaceHazardMonitor() {
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState(null);

  async function loadHazards() {
    try {
      setLoading(true);

      const res = await fetch("/api/hazards", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load hazards");
      }

      setHazards(data.hazards || []);
      setWarning(data.warning || null);
    } catch (error) {
      console.error("Hazard error:", error);
      setWarning(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHazards();
  }, []);

  const solarFlare = hazards.find(
    (h) => h.hazard_type === "Solar Flare"
  );

  const solarParticle = hazards.find(
    (h) => h.hazard_type === "Solar Particle Activity"
  );

  const geomagneticStorm = hazards.find(
    (h) => h.hazard_type === "Geomagnetic Storm"
  );

  const hasWarning = hazards.some((h) =>
    ["warning", "high", "critical"].includes(
      String(h.status || "").toLowerCase()
    )
  );

  const hasMonitor = hazards.some((h) =>
    ["monitor", "moderate"].includes(
      String(h.status || "").toLowerCase()
    )
  );

  let overallRisk = "Low";
  let overallStatus = "Normal";
  let assessmentText =
    "All monitored space environment conditions are within safe ranges.";

  if (hasMonitor) {
    overallRisk = "Monitor";
    overallStatus = "Monitor";
    assessmentText =
      "Environmental activity is elevated but currently under monitoring.";
  }

  if (hasWarning) {
    overallRisk = "High";
    overallStatus = "Warning";
    assessmentText =
      "One or more environmental hazards require additional attention.";
  }

  return (
    <div className="min-h-screen bg-base p-4 lg:p-7">
      <div className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-[1560px] gap-5 lg:grid-cols-[264px_1fr]">

        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN CONTENT */}
        <main className="flex min-h-full min-w-0 flex-col gap-4">

          {/* HEADER */}
          <section className="rounded-xl bg-card px-6 py-10 lg:px-7">
            <h1 className="text-[24px] font-semibold text-white">
              Space Hazard Monitor
            </h1>

            <p className="mt-1 text-sm text-white/60">
              Monitor environmental factors that may impact your health.
            </p>
          </section>

          {/* METRIC CARDS */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon="☀"
              label="Solar Flare Activity"
              value={solarFlare?.value ?? 0}
              unit={solarFlare?.unit ?? "events"}
              status={getStatus(solarFlare)}
              loading={loading}
            />

            <MetricCard
              icon="☄"
              label="Particle Activity"
              value={solarParticle?.value ?? 0}
              unit={solarParticle?.unit ?? "events"}
              status={getStatus(solarParticle)}
              loading={loading}
            />

            <MetricCard
              icon="🧲"
              label="Geomagnetic Storm"
              value={geomagneticStorm?.value ?? 0}
              unit={geomagneticStorm?.unit ?? "events"}
              status={getStatus(geomagneticStorm)}
              loading={loading}
            />

            <MetricCard
              icon="⚠"
              label="Overall Risk"
              value={overallRisk}
              unit="current status"
              status={overallStatus}
              loading={loading}
            />
          </section>

          {/* MIDDLE SECTION - FLEX-1 BIAR NGISI SPACE */}
          <section className="grid flex-1 gap-4 xl:grid-cols-[1fr_1.08fr]">

            {/* SPACE HAZARD TRENDS */}
            <div className="flex h-full min-h-[278px] flex-col rounded-xl bg-card p-5">
              <h2 className="text-[15px] font-semibold text-white">
                Space Hazard Trends
              </h2>

              {/* NANTI RECHARTS MASUK SINI */}
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-white/30">
                  Historical trend data loading...
                </p>
              </div>
            </div>

            {/* RECENT SPACE EVENTS */}
            <div className="h-full rounded-xl bg-card p-5">
              <h2 className="text-[15px] font-semibold text-white">
                Recent Space Events
              </h2>

              <div className="mt-6 flex flex-col gap-5">
                {loading ? (
                  <p className="text-sm text-white/40">
                    Loading space events...
                  </p>
                ) : hazards.length === 0 ? (
                  <p className="text-sm text-white/40">
                    No recent space events found.
                  </p>
                ) : (
                  hazards.slice(0, 3).map((hazard, index) => (
                    <div
                      key={hazard.id || index}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">

                        {/* EVENT ICON */}
                        <div className="flex h-[54px] w-[64px] shrink-0 items-center justify-center rounded-md bg-white/5 text-2xl">
                          {getEventIcon(hazard.hazard_type)}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-medium text-white">
                            {hazard.hazard_type}
                          </h3>

                          <p className="mt-1 text-[11px] leading-relaxed text-white/45">
                            {hazard.details ||
                              "Space environment activity detected."}
                          </p>
                        </div>
                      </div>

                      <StatusBadge
                        status={getStatus(hazard)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* CURRENT ASSESSMENT */}
          <section className="flex items-center gap-5 rounded-xl bg-card px-7 py-6">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
              !
            </div>

            <div>
              <h2 className="text-[15px] font-semibold text-white">
                Current Assessment
              </h2>

              <p className="mt-1 text-xs text-white/55">
                {assessmentText}
              </p>

              {warning && (
                <p className="mt-2 text-xs text-yellow-400">
                  {warning}
                </p>
              )}
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}