"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "./icons";
import { saveBaseline, useAstronaut } from "@/lib/astronaut";

const EMPTY = { code: "", name: "", age: "", gender: "", heart_rate: "", spo2: "", body_temperature: "", respiration_rate: "", blood_pressure: "", sleep_duration: "", hrv: "", activity_level: "" };

const INFO = [
  { k: "code", label: "Astronaut ID", ph: "e.g. AST-0426" },
  { k: "age", label: "Age", ph: "Enter your age", mode: "numeric" },
  { k: "name", label: "Full Name", ph: "Enter your name" },
  { k: "gender", label: "Gender", select: ["male", "female", "other"] },
];
const VITALS = [
  { k: "heart_rate", label: "Heart Rate (bpm)", ph: "e.g. 83", mode: "decimal" },
  { k: "spo2", label: "Blood Oxygen (SpO₂) (%)", ph: "e.g. 98", mode: "decimal" },
  { k: "body_temperature", label: "Body Temperature (°C)", ph: "e.g. 36.6", mode: "decimal" },
  { k: "respiration_rate", label: "Respiration Rate (br/min)", ph: "e.g. 16", mode: "decimal" },
  { k: "blood_pressure", label: "Blood Pressure (mmHg)", ph: "e.g. 120/80" },
  { k: "sleep_duration", label: "Sleep Quality (hours/day)", ph: "e.g. 7.5", mode: "decimal" },
  { k: "hrv", label: "HRV (ms)", ph: "e.g. 60", mode: "decimal" },
  { k: "activity_level", label: "Activity Level (0–100)", ph: "e.g. 60", mode: "decimal" },
];

const input = "w-full rounded-xl bg-white/[0.06] px-5 py-4 text-[15px] text-white outline-none placeholder:text-white/30 focus:ring-2 focus:ring-brand/70";

function Title({ children }) {
  return (
    <h2 className="border-l-8 border-brand bg-[linear-gradient(to_right,rgba(249,122,53,0.28),transparent)] px-8 py-5 text-2xl font-semibold sm:w-[420px]">
      {children}
    </h2>
  );
}

function Field({ f, form, set }) {
  return (
    <label className="block">
      <span className="mb-3 block text-[15px]">{f.label}</span>
      {f.select ? (
        <select className={input + " appearance-none capitalize"} value={form[f.k]} onChange={(e) => set(f.k, e.target.value)}>
          <option value="" className="bg-card">Select gender</option>
          {f.select.map((o) => <option key={o} value={o} className="bg-card capitalize">{o}</option>)}
        </select>
      ) : (
        <input className={input} type="text" inputMode={f.mode} placeholder={f.ph} value={form[f.k]} onChange={(e) => set(f.k, e.target.value)} />
      )}
    </label>
  );
}

export default function BaselineForm() {
  const router = useRouter();
  const { astronaut, baseline } = useAstronaut();
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  // pre-fill when a baseline already exists
  useEffect(() => {
    if (!astronaut) return;
    const b = baseline || {};
    setForm({
      code: astronaut.astronaut_code ?? "", name: astronaut.name ?? "", age: astronaut.age ?? "", gender: astronaut.gender ?? "",
      heart_rate: b.heart_rate ?? "", spo2: b.spo2 ?? "", body_temperature: b.body_temperature ?? "", respiration_rate: b.respiration_rate ?? "",
      blood_pressure: b.systolic && b.diastolic ? `${b.systolic}/${b.diastolic}` : "", sleep_duration: b.sleep_duration ?? "", hrv: b.hrv ?? "", activity_level: b.activity_level ?? "",
    });
  }, [astronaut, baseline]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    const code = form.code.trim(), name = form.name.trim();
    if (!code || !name) return setMsg({ t: "error", m: "Astronaut ID and Full Name are required." });
    const num = (k, label) => {
      const v = String(form[k]).trim();
      if (v === "") return null;
      const n = Number(v);
      if (Number.isNaN(n)) throw new Error(`${label} must be a number.`);
      return n;
    };
    try {
      setBusy(true);
      let systolic = null, diastolic = null;
      const bp = String(form.blood_pressure).trim();
      if (bp) {
        const m = bp.match(/^(\d{2,3})\s*\/\s*(\d{2,3})$/);
        if (!m) throw new Error("Blood pressure must look like 120/80.");
        systolic = +m[1]; diastolic = +m[2];
      }
      await saveBaseline({
        code, name, age: num("age", "Age"), gender: form.gender || null,
        heart_rate: num("heart_rate", "Heart rate"), spo2: num("spo2", "SpO₂"), body_temperature: num("body_temperature", "Body temperature"),
        respiration_rate: num("respiration_rate", "Respiration rate"), sleep_duration: num("sleep_duration", "Sleep"),
        hrv: num("hrv", "HRV"), activity_level: num("activity_level", "Activity level"), systolic, diastolic,
      });
      setMsg({ t: "ok", m: "Baseline saved. Redirecting to the dashboard…" });
      setTimeout(() => router.push("/"), 900);
    } catch (err) {
      setMsg({ t: "error", m: err.message || String(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-base p-4 lg:p-7">
      <form
        onSubmit={submit}
        className="relative mx-auto max-w-[1560px] overflow-hidden rounded-[32px] border border-line bg-cover bg-center px-6 py-10 sm:px-14 sm:py-14"
        // optional: drop an astronaut photo at /public/astronaut-bg.jpg
        style={{ backgroundImage: "linear-gradient(rgba(21,19,22,0.86),rgba(21,19,22,0.92)), url('/astronaut-bg.jpg')" }}
      >
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-white/70 hover:text-brand">
          <ArrowLeft width={16} height={16} /> Back to dashboard
        </Link>

        <Title>Your Information</Title>
        <div className="mt-8 grid gap-x-12 gap-y-6 md:grid-cols-2">
          {INFO.map((f) => <Field key={f.k} f={f} form={form} set={set} />)}
        </div>

        <div className="mt-12"><Title>Health Baseline</Title></div>
        <div className="mt-8 grid gap-x-8 gap-y-6 md:grid-cols-2 xl:grid-cols-3">
          {VITALS.map((f) => <Field key={f.k} f={f} form={form} set={set} />)}
        </div>

        {msg && (
          <p className={"mt-8 rounded-xl px-5 py-3 text-sm " + (msg.t === "ok" ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300")}>{msg.m}</p>
        )}

        <div className="mt-14 flex justify-end gap-4">
          <button type="button" onClick={() => { setForm(EMPTY); setMsg(null); }} className="rounded-xl border border-white/80 px-12 py-4 text-lg transition-colors hover:border-brand hover:text-brand">Reset</button>
          <button type="submit" disabled={busy} className="rounded-xl bg-brand px-10 py-4 text-lg font-medium text-white disabled:opacity-60">{busy ? "Saving…" : "Save Baseline"}</button>
        </div>
      </form>
    </div>
  );
}
