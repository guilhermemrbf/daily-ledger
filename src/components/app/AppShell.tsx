import { useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Receipt, CalendarDays, BarChart3, Settings, Plus } from "lucide-react";
import { SheetsContext, type SheetsApi } from "./sheets-context";
import { ExpenseSheet } from "./ExpenseSheet";
import { ProfitSheet } from "./ProfitSheet";
import { todayKey } from "@/lib/dates";
import type { Expense } from "@/lib/data";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/gastos", label: "Gastos", icon: Receipt },
  { to: "/historico", label: "Histórico", icon: CalendarDays },
  { to: "/analises", label: "Análises", icon: BarChart3 },
  { to: "/configuracoes", label: "Ajustes", icon: Settings },
] as const;

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary glow-primary">
        <span className="font-display text-lg font-bold text-primary-foreground">E</span>
      </div>
      <div className="min-w-0 leading-tight">
        <p className="truncate font-display text-[15px] font-semibold">Escalie</p>
        <p className="truncate text-xs text-muted-foreground">Finanças</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | undefined>();
  const [expenseDate, setExpenseDate] = useState<string | undefined>();
  const [profitOpen, setProfitOpen] = useState(false);
  const [profitDate, setProfitDate] = useState(todayKey());

  const api = useMemo<SheetsApi>(
    () => ({
      openExpense: (o) => {
        setEditing(o?.expense);
        setExpenseDate(o?.date);
        setExpenseOpen(true);
      },
      openProfit: (d) => {
        setProfitDate(d);
        setProfitOpen(true);
      },
    }),
    [],
  );

  return (
    <SheetsContext.Provider value={api}>
      <div className="min-h-dvh md:flex">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-sidebar p-5 md:flex">
          <Logo />
          <nav className="mt-10 grid gap-1">
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/" }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
                activeProps={{ className: "bg-sidebar-accent !text-foreground [&_svg]:text-primary-soft" }}
              >
                <Icon className="h-[18px] w-[18px]" />
                {label === "Ajustes" ? "Configurações" : label}
              </Link>
            ))}
          </nav>
          <button
            onClick={() => api.openExpense()}
            className="mt-auto flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary font-semibold text-primary-foreground glow-primary transition-transform active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" /> Adicionar gasto
          </button>
        </aside>

        <main className="mx-auto w-full max-w-3xl min-w-0 px-4 pt-safe pb-[calc(env(safe-area-inset-bottom)+7rem)] md:px-8 md:pb-12">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 backdrop-blur-xl pb-safe md:hidden">
          <div className="mx-auto grid max-w-lg grid-cols-5">
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/" }}
                className="group flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground"
                activeProps={{ className: "!text-foreground" }}
              >
                {({ isActive }: { isActive: boolean }) => (
                  <>
                    <span className={cn("grid h-8 w-12 place-items-center rounded-full transition-colors", isActive && "bg-primary/18")}>
                      <Icon className={cn("h-5 w-5", isActive && "text-primary-soft")} />
                    </span>
                    {label}
                  </>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Mobile floating add */}
        <button
          onClick={() => api.openExpense()}
          aria-label="Adicionar gasto"
          className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-40 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground glow-primary transition-transform active:scale-95 md:hidden"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      <ExpenseSheet open={expenseOpen} onOpenChange={setExpenseOpen} expense={editing} defaultDate={expenseDate} />
      <ProfitSheet open={profitOpen} onOpenChange={setProfitOpen} date={profitDate} />
    </SheetsContext.Provider>
  );
}
