const BARS = [10, 12, 12, 14, 16, 18, 20];

export default function MetricCard({ icon: Icon, label, value, unit, baseline, updated }) {
  return (
    <div className="flex flex-col rounded-2xl bg-card p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand text-white">
          <Icon width={18} height={18} />
        </span>
        <span className="text-[15px]">{label}</span>
      </div>

      <div className="mt-9">
        <div className="text-[28px] font-semibold leading-none">
          {value}
          <span className="ml-1 text-sm font-normal">{unit}</span>
        </div>
        <p className="mt-1.5 text-xs">Personal baseline : {baseline}</p>
      </div>

      <div className="mt-5 flex items-end justify-between border-t border-line pt-3 text-xs">
        <span>Updated {updated}</span>
        <span className="flex items-end gap-[3px]">
          {BARS.map((h, i) => (
            <span key={i} className="inline-block w-[2px] rounded-sm bg-brand" style={{ height: h }} />
          ))}
        </span>
      </div>
    </div>
  );
}
