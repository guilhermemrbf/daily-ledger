import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "./MoneyInput";
import { centsToInput, formatBRL, parseMoneyToCents } from "@/lib/money";
import { formatLong } from "@/lib/dates";
import { useClosings, useSaveClosing } from "@/lib/data";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  date: string;
}

export function ProfitSheet({ open, onOpenChange, date: initialDate }: Props) {
  const { data: closings = [] } = useClosings();
  const save = useSaveClosing();
  const [date, setDate] = useState(initialDate);
  const [amount, setAmount] = useState("");
  const [touched, setTouched] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const existing = closings.find((c) => c.closing_date === date);

  useEffect(() => {
    if (open) setDate(initialDate);
  }, [open, initialDate]);

  useEffect(() => {
    if (!open) return;
    const ex = closings.find((c) => c.closing_date === date);
    setAmount(ex ? centsToInput(ex.profit_cents) : "");
    setTouched(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, date]);

  const cents = parseMoneyToCents(amount);
  const invalid = cents === null || cents < 0;

  async function submit() {
    setTouched(true);
    if (invalid || save.isPending) return;
    try {
      await save.mutateAsync({ closing_date: date, profit_cents: cents! });
      toast.success(existing ? "Fechamento atualizado" : "Lucro do dia salvo", { description: `${formatBRL(cents!)} · ${formatLong(date)}` });
      onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} repositionInputs shouldScaleBackground={false}>
      <DrawerContent className="mx-auto max-h-[92dvh] w-full max-w-lg border-border bg-card">
        <div className="flex min-h-0 flex-col overflow-y-auto px-5 pb-2 pt-3">
          <DrawerTitle className="font-display text-xl">{existing ? "Atualizar fechamento" : "Informar lucro do dia"}</DrawerTitle>
          <DrawerDescription className="mt-1 text-sm text-muted-foreground">
            Valor total consolidado do dia. Um único lucro por dia — salvar de novo substitui, nunca soma.
          </DrawerDescription>

          {existing && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm">
              <RefreshCw className="h-4 w-4 shrink-0 text-primary-soft" />
              <span>Valor atual: <strong className="num">{formatBRL(existing.profit_cents)}</strong>. Você está editando.</span>
            </div>
          )}

          <label htmlFor="profit-amount" className="eyebrow mt-5 mb-2 block">Lucro total</label>
          <MoneyInput ref={ref} id="profit-amount" value={amount} onChange={setAmount} invalid={touched && invalid} autoFocus onEnter={submit} />
          {touched && invalid && <p className="mt-2 text-sm text-negative">Informe um valor (R$ 0,00 é permitido).</p>}

          <label className="mt-5 block">
            <span className="eyebrow mb-2 block">Data de referência</span>
            <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="h-12 w-full rounded-xl border bg-surface px-3 text-base outline-none focus:border-primary" />
          </label>
          <p className="mt-2 text-xs capitalize text-muted-foreground">{formatLong(date)}</p>
        </div>
        <div className="sticky bottom-0 border-t bg-card px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
          <Button size="lg" className="h-13 w-full rounded-2xl text-base font-semibold" disabled={save.isPending} onClick={submit}>
            {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {save.isPending ? "Salvando…" : existing ? "Atualizar lucro" : "Salvar lucro"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
