// Data access + react-query hooks. RLS scopes every row to the signed-in user.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Expense = Tables<"expenses">;
export type Closing = Tables<"daily_closings">;
export type Category = Tables<"categories">;

export const qk = { expenses: ["expenses"], closings: ["closings"], categories: ["categories"] } as const;

function friendly(err: unknown): Error {
  const msg = err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err);
  if (/fetch|network|Failed/i.test(msg)) return new Error("Sem conexão. Verifique a internet e tente novamente.");
  return new Error("Não foi possível concluir. Tente novamente.");
}

async function userId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error("Sessão expirada. Entre novamente.");
  return id;
}

async function fetchAllExpenses(): Promise<Expense[]> {
  const out: Expense[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from("expenses").select("*")
      .order("transaction_date", { ascending: false })
      .range(from, from + 999);
    if (error) throw friendly(error);
    out.push(...data);
    if (data.length < 1000) return out;
  }
}

export function useExpenses() {
  return useQuery({ queryKey: qk.expenses, queryFn: fetchAllExpenses });
}

export function useClosings() {
  return useQuery({
    queryKey: qk.closings,
    queryFn: async () => {
      const { data, error } = await supabase.from("daily_closings").select("*").order("closing_date", { ascending: false }).limit(5000);
      if (error) throw friendly(error);
      return data;
    },
  });
}

export function useCustomCategories() {
  return useQuery({
    queryKey: qk.categories,
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("created_at");
      if (error) throw friendly(error);
      return data;
    },
  });
}

export interface ExpenseInput {
  id: string; // client-generated so retries never duplicate
  amount_cents: number;
  description: string | null;
  category: string;
  transaction_date: string;
  transaction_time: string;
}

export function useSaveExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ExpenseInput) => {
      const uid = await userId();
      const { error } = await supabase.from("expenses").upsert({ ...input, user_id: uid }, { onConflict: "id" });
      if (error) throw friendly(error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.expenses }),
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw friendly(error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.expenses }),
  });
}

/** One consolidated profit per day: upsert replaces, never sums. */
export function useSaveClosing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { closing_date: string; profit_cents: number }) => {
      const uid = await userId();
      const { error } = await supabase
        .from("daily_closings")
        .upsert({ ...input, user_id: uid }, { onConflict: "user_id,closing_date" });
      if (error) throw friendly(error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.closings }),
  });
}

export function useDeleteClosing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (date: string) => {
      const { error } = await supabase.from("daily_closings").delete().eq("closing_date", date);
      if (error) throw friendly(error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.closings }),
  });
}

export function useAddCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const uid = await userId();
      const { error } = await supabase.from("categories").insert({ name, user_id: uid });
      if (error) {
        if (error.code === "23505") throw new Error("Essa categoria já existe.");
        throw friendly(error);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.categories }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw friendly(error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.categories }),
  });
}
