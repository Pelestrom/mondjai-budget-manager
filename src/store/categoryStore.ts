import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color?: string;
  subcategories?: string[];
}

interface CategoryState {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  initializeDefaultCategories: () => void;
}

const defaultCategories: Omit<Category, 'id'>[] = [
  { name: 'Nourriture', icon: 'UtensilsCrossed', color: '#FF6B6B' },
  { name: 'Transport', icon: 'Car', color: '#4ECDC4' },
  { name: 'Logement', icon: 'Home', color: '#45B7D1' },
  { name: 'Internet', icon: 'Wifi', color: '#96CEB4' },
  { name: 'Santé', icon: 'Heart', color: '#74B9FF' },
  { name: 'Études', icon: 'GraduationCap', color: '#00B894' },
  {
    name: 'Urgences',
    icon: 'AlertTriangle',
    color: '#FF7675',
    subcategories: ['Maladie', 'Réparations'],
  },
];

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set) => ({
      categories: [],
      addCategory: (category) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { ...category, id: crypto.randomUUID() },
          ],
        })),
      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),
      initializeDefaultCategories: () =>
        set((state) => {
          if (state.categories.length === 0) {
            return {
              categories: defaultCategories.map((c) => ({
                ...c,
                id: crypto.randomUUID(),
              })),
            };
          }
          return state;
        }),
    }),
    {
      name: 'mondjai-categories',
    }
  )
);
