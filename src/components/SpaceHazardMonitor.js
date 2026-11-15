
"use client";

import TrendChart from "./TrendChart";
import { useHazards } from "@/lib/useHazards";

const META = {
  radiation: { name: "Radiation", icon: "☢️" },
  geomagnetic: { name: "Geomagnetic", icon: "🧲" },
  microgravity: { name: "Microgravity", icon: "🛰️" },
  isolation: { name: "Isolation", icon: "🔒" },
  closed_environment: { name: "Closed Environment", icon: "🧪" },
};

const COLOR = {
  normal: "#2f6f4f",
  attention: "#ffc21a",
  warning: "#ff8a1f",
  critical: "#ff3b30",
};

const RANK = { normal: 0, attention: 1, warning: 2, critical: 3 };

function normStatus(hazard) {
  if (!hazard) return "normal";
  return String(hazard.status || "normal").toLowerCase();
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function StatusBadge({ status = "normal" }) {
  const st = String(status).toLowerCase();

  return (
    <span
      className="shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-medium"
      style={{
        background: COLOR[st] || COLOR.normal,
        color: st === "normal" ? "#fff" : "#1a1208",
      }}
    >
      {cap(st)}
    </span>
  );
}

function MetricCard({
  icon,
  label,
  value,
  unit,
  status = "normal",
  loading,
}) {
  return (
    <div className="min-w-0 rounded-xl bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="text-2xl sm:text-3xl">{icon}</div>
        <p className="text-right text-xs text-white/70 sm:text-sm">
          {label}
        </p>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="break-words text-xl font-medium text-white sm:text-2xl">
            {loading ? "—" : value}
          </div>
          <p className="mt-3 truncate text-[11px] text-white/40">
            {unit}
          </p>
        </div>

        <StatusBadge status={status} />
      </div>
    </div>
  );
}

function formatTime(iso) {
  if (!iso) return "";

  const d = new Date(iso);
  if (isNaN(d)) return "";

  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SpaceHazardMonitor() {
  const { loading, error, warning, hazards } = useHazards();
  const notice = error || warning;

  const byType = (type) =>
    hazards.find((h) => h.hazard_type === type);

  const radiation = byType("radiation");
  const geomagnetic = byType("geomagnetic");
  const microgravity = byType("microgravity");

  // Semua hazard yang dikenal, diurutkan dari yang paling parah
  const events = Object.keys(META)
    .map((t) => byType(t))
    .filter(Boolean)
    .sort(
      (a, b) => RANK[normStatus(b)] - RANK[normStatus(a)]
    );

  const worst = events.reduce(
    (max, h) => Math.max(max, RANK[normStatus(h)] ?? 0),
    0
  );

  let overallRisk = "Low";
  let overallStatus = "normal";

  let assessmentText =
    "All monitored space environment conditions are within safe ranges.";

  if (worst === RANK.attention) {
    overallRisk = "Monitor";
    overallStatus = "attention";
    assessmentText =
      "Environmental activity is elevated but currently under monitoring.";
  }

  if (worst === RANK.warning) {
    overallRisk = "High";
    overallStatus = "warning";
    assessmentText =
      "One or more environmental hazards require additional attention.";
  }

  if (worst === RANK.critical) {
    overallRisk = "Critical";
    overallStatus = "critical";
    assessmentText =
      "Critical environmental hazard detected. Immediate action is recommended.";
  }

  // Value/unit menggunakan data API atau fallback
  const cardProps = (h) => ({
    value: h?.value ?? cap(normStatus(h)),
    unit: h?.unit ?? h?.source ?? "—",
    status: normStatus(h),
    loading,
  });

  return (
    <div className="w-full min-w-0">

      <div className="mx-auto flex w-full max-w-[1560px] min-w-0 flex-col gap-4 sm:gap-5">

        {/* HEADER */}
        <section className="min-w-0 rounded-xl bg-card px-4 py-6 sm:px-6 sm:py-8 lg:px-7 lg:py-10">
          <h1 className="text-xl font-semibold text-white sm:text-2xl lg:text-[24px]">
            Space Hazard Monitor
          </h1>

          <p className="mt-1 text-xs leading-relaxed text-white/60 sm:text-sm">
            Monitor environmental factors that may impact your health.
          </p>
        </section>

        {/* METRIC CARDS */}
        <section className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <MetricCard
            icon={META.radiation.icon}
            label="Radiation"
            {...cardProps(radiation)}
          />

          <MetricCard
            icon={META.geomagnetic.icon}
            label="Geomagnetic"
            {...cardProps(geomagnetic)}
          />

          <MetricCard
            icon={META.microgravity.icon}
            label="Microgravity"
            {...cardProps(microgravity)}
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

        {/* MIDDLE SECTION */}
        <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[1fr_1.08fr]">

          {/* SPACE HAZARD TRENDS */}
          <div className="min-w-0 overflow-hidden rounded-xl">
            <TrendChart days={14} />
          </div>

          {/* RECENT SPACE EVENTS */}
          <div className="min-w-0 rounded-xl bg-card p-4 sm:p-5">
            <h2 className="text-[15px] font-semibold text-white">
              Recent Space Events
            </h2>

            <div className="mt-5 flex flex-col gap-5 sm:mt-6">
              {loading ? (
                <p className="text-sm text-white/40">
                  Loading space events...
                </p>
              ) : events.length === 0 ? (
                <p className="text-sm text-white/40">
                  No recent space events found.
                </p>
              ) : (
                events.map((hazard) => (
                  <div
                    key={hazard.hazard_type}
                    className="flex min-w-0 items-start justify-between gap-2 sm:gap-4"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      {/* EVENT ICON */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white/5 text-xl sm:h-[54px] sm:w-[64px] sm:text-2xl">
                        {META[hazard.hazard_type]?.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-sm font-medium text-white">
                          {META[hazard.hazard_type]?.name}
                        </h3>

                        <p className="mt-1 break-words text-[11px] leading-relaxed text-white/45">
                          {hazard.description ||
                            "Space environment activity detected."}
                        </p>

                        <p className="mt-1 break-words text-[10px] text-white/30">
                          {hazard.source}
                          {formatTime(hazard.recorded_at) &&
                            ` · ${formatTime(hazard.recorded_at)}`}
                        </p>
                      </div>
                    </div>

                    <StatusBadge status={normStatus(hazard)} />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* CURRENT ASSESSMENT */}
        <section className="flex min-w-0 items-start gap-3 rounded-xl bg-card p-4 sm:items-center sm:gap-5 sm:px-7 sm:py-6">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
            !
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-semibold text-white">
              Current Assessment
            </h2>

            <p className="mt-1 break-words text-xs leading-relaxed text-white/55">
              {assessmentText}
            </p>

            {notice && (
              <p className="mt-2 break-words text-xs text-yellow-400">
                {notice}
              </p>
            )}

            <p className="mt-2 text-[10px] leading-relaxed text-white/30">
              Space weather data: NASA CCMC DONKI. Other conditions are simulated.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
