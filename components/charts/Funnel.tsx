import type { FunnelStep } from "@/lib/analytics";

const pct = (n: number) => `${Math.round(n * 100)}%`;

// Horizontal funnel: one bar per step (share of the top step), count at the
// tip, step-to-step conversion on the right. The biggest drop is flagged
// with an icon + label, never colour alone.
export function Funnel({ steps, color }: { steps: FunnelStep[]; color: string }) {
  if (steps[0]?.count === 0) {
    return <p className="py-6 text-sm text-dim">No deals in this period yet.</p>;
  }

  return (
    <ol className="flex flex-col">
      {steps.map((s) => (
        <li
          key={s.label}
          title={`${s.label}: ${s.count}${s.pctOfPrev != null ? ` (${pct(s.pctOfPrev)} of previous step)` : ""}`}
          className="grid grid-cols-[7.5rem_1fr_3.5rem] items-center gap-3 border-b border-border py-2 text-sm last:border-b-0 sm:grid-cols-[9rem_1fr_4.5rem]"
        >
          <span className="truncate text-muted">{s.label}</span>
          <span className="flex items-center gap-2">
            <span
              className="h-3.5 rounded-r-[4px]"
              style={{
                width: `${Math.max(s.pctOfTop * 100, s.count > 0 ? 1.5 : 0)}%`,
                background: color,
              }}
            />
            <span className="tnum text-fg">{s.count}</span>
          </span>
          <span className="tnum text-right text-xs">
            {s.pctOfPrev == null ? (
              <span className="text-dim">—</span>
            ) : s.isBiggestDrop ? (
              <span className="text-danger" title="Biggest drop-off in this funnel">
                ▼ {pct(s.pctOfPrev)}
              </span>
            ) : (
              <span className="text-muted">{pct(s.pctOfPrev)}</span>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
