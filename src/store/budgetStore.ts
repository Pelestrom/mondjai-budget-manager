import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Budget {
  id: string;
  categoryId?: string; // undefined = global budget
  amount: number;
  period: 'monthly' | 'weekly' | 'custom';
  startDate?: string;
  endDate?: string;
}

interface BudgetState {
  budgets: Budget[];
  globalBudget: Budget | null;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  setGlobalBudget: (budget: Omit<Budget, 'id'>) => void;
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set) => ({
      budgets: [],
      globalBudget: null,
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
      setGlobalBudget: (budget) =>
        set(() => ({
          globalBudget: { ...budget, id: 'global' },
        })),
    }),
    {
      name: 'mondjai-budgets',
    }
  )
);
