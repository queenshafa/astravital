"use client";

import { useState } from "react";
import BodyViewer from "./BodyViewer";
import { LV, NAMES } from "@/lib/anatomy";

const VIEWS = [["Front", 0], ["Right", Math.PI / 2], ["Back", Math.PI], ["Left", -Math.PI / 2]];
const LAYERS = { skin: "Skin", bones: "Bones", vessels: "Vessels", organs: "Organs" };
const chip = (on) =>
  "cursor-pointer rounded-lg border px-3 py-1.5 text-[13px] transition-colors " +
  (on ? "border-brand bg-brand text-white" : "border-line text-white/80 hover:border-brand");

export default function AnatomyPanel({ pain, setPain, sel, setSel }) {
  const [layers, setLayers] = useState({ skin: true, bones: true, vessels: true, organs: true });
  const [auto, setAuto] = useState(true);
  const [viewReq, setViewReq] = useState(null);
  const [activeView, setActiveView] = useState("Front");

  const pick = (id) => { setSel(id); setPain((p) => (p[id] ? p : { ...p, [id]: 1 })); };
  const setLevel = (lv) => setPain((p) => ({ ...p, [sel]: lv }));
  const remove = () => { setPain((p) => { const n = { ...p }; delete n[sel]; return n; }); setSel(null); };
  const goView = (n, a) => { setActiveView(n); setViewReq({ a, k: Math.random() }); };
  const marked = Object.keys(pain);

  return (
    <section id="anatomy" className="rounded-2xl bg-card p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Anatomy Body</h2>
          <p className="mt-1 text-[15px]">Tap a body part to mark where it hurts</p>
        </div>
        <div className="flex">
          {VIEWS.map(([n, a]) => (
            <button
              key={n}
              onClick={() => goView(n, a)}
              className={"rounded-md px-5 py-2.5 text-[15px] transition-colors " + (activeView === n ? "bg-brand text-white" : "text-white/90 hover:text-brand")}
            >{n}</button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="relative h-[min(70vh,640px)] min-h-[440px] overflow-hidden rounded-2xl border border-line bg-[radial-gradient(ellipse_at_50%_35%,#34303a,#17151a)]">
          <BodyViewer pain={pain} sel={sel} layers={layers} auto={auto} onPick={pick} viewReq={viewReq} />
          {sel && (
            <div className="absolute bottom-3.5 left-3.5 z-[2] w-[min(250px,calc(100%_-_28px))] rounded-2xl border border-line bg-base/85 p-4 backdrop-blur-xl">
              <button onClick={() => setSel(null)} className="absolute right-3 top-3 h-7 w-7 rounded-lg border border-line" aria-label="Close">×</button>
              <small className="text-xs text-white/50">Selected area</small>
              <b className="mb-3 mt-0.5 block text-[17px]">{NAMES[sel]}</b>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    style={pain[sel] === l ? { background: LV[l].c, borderColor: LV[l].c } : undefined}
                    className={"flex-1 rounded-lg border py-2 text-[13px] " + (pain[sel] === l ? "font-bold text-white" : "border-line")}
                  >{LV[l].n}</button>
                ))}
              </div>
              <button onClick={remove} className={chip(false) + " mt-2 w-full"}>Remove mark</button>
            </div>
          )}
        </div>

        <aside className="flex max-h-[min(70vh,640px)] flex-col gap-5 overflow-auto">
          <div>
            <h3 className="mb-2 text-[11px] font-bold tracking-[0.12em] text-white/50">LAYERS</h3>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(LAYERS).map((k) => (
                <button key={k} className={chip(layers[k])} onClick={() => setLayers({ ...layers, [k]: !layers[k] })}>{LAYERS[k]}</button>
              ))}
              <button className={chip(auto)} onClick={() => setAuto(!auto)}>Auto-rotate</button>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-[11px] font-bold tracking-[0.12em] text-white/50">MARKED AREAS ({marked.length})</h3>
            {marked.length ? (
              <div className="flex flex-col gap-1.5">
                {marked.map((id) => (
                  <button key={id} onClick={() => setSel(id)} className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2 text-left text-sm hover:border-brand">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: LV[pain[id]].c }} />
                    <span className="flex-1">{NAMES[id]}</span>
                    <span className="text-xs text-white/50">{LV[pain[id]].n}</span>
                  </button>
                ))}
                <button className={chip(false)} onClick={() => { setPain({}); setSel(null); }}>Clear all</button>
              </div>
            ) : (
              <p className="text-[13px] text-white/50">No areas marked yet.</p>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-[11px] font-bold tracking-[0.12em] text-white/50">ALL BODY PARTS</h3>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(NAMES).map((id) => (
                <button key={id} onClick={() => pick(id)} className={"flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs " + (sel === id ? "border-brand" : "border-line")}>
                  <span className="h-2 w-2 rounded-full bg-line" style={pain[id] ? { background: LV[pain[id]].c } : undefined} />
                  {NAMES[id]}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <p className="mt-5 text-xs text-white/40">
        Body model:{" "}
        <a className="underline" href="https://sketchfab.com/3d-models/proxy-human-base-mesh-9fea713a3eec47d7a7f9a3364d08f22e">Proxy Human base mesh</a>{" "}
        by sphere_joe, CC BY 4.0. Internal anatomy is a simple illustration, not a medical diagnosis.
      </p>
    </section>
  );
}
