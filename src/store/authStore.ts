import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  username: string;
  isStudent: boolean;
  currency: string;
  rememberMe: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  biometricEnabled: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setBiometric: (enabled: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      biometricEnabled: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      setBiometric: (enabled) => set({ biometricEnabled: enabled }),
    }),
    {
      name: 'mondjai-auth',
    }
  )
);
