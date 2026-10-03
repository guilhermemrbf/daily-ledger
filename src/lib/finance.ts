// Single source of truth for all financial rules.
import { addDays } from "./dates";

export interface ExpenseLike {
  id: string;
  amount_cents: number;
  description: string | null;
  category: string;
  transaction_date: string;
  transaction_time: string;
  created_at: string;
}
export interface ClosingLike {
  closing_date: string;
  profit_cents: number;
}

export type DayStatus = "positive" | "negative" | "balanced" | "pending" | "empty";

export interface DaySummary {
  date: string;
  profitCents: number | null; // null = not informed (≠ 0)
  expensesCents: number;
  count: number;
  netCents: number | null;
  status: DayStatus;
  consumptionPct: number | null;
}

export function netStatus(net: number): DayStatus {
  return net > 0 ? "positive" : net < 0 ? "negative" : "balanced";
}

export function consumption(expenses: number, profit: number | null): number | null {
  if (profit === null || profit <= 0) return null;
  return (expenses / profit) * 100;
}

export function summarizeDay(date: string, expenses: ExpenseLike[], closing: ClosingLike | undefined): DaySummary {
  const dayExp = expenses.filter((e) => e.transaction_date === date);
  const expensesCents = dayExp.reduce((s, e) => s + e.amount_cents, 0);
  const profitCents = closing ? closing.profit_cents : null;
  const netCents = profitCents === null ? null : profitCents - expensesCents;
  const status: DayStatus =
    netCents !== null ? netStatus(netCents) : dayExp.length ? "pending" : "empty";
  return {
    date,
    profitCents,
    expensesCents,
    count: dayExp.length,
    netCents,
    status,
    consumptionPct: consumption(expensesCents, profitCents),
  };
}

/** All days that have any activity, newest first. */
export function buildDays(expenses: ExpenseLike[], closings: ClosingLike[]): DaySummary[] {
  const dates = new Set<string>();
  expenses.forEach((e) => dates.add(e.transaction_date));
  closings.forEach((c) => dates.add(c.closing_date));
  const cmap = new Map(closings.map((c) => [c.closing_date, c]));
  return [...dates]
    .sort((a, b) => (a < b ? 1 : -1))
    .map((d) => summarizeDay(d, expenses, cmap.get(d)));
}

export function sortExpenses<T extends ExpenseLike>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const ka = `${a.transaction_date} ${a.transaction_time} ${a.created_at}`;
    const kb = `${b.transaction_date} ${b.transaction_time} ${b.created_at}`;
    return ka < kb ? 1 : -1;
  });
}

export function categoryTotals(expenses: ExpenseLike[]) {
  const m = new Map<string, number>();
  expenses.forEach((e) => m.set(e.category, (m.get(e.category) ?? 0) + e.amount_cents));
  return [...m.entries()].map(([category, cents]) => ({ category, cents })).sort((a, b) => b.cents - a.cents);
}

export function daySnapshot(expenses: ExpenseLike[]) {
  const sorted = sortExpenses(expenses);
  const biggest = expenses.reduce<ExpenseLike | null>((m, e) => (!m || e.amount_cents > m.amount_cents ? e : m), null);
  return {
    count: expenses.length,
    biggest,
    topCategory: categoryTotals(expenses)[0] ?? null,
    lastTime: sorted[0]?.transaction_time ?? null,
  };
}

export function rangeKeys(from: string, to: string): string[] {
  const out: string[] = [];
  let k = from;
  let guard = 0;
  while (k <= to && guard++ < 1000) {
    out.push(k);
    k = addDays(k, 1);
  }
  return out;
}

export interface PeriodStats {
  profitCents: number;
  expensesCents: number;
  netCents: number;
  avgExpensePerDay: number | null;
  avgNetPerClosedDay: number | null;
  positive: number;
  negative: number;
  balanced: number;
  pending: number;
  closedDays: number;
  consumptionPct: number | null;
  days: DaySummary[]; // every day in range (including empty), ascending
}

export function periodStats(from: string, to: string, expenses: ExpenseLike[], closings: ClosingLike[]): PeriodStats {
  const inRange = expenses.filter((e) => e.transaction_date >= from && e.transaction_date <= to);
  const cmap = new Map(closings.filter((c) => c.closing_date >= from && c.closing_date <= to).map((c) => [c.closing_date, c]));
  const days = rangeKeys(from, to).map((d) => summarizeDay(d, inRange, cmap.get(d)));
  const profitCents = [...cmap.values()].reduce((s, c) => s + c.profit_cents, 0);
  const expensesCents = inRange.reduce((s, e) => s + e.amount_cents, 0);
  const closed = days.filter((d) => d.netCents !== null);
  const daysWithExpenses = days.filter((d) => d.count > 0).length;
  return {
    profitCents,
    expensesCents,
    netCents: profitCents - expensesCents,
    avgExpensePerDay: daysWithExpenses ? Math.round(expensesCents / daysWithExpenses) : null,
    avgNetPerClosedDay: closed.length ? Math.round(closed.reduce((s, d) => s + (d.netCents ?? 0), 0) / closed.length) : null,
    positive: days.filter((d) => d.status === "positive").length,
    negative: days.filter((d) => d.status === "negative").length,
    balanced: days.filter((d) => d.status === "balanced").length,
    pending: days.filter((d) => d.status === "pending").length,
    closedDays: closed.length,
    consumptionPct: profitCents > 0 ? (expensesCents / profitCents) * 100 : null,
    days,
  };
}

export const STATUS_LABEL: Record<DayStatus, string> = {
  positive: "Positivo",
  negative: "Negativo",
  balanced: "Equilibrado",
  pending: "Fechamento pendente",
  empty: "Sem movimentação",
};

export const toneClass = (status: DayStatus) =>
  ({
    positive: "text-positive",
    negative: "text-negative",
    balanced: "text-neutral",
    pending: "text-pending",
    empty: "text-muted-foreground",
  })[status];
