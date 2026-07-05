import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface FixedExpense {
  id: string;
  user_id: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  subcategory?: string | null;
  note?: string | null;
  label?: string | null;
  created_at: string;
  updated_at: string;
}

export const useFixedExpenses = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: fixedExpenses = [], isLoading } = useQuery({
    queryKey: ["fixed_expenses", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from("fixed_expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as FixedExpense[];
    },
    enabled: !!user,
  });

  const addFixedExpense = useMutation({
    mutationFn: async (payload: Omit<FixedExpense, "id" | "user_id" | "created_at" | "updated_at">) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("fixed_expenses")
        .insert({ ...payload, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as FixedExpense;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fixed_expenses"] }),
  });

  const updateFixedExpense = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<FixedExpense> }) => {
      const { error } = await (supabase as any).from("fixed_expenses").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fixed_expenses"] }),
  });

  const deleteFixedExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("fixed_expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fixed_expenses"] }),
  });

  return {
    fixedExpenses,
    isLoading,
    addFixedExpense: addFixedExpense.mutateAsync,
    updateFixedExpense: updateFixedExpense.mutateAsync,
    deleteFixedExpense: deleteFixedExpense.mutateAsync,
  };
};
