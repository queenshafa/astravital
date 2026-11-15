"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Cog } from "./icons";
import LogoutButton from "./LogoutButton";
import { supabase } from "@/lib/supabase";

const MENU = [
  { label: "Dashboard", href: "/" },
  { label: "Health Trends", href: "/health-trends" },
  { label: "Risk Analysis", href: "/risk-analysis" },
  { label: "Space Hazard", href: "/space-hazard" },
];

export default function Sidebar() {
  const path = usePathname();
  const [email, setEmail] = useState("");
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || "")); }, []);

  return (
    <aside className="sticky top-7 hidden h-[calc(100vh-3.5rem)] flex-col rounded-2xl bg-card px-4 py-10 lg:flex">
      <div className="px-4 text-[44px] font-semibold leading-[0.95] tracking-tight">
        Astra
        <br />
        Vital<span className="text-brand">.</span>
      </div>

      <p className="mt-14 px-4 text-sm text-white/40">Menu</p>
      <nav className="mt-4 flex flex-col gap-1.5">
        {MENU.map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className={"rounded-md px-4 py-3 text-[15px] transition-colors " + (path === m.href ? "bg-brand text-white" : "text-white/90 hover:text-brand")}
          >
            {m.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2">
        {email && <p className="truncate px-4 text-xs text-white/50" title={email}>{email}</p>}
        <button className="flex items-center gap-2 rounded-md bg-brand px-4 py-3 text-[15px] text-white">
          <Cog width={18} height={18} /> Setting
        </button>
        <LogoutButton className="rounded-md border border-line px-4 py-3 text-left text-[15px] text-white/80 transition-colors hover:border-brand hover:text-brand" />
      </div>
    </aside>
  );
}
