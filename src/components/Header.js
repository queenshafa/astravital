
import NotificationBell from "./NotificationBell";
import LogoutButton from "./LogoutButton";

export default function Header({
  name,
  status,
  analyses,
  hazards,
  loading,
}) {
  return (
    <header className="flex w-full flex-col gap-5 rounded-2xl bg-card px-4 py-5 sm:px-6 sm:py-7 md:flex-row md:items-center md:justify-between md:px-8 md:py-8 lg:py-10">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="lg:hidden">
          <img
            src="/medteor_logo.png"
            alt="Medteor"
            className="h-auto w-24 object-contain sm:w-28"
          />
        </div>
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl lg:text-[32px]">
            Hi, {name || "Astronaut"}!
          </h1>

          <p className="mt-1 text-sm leading-relaxed text-white/70 sm:text-[15px]">
            {status}
          </p>
        </div>
      </div>
      <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end">
        <LogoutButton className="shrink-0 rounded-lg border border-line px-3 py-2 text-xs text-white/80 transition-colors hover:border-brand hover:text-brand sm:text-sm lg:hidden" />
        <div className="ml-auto shrink-0">
          <NotificationBell
            analyses={analyses}
            hazards={hazards}
            loading={loading}
          />
        </div>
      </div>
    </header>
  );
}