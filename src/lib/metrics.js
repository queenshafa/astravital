import { Droplet, HeartPulse, Moon, Waves } from "@/components/icons";

const ago = (iso) => {
  if (!iso) return "—";
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + " min ago.";
  const h = Math.round(m / 60);
  return h < 48 ? h + " h ago." : Math.round(h / 24) + " d ago.";
};
const f = (v, d = 0) => (v == null ? "—" : Number(v).toFixed(d));

export function buildMetrics(baseline, latest) {
  const b = baseline || {}, l = latest || {}, u = ago(l.recorded_at);
  return [
    { icon: HeartPulse, label: "Heart Rate", value: f(l.heart_rate), unit: "bpm", baseline: f(b.heart_rate), updated: u },
    { icon: Waves, label: "HRV", value: f(l.hrv), unit: "ms", baseline: f(b.hrv), updated: u },
    { icon: Droplet, label: "SpO", value: f(l.spo2), unit: "%", baseline: f(b.spo2), updated: u },
    { icon: Moon, label: "Sleep", value: f(l.sleep_duration, 1), unit: "hrs", baseline: b.sleep_duration == null ? "—" : f(b.sleep_duration, 1) + "h", updated: u },
  ];
}
