// Date keys are local "YYYY-MM-DD" strings — never derived from UTC.
const pad = (n: number) => n.toString().padStart(2, "0");

export function toKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export const todayKey = () => toKey(new Date());

export function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(key: string, n: number): string {
  const d = parseKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

export function nowTime(): string {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const shortTime = (t: string | null | undefined) => (t ? t.slice(0, 5) : "");

export function formatLong(key: string): string {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(parseKey(key));
}
export function formatShort(key: string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(parseKey(key)).replace(".", "");
}
export function formatWeekday(key: string): string {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(parseKey(key)).replace(".", "");
}

export function relativeLabel(key: string): string {
  const t = todayKey();
  if (key === t) return "Hoje";
  if (key === addDays(t, -1)) return "Ontem";
  return formatShort(key);
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export function isValidKey(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}
