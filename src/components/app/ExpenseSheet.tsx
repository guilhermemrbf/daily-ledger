import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, CalendarClock } from "lucide-react";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "./MoneyInput";
import { centsToInput, parseMoneyToCents } from "@/lib/money";
import { nowTime, todayKey, shortTime, relativeLabel } from "@/lib/dates";
import { useCustomCategories, useSaveExpense, type Expense } from "@/lib/data";
import { DEFAULT_CATEGORIES, categoryIcon } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  expense?: Expense | undefined;
  defaultDate?: string | undefined;
}

export function ExpenseSheet({ open, onOpenChange, expense, defaultDate }: Props) {
  const save = useSaveExpense();
  const { data: custom = [] } = useCustomCategories();
  const categories = useMemo(
    () => [...DEFAULT_CATEGORIES.map((c) => c.name), ...custom.map((c) => c.name).filter((n) => !DEFAULT_CATEGORIES.some((d) => d.name === n))],
    [custom],
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const [id, setId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Outros");
  const [date, setDate] = useState(todayKey());
  const [time, setTime] = useState(nowTime());
  const [showWhen, setShowWhen] = useState(false);
  const [touched, setTouched] = useState(false);

  const reset = (keepCategory = false) => {
    setId(crypto.randomUUID());
    setAmount("");
    setDescription("");
    if (!keepCategory) setCategory("Outros");
    setDate(defaultDate ?? todayKey());
    setTime(nowTime());
    setShowWhen(false);
    setTouched(false);
  };

  useEffect(() => {
    if (!open) return;
    if (expense) {
      setId(expense.id);
      setAmount(centsToInput(expense.amount_cents));
      setDescription(expense.description ?? "");
      setCategory(expense.category);
      setDate(expense.transaction_date);
      setTime(shortTime(expense.transaction_time));
      setShowWhen(false);
      setTouched(false);
    } else reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, expense?.id]);

  const cents = parseMoneyToCents(amount);
  const invalid = cents === null || cents <= 0;

  async function submit(another = false) {
    setTouched(true);
    if (invalid || save.isPending) {
      if (invalid) inputRef.current?.focus();
      return;
    }
    try {
      await save.mutateAsync({
        id,
        amount_cents: cents!,
        description: description.trim().slice(0, 200) || null,
        category,
        transaction_date: date,
        transaction_time: time.length === 5 ? `${time}:00` : time,
      });
      toast.success(expense ? "Gasto atualizado" : "Gasto salvo", { description: `${amount ? "R$ " + amount : ""} · ${category}` });
      if (another && !expense) {
        reset(true);
        inputRef.current?.focus();
      } else onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message, { description: "Nada foi salvo. Toque em salvar para tentar de novo." });
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} repositionInputs shouldScaleBackground={false}>
      <DrawerContent className="mx-auto max-h-[92dvh] w-full max-w-lg border-border bg-card">
        <div className="flex min-h-0 flex-col overflow-y-auto px-5 pb-2 pt-3">
          <DrawerTitle className="font-display text-xl">{expense ? "Editar gasto" : "Adicionar gasto"}</DrawerTitle>
          <DrawerDescription className="mt-1 text-sm text-muted-foreground">
            {expense ? "Corrija o lançamento e salve." : "Valor é o único campo obrigatório."}
          </DrawerDescription>

          <label htmlFor="expense-amount" className="eyebrow mt-5 mb-2 block">Valor</label>
          <MoneyInput
            ref={inputRef}
            id="expense-amount"
            value={amount}
            onChange={setAmount}
            invalid={touched && invalid}
            autoFocus
            onEnter={() => submit()}
          />
          {touched && invalid && <p className="mt-2 text-sm text-negative">Informe um valor maior que zero.</p>}

          <p className="eyebrow mt-5 mb-2">Categoria</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const Icon = categoryIcon(c);
              const active = c === category;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors",
                    active ? "border-primary bg-primary/15 text-foreground" : "border-border bg-surface text-muted-foreground hover:text-foreground",
                  )}
                  aria-pressed={active}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary-soft")} />
                  {c}
                </button>
              );
            })}
          </div>

          <label htmlFor="expense-desc" className="eyebrow mt-5 mb-2 block">Descrição <span className="normal-case tracking-normal font-normal">(opcional)</span></label>
          <input
            id="expense-desc"
            value={description}
            maxLength={200}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex.: almoço, Uber, ferramenta…"
            enterKeyHint="done"
            className="h-12 w-full rounded-xl border bg-surface px-4 text-base outline-none transition-colors focus:border-primary"
          />

          {!showWhen ? (
            <button type="button" onClick={() => setShowWhen(true)} className="mt-4 inline-flex items-center gap-2 self-start rounded-lg py-2 text-sm text-muted-foreground hover:text-foreground">
              <CalendarClock className="h-4 w-4 text-primary-soft" />
              {relativeLabel(date)} às {time} · <span className="text-primary-soft">alterar</span>
            </button>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="eyebrow mb-2 block">Data</span>
                <input type="date" value={date} max="2100-12-31" onChange={(e) => e.target.value && setDate(e.target.value)} className="h-12 w-full min-w-0 rounded-xl border bg-surface px-3 text-base outline-none focus:border-primary" />
              </label>
              <label className="block">
                <span className="eyebrow mb-2 block">Horário</span>
                <input type="time" value={time} onChange={(e) => e.target.value && setTime(e.target.value)} className="h-12 w-full min-w-0 rounded-xl border bg-surface px-3 text-base outline-none focus:border-primary" />
              </label>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 grid gap-2 border-t bg-card px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
          <Button size="lg" className="h-13 rounded-2xl text-base font-semibold" disabled={save.isPending} onClick={() => submit()}>
            {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {save.isPending ? "Salvando…" : expense ? "Salvar alterações" : "Salvar gasto"}
          </Button>
          {!expense && (
            <Button variant="ghost" className="h-11 rounded-2xl text-muted-foreground" disabled={save.isPending} onClick={() => submit(true)}>
              Salvar e adicionar outro
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
