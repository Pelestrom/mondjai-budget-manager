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
  { name: 'Nourriture', icon: '🍔', color: '#FF6B6B' },
  { name: 'Transport', icon: '🚗', color: '#4ECDC4' },
  { name: 'Logement', icon: '🏠', color: '#45B7D1' },
  { name: 'Internet', icon: '📶', color: '#96CEB4' },
  { name: 'Sorties', icon: '🎉', color: '#FFEAA7' },
  { name: 'Travail', icon: '💼', color: '#DFE6E9' },
  { name: 'Cadeau', icon: '🎁', color: '#FD79A8' },
  { name: 'Santé', icon: '🏥', color: '#74B9FF' },
  { name: 'Médicaments', icon: '💊', color: '#A29BFE' },
  { name: 'Études', icon: '🎓', color: '#00B894' },
  {
    name: 'Urgences',
    icon: '🌧',
    color: '#FF7675',
    subcategories: ['Maladie', 'Réparations'],
  },
  { name: 'Autre', icon: '➕', color: '#B2BEC3' },
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
