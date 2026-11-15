"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LogoutButton({ className = "" }) {
  const router = useRouter();
  const out = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("astra.astronautId");
    router.replace("/login");
    router.refresh();
  };
  return <button onClick={out} className={className}>Log out</button>;
}
