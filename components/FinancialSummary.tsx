import { computeFinancialSummary } from "@/lib/finance";
import type { Project } from "@/lib/types";
import { StatTile } from "./StatTile";

export function FinancialSummary({ projects }: { projects: Project[] }) {
  const {
    pipelineValue,
    outstanding,
    revenueThisMonth,
    revenueThisYear,
    yearlyMaintenance,
  } = computeFinancialSummary(projects);

  const now = new Date();
  const monthLabel = now.toLocaleString("en-IE", { month: "long" });

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <StatTile
        label="Pipeline value"
        total={pipelineValue.total}
        lines={pipelineValue.lines}
      />
      <StatTile
        label="Outstanding"
        total={outstanding.total}
        lines={outstanding.lines}
      />
      <StatTile
        label={`Revenue in ${monthLabel}`}
        total={revenueThisMonth.total}
        lines={revenueThisMonth.lines}
      />
      <StatTile
        label={`Revenue ${now.getFullYear()}`}
        total={revenueThisYear.total}
        lines={revenueThisYear.lines}
      />
      <StatTile
        label="Maintenance (yearly)"
        total={yearlyMaintenance.total}
        lines={yearlyMaintenance.lines}
      />
    </div>
  );
}
