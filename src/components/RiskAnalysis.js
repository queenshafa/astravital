
"use client";

import { useState } from "react";
import RiskTrendChart from "./RiskTrendChart";
import {
  HeartPulse,
  Moon,
  BatteryWarning,
} from "lucide-react";

export default function RiskAnalysis() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Dummy data sementara
  const baseline = {
    heartRate: 68,
    hrv: 65,
    spo2: 98,
    sleepDuration: 7.5,
    activityLevel: 80,
  };

  const current = {
    heartRate: 82,
    hrv: 48,
    spo2: 97,
    sleepDuration: 5.2,
    activityLevel: 55,
  };

  async function runAnalysis() {
    try {
      setLoading(true);

      const response = await fetch("/api/risk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current,
          baseline,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to run analysis");
      }

      setResult(data.data);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Data default untuk UI sebelum analysis dijalankan
  const defaultPatterns = [
    {
      label: "HRV",
      value: `${current.hrv} ms`,
      change: "26%",
      icon: "heart",
    },
    {
      label: "Sleep Duration",
      value: `${current.sleepDuration} h`,
      change: "32%",
      icon: "sleep",
    },
    {
      label: "Fatigue Level",
      value: "High",
      change: "—",
      icon: "fatigue",
    },
  ];

  const patterns =
    result?.detectedPatterns?.length > 0
      ? result.detectedPatterns.slice(0, 3).map((pattern, index) => ({
          label: pattern.metric,
          value:
            pattern.metric?.toLowerCase().includes("hrv")
              ? `${pattern.current} ms`
              : String(pattern.current),
          change: `${Math.abs(pattern.changePercent)}%`,
          icon:
            index === 0
              ? "heart"
              : index === 1
                ? "sleep"
                : "fatigue",
        }))
      : defaultPatterns;

  const defaultRisks = [
    {
      name: "Physiological Stress",
      score: 78,
    },
    {
      name: "Insufficient Recovery",
      score: 62,
    },
    {
      name: "Muscle Deconditioning",
      score: 41,
    },
    {
      name: "Radiation Exposure",
      score: 12,
    },
  ];

  const risks =
    result?.potentialRisks?.length > 0
      ? result.potentialRisks.slice(0, 4)
      : defaultRisks;

  const summary =
    result?.summary ||
    "Your HRV has decreased compared to baseline, along with reduced sleep duration. This combination may indicate physiological stress and insufficient recovery.";

  function PatternIcon({ type }) {
    const iconClass =
      "flex h-7 w-7 shrink-0 items-center justify-center rounded bg-brand text-white";

    if (type === "heart") {
      return (
        <div className={iconClass}>
          <HeartPulse size={16} />
        </div>
      );
    }

    if (type === "sleep") {
      return (
        <div className={iconClass}>
          <Moon size={16} />
        </div>
      );
    }

    return (
      <div className={iconClass}>
        <BatteryWarning size={16} />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="mx-auto flex w-full max-w-[1560px] min-w-0 flex-col gap-4 sm:gap-5">

        {/* HEADER */}
        <section className="min-w-0 rounded-xl bg-card px-4 py-6 sm:px-6 sm:py-8 lg:px-7 lg:py-9">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-white sm:text-2xl">
                Health Risk Assessment
              </h1>

              <p className="mt-1 text-xs leading-relaxed text-white/60 sm:text-sm">
                Real-time analysis of your health data and potential risks.
              </p>
            </div>

            <button
              onClick={runAnalysis}
              disabled={loading}
              className="w-full shrink-0 rounded-lg bg-brand px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2.5"
            >
              {loading ? "Analyzing..." : "Run Analysis"}
            </button>
          </div>
        </section>

        {/* TOP SECTION */}
        <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[0.8fr_1.2fr]">

          {/* DETECTED PATTERNS */}
          <div className="min-w-0 rounded-xl bg-card p-4 sm:p-5">
            <h2 className="text-[15px] font-semibold text-white">
              Detected Patterns
            </h2>

            <div className="mt-6 flex flex-col gap-6 sm:mt-7">
              {patterns.map((pattern, index) => (
                <div
                  key={`${pattern.label}-${index}`}
                  className="grid min-w-0 grid-cols-[28px_minmax(0,1fr)_auto_auto] items-center gap-2 sm:gap-3"
                >
                  <PatternIcon type={pattern.icon} />

                  <span className="min-w-0 break-words text-xs text-white/75 sm:text-sm">
                    {pattern.label}
                  </span>

                  <span className="whitespace-nowrap text-xs font-medium text-white sm:text-sm">
                    {pattern.value}
                  </span>

                  <span className="min-w-[32px] text-right text-[10px] text-white/50 sm:min-w-[38px] sm:text-xs">
                    {pattern.change}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RISK TREND */}
          <div className="min-w-0 overflow-hidden rounded-xl bg-card p-4 sm:p-5">
            <div>
              <h2 className="text-[15px] font-semibold text-white">
                Risk Trend
              </h2>

              <p className="mt-1 text-xs text-white/40 sm:text-sm">
                Overall risk score over the last 7 days
              </p>
            </div>

            {/* Chart */}
            <div className="mt-4 h-[200px] w-full min-w-0 sm:h-[230px]">
              <RiskTrendChart />
            </div>
          </div>
        </section>

        {/* BOTTOM SECTION */}
        <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[1.7fr_0.95fr]">

          {/* POTENTIAL RISK FACTORS */}
          <div className="min-w-0 rounded-xl bg-card p-4 sm:p-5 lg:p-6">
            <h2 className="text-[15px] font-semibold text-white">
              Potential Risk Factors
            </h2>

            <div className="mt-6 flex flex-col gap-6 sm:mt-7 sm:gap-5">
              {risks.map((risk, index) => (
                <div
                  key={risk.name || index}
                  className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(60px,1.5fr)_42px] items-center gap-3 sm:grid-cols-[minmax(140px,180px)_minmax(100px,1fr)_50px] sm:gap-4"
                >
                  <span className="break-words text-xs leading-snug text-white/70 sm:text-sm">
                    {risk.name}
                  </span>

                  <div className="h-2 min-w-0 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-brand transition-all duration-700"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, Number(risk.score) || 0)
                        )}%`,
                      }}
                    />
                  </div>

                  <span className="text-right text-xs text-white/70 sm:text-sm">
                    {risk.score}%
                  </span>
                </div>
              ))}
            </div>

            {result?.overallRisk && (
              <div className="mt-8 border-t border-white/10 pt-5">
                <p className="text-xs text-white/40">
                  Overall Risk Level
                </p>

                <p className="mt-1 text-lg font-semibold text-brand">
                  {result.overallRisk}
                </p>
              </div>
            )}
          </div>

          {/* ANALYSIS SUMMARY */}
          <div className="min-w-0 rounded-xl bg-card p-4 sm:p-5 lg:p-6">
            <h2 className="text-[15px] font-semibold text-white">
              Analysis Summary
            </h2>

            <p className="mt-5 break-words text-sm leading-relaxed text-white/65 sm:mt-6">
              {summary}
            </p>

            {result?.recommendation && (
              <div className="mt-6 border-t border-white/10 pt-5">
                <h3 className="text-sm font-medium text-white">
                  Recommended Follow-up
                </h3>

                <p className="mt-2 break-words text-sm leading-relaxed text-white/50">
                  {result.recommendation}
                </p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
