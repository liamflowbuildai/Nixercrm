import Link from "next/link";
import type { Alert } from "@/lib/alerts";

const TYPE_LABEL: Record<Alert["type"], string> = {
  renewal: "Renewal",
  follow_up: "Follow-up",
  day21_review: "Day-21 review",
  pilot_end: "Pilot ends",
};

export function NeedsAttention({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        Needs Attention
      </h2>
      <div className="flex flex-col gap-2">
        {alerts.map((alert) => {
          const overdue = alert.daysUntil < 0;
          const dueToday = alert.daysUntil === 0;
          const statusLabel = overdue
            ? `${Math.abs(alert.daysUntil)}d overdue`
            : dueToday
              ? "Due today"
              : `Due in ${alert.daysUntil}d`;

          return (
            <Link
              key={`${alert.projectId}-${alert.type}`}
              href={`/projects/${alert.projectId}`}
              className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors ${
                overdue
                  ? "border-danger/40 bg-danger/10 hover:border-danger"
                  : "border-accent/40 bg-accent/10 hover:border-accent"
              }`}
            >
              <span className="text-fg">
                <span className="text-muted">{TYPE_LABEL[alert.type]}</span>
                {" — "}
                {alert.projectName}
              </span>
              <span
                className={`font-medium ${overdue ? "text-danger" : "text-accent"}`}
              >
                {statusLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
