import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { summarize } from "@/lib/hazards";

// NASA CCMC moved the public DONKI API on 2026-09-30 (no API key needed).
// The old hosts stay as fallbacks in case one of them is down or redirects.
const BASES = [
  "https://ccmc.gsfc.nasa.gov/DONKI-API/get",
  "https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get",
  "https://api.nasa.gov/DONKI",
];
const day = (d) => d.toISOString().slice(0, 10);

async function donki(type, start, end) {
  const errors = [];
  for (const base of BASES) {
    const host = new URL(base).host;
    try {
      let url = `${base}/${type}?startDate=${day(start)}&endDate=${day(end)}`;
      if (host === "api.nasa.gov") url += `&api_key=${process.env.NASA_API_KEY || "DEMO_KEY"}`;
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        next: { revalidate: 1800 }, // cache 30 min
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) { errors.push(`${host} ${res.status}`); continue; }
      const text = (await res.text()).trim();
      if (!text) return []; // no events in range
      let json;
      try { json = JSON.parse(text); } catch { errors.push(`${host} returned a web page, not JSON`); continue; }
      if (Array.isArray(json)) return json;
      errors.push(`${host} unexpected response`);
    } catch (e) {
      errors.push(`${host} ${e.name === "TimeoutError" ? "timeout" : e.message}`);
    }
  }
  throw new Error(`DONKI ${type}: ${errors.join("; ")}`);
}

export async function GET() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const end = new Date(), start = new Date(end.getTime() - 7 * 864e5);
  let hazards = null, warning = null;
  try {
    const [flr, sep, gst] = await Promise.all([donki("FLR", start, end), donki("SEP", start, end), donki("GST", start, end)]);
    hazards = summarize({ flr, sep, gst });
  } catch (e) {
    warning = `NASA API unavailable (${e.message}). Showing the last stored values.`;
  }

  const { data: stored } = await supabase.from("space_hazards").select("*").order("recorded_at", { ascending: false }).limit(60);
  const latest = new Map();
  (stored || []).forEach((r) => { if (!latest.has(r.hazard_type)) latest.set(r.hazard_type, r); });

  if (hazards) {
    // save NASA rows at most once per hour; simulated rows only once
    const rows = hazards.filter((h) => {
      const last = latest.get(h.hazard_type);
      return !last || (h.source !== "Simulated" && Date.now() - new Date(last.recorded_at).getTime() > 36e5);
    });
    if (rows.length) {
      const { error } = await supabase.from("space_hazards").insert(rows);
      if (error) warning = `Could not save hazards: ${error.message}`;
    }
  }

  return NextResponse.json({ hazards: hazards ?? [...latest.values()], warning });
}