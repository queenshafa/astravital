import Link from "next/link";
import { Plus } from "./icons";

// Floating button: opens the baseline form
export default function Fab() {
  return (
    <Link
      href="/baseline"
      aria-label="Fill baseline form"
      title="Fill baseline form"
      className="group fixed bottom-6 right-6 z-50 flex h-14 items-center gap-2 rounded-full bg-brand px-4 text-white shadow-[0_10px_30px_rgba(249,122,53,0.45)] transition-transform hover:scale-105"
    >
      <Plus width={24} height={24} />
      <span className="hidden text-sm font-medium group-hover:inline">Baseline form</span>
    </Link>
  );
}
