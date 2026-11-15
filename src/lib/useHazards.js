"use client";

import { useEffect, useState } from "react";

export function useHazards() {
  const [s, setS] = useState({ loading: true, error: null, warning: null, hazards: [] });
  useEffect(() => {
    let off = false;
    fetch("/api/hazards")
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || r.statusText);
        if (!off) setS({ loading: false, error: null, warning: j.warning, hazards: j.hazards });
      })
      .catch((e) => { if (!off) setS((x) => ({ ...x, loading: false, error: e.message })); });
    return () => { off = true; };
  }, []);
  return s;
}
