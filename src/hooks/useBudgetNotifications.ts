import { useEffect, useRef } from 'react';
import { useBudgetStore } from '@/store/budgetStore';
import { useTransactionStore } from '@/store/transactionStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useSettingsStore } from '@/store/settingsStore';
import { startOfWeek, startOfMonth, endOfWeek, endOfMonth, isWithinInterval, isPast } from 'date-fns';

export const useBudgetNotifications = () => {
  const { budgets, globalBudget } = useBudgetStore();
  const transactions = useTransactionStore((state) => state.transactions);
  const categories = useCategoryStore((state) => state.categories);
  const { addNotification, notifications } = useNotificationStore();
  const notificationsEnabled = useSettingsStore((state) => state.notificationsEnabled);
  const lastChecked = useRef<Record<string, string>>({});

  const getBudgetPeriod = (period: string, startDate?: string, endDate?: string) => {
    const now = new Date();
    if (period === "weekly") {
      return { start: startOfWeek(now), end: endOfWeek(now) };
    } else if (period === "custom" && startDate && endDate) {
      return { start: new Date(startDate), end: new Date(endDate) };
    }
    return { start: startOfMonth(now), end: endOfMonth(now) };
  };

  useEffect(() => {
    if (!notificationsEnabled) return;

    // Check global budget
    if (globalBudget) {
      const { start, end } = getBudgetPeriod(globalBudget.period, globalBudget.startDate, globalBudget.endDate);
      
      // Check if budget period has expired
      if (globalBudget.period === 'custom' && globalBudget.endDate && isPast(new Date(globalBudget.endDate))) {
        const expiredKey = `global-expired-${globalBudget.endDate}`;
        if (lastChecked.current[expiredKey] !== 'notified') {
          addNotification({
            title: "Budget expiré",
            message: "Votre budget global a expiré. Veuillez le réinitialiser et en définir un nouveau si nécessaire.",
            type: "info",
          });
          lastChecked.current[expiredKey] = 'notified';
        }
      }

      const totalExpenses = transactions
        .filter((t) => t.type === "expense" && isWithinInterval(new Date(t.date), { start, end }))
        .reduce((sum, t) => sum + t.amount, 0);
      
      const percentage = (totalExpenses / globalBudget.amount) * 100;
      const checkKey = `global-${Math.floor(percentage / 10)}`;

      if (lastChecked.current.global !== checkKey) {
        if (percentage >= 100) {
          addNotification({
            title: "Budget global dépassé!",
            message: `Vous avez dépassé votre budget global de ${(totalExpenses - globalBudget.amount).toLocaleString()} ${globalBudget.amount > 0 ? '' : 'FCFA'}`,
            type: "error",
          });
        } else if (percentage >= 80 && percentage < 100) {
          addNotification({
            title: "Attention au budget!",
            message: `Vous avez utilisé ${percentage.toFixed(0)}% de votre budget global. Il vous reste ${(globalBudget.amount - totalExpenses).toLocaleString()}.`,
            type: "warning",
          });
        } else if (percentage >= 50 && percentage < 70) {
          addNotification({
            title: "Mi-parcours budget",
            message: `Vous avez utilisé ${percentage.toFixed(0)}% de votre budget global. Continuez à bien gérer!`,
            type: "info",
          });
        }
        lastChecked.current.global = checkKey;
      }
    }

    // Check category budgets
    budgets.forEach((budget) => {
      if (!budget.categoryId) return;
      
      const category = categories.find((c) => c.id === budget.categoryId);
      if (!category) return;

      const { start, end } = getBudgetPeriod(budget.period, budget.startDate, budget.endDate);
      
      // Check if budget period has expired
      if (budget.period === 'custom' && budget.endDate && isPast(new Date(budget.endDate))) {
        const expiredKey = `cat-expired-${budget.id}-${budget.endDate}`;
        if (lastChecked.current[expiredKey] !== 'notified') {
          addNotification({
            title: `Budget ${category.name} expiré`,
            message: `Le budget de la catégorie "${category.name}" a expiré. Veuillez le réinitialiser.`,
            type: "info",
          });
          lastChecked.current[expiredKey] = 'notified';
        }
      }

      const spent = transactions
        .filter(
          (t) =>
            t.type === "expense" &&
            t.category === category.name &&
            isWithinInterval(new Date(t.date), { start, end })
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = (spent / budget.amount) * 100;
      const checkKey = `${budget.id}-${Math.floor(percentage / 10)}`;

      if (lastChecked.current[budget.id] !== checkKey) {
        if (percentage >= 100) {
          addNotification({
            title: `Budget ${category.name} dépassé!`,
            message: `Vous avez dépassé le budget de la catégorie "${category.name}" de ${(spent - budget.amount).toLocaleString()}.`,
            type: "error",
          });
        } else if (percentage >= 80 && percentage < 100) {
          addNotification({
            title: `Alerte budget ${category.name}`,
            message: `Vous avez utilisé ${percentage.toFixed(0)}% du budget "${category.name}". Attention!`,
            type: "warning",
          });
        } else if (percentage >= 50 && percentage < 70) {
          addNotification({
            title: `Budget ${category.name} à mi-chemin`,
            message: `${percentage.toFixed(0)}% du budget "${category.name}" utilisé. Continuez comme ça!`,
            type: "info",
          });
        }
        lastChecked.current[budget.id] = checkKey;
      }
    });
  }, [transactions, globalBudget, budgets, categories, addNotification, notificationsEnabled]);
};
