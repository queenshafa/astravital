"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase, hasSupabase } from "./supabase";
import { ensureRiskAnalyses, latestPerCategory } from "./risk";

const KEY = "astra.astronautId";

// Create/update the astronaut (by astronaut_code) and upsert its personal baseline.
export async function saveBaseline(f) {
  const found = await supabase.from("astronauts").select("id").eq("astronaut_code", f.code).maybeSingle();
  if (found.error) throw found.error;
  const info = { astronaut_code: f.code, name: f.name, age: f.age, gender: f.gender };
  let id;
  if (found.data) {
    id = found.data.id;
    const { error } = await supabase.from("astronauts").update(info).eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabase.from("astronauts").insert(info).select("id").single();
    if (error) throw error;
    id = data.id;
  }
  const base = {
    astronaut_id: id, heart_rate: f.heart_rate, hrv: f.hrv, spo2: f.spo2, sleep_duration: f.sleep_duration,
    activity_level: f.activity_level, body_temperature: f.body_temperature, respiration_rate: f.respiration_rate,
    systolic: f.systolic, diastolic: f.diastolic,
  };
  const { error } = await supabase.from("health_baselines").upsert(base, { onConflict: "astronaut_id" });
  if (error) throw error;
  localStorage.setItem(KEY, id);
  return id;
}

// Loads the active astronaut (saved in this browser, else the newest one in the DB).
// days > 0 also loads readings from the last N days (for the trend charts).
export function useAstronaut({ days = 0 } = {}) {
  const [state, setState] = useState({ loading: true, error: null, astronaut: null, baseline: null, latest: null, readings: [], analyses: [] });
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let off = false;
    (async () => {
      if (!hasSupabase) { setState((s) => ({ ...s, loading: false, error: "Supabase env vars are missing. Add them to .env.local and restart." })); return; }
      try {
        let astronaut = null;
        const saved = localStorage.getItem(KEY);
        if (saved) { const r = await supabase.from("astronauts").select("*").eq("id", saved).maybeSingle(); if (r.error) throw r.error; astronaut = r.data; }
        if (!astronaut) { const r = await supabase.from("astronauts").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle(); if (r.error) throw r.error; astronaut = r.data; }
        if (!astronaut) { if (!off) setState({ loading: false, error: null, astronaut: null, baseline: null, latest: null, readings: [], analyses: [] }); return; }
        const id = astronaut.id;
        const since = new Date(Date.now() - days * 864e5).toISOString();
        const loadAnalyses = () => supabase.from("risk_analyses").select("*").eq("astronaut_id", id).order("analyzed_at", { ascending: false }).limit(40);
        const [b, l, rd, an] = await Promise.all([
          supabase.from("health_baselines").select("*").eq("astronaut_id", id).maybeSingle(),
          supabase.from("health_readings").select("*").eq("astronaut_id", id).order("recorded_at", { ascending: false }).limit(1).maybeSingle(),
          days ? supabase.from("health_readings").select("*").eq("astronaut_id", id).gte("recorded_at", since).order("recorded_at", { ascending: true }).limit(5000) : Promise.resolve({ data: [] }),
          loadAnalyses(),
        ]);
        for (const r of [b, l, rd, an]) if (r.error) throw r.error;
        let rows = an.data;
        if (await ensureRiskAnalyses(id, b.data, l.data, rows[0]?.analyzed_at)) {
          const r2 = await loadAnalyses();
          if (!r2.error) rows = r2.data;
        }
        if (!off) setState({ loading: false, error: null, astronaut, baseline: b.data, latest: l.data, readings: rd.data, analyses: latestPerCategory(rows) });
      } catch (e) {
        if (!off) setState((s) => ({ ...s, loading: false, error: e.message || String(e) }));
      }
    })();
    return () => { off = true; };
  }, [days, tick]);

  return { ...state, refresh };
}
