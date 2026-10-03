// Monetary helpers. All amounts are integer cents.
const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatBRL(cents: number, opts: { sign?: boolean } = {}): string {
  const s = BRL.format(Math.abs(cents) / 100);
  if (cents < 0) return `−${s}`;
  if (opts.sign && cents > 0) return `+${s}`;
  return s;
}

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Masks free typing into pt-BR money format ("1.250,50").
 * Thousand dots are inserted automatically; a "." typed as the last char
 * (some Android decimal keypads) is treated as the decimal comma.
 */
export function maskMoneyInput(raw: string, prev = ""): string {
  let s = raw;
  if (s.length === prev.length + 1 && s.endsWith(".") && !prev.includes(",")) {
    s = s.slice(0, -1) + ",";
  }
  s = s.replace(/[^\d,]/g, "");
  if (!s) return "";
  const ci = s.indexOf(",");
  let intDigits = ci >= 0 ? s.slice(0, ci) : s;
  const decDigits = ci >= 0 ? s.slice(ci + 1).replace(/,/g, "").slice(0, 2) : null;
  intDigits = intDigits.replace(/^0+(?=\d)/, "").slice(0, 9);
  if (!intDigits && decDigits !== null) intDigits = "0";
  const head = groupThousands(intDigits);
  return decDigits !== null ? `${head},${decDigits}` : head;
}

/** Parses a masked value into integer cents; null if empty/invalid. */
export function parseMoneyToCents(masked: string): number | null {
  const s = masked.replace(/\./g, "").trim();
  if (!s) return null;
  const [i, d = ""] = s.split(",");
  if (!/^\d*$/.test(i ?? "") || !/^\d*$/.test(d)) return null;
  const cents = Number(i || "0") * 100 + Number((d + "00").slice(0, 2));
  return Number.isFinite(cents) ? cents : null;
}

export function centsToInput(cents: number): string {
  const int = Math.floor(cents / 100).toString();
  const dec = (cents % 100).toString().padStart(2, "0");
  return `${groupThousands(int)},${dec}`;
}
