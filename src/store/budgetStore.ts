import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Budget {
  id: string;
  categoryId?: string; // undefined = global budget
  amount: number;
  period: 'monthly' | 'weekly' | 'daily';
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  enabled: boolean;
}

interface BudgetState {
  budgets: Budget[];
  fixedExpenses: FixedExpense[];
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addFixedExpense: (expense: Omit<FixedExpense, 'id'>) => void;
  updateFixedExpense: (id: string, updates: Partial<FixedExpense>) => void;
  deleteFixedExpense: (id: string) => void;
  toggleFixedExpense: (id: string) => void;
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set) => ({
      budgets: [],
      fixedExpenses: [],
      addBudget: (budget) =>
        set((state) => ({
          budgets: [...state.budgets, { ...budget, id: crypto.randomUUID() }],
        })),
      updateBudget: (id, updates) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        })),
      deleteBudget: (id) =>
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        })),
      addFixedExpense: (expense) =>
        set((state) => ({
          fixedExpenses: [
            ...state.fixedExpenses,
            { ...expense, id: crypto.randomUUID() },
          ],
        })),
      updateFixedExpense: (id, updates) =>
        set((state) => ({
          fixedExpenses: state.fixedExpenses.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),
      deleteFixedExpense: (id) =>
        set((state) => ({
          fixedExpenses: state.fixedExpenses.filter((e) => e.id !== id),
        })),
      toggleFixedExpense: (id) =>
        set((state) => ({
          fixedExpenses: state.fixedExpenses.map((e) =>
            e.id === id ? { ...e, enabled: !e.enabled } : e
          ),
        })),
    }),
    {
      name: 'mondjai-budgets',
    }
  )
);
