export function summarize({ flr = [], sep = [], gst = [] }) {
  const hazards = [];

  // Solar Flares
  if (flr.length > 0) {
    const latest = flr[0];

    hazards.push({
      hazard_type: "Solar Flare",
      value: flr.length,
      unit: "events",
      status: flr.length >= 3 ? "Monitor" : "Normal",
      source: "NASA DONKI",
      details:
        latest?.note ||
        `${flr.length} solar flare event(s) detected.`,
      recorded_at: new Date().toISOString(),
    });
  } else {
    hazards.push({
      hazard_type: "Solar Flare",
      value: 0,
      unit: "events",
      status: "Normal",
      source: "NASA DONKI",
      details: "No solar flare events detected in the selected period.",
      recorded_at: new Date().toISOString(),
    });
  }

  // Solar Energetic Particles
  if (sep.length > 0) {
    hazards.push({
      hazard_type: "Solar Particle Activity",
      value: sep.length,
      unit: "events",
      status: sep.length >= 2 ? "Monitor" : "Normal",
      source: "NASA DONKI",
      details: `${sep.length} solar energetic particle event(s) detected.`,
      recorded_at: new Date().toISOString(),
    });
  } else {
    hazards.push({
      hazard_type: "Solar Particle Activity",
      value: 0,
      unit: "events",
      status: "Normal",
      source: "NASA DONKI",
      details: "No solar energetic particle events detected.",
      recorded_at: new Date().toISOString(),
    });
  }

  // Geomagnetic Storms
  if (gst.length > 0) {
    const status = gst.length >= 2 ? "Monitor" : "Low";

    hazards.push({
      hazard_type: "Geomagnetic Storm",
      value: gst.length,
      unit: "events",
      status,
      source: "NASA DONKI",
      details: `${gst.length} geomagnetic storm event(s) detected.`,
      recorded_at: new Date().toISOString(),
    });
  } else {
    hazards.push({
      hazard_type: "Geomagnetic Storm",
      value: 0,
      unit: "events",
      status: "Low",
      source: "NASA DONKI",
      details: "No geomagnetic storm events detected.",
      recorded_at: new Date().toISOString(),
    });
  }

  return hazards;
}