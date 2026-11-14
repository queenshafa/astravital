import { Cog } from "./icons";

const MENU = [
  { label: "Dashboard", href: "#", active: true },
  { label: "Anatomy Body", href: "#anatomy" },
  { label: "Risk Analysis", href: "#" },
  { label: "Lab Records", href: "#" },
];

export default function Sidebar() {
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
          <a
            key={m.label}
            href={m.href}
            className={
              "rounded-md px-4 py-3 text-[15px] transition-colors " +
              (m.active ? "bg-brand text-white" : "text-white/90 hover:text-brand")
            }
          >
            {m.label}
          </a>
        ))}
      </nav>

      <button className="mt-auto flex items-center gap-2 rounded-md bg-brand px-4 py-3 text-[15px] text-white">
        <Cog width={18} height={18} /> Setting
      </button>
    </aside>
  );
}
