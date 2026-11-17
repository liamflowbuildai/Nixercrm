import type { LostSummary } from "@/lib/analytics";

// Where deals were lost, by the stage they were at. The stage that loses the
// most is called out by label, not colour alone.
export function LostBars({ summary, color }: { summary: LostSummary; color: string }) {
  const rows = [
    ...summary.byStage,
    ...(summary.unknown
      ? [{ stage: "unknown", label: "Not recorded", count: summary.unknown }]
      : []),
  ];
  if (rows.length === 0) {
    return <p className="py-2 text-sm text-dim">No lost deals in this period.</p>;
  }
  const max = Math.max(...rows.map((r) => r.count));

  return (
    <ul className="flex flex-col">
      {rows.map((r) => {
        const top = r.count === max && r.stage !== "unknown";
        return (
          <li
            key={r.stage}
            title={`${r.label}: ${r.count} lost`}
            className="grid grid-cols-[1fr_6rem] items-center gap-x-3 gap-y-1 py-1.5 text-sm sm:grid-cols-[13rem_1fr_9rem]"
          >
            <span className={r.stage === "unknown" ? "text-dim" : "text-fg"}>{r.label}</span>
            <span className="col-span-2 row-start-2 flex items-center gap-2 sm:col-span-1 sm:row-start-auto">
              <span
                className="h-2.5 rounded-r-[4px]"
                style={{ width: `${(r.count / max) * 100}%`, background: top ? color : "var(--dim)" }}
              />
              <span className="tnum text-xs text-muted">{r.count}</span>
            </span>
            <span className="text-right text-xs">
              {top && <span className="text-fg">● Most lost here</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
