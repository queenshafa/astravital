"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell } from "./icons";
import { CATEGORIES, levelIndex } from "@/lib/risk";

const BRAND = "#f97a35";

function Icon({ kind }) {
  if (kind === "danger") {
    return (
      <svg width="34" height="34" viewBox="0 0 24 24" fill={BRAND} aria-hidden>
        <path d="M12 2.6a1.7 1.7 0 0 1 1.5.9l9 15.6a1.7 1.7 0 0 1-1.5 2.5H3a1.7 1.7 0 0 1-1.5-2.5l9-15.6a1.7 1.7 0 0 1 1.5-.9Z" />
        <rect x="11" y="8.5" width="2" height="6" rx="1" fill="#222" />
        <circle cx="12" cy="17.5" r="1.2" fill="#222" />
      </svg>
    );
  }
  if (kind === "attention") {
    return (
      <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="11" fill={BRAND} />
        <rect x="11" y="6" width="2" height="8" rx="1" fill="#222" />
        <circle cx="12" cy="17.5" r="1.3" fill="#222" />
      </svg>
    );
  }
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="11" fill={BRAND} />
      <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function timeAgo(iso, now) {
  if (!iso || !now) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const m = Math.max(0, Math.round((now - t) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// analyses + hazards -> daftar notif
function buildNotifications(analyses = [], hazards = []) {
  const items = [];

  for (const a of analyses) {
    const idx = levelIndex(a.risk_level);
    if (!(idx > 0)) continue;
    const label = CATEGORIES[a.risk_category]?.label ?? a.risk_category;
    items.push({
      id: `risk-${a.id ?? a.risk_category}-${a.risk_level}`,
      kind: idx >= 2 ? "danger" : "attention",
      title: `${label} Alert`,
      text: a.description || a.summary || `${label} risk level is ${a.risk_level}. Monitoring recommended.`,
      at: a.recorded_at || a.created_at,
    });
  }

  for (const h of hazards) {
    const st = String(h.status || "normal").toLowerCase();
    if (st === "normal") continue;
    const name = String(h.hazard_type || "hazard").replace(/_/g, " ");
    items.push({
      id: `hz-${h.hazard_type}-${st}`,
      kind: st === "attention" ? "attention" : "danger",
      title: `${name.charAt(0).toUpperCase() + name.slice(1)} Alert`,
      text: h.description || "Space environment activity is elevated. Monitoring recommended.",
      at: h.recorded_at,
    });
  }

  const rank = { danger: 0, attention: 1 };
  items.sort(
    (a, b) =>
      rank[a.kind] - rank[b.kind] ||
      new Date(b.at || 0).getTime() - new Date(a.at || 0).getTime()
  );
  return items.slice(0, 5);
}

export default function NotificationBell({ analyses = [], hazards = [], loading = false }) {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(null); // jangan panggil Date.now() saat render
  const [read, setRead] = useState(() => new Set());
  const wrapRef = useRef(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  // tutup kalau klik di luar atau tekan Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = useMemo(() => buildNotifications(analyses, hazards), [analyses, hazards]);
  const unread = items.filter((i) => !read.has(i.id)).length;

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-10 w-10 place-items-center rounded-lg bg-white text-base"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell width={18} height={18} />
        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[10px] font-semibold leading-none text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 w-[min(92vw,400px)] rounded-2xl border border-line bg-card p-5 shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Detected Patterns</h2>
            <button
              onClick={() => setRead(new Set(items.map((i) => i.id)))}
              disabled={unread === 0}
              className="text-sm text-white/80 transition-colors hover:text-brand disabled:opacity-40 disabled:hover:text-white/80"
            >
              Mark all as read
            </button>
          </div>

          <div className="mt-5 flex max-h-[60vh] flex-col gap-5 overflow-y-auto pr-1">
            {loading ? (
              <p className="text-sm text-white/40">Checking for patterns…</p>
            ) : items.length === 0 ? (
              <div className="flex items-start gap-4">
                <div className="shrink-0"><Icon kind="ok" /></div>
                <div>
                  <h3 className="text-base">All clear</h3>
                  <p className="mt-0.5 text-sm text-white/70">No risks detected. Everything is within your baseline.</p>
                </div>
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setRead((s) => new Set(s).add(n.id))}
                  className={"flex items-start gap-4 text-left transition-opacity " + (read.has(n.id) ? "opacity-50" : "")}
                >
                  <div className="mt-0.5 shrink-0"><Icon kind={n.kind} /></div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base text-white font-medium">{n.title}</h3>
                    <p className="mt-0.5 text-sm leading-snug text-white/55 ">{n.text}</p>
                  </div>
                  <span className="shrink-0 text-sm text-white/80">{timeAgo(n.at, now)}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}