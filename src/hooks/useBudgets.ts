import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface Budget {
  id: string;
  user_id: string;
  category_id?: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'custom';
  start_date?: string;
  end_date?: string;
  is_global: boolean;
  created_at: string;
}

export const useBudgets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['budgets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Budget[];
    },
    enabled: !!user,
  });

  const globalBudget = budgets.find((b) => b.is_global);
  const categoryBudgets = budgets.filter((b) => !b.is_global);

  const addBudgetMutation = useMutation({
    mutationFn: async (budget: Omit<Budget, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('budgets')
        .insert({ ...budget, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Budget> }) => {
      const { error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const setGlobalBudgetMutation = useMutation({
    mutationFn: async (budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'is_global' | 'category_id'>) => {
      if (!user) throw new Error('Not authenticated');
      
      // Delete existing global budget if exists
      if (globalBudget) {
        await supabase
          .from('budgets')
          .delete()
          .eq('id', globalBudget.id);
      }
      
      const { data, error } = await supabase
        .from('budgets')
        .insert({ ...budget, user_id: user.id, is_global: true, category_id: null })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const resetAllBudgetsMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  return {
    budgets: categoryBudgets,
    globalBudget,
    isLoading,
    addBudget: addBudgetMutation.mutateAsync,
    updateBudget: updateBudgetMutation.mutateAsync,
    deleteBudget: deleteBudgetMutation.mutateAsync,
    setGlobalBudget: setGlobalBudgetMutation.mutateAsync,
    resetAllBudgets: resetAllBudgetsMutation.mutateAsync,
  };
};
