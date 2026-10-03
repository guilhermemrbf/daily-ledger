import { useState, type ReactNode } from "react";
import { Pencil, Trash2, Loader2, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatBRL } from "@/lib/money";
import { shortTime, relativeLabel } from "@/lib/dates";
import { categoryIcon } from "@/lib/categories";
import { STATUS_LABEL, type DayStatus } from "@/lib/finance";
import { useDeleteExpense, type Expense } from "@/lib/data";
import { useSheets } from "./sheets-context";
import { cn } from "@/lib/utils";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 pt-6 pb-5">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 truncate text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

const STATUS_STYLE: Record<DayStatus, string> = {
  positive: "bg-positive/12 text-positive border-positive/25",
  negative: "bg-negative/12 text-negative border-negative/25",
  balanced: "bg-neutral/10 text-neutral border-neutral/20",
  pending: "bg-primary/10 text-pending border-primary/25",
  empty: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status, className }: { status: DayStatus; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", STATUS_STYLE[status], className)}>
      {status === "pending" ? "Pendente" : STATUS_LABEL[status]}
    </span>
  );
}

export function ConsumptionBar({ pct, compact }: { pct: number | null; compact?: boolean }) {
  if (pct === null)
    return <p className="text-sm text-muted-foreground">Informe o lucro para calcular o consumo.</p>;
  const over = pct > 100;
  const width = over ? 100 : pct;
  const okPart = over ? (100 / pct) * 100 : 100;
  return (
    <div>
      {!compact && (
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <span className="text-sm text-muted-foreground">do lucro consumido pelos gastos</span>
          <span className={cn("num text-lg font-semibold", over ? "text-negative" : pct >= 80 ? "text-primary-soft" : "text-foreground")}>
            {pct.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
          </span>
        </div>
      )}
      <div className="relative h-2.5 overflow-hidden rounded-full bg-surface">
        <div
          className={cn("absolute inset-y-0 left-0 rounded-full transition-[width] duration-500", over ? "bg-negative" : "bg-primary")}
          style={{ width: `${width}%` }}
        />
        {over && <div className="absolute inset-y-0 left-0 rounded-l-full bg-primary transition-[width] duration-500" style={{ width: `${okPart}%` }} />}
      </div>
      {over && !compact && (
        <p className="mt-2 text-xs text-negative">Gastos excederam o lucro em {formatBRL(0)}… </p>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="card-surface flex flex-col items-center px-6 py-10 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/12">
        <Icon className="h-6 w-6 text-primary-soft" />
      </div>
      <p className="mt-4 font-display font-semibold">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="card-surface border-negative/30 p-5 text-sm">
      <p className="font-semibold text-negative">Não foi possível carregar os dados</p>
      <p className="mt-1 text-muted-foreground">{message}</p>
      <button onClick={onRetry} className="mt-3 rounded-lg bg-surface px-3 py-2 font-medium">Tentar novamente</button>
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-card", className)} />;
}

export function ExpenseRow({ expense, showDate }: { expense: Expense; showDate?: boolean }) {
  const { openExpense } = useSheets();
  const del = useDeleteExpense();
  const [confirm, setConfirm] = useState(false);
  const Icon = categoryIcon(expense.category);

  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface">
        <Icon className="h-[18px] w-[18px] text-primary-soft" />
      </div>
      <button className="min-w-0 text-left" onClick={() => openExpense({ expense })}>
        <p className="truncate text-[15px] font-medium">{expense.description || expense.category}</p>
        <p className="truncate text-xs text-muted-foreground">
          {expense.category} · {showDate ? `${relativeLabel(expense.transaction_date)} · ` : ""}{shortTime(expense.transaction_time)}
        </p>
      </button>
      <div className="flex items-center gap-1">
        <span className="num mr-1 text-[15px] font-semibold">−{formatBRL(expense.amount_cents)}</span>
        <button aria-label="Editar gasto" onClick={() => openExpense({ expense })} className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-surface hover:text-foreground">
          <Pencil className="h-4 w-4" />
        </button>
        <button aria-label="Excluir gasto" onClick={() => setConfirm(true)} className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-negative/10 hover:text-negative">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent className="max-w-sm rounded-3xl border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este gasto?</AlertDialogTitle>
            <AlertDialogDescription>
              {formatBRL(expense.amount_cents)} · {expense.description || expense.category}. Os totais do dia serão recalculados. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={del.isPending}
              onClick={async (e) => {
                e.preventDefault();
                try {
                  await del.mutateAsync(expense.id);
                  toast.success("Gasto excluído");
                  setConfirm(false);
                } catch (err) {
                  toast.error((err as Error).message);
                }
              }}
            >
              {del.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}
