"use client";

import { useEffect, useState } from "react";

export function useHazardHistory(days = 14) {
  const [s, setS] = useState({ loading: true, error: null, warning: null, days: [] });

  useEffect(() => {
    let off = false;
    setS((x) => ({ ...x, loading: true, error: null }));

    fetch(`/api/hazards?days=${days}`, { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || r.statusText || "Request failed");
        if (!off) {
          setS({
            loading: false,
            error: null,
            warning: j.warning ?? null,
            days: Array.isArray(j.days) ? j.days : [],
          });
        }
      })
      .catch((e) => {
        if (!off) setS({ loading: false, error: e.message, warning: null, days: [] });
      });

    return () => { off = true; };
  }, [days]);

  return s;
}