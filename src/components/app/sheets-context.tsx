import { createContext, useContext } from "react";
import type { Expense } from "@/lib/data";

export interface SheetsApi {
  openExpense: (opts?: { expense?: Expense; date?: string }) => void;
  openProfit: (date: string) => void;
}

export const SheetsContext = createContext<SheetsApi | null>(null);

export function useSheets(): SheetsApi {
  const ctx = useContext(SheetsContext);
  if (!ctx) throw new Error("useSheets must be used inside AppShell");
  return ctx;
}
