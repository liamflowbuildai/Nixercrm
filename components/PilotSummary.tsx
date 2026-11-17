import { formatCurrency } from "@/lib/format";
import { getPilotStatus, PILOT_DAYS } from "@/lib/sales";
import type { Project, SalesMonth } from "@/lib/types";

export function PilotSummary({
  project,
  months,
}: {
  project: Project;
  months: SalesMonth[];
}) {
  const s = getPilotStatus(project, months);
  const pct =
    s.guaranteedCalls > 0
      ? Math.min(100, Math.round((s.callsHeld / s.guaranteedCalls) * 100))
      : 0;

  let pilotLine = "Pilot not started (starts when ads go live)";
  if (s.pilotStart && s.dayOfPilot == null) {
    pilotLine = `Pilot starts ${s.pilotStart.toLocaleDateString("en-IE")}`;
  } else if (s.dayOfPilot != null && s.daysLeft != null) {
    pilotLine =
      s.daysLeft >= 0
        ? `Day ${Math.min(s.dayOfPilot, PILOT_DAYS)} of ${PILOT_DAYS} · ${s.daysLeft} days left`
        : `90 days ended ${s.pilotEnd!.toLocaleDateString("en-IE")}`;
  }

  return (
    <section className="mb-6 max-w-2xl">
      <div className="grid grid-cols-3 gap-6 border-y border-border py-4">
        <Figure label="Projected value" value={formatCurrency(s.projectedValue)} />
        <Figure label="Made to date" value={formatCurrency(s.earnedToDate)} accent />
        <Figure label="Still to come" value={formatCurrency(s.remainingProjected)} />
      </div>
      <div className="mt-4">
        <div className="mb-1 flex items-baseline justify-between text-sm">
          <span className="text-fg">
            {s.callsHeld} / {s.guaranteedCalls || "?"} guaranteed calls held
            {s.guaranteeMet && <span className="text-accent"> · guarantee met</span>}
          </span>
          <span className={s.extended ? "text-danger" : "text-muted"}>
            {s.extended ? "Extended: guarantee not met yet" : pilotLine}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${pct}%` }}
          />
        </div>
        {s.unpaidAmount > 0 && (
          <p className="mt-2 text-sm text-muted">
            {formatCurrency(s.unpaidAmount)} of held calls not paid yet.
          </p>
        )}
      </div>
    </section>
  );
}

function Figure({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${accent ? "text-accent" : "text-fg"}`}>
        {value}
      </p>
    </div>
  );
}
