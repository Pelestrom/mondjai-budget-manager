import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  fixedExpensesEnabled: boolean;
  detailedStatsEnabled: boolean;
  smartBarEnabled: boolean;
  notificationsEnabled: boolean;
  toggleFixedExpenses: () => void;
  toggleDetailedStats: () => void;
  toggleSmartBar: () => void;
  toggleNotifications: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      fixedExpensesEnabled: true,
      detailedStatsEnabled: true,
      smartBarEnabled: true,
      notificationsEnabled: true,
      toggleFixedExpenses: () =>
        set((state) => ({ fixedExpensesEnabled: !state.fixedExpensesEnabled })),
      toggleDetailedStats: () =>
        set((state) => ({ detailedStatsEnabled: !state.detailedStatsEnabled })),
      toggleSmartBar: () =>
        set((state) => ({ smartBarEnabled: !state.smartBarEnabled })),
      toggleNotifications: () =>
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
    }),
    {
      name: 'mondjai-settings',
    }
  )
);
