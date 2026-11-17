import type { StageLoad } from "@/lib/analytics";
import { STALE_DAYS } from "@/lib/analytics";

// Where open deals are sitting right now. The busiest stage is called out as
// the bottleneck; stale deals (no update in 14+ days) are flagged per stage.
export function StageLoadBars({ load, color }: { load: StageLoad[]; color: string }) {
  const max = Math.max(...load.map((l) => l.count), 0);
  const total = load.reduce((s, l) => s + l.count, 0);
  if (total === 0) {
    return <p className="py-6 text-sm text-dim">No open deals.</p>;
  }

  return (
    <ul className="flex flex-col">
      {load.map((l) => {
        const isBottleneck = l.count === max && max > 1;
        return (
          <li
            key={l.stage}
            title={`${l.label}: ${l.count} open${l.stale ? `, ${l.stale} untouched ${STALE_DAYS}+ days` : ""}`}
            className={`${l.count ? "grid" : "hidden sm:grid"} grid-cols-[1fr_6rem] items-center gap-x-3 gap-y-1 py-1.5 text-sm sm:grid-cols-[13rem_1fr_9rem]`}
          >
            <span className={`truncate ${l.count ? "text-fg" : "text-dim"}`}>{l.label}</span>
            <span className="col-span-2 row-start-2 flex items-center gap-2 sm:col-span-1 sm:row-start-auto">
              {l.count > 0 && (
                <span
                  className="h-2.5 rounded-r-[4px]"
                  style={{ width: `${(l.count / max) * 100}%`, background: isBottleneck ? color : "var(--dim)" }}
                />
              )}
              <span className="tnum text-xs text-muted">{l.count}</span>
            </span>
            <span className="text-right text-xs">
              {isBottleneck && <span className="text-fg">● Bottleneck</span>}
              {l.stale > 0 && (
                <span className="ml-2 text-danger">⚠ {l.stale} stale</span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
