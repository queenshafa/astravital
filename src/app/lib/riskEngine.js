function calculateChange(current, baseline) {
  if (baseline === 0 || baseline === null || baseline === undefined) {
    return 0;
  }

  return ((current - baseline) / baseline) * 100;
}

function round(value) {
  return Math.round(value * 10) / 10;
}

export function analyzeRisk(current, baseline) {
  if (!current || !baseline) {
    throw new Error("Current and baseline health data are required.");
  }

  const changes = {
    heartRate: calculateChange(current.heartRate, baseline.heartRate),
    hrv: calculateChange(current.hrv, baseline.hrv),
    spo2: calculateChange(current.spo2, baseline.spo2),
    sleepDuration: calculateChange(
      current.sleepDuration,
      baseline.sleepDuration
    ),
    activityLevel: calculateChange(
      current.activityLevel,
      baseline.activityLevel
    ),
  };

  const detectedPatterns = [];

  if (changes.hrv <= -10) {
    detectedPatterns.push({
      metric: "HRV",
      current: current.hrv,
      baseline: baseline.hrv,
      changePercent: round(changes.hrv),
      status: changes.hrv <= -25 ? "warning" : "attention",
    });
  }

  if (changes.sleepDuration <= -10) {
    detectedPatterns.push({
      metric: "Sleep Duration",
      current: current.sleepDuration,
      baseline: baseline.sleepDuration,
      changePercent: round(changes.sleepDuration),
      status: changes.sleepDuration <= -25 ? "warning" : "attention",
    });
  }

  if (changes.heartRate >= 10) {
    detectedPatterns.push({
      metric: "Heart Rate",
      current: current.heartRate,
      baseline: baseline.heartRate,
      changePercent: round(changes.heartRate),
      status: changes.heartRate >= 25 ? "warning" : "attention",
    });
  }

  if (changes.spo2 <= -2) {
    detectedPatterns.push({
      metric: "SpO₂",
      current: current.spo2,
      baseline: baseline.spo2,
      changePercent: round(changes.spo2),
      status: "warning",
    });
  }

  const potentialRisks = [];

  // Physiological Stress
  let physiologicalStress = 0;

  if (changes.hrv <= -10) physiologicalStress += 30;
  if (changes.sleepDuration <= -10) physiologicalStress += 20;
  if (changes.heartRate >= 10) physiologicalStress += 30;

  physiologicalStress = Math.min(physiologicalStress, 100);

  if (physiologicalStress > 0) {
    potentialRisks.push({
      name: "Physiological Stress",
      score: physiologicalStress,
      category: "cardiovascular",
    });
  }

  // Insufficient Recovery
  let insufficientRecovery = 0;

  if (changes.sleepDuration <= -10) insufficientRecovery += 50;
  if (changes.hrv <= -10) insufficientRecovery += 30;
  if (changes.activityLevel <= -20) insufficientRecovery += 20;

  insufficientRecovery = Math.min(insufficientRecovery, 100);

  if (insufficientRecovery > 0) {
    potentialRisks.push({
      name: "Insufficient Recovery",
      score: insufficientRecovery,
      category: "recovery",
    });
  }

  // Muscle Deconditioning
  let muscleDeconditioning = 0;

  if (changes.activityLevel <= -15) muscleDeconditioning += 60;
  if (changes.sleepDuration <= -20) muscleDeconditioning += 20;

  muscleDeconditioning = Math.min(muscleDeconditioning, 100);

  if (muscleDeconditioning > 0) {
    potentialRisks.push({
      name: "Muscle Deconditioning",
      score: muscleDeconditioning,
      category: "musculoskeletal",
    });
  }

  potentialRisks.sort((a, b) => b.score - a.score);

  const highestScore =
    potentialRisks.length > 0 ? potentialRisks[0].score : 0;

  let overallRisk = "normal";

  if (highestScore >= 70) {
    overallRisk = "warning";
  } else if (highestScore >= 30) {
    overallRisk = "attention";
  }

  let summary =
    "Current health indicators remain within the expected range.";

  let recommendation = "Continue routine monitoring.";

  if (overallRisk === "attention") {
    summary =
      "Changes from the astronaut's personal baseline suggest that additional monitoring may be required.";

    recommendation =
      "Continue monitoring key indicators and review recent health trends.";
  }

  if (overallRisk === "warning") {
    summary =
      "Multiple indicators show significant changes from the astronaut's personal baseline, suggesting a potential health concern requiring further review.";

    recommendation =
      "Prioritize further assessment and closely monitor the affected indicators.";
  }

  return {
    overallRisk,
    detectedPatterns,
    potentialRisks,

    changes: {
      heartRate: round(changes.heartRate),
      hrv: round(changes.hrv),
      spo2: round(changes.spo2),
      sleepDuration: round(changes.sleepDuration),
      activityLevel: round(changes.activityLevel),
    },

    summary,
    recommendation,
    analyzedAt: new Date().toISOString(),
  };
}