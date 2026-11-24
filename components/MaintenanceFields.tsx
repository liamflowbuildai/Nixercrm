"use client";

import { useState } from "react";

const field =
  "rounded-xl border border-border-strong bg-bg px-3 py-2 text-fg outline-none focus:border-accent";

const round2 = (n: number) => Math.round(n * 100) / 100;
const today = () => new Date().toISOString().slice(0, 10);

// Billing (monthly/yearly) + amount in that period's terms. The database keeps
// the yearly figure; switching billing converts the number shown.
export function MaintenanceFields({
  yearlyFee,
  billing: initialBilling,
  monthlyFrom,
  isNew,
}: {
  yearlyFee: number | null;
  billing: "monthly" | "yearly";
  monthlyFrom: string | null;
  isNew: boolean;
}) {
  const [billing, setBilling] = useState(initialBilling);
  const [amount, setAmount] = useState<string>(
    yearlyFee == null ? "" : String(initialBilling === "monthly" ? round2(yearlyFee / 12) : yearlyFee),
  );
  const [from, setFrom] = useState(monthlyFrom ?? "");

  function switchTo(next: "monthly" | "yearly") {
    if (next === billing) return;
    const n = Number(amount);
    if (amount !== "" && !Number.isNaN(n)) {
      setAmount(String(next === "monthly" ? round2(n / 12) : round2(n * 12)));
    }
    if (next === "monthly" && !from && !isNew) setFrom(today());
    setBilling(next);
  }

  return (
    <>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">Maintenance billed</span>
        <select
          name="maintenance_billing"
          value={billing}
          onChange={(e) => switchTo(e.target.value as "monthly" | "yearly")}
          className={field}
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">
          Maintenance (€/{billing === "monthly" ? "month" : "year"})
        </span>
        <input
          name="maintenance_amount"
          type="number"
          step="0.01"
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={field}
        />
      </label>
      {billing === "monthly" && (
        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted">Monthly billing started</span>
          <input
            name="monthly_billing_from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={field}
          />
          <span className="text-xs text-muted">
            Counts as recurring income from this month.
            {isNew && " Leave blank to use the maintenance set-up date."}
          </span>
        </label>
      )}
    </>
  );
}
