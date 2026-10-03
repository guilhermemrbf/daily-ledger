import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export type DbExpense = {
  id: string;
  amount_cents: number;
  description: string | null;
  category: string;
  transaction_date: string;
  transaction_time: string;
  created_at: string;
};

export type DbClosing = {
  closing_date: string;
  profit_cents: number;
  updated_at: string;
};

export async function loadFinanceData(userId: string) {
  if (!supabase) throw new Error("O backend ainda não foi configurado.");
  const [expensesResult, closingsResult] = await Promise.all([
    supabase.from("expenses").select("id,amount_cents,description,category,transaction_date,transaction_time,created_at").eq("user_id", userId).order("transaction_date", { ascending: false }),
    supabase.from("daily_closings").select("closing_date,profit_cents,updated_at").eq("user_id", userId).order("closing_date", { ascending: false }),
  ]);
  if (expensesResult.error) throw expensesResult.error;
  if (closingsResult.error) throw closingsResult.error;
  return {
    expenses: (expensesResult.data ?? []).map((e) => ({
      id: e.id,
      amountCents: Number(e.amount_cents),
      description: e.description ?? "",
      category: e.category,
      date: e.transaction_date,
      time: String(e.transaction_time ?? "00:00:00").slice(0, 5),
      createdAt: e.created_at,
    })),
    closings: (closingsResult.data ?? []).map((c) => ({
      date: c.closing_date,
      profitCents: Number(c.profit_cents),
      updatedAt: c.updated_at,
    })),
  };
}

export async function saveExpenseToCloud(userId: string, expense: {
  id: string;
  amountCents: number;
  description: string;
  category: string;
  date: string;
  time: string;
  createdAt: string;
}) {
  if (!supabase) throw new Error("O backend ainda não foi configurado.");
  const { error } = await supabase.from("expenses").upsert({
    id: expense.id,
    user_id: userId,
    amount_cents: expense.amountCents,
    description: expense.description || null,
    category: expense.category,
    transaction_date: expense.date,
    transaction_time: expense.time,
    created_at: expense.createdAt,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function deleteExpenseFromCloud(id: string) {
  if (!supabase) throw new Error("O backend ainda não foi configurado.");
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}

export async function saveClosingToCloud(userId: string, closing: { date: string; profitCents: number; updatedAt: string }) {
  if (!supabase) throw new Error("O backend ainda não foi configurado.");
  const { error } = await supabase.from("daily_closings").upsert({
    user_id: userId,
    closing_date: closing.date,
    profit_cents: closing.profitCents,
    updated_at: closing.updatedAt,
  }, { onConflict: "user_id,closing_date" });
  if (error) throw error;
}
