import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, BarChart3, CalendarDays, Check,
  ChevronRight, Clock3, Download, Ellipsis, FileClock, Filter, LayoutDashboard,
  Menu, Minus, Pencil, Plus, Receipt, Search, Settings2, Sparkles,
  TrendingDown, TrendingUp, Wallet, X, Trash2, PiggyBank, CircleDollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Finanças" },
      { name: "description", content: "Controle financeiro diário simples, rápido e claro." },
      { property: "og:title", content: "Finanças" },
      { property: "og:description", content: "Controle seus gastos, acompanhe seu lucro e saiba quanto realmente sobrou." },
    ],
  }),
  component: EscalieApp,
});

type Section = "dashboard" | "gastos" | "historico" | "analises" | "configuracoes";
type Expense = { id: string; amountCents: number; description: string; category: string; date: string; time: string; createdAt: string; };
type Closing = { date: string; profitCents: number; updatedAt: string; };
type Store = { expenses: Expense[]; closings: Closing[]; };
const STORE_KEY = "financas-dados-v1";
function readStore(): Store {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { expenses: [], closings: [] };
    const parsed = JSON.parse(raw) as Partial<Store>;
    return { expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [], closings: Array.isArray(parsed.closings) ? parsed.closings : [] };
  } catch { return { expenses: [], closings: [] }; }
}
const CATEGORIES = ["Alimentação", "Transporte", "Moradia", "Assinaturas", "Ferramentas e softwares", "Publicidade e anúncios", "Compras", "Saúde", "Lazer", "Outros"];
const NAV: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "gastos", label: "Gastos", icon: Receipt },
  { id: "historico", label: "Histórico", icon: FileClock },
  { id: "analises", label: "Análises", icon: BarChart3 },
  { id: "configuracoes", label: "Configurações", icon: Settings2 },
];

function localDate(d = new Date()) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function localTime(d = new Date()) { return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; }
function money(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
function dateLabel(date: string, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" }) {
  if (!date) return "—";
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", opts).format(new Date(y, m - 1, d, 12));
}
function parseMoney(value: string) {
  const clean = value.trim().replace(/R\$\s?/g, "").replace(/\s/g, "");
  if (!clean) return NaN;
  const normalized = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean;
  const n = Number(normalized);
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}
function amountInput(cents: number) {
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100);
}
function EscalieApp() {
  const [section, setSection] = useState<Section>("dashboard");
  const [store, setStore] = useState<Store>({ expenses: [], closings: [] });
  const [ready, setReady] = useState(false);
  const [selectedDate, setSelectedDate] = useState(localDate());
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [closingOpen, setClosingOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [profitInput, setProfitInput] = useState("");
  const [closingDate, setClosingDate] = useState(localDate());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("Todas");
  const [filterDate, setFilterDate] = useState(localDate());
  const [period, setPeriod] = useState("7");
  const [customStart, setCustomStart] = useState(localDate());
  const [customEnd, setCustomEnd] = useState(localDate());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    setStore(readStore());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); }
    catch { setToast("Não foi possível salvar os dados neste navegador."); }
  }, [store, ready]);

    useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const expensesFor = useCallback((date: string) => store.expenses.filter(e => e.date === date), [store.expenses]);
  const closingFor = useCallback((date: string) => store.closings.find(c => c.date === date), [store.closings]);
  const dailyExpenses = useMemo(() => expensesFor(selectedDate), [expensesFor, selectedDate]);
  const dailySpend = dailyExpenses.reduce((sum, e) => sum + e.amountCents, 0);
  const dailyClosing = closingFor(selectedDate);
  const dailyNet = dailyClosing ? dailyClosing.profitCents - dailySpend : null;
  const sortedExpenses = useMemo(() => [...store.expenses].sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time)), [store.expenses]);

  const openExpense = (item?: Expense) => {
    setEditing(item ?? null);
    setExpenseAmount(item ? amountInput(item.amountCents) : "");
    setExpenseOpen(true);
  };
  const saveExpense = (event: React.FormEvent) => {
    event.preventDefault();
    const cents = parseMoney(expenseAmount);
    if (!Number.isFinite(cents) || cents <= 0) { setToast("Informe um valor maior que zero."); return; }
    setSaving(true);
    const now = new Date().toISOString();
    const item: Expense = {
      id: editing?.id ?? (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now())),
      amountCents: cents, description: editing?.description ?? "", category: editing?.category ?? "Outros",
      date: localDate(), time: localTime(), createdAt: editing?.createdAt ?? now,
    };
    setStore(prev => ({ ...prev, expenses: editing ? prev.expenses.map(e => e.id === editing.id ? item : e) : [item, ...prev.expenses] }));
    setSelectedDate(localDate()); setFilterDate(localDate()); setExpenseOpen(false); setSaving(false);
    setToast(editing ? "Gasto atualizado." : `Gasto de ${money(cents)} adicionado.`);
    setExpenseAmount("");
  };
  const openClosing = (date = selectedDate) => {
    setClosingDate(date);
    const existing = closingFor(date);
    setProfitInput(existing ? amountInput(existing.profitCents) : "");
    setClosingOpen(true);
  };
  const saveClosing = (event: React.FormEvent) => {
    event.preventDefault();
    const cents = parseMoney(profitInput);
    if (!Number.isFinite(cents) || cents < 0) { setToast("Informe um lucro válido. O valor pode ser zero."); return; }
    setSaving(true);
    const item: Closing = { date: closingDate, profitCents: cents, updatedAt: new Date().toISOString() };
    setStore(prev => ({ ...prev, closings: prev.closings.some(c => c.date === closingDate) ? prev.closings.map(c => c.date === closingDate ? item : c) : [...prev.closings, item] }));
    setSelectedDate(closingDate); setClosingOpen(false); setSaving(false); setToast("Fechamento salvo.");
  };
  const deleteExpense = (id: string) => {
    setStore(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) }));
    setConfirmDelete(null); setToast("Gasto excluído.");
  };
  const getDaily = (date: string) => {
    const spend = store.expenses.filter(e => e.date === date).reduce((s, e) => s + e.amountCents, 0);
    const closing = store.closings.find(c => c.date === date);
    return { date, spend, profit: closing?.profitCents ?? null, net: closing ? closing.profitCents - spend : null, count: store.expenses.filter(e => e.date === date).length };
  };
  const allDates = useMemo(() => Array.from(new Set([...store.expenses.map(e => e.date), ...store.closings.map(c => c.date)])).sort((a,b) => b.localeCompare(a)), [store]);
  const filteredExpenses = sortedExpenses.filter(e => (!search || e.description.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase())) && (filterCategory === "Todas" || e.category === filterCategory) && (!filterDate || e.date === filterDate));
  const periodDates = useMemo(() => {
    const today = new Date(); const todayKey = localDate(today);
    if (period === "custom") return allDates.filter(d => d >= customStart && d <= customEnd);
    if (period === "month") return allDates.filter(d => d.slice(0,7) === todayKey.slice(0,7));
    const days = Number(period);
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - days + 1);
    return allDates.filter(d => d >= localDate(start) && d <= todayKey);
  }, [allDates, period, customStart, customEnd]);
  const periodRows = periodDates.map(getDaily).sort((a,b) => a.date.localeCompare(b.date));
  const totalProfit = periodRows.reduce((s,r) => s + (r.profit ?? 0), 0);
  const totalSpend = periodRows.reduce((s,r) => s + r.spend, 0);
  const closedRows = periodRows.filter(r => r.profit !== null);
  const totalNet = totalProfit - totalSpend;
  const maxBar = Math.max(1, ...periodRows.flatMap(r => [r.profit ?? 0, r.spend, Math.abs(r.net ?? 0)]));
  const todayText = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  const exportCsv = () => {
    const rows = [["tipo","data","horario","valor_centavos","descricao","categoria"], ...store.expenses.map(e => ["gasto",e.date,e.time,e.amountCents,e.description,e.category]), ...store.closings.map(c => ["lucro",c.date,"",c.profitCents,"Fechamento diário",""])];
    const csv = rows.map(row => row.map(v => `"${String(v).replace(/"/g,'""')}"`).join(";")).join("\r\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "financas.csv"; a.click(); URL.revokeObjectURL(url);
    setToast("Exportação gerada.");
  };

  const resultClass = (net: number | null) => net === null ? "text-muted-foreground" : net > 0 ? "text-positive" : net < 0 ? "text-negative" : "text-foreground";
  const statusLabel = (net: number | null) => net === null ? "Fechamento pendente" : net > 0 ? "Dia positivo" : net < 0 ? "Dia negativo" : "Dia equilibrado";
  const headerTitle = NAV.find(n => n.id === section)?.label ?? "Dashboard";

  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Carregando seu financeiro…</div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[252px] flex-col border-r border-border bg-[#0b0a10] px-4 py-6 lg:flex">
        <Brand />
        <div className="mt-10 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">Seu financeiro</div>
        <nav className="mt-3 space-y-1">
          {NAV.map(item => <NavButton key={item.id} item={item} active={section === item.id} onClick={() => setSection(item.id)} />)}
        </nav>
        <div className="mt-auto rounded-2xl border border-border bg-card/70 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold"><span className="size-2 rounded-full bg-positive" /> Controle diário</div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">Lucro, gastos e resultado em um só lugar.</p>
        </div>
        <div className="mt-4 flex items-center gap-3 border-t border-border px-2 pt-4">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary"><Wallet size={17} /></div>
          <div className="min-w-0"><p className="truncate text-sm font-semibold">Meu financeiro</p><p className="text-xs text-muted-foreground">Espaço pessoal</p></div>
          <button aria-label="Configurações" onClick={() => setSection("configuracoes")} className="ml-auto rounded-lg p-2 text-muted-foreground hover:bg-accent"><Ellipsis size={17} /></button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-border/80 bg-background/90 px-4 backdrop-blur-xl sm:px-6 lg:ml-[252px] lg:px-9">
        <div className="flex items-center gap-3">
          <button className="rounded-xl border border-border p-2 lg:hidden" onClick={() => setMobileMenu(v => !v)} aria-label="Abrir menu"><Menu size={18} /></button>
          <div className="lg:hidden"><Brand compact /></div>
          <div className="hidden lg:block"><p className="text-sm font-semibold">{headerTitle}</p><p className="mt-0.5 text-xs capitalize text-muted-foreground">{todayText}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground sm:inline-flex"><span className="mr-2 mt-1 size-1.5 rounded-full bg-positive" /> Visão pessoal</span>
          <button onClick={() => openExpense()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_-12px_#8b5cf6] transition hover:bg-primary/90 sm:px-4"><Plus size={16} /> <span className="hidden sm:inline">Adicionar gasto</span><span className="sm:hidden">Gasto</span></button>
        </div>
      </header>

      {mobileMenu && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileMenu(false)}><div className="h-full w-[min(84vw,300px)] border-r border-border bg-[#0b0a10] p-4" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between"><Brand /><button onClick={() => setMobileMenu(false)} className="rounded-lg p-2"><X size={18}/></button></div><nav className="mt-8 space-y-1">{NAV.map(item => <NavButton key={item.id} item={item} active={section === item.id} onClick={() => {setSection(item.id);setMobileMenu(false);}} />)}</nav></div></div>}

      <main className="mx-auto max-w-[1500px] px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:ml-[252px] lg:px-9 lg:pb-12 lg:pt-9">
        {!ready ? <div className="animate-pulse rounded-3xl border border-border bg-card p-10 text-sm text-muted-foreground">Carregando seu financeiro…</div> : (
          <>
            {section === "dashboard" && <section className="space-y-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">{new Date().getHours() < 12 ? "Bom dia" : new Date().getHours() < 18 ? "Boa tarde" : "Boa noite"}, Guilherme</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Seu financeiro<span className="text-primary">.</span></h1><p className="mt-2 text-sm text-muted-foreground">Veja quanto você gastou hoje e se o lucro está cobrindo suas despesas.</p></div><div className="flex items-center gap-2 self-start rounded-xl border border-border bg-card px-3 py-2.5 sm:self-auto"><CalendarDays size={16} className="text-primary"/><input aria-label="Data selecionada" type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-[132px] bg-transparent text-sm outline-none"/></div></div>
              <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
                <div className="hero-surface relative overflow-hidden p-5 sm:p-7"><div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-primary/10 blur-3xl"/><div className="relative flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground"><span className="size-2 rounded-full bg-primary"/> Resultado líquido de {selectedDate === localDate() ? "hoje" : dateLabel(selectedDate, {day:"numeric",month:"long"})}</div><p className={cn("num mt-5 break-words text-4xl font-semibold sm:text-5xl", resultClass(dailyNet))}>{dailyNet === null ? "Pendente" : money(dailyNet)}</p><p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">{dailyNet === null ? <><Clock3 size={15}/> {dailySpend > 0 ? "Gastos registrados; falta informar o lucro." : "Informe o lucro para fechar o dia."}</> : <><span className={cn("flex size-6 items-center justify-center rounded-full", dailyNet > 0 ? "bg-positive/10 text-positive" : dailyNet < 0 ? "bg-negative/10 text-negative" : "bg-secondary text-muted-foreground")}>{dailyNet > 0 ? <ArrowUpRight size={15}/> : dailyNet < 0 ? <ArrowDownRight size={15}/> : <Minus size={14}/>}</span>{statusLabel(dailyNet)}</>}</p></div><div className="hidden size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary sm:flex"><Activity size={22}/></div></div><div className="relative mt-7 flex flex-wrap gap-2 border-t border-border/70 pt-5"><button onClick={() => openClosing(selectedDate)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90"><CircleDollarSign size={16}/>{dailyClosing ? "Editar lucro do dia" : "Informar lucro do dia"}</button><button onClick={() => openExpense()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card/80 px-4 text-sm font-semibold hover:bg-accent"><Plus size={16}/> Adicionar gasto</button></div></div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <MetricCard icon={TrendingUp} label="Lucro do dia" value={dailyClosing ? money(dailyClosing.profitCents) : "Não informado"} detail={dailyClosing ? "Fechamento registrado" : "Fechamento pendente"} tone={dailyClosing ? "purple" : "muted"} />
                  <MetricCard icon={TrendingDown} label="Gastos do dia" value={money(dailySpend)} detail={`${dailyExpenses.length} lançamento${dailyExpenses.length === 1 ? "" : "s"}`} tone="neutral" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard icon={Wallet} label="Saldo líquido" value={dailyNet === null ? "Pendente" : money(dailyNet)} detail={dailyNet === null ? "Informe o lucro para calcular" : statusLabel(dailyNet)} tone={dailyNet === null ? "muted" : dailyNet > 0 ? "positive" : dailyNet < 0 ? "negative" : "neutral"} />
                <MetricCard icon={PiggyBank} label="Lucro consumido" value={!dailyClosing || dailyClosing.profitCents === 0 ? "—" : `${Math.round(dailySpend / dailyClosing.profitCents * 100)}%`} detail={!dailyClosing || dailyClosing.profitCents === 0 ? "Informe o lucro para calcular" : "Gastos ÷ lucro informado"} tone="purple" />
                <MetricCard icon={Receipt} label="Maior gasto" value={dailyExpenses.length ? money(Math.max(...dailyExpenses.map(e => e.amountCents))) : "—"} detail={dailyExpenses.length ? dailyExpenses.reduce((a,b) => a.amountCents > b.amountCents ? a : b).description || "Sem descrição" : "Nenhum gasto registrado"} tone="neutral" />
              </div>
              {dailyClosing && <div className="card-surface p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-semibold">Consumo do lucro</h2><p className="mt-1 text-xs text-muted-foreground">Quanto dos ganhos do dia foi usado em gastos.</p></div><span className={cn("text-lg font-semibold num", dailySpend > dailyClosing.profitCents ? "text-negative" : "text-primary")}>{dailyClosing.profitCents > 0 ? `${Math.round(dailySpend / dailyClosing.profitCents * 100)}%` : "—"}</span></div>{dailyClosing.profitCents > 0 ? <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-secondary"><div className={cn("h-full rounded-full transition-all", dailySpend > dailyClosing.profitCents ? "bg-negative" : "bg-primary")} style={{width:`${Math.min(100,dailySpend / dailyClosing.profitCents * 100)}%`}}/></div> : <p className="mt-4 text-sm text-muted-foreground">Informe um lucro maior que zero para calcular o percentual.</p>}{dailyClosing.profitCents > 0 && dailySpend > dailyClosing.profitCents && <p className="mt-3 text-xs font-medium text-negative">Os gastos ultrapassaram o lucro em {money(dailySpend - dailyClosing.profitCents)}.</p>}</div>}
              <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]"><div className="card-surface p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Gastos recentes</h2><p className="mt-1 text-xs text-muted-foreground">Lançamentos do dia selecionado</p></div><button onClick={() => setSection("gastos")} className="text-xs font-semibold text-primary hover:text-primary-soft">Ver todos <ChevronRight className="ml-1 inline size-3.5"/></button></div>{dailyExpenses.length ? <div className="mt-4 divide-y divide-border/70">{[...dailyExpenses].sort((a,b) => b.time.localeCompare(a.time)).slice(0,5).map(e => <ExpenseRow key={e.id} item={e} onEdit={() => openExpense(e)} onDelete={() => setConfirmDelete(e.id)} />)}</div> : <EmptyState icon={Receipt} title="Nenhum gasto por aqui" description="Registre seu primeiro gasto para acompanhar o saldo do dia." action="Adicionar gasto" onAction={() => openExpense()} />}</div>
              <div className="card-surface p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Resumo do dia</h2><p className="mt-1 text-xs text-muted-foreground">Seu ritmo financeiro</p></div><span className="rounded-xl bg-primary/10 p-2 text-primary"><Sparkles size={17}/></span></div><div className="mt-5 space-y-4"><SummaryLine label="Lançamentos" value={String(dailyExpenses.length)} /><SummaryLine label="Categoria com maior gasto" value={dailyExpenses.length ? Object.entries(dailyExpenses.reduce<Record<string,number>>((acc,e) => ({...acc,[e.category]:(acc[e.category] ?? 0)+e.amountCents}),{})).sort((a,b)=>b[1]-a[1])[0][0] : "—"} /><SummaryLine label="Último lançamento" value={dailyExpenses.length ? [...dailyExpenses].sort((a,b)=>b.time.localeCompare(a.time))[0].time : "—"} /><SummaryLine label="Fechamento" value={dailyClosing ? "Concluído" : "Pendente"} accent={!dailyClosing}/></div></div></div>
            </section>}

            {section === "gastos" && <section className="space-y-6"><PageHeading eyebrow="Movimentações" title="Gastos" description="Cada despesa registrada, organizada e fácil de revisar." action={<button onClick={() => openExpense()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white"><Plus size={16}/> Adicionar gasto</button>}/><div className="grid gap-4 sm:grid-cols-3"><MetricCard icon={Wallet} label="Total no dia" value={money(expensesFor(filterDate).reduce((s,e)=>s+e.amountCents,0))} detail={dateLabel(filterDate,{day:"numeric",month:"long",year:"numeric"})} tone="purple"/><MetricCard icon={Receipt} label="Lançamentos" value={String(expensesFor(filterDate).length)} detail="Na data selecionada" tone="neutral"/><MetricCard icon={Activity} label="Total de gastos" value={money(store.expenses.reduce((s,e)=>s+e.amountCents,0))} detail="Todos os registros" tone="neutral"/></div><div className="card-surface p-4 sm:p-5"><div className="grid gap-3 md:grid-cols-[1fr_180px_170px]"><label className="relative block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar descrição ou categoria" className="field-input pl-9"/></label><select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} className="field-input"><option>Todas</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select><input aria-label="Filtrar por data" type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} className="field-input"/></div><div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Filter size={14}/>{filteredExpenses.length} registro(s) encontrado(s)</div></div><div className="card-surface overflow-hidden"><div className="hidden grid-cols-[minmax(0,1fr)_150px_120px_110px] gap-4 border-b border-border bg-secondary/30 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:grid"><span>Descrição</span><span>Categoria</span><span>Data e hora</span><span className="text-right">Valor</span></div>{filteredExpenses.length ? filteredExpenses.map(e=><ExpenseRow key={e.id} item={e} onEdit={()=>openExpense(e)} onDelete={()=>setConfirmDelete(e.id)}/>) : <EmptyState icon={Search} title="Nenhum gasto encontrado" description="Tente mudar os filtros ou registre uma nova despesa." action="Adicionar gasto" onAction={()=>openExpense()}/>}</div></section>}

            {section === "historico" && <section className="space-y-6"><PageHeading eyebrow="Visão por data" title="Histórico" description="Consulte fechamentos e gastos sem misturar os dias."/><div className="grid gap-4 sm:grid-cols-3"><MetricCard icon={CalendarDays} label="Dias com registros" value={String(allDates.length)} detail="Com gasto ou fechamento" tone="purple"/><MetricCard icon={Check} label="Dias fechados" value={String(store.closings.length)} detail="Lucro informado" tone="positive"/><MetricCard icon={Clock3} label="Pendentes" value={String(allDates.filter(d=>!closingFor(d)).length)} detail="Ainda sem lucro informado" tone="muted"/></div><div className="space-y-3">{allDates.length ? allDates.map(date=>{const row=getDaily(date);return <button key={date} onClick={()=>{setSelectedDate(date);setSection("dashboard");}} className="card-surface flex w-full flex-col gap-4 p-4 text-left transition hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div className="flex items-center gap-3"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><CalendarDays size={19}/></div><div><p className="font-semibold capitalize">{dateLabel(date,{weekday:"short",day:"numeric",month:"long",year:"numeric"})}</p><p className="mt-1 text-xs text-muted-foreground">{row.count} gasto(s) · {row.profit === null ? "Fechamento pendente" : "Fechado"}</p></div></div><div className="grid grid-cols-2 gap-x-5 gap-y-2 sm:flex sm:items-center sm:gap-8"><div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Gastos</p><p className="mt-1 text-sm font-semibold num">{money(row.spend)}</p></div><div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Lucro</p><p className="mt-1 text-sm font-semibold num">{row.profit === null ? "—" : money(row.profit)}</p></div><div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Resultado</p><p className={cn("mt-1 text-sm font-semibold num",resultClass(row.net))}>{row.net === null ? "Pendente" : money(row.net)}</p></div><ChevronRight className="hidden text-muted-foreground sm:block"/></div></button>}) : <div className="card-surface p-10"><EmptyState icon={FileClock} title="Seu histórico começa aqui" description="Depois dos primeiros lançamentos, cada dia aparece organizado nesta tela." action="Registrar gasto" onAction={()=>openExpense()}/></div>}</div></section>}

            {section === "analises" && <section className="space-y-6"><PageHeading eyebrow="Visão de período" title="Análises" description="Entenda a relação entre lucro e gastos usando os seus próprios registros."/><div className="card-surface p-4 sm:p-5"><div className="flex flex-wrap gap-2">{[["7","7 dias"],["30","30 dias"],["month","Este mês"],["custom","Personalizado"]].map(([v,l])=><button key={v} onClick={()=>setPeriod(v)} className={cn("rounded-xl px-3.5 py-2 text-xs font-semibold transition",period===v?"bg-primary text-white":"bg-secondary text-muted-foreground hover:text-foreground")}>{l}</button>)}</div>{period==="custom"&&<div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs text-muted-foreground">De<input type="date" value={customStart} onChange={e=>setCustomStart(e.target.value)} className="field-input mt-1.5"/></label><label className="text-xs text-muted-foreground">Até<input type="date" value={customEnd} onChange={e=>setCustomEnd(e.target.value)} className="field-input mt-1.5"/></label></div>}</div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard icon={TrendingUp} label="Lucro informado" value={money(totalProfit)} detail="Dias com fechamento" tone="purple"/><MetricCard icon={TrendingDown} label="Gastos totais" value={money(totalSpend)} detail="No período selecionado" tone="neutral"/><MetricCard icon={Wallet} label="Resultado acumulado" value={money(totalNet)} detail={`${closedRows.length} dia(s) fechado(s)`} tone={totalNet>0?"positive":totalNet<0?"negative":"neutral"}/><MetricCard icon={Clock3} label="Fechamentos pendentes" value={String(periodRows.filter(r=>r.profit===null).length)} detail="Dias com registros" tone="muted"/></div><div className="grid gap-5 xl:grid-cols-2"><div className="card-surface p-5 sm:p-6"><h2 className="font-semibold">Lucro versus gastos</h2><p className="mt-1 text-xs text-muted-foreground">Comparação diária em reais.</p>{periodRows.length ? <div className="mt-6 space-y-4">{periodRows.map(r=><div key={r.date}><div className="mb-2 flex items-center justify-between gap-3 text-xs"><span className="capitalize text-muted-foreground">{dateLabel(r.date,{day:"2-digit",month:"short"})}</span><span className="num text-foreground">{r.profit===null?"Lucro pendente":money(r.profit)} <span className="text-muted-foreground">/ {money(r.spend)}</span></span></div><div className="flex h-2.5 gap-1"><div title="Lucro informado" className="rounded-full bg-primary" style={{width:`${r.profit===null?0:Math.max(1,r.profit/maxBar*100)}%`}}/><div title="Gastos" className="rounded-full bg-negative/80" style={{width:`${Math.max(r.spend===0?0:1,r.spend/maxBar*100)}%`}}/></div></div>)}</div> : <EmptyState icon={BarChart3} title="Sem dados para analisar" description="Registre gastos e informe o lucro para começar a ver tendências."/>}<div className="mt-5 flex gap-4 text-[11px] text-muted-foreground"><span><i className="mr-1.5 inline-block size-2 rounded-full bg-primary"/>Lucro</span><span><i className="mr-1.5 inline-block size-2 rounded-full bg-negative"/>Gastos</span></div></div><div className="card-surface p-5 sm:p-6"><h2 className="font-semibold">Gastos por categoria</h2><p className="mt-1 text-xs text-muted-foreground">Distribuição das despesas do período.</p>{totalSpend>0 ? <div className="mt-6 space-y-4">{Object.entries(periodRows.reduce<Record<string,number>>((acc,r)=>{store.expenses.filter(e=>e.date===r.date).forEach(e=>acc[e.category]=(acc[e.category]??0)+e.amountCents);return acc;},{})).sort((a,b)=>b[1]-a[1]).map(([cat,cents])=><div key={cat}><div className="mb-2 flex items-center justify-between gap-3 text-xs"><span>{cat}</span><span className="num text-muted-foreground">{money(cents)} · {Math.round(cents/totalSpend*100)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{width:`${cents/totalSpend*100}%`}}/></div></div>)}</div> : <EmptyState icon={Receipt} title="Nenhuma despesa no período" description="Quando houver gastos registrados, você verá aqui as categorias que mais pesam."/>}</div></div><div className="card-surface p-5 sm:p-6"><h2 className="font-semibold">Indicadores do período</h2><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><SummaryLine label="Média de gastos por dia com dados" value={money(periodRows.length?Math.round(totalSpend/periodRows.length):0)}/><SummaryLine label="Média líquida por dia fechado" value={closedRows.length?money(Math.round(totalNet/closedRows.length)):"—"}/><SummaryLine label="Dias positivos" value={String(closedRows.filter(r=>(r.net??0)>0).length)} /><SummaryLine label="Dias negativos" value={String(closedRows.filter(r=>(r.net??0)<0).length)} /><SummaryLine label="Dias equilibrados" value={String(closedRows.filter(r=>r.net===0).length)} /><SummaryLine label="Taxa de consumo do lucro" value={totalProfit>0?`${Math.round(totalSpend/totalProfit*100)}%`:"—"} /><SummaryLine label="Dias com registros" value={String(periodRows.length)}/><SummaryLine label="Dias pendentes" value={String(periodRows.filter(r=>r.profit===null).length)} /></div></div></section>}

            {section === "configuracoes" && <section className="space-y-6"><PageHeading eyebrow="Preferências" title="Configurações" description="Preferências e ferramentas para cuidar dos seus dados."/><div className="grid gap-5 lg:grid-cols-2"><div className="card-surface p-5 sm:p-6"><div className="flex items-center gap-3"><div className="rounded-xl bg-primary/10 p-3 text-primary"><Settings2 size={20}/></div><div><h2 className="font-semibold">Preferências gerais</h2><p className="mt-1 text-xs text-muted-foreground">Configurações atuais do Finanças</p></div></div><div className="mt-6 divide-y divide-border/70"><SummaryLine label="Moeda" value="Real brasileiro (BRL)"/><SummaryLine label="Formato" value="R$ 1.250,00"/><SummaryLine label="Fuso horário" value={Intl.DateTimeFormat().resolvedOptions().timeZone}/><SummaryLine label="Armazenamento atual" value="Neste navegador"/></div></div><div className="card-surface p-5 sm:p-6"><div className="flex items-center gap-3"><div className="rounded-xl bg-primary/10 p-3 text-primary"><Download size={20}/></div><div><h2 className="font-semibold">Seus dados</h2><p className="mt-1 text-xs text-muted-foreground">Exporte uma cópia dos lançamentos em CSV.</p></div></div><p className="mt-5 text-sm leading-6 text-muted-foreground">O arquivo inclui gastos e fechamentos diários, com valores em centavos para manter a precisão dos registros.</p><button onClick={exportCsv} className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-secondary/60 px-4 text-sm font-semibold hover:bg-accent"><Download size={16}/> Exportar CSV</button><div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4"><p className="text-sm font-semibold">Sobre o armazenamento</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Nesta versão, os dados ficam salvos no armazenamento local deste navegador e dispositivo. Eles não sincronizam automaticamente com outros dispositivos. Para uso definitivo, é necessário conectar a persistência segura do backend.</p></div></div></div></section>}
          </>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-[#0d0b12]/95 px-1 pb-safe pt-2 backdrop-blur-xl lg:hidden">{NAV.map(item=>{const Icon=item.icon;return <button key={item.id} onClick={()=>setSection(item.id)} className={cn("flex min-w-0 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-medium transition",section===item.id?"text-primary":"text-muted-foreground")}><Icon size={19} strokeWidth={section===item.id?2.4:1.8}/><span>{item.label}</span></button>})}</nav>

      {expenseOpen && <Modal title={editing ? "Editar gasto" : "Adicionar gasto"} subtitle="Um valor e pronto. Sem categorias nem campos extras." onClose={()=>setExpenseOpen(false)}><form onSubmit={saveExpense} className="space-y-4"><label className="block text-xs font-semibold text-muted-foreground">Quanto você gastou? (R$)<input autoFocus type="text" inputMode="decimal" autoComplete="off" placeholder="5,00" value={expenseAmount} onChange={e=>setExpenseAmount(e.target.value)} className="field-input mt-2 h-16 text-2xl font-semibold num" required/><span className="mt-2 block text-xs font-normal">Digite apenas o valor. A data e o horário são preenchidos automaticamente.</span></label><div className="sticky bottom-0 flex gap-3 border-t border-border bg-card pt-4"><button type="button" onClick={()=>setExpenseOpen(false)} className="h-11 flex-1 rounded-xl border border-border text-sm font-semibold">Cancelar</button><button disabled={saving} className="h-11 flex-1 rounded-xl bg-primary text-sm font-semibold text-white disabled:opacity-60">{saving?"Salvando…":editing?"Salvar alterações":"Salvar gasto"}</button></div></form></Modal>}
      {closingOpen && <Modal title={closingFor(closingDate) ? "Editar fechamento" : "Informar lucro do dia"} subtitle="Informe o lucro total consolidado desta data. O valor anterior será substituído." onClose={()=>setClosingOpen(false)}><form onSubmit={saveClosing} className="space-y-4"><label className="block text-xs font-semibold text-muted-foreground">Data de referência<input type="date" value={closingDate} onChange={e=>{setClosingDate(e.target.value);const found=store.closings.find(c=>c.date===e.target.value);setProfitInput(found?amountInput(found.profitCents):"");}} className="field-input mt-2"/></label><label className="block text-xs font-semibold text-muted-foreground">Lucro total (R$)<input autoFocus type="text" inputMode="decimal" placeholder="0,00" value={profitInput} onChange={e=>setProfitInput(e.target.value)} className="field-input mt-2 h-14 text-xl font-semibold num" required/></label><div className="rounded-xl border border-border bg-secondary/40 p-4"><div className="flex justify-between text-sm"><span className="text-muted-foreground">Gastos registrados</span><span className="num font-semibold">{money(expensesFor(closingDate).reduce((s,e)=>s+e.amountCents,0))}</span></div><div className="mt-3 flex justify-between text-sm"><span className="text-muted-foreground">Resultado estimado</span><span className="num font-semibold">{Number.isFinite(parseMoney(profitInput))?money(parseMoney(profitInput)-expensesFor(closingDate).reduce((s,e)=>s+e.amountCents,0)):"—"}</span></div></div><div className="flex gap-3 border-t border-border pt-4"><button type="button" onClick={()=>setClosingOpen(false)} className="h-11 flex-1 rounded-xl border border-border text-sm font-semibold">Cancelar</button><button disabled={saving} className="h-11 flex-1 rounded-xl bg-primary text-sm font-semibold text-white disabled:opacity-60">{saving?"Salvando…":"Salvar lucro"}</button></div></form></Modal>}
      {confirmDelete && <Modal title="Excluir este gasto?" subtitle="Essa ação não pode ser desfeita. O resultado do dia será recalculado." onClose={()=>setConfirmDelete(null)}><div className="flex gap-3"><button onClick={()=>setConfirmDelete(null)} className="h-11 flex-1 rounded-xl border border-border text-sm font-semibold">Cancelar</button><button onClick={()=>deleteExpense(confirmDelete)} className="h-11 flex-1 rounded-xl bg-negative text-sm font-semibold text-white"><Trash2 className="mr-2 inline size-4"/>Excluir gasto</button></div></Modal>}
      {toast && <div role="status" className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium shadow-2xl lg:bottom-6"><Check size={16} className="text-positive"/>{toast}</div>}
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-3"><img src="/financas-logo.webp" alt="Logo Finanças" className="size-10 shrink-0 rounded-xl object-cover" />{!compact && <div><p className="text-sm font-bold tracking-tight">Finanças</p><p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[.19em] text-muted-foreground">Controle diário</p></div>}</div>;
}
function NavButton({ item, active, onClick }: { item: {id: Section;label:string;icon:typeof LayoutDashboard};active:boolean;onClick:()=>void }) {
  const Icon=item.icon;
  return <button onClick={onClick} className={cn("group flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition",active?"bg-primary/12 text-primary shadow-[inset_2px_0_0_#8b5cf6]":"text-muted-foreground hover:bg-accent/70 hover:text-foreground")}><Icon size={18} strokeWidth={active?2.3:1.8}/>{item.label}{active&&<span className="ml-auto size-1.5 rounded-full bg-primary"/>}</button>;
}
function MetricCard({ icon: Icon, label, value, detail, tone }: {icon:typeof Wallet;label:string;value:string;detail:string;tone:"purple"|"positive"|"negative"|"neutral"|"muted"}) {
  const colors={purple:"bg-primary/10 text-primary",positive:"bg-positive/10 text-positive",negative:"bg-negative/10 text-negative",neutral:"bg-secondary text-muted-foreground",muted:"bg-secondary text-muted-foreground"};
  const valueColor=tone==="positive"?"text-positive":tone==="negative"?"text-negative":tone==="purple"?"text-foreground":"text-foreground";
  return <div className="card-surface min-w-0 p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><span className="text-xs font-medium text-muted-foreground">{label}</span><span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl",colors[tone])}><Icon size={17}/></span></div><p className={cn("num mt-4 break-words text-xl font-semibold sm:text-2xl",valueColor)}>{value}</p><p className="mt-1.5 truncate text-[11px] text-muted-foreground">{detail}</p></div>;
}
function PageHeading({eyebrow,title,description,action}:{eyebrow:string;title:string;description:string;action?:React.ReactNode}) {
  return <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">{eyebrow}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}<span className="text-primary">.</span></h1><p className="mt-2 text-sm text-muted-foreground">{description}</p></div>{action}</div>;
}
function SummaryLine({label,value,accent=false}:{label:string;value:string;accent?:boolean}) {
  return <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"><span className="text-xs text-muted-foreground">{label}</span><span className={cn("max-w-[60%] text-right text-xs font-semibold",accent?"text-primary":"text-foreground")}>{value}</span></div>;
}
function ExpenseRow({item,onEdit,onDelete}:{item:Expense;onEdit:()=>void;onDelete:()=>void}) {
  return <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3.5 last:border-b-0 sm:grid sm:grid-cols-[minmax(0,1fr)_150px_120px_110px] sm:gap-4 sm:px-5"><div className="flex min-w-0 flex-1 items-center gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground"><Receipt size={17}/></div><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.description || item.category}</p><p className="mt-1 truncate text-[11px] text-muted-foreground sm:hidden">{item.category} · {dateLabel(item.date)} · {item.time}</p><p className="mt-1 hidden truncate text-[11px] text-muted-foreground sm:block">{item.description ? item.category : "Sem descrição"}</p></div></div><span className="hidden truncate text-xs text-muted-foreground sm:block">{item.category}</span><span className="hidden text-xs text-muted-foreground sm:block">{dateLabel(item.date)} · {item.time}</span><div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:justify-end sm:gap-2"><span className="num text-sm font-semibold">{money(item.amountCents)}</span><div className="flex gap-0.5"><button onClick={onEdit} aria-label="Editar gasto" className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"><Pencil size={14}/></button><button onClick={onDelete} aria-label="Excluir gasto" className="rounded-lg p-1.5 text-muted-foreground hover:bg-negative/10 hover:text-negative"><Trash2 size={14}/></button></div></div></div>;
}
function EmptyState({icon:Icon,title,description,action,onAction}:{icon:typeof Receipt;title:string;description:string;action?:string;onAction?:()=>void}) {
  return <div className="flex flex-col items-center px-5 py-10 text-center"><span className="flex size-12 items-center justify-center rounded-2xl border border-border bg-secondary/70 text-muted-foreground"><Icon size={20}/></span><h3 className="mt-4 text-sm font-semibold">{title}</h3><p className="mt-2 max-w-xs text-xs leading-5 text-muted-foreground">{description}</p>{action&&onAction&&<button onClick={onAction} className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl bg-primary/10 px-3 text-xs font-semibold text-primary hover:bg-primary/15"><Plus size={14}/>{action}</button>}</div>;
}
function Modal({title,subtitle,onClose,children}:{title:string;subtitle:string;onClose:()=>void;children:React.ReactNode}) {
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><div role="dialog" aria-modal="true" aria-label={title} className="max-h-[min(92dvh,800px)] w-full overflow-y-auto rounded-t-3xl border border-border bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-6"><div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold">{title}</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{subtitle}</p></div><button onClick={onClose} aria-label="Fechar" className="rounded-xl p-2 text-muted-foreground hover:bg-accent"><X size={18}/></button></div>{children}</div></div>;
}
