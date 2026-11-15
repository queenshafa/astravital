"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const input = "w-full rounded-xl bg-white/[0.06] px-5 py-4 text-[15px] text-white outline-none placeholder:text-white/30 focus:ring-2 focus:ring-brand/70";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace("/");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        if (data.session) { router.replace("/"); router.refresh(); }
        else setMsg({ t: "ok", m: "Account created. Check your email and click the confirmation link, then log in." });
      }
    } catch (err) {
      setMsg({ t: "error", m: err.message || String(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-base p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-[28px] border border-line bg-card p-8 sm:p-10">
        <div className="flex justify-center">
          <img
            src="/medteor_logo.png"
            alt="Medteor"
            className="h-auto w-[190px] object-contain"
          />
        </div>
        <p className="mt-4 text-[15px] text-white/60">{mode === "signin" ? "Log in to see your health dashboard." : "Create an account to start tracking."}</p>

        <div className="mt-6 flex">
          {[["signin", "Log in"], ["signup", "Sign up"]].map(([k, label]) => (
            <button
              type="button" key={k} onClick={() => { setMode(k); setMsg(null); }}
              className={"rounded-md px-5 py-2.5 text-[15px] transition-colors " + (mode === k ? "bg-brand text-white" : "text-white/90 hover:text-brand")}
            >{label}</button>
          ))}
        </div>

        <label className="mt-6 block">
          <span className="mb-2 block text-[15px]">Email</span>
          <input className={input} type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="mt-4 block">
          <span className="mb-2 block text-[15px]">Password</span>
          <input className={input} type="password" required minLength={6} autoComplete={mode === "signin" ? "current-password" : "new-password"} placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        {msg && <p className={"mt-5 rounded-xl px-4 py-3 text-sm " + (msg.t === "ok" ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300")}>{msg.m}</p>}

        <button type="submit" disabled={busy} className="mt-6 w-full rounded-xl bg-brand py-4 text-lg font-medium text-white disabled:opacity-60">
          {busy ? "Please wait…" : mode === "signin" ? "Log in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
