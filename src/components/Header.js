import NotificationBell from "./NotificationBell";
import LogoutButton from "./LogoutButton";

export default function Header({ name, status, analyses, hazards, loading }) {
  return (
    <header className="flex items-center justify-between rounded-2xl bg-card px-8 py-10">
      <div>
        <div className="mb-2 text-[22px] font-semibold tracking-tight lg:hidden">
          Astra Vital<span className="text-brand">.</span>
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight sm:text-[32px]">Hi, {name || "Astronaut"}!</h1>
        <p className="mt-1 text-[15px]">{status}</p>
      </div>
      <div className="flex items-center gap-3">
        <LogoutButton className="rounded-lg border border-line px-3 py-2 text-sm text-white/80 hover:border-brand hover:text-brand lg:hidden" />
        <NotificationBell analyses={analyses} hazards={hazards} loading={loading} />
      </div>
    </header>
  );
}