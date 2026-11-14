import { LV } from "@/lib/anatomy";
import { Bell } from "./icons";

export default function Header({ count, worst }) {
  const status = count
    ? `${count} area${count > 1 ? "s" : ""} marked · highest pain: ${LV[worst].n}`
    : "Your health status is generally stable 👌";
  return (
    <header className="flex items-center justify-between rounded-2xl bg-card px-8 py-10">
      <div>
        <div className="mb-2 text-[22px] font-semibold tracking-tight lg:hidden">
          Astra Vital<span className="text-brand">.</span>
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight sm:text-[32px]">Hi, Astronaut!</h1>
        <p className="mt-1 text-[15px]">{status}</p>
      </div>
      <button className="grid h-10 w-10 place-items-center rounded-lg bg-white text-base" aria-label="Notifications">
        <Bell width={18} height={18} />
      </button>
    </header>
  );
}
