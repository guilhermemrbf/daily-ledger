import { forwardRef } from "react";
import { maskMoneyInput } from "@/lib/money";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (v: string) => void;
  id?: string;
  invalid?: boolean;
  autoFocus?: boolean;
  onEnter?: () => void;
}

/** Large BRL input: text + inputmode=decimal so mobile opens the numeric keypad with comma. */
export const MoneyInput = forwardRef<HTMLInputElement, Props>(function MoneyInput(
  { value, onChange, id, invalid, autoFocus, onEnter },
  ref,
) {
  return (
    <div
      className={cn(
        "flex items-baseline gap-2 rounded-2xl border bg-surface px-4 py-3 transition-colors focus-within:border-primary focus-within:glow-primary",
        invalid && "border-negative",
      )}
    >
      <span className="num text-xl font-semibold text-muted-foreground">R$</span>
      <input
        ref={ref}
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        enterKeyHint="done"
        placeholder="0,00"
        autoFocus={autoFocus}
        value={value}
        aria-invalid={invalid}
        onChange={(e) => onChange(maskMoneyInput(e.target.value, value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onEnter?.();
          }
        }}
        onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ block: "center", behavior: "smooth" }), 250)}
        className="num w-full min-w-0 bg-transparent text-4xl font-semibold text-foreground outline-none placeholder:text-muted-foreground/40"
      />
    </div>
  );
});
