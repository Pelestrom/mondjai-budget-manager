import { useEffect, useRef } from 'react';
import { useBudgets } from './useBudgets';
import { useTransactions } from './useTransactions';
import { useCategories } from './useCategories';
import { useNotifications } from './useNotifications';
import { useSettings } from './useSettings';
import { startOfWeek, startOfMonth, endOfWeek, endOfMonth, isWithinInterval, isPast } from 'date-fns';

export const useBudgetNotificationsDB = () => {
  const { budgets, globalBudget } = useBudgets();
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { addNotification } = useNotifications();
  const { settings } = useSettings();
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
    if (!settings?.notifications_enabled) return;

    // Check global budget
    if (globalBudget) {
      const { start, end } = getBudgetPeriod(globalBudget.period, globalBudget.start_date ?? undefined, globalBudget.end_date ?? undefined);
      
      // Check if budget period has expired
      if (globalBudget.period === 'custom' && globalBudget.end_date && isPast(new Date(globalBudget.end_date))) {
        const expiredKey = `global-expired-${globalBudget.end_date}`;
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
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const percentage = (totalExpenses / globalBudget.amount) * 100;
      const checkKey = `global-${Math.floor(percentage / 10)}`;

      if (lastChecked.current.global !== checkKey) {
        if (percentage >= 100) {
          addNotification({
            title: "Budget global dépassé!",
            message: `Vous avez dépassé votre budget global de ${(totalExpenses - globalBudget.amount).toLocaleString()}`,
            type: "error",
          });
        } else if (percentage >= 80 && percentage < 100) {
          addNotification({
            title: "Attention au budget!",
            message: `Vous avez utilisé ${percentage.toFixed(0)}% de votre budget global.`,
            type: "warning",
          });
        } else if (percentage >= 50 && percentage < 70) {
          addNotification({
            title: "Mi-parcours budget",
            message: `Vous avez utilisé ${percentage.toFixed(0)}% de votre budget global.`,
            type: "info",
          });
        }
        lastChecked.current.global = checkKey;
      }
    }

    // Check category budgets
    budgets.forEach((budget) => {
      if (!budget.category_id) return;
      
      const category = categories.find((c) => c.id === budget.category_id);
      if (!category) return;

      const { start, end } = getBudgetPeriod(budget.period, budget.start_date ?? undefined, budget.end_date ?? undefined);
      
      if (budget.period === 'custom' && budget.end_date && isPast(new Date(budget.end_date))) {
        const expiredKey = `cat-expired-${budget.id}-${budget.end_date}`;
        if (lastChecked.current[expiredKey] !== 'notified') {
          addNotification({
            title: `Budget ${category.name} expiré`,
            message: `Le budget "${category.name}" a expiré. Veuillez le réinitialiser.`,
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
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const percentage = (spent / budget.amount) * 100;
      const checkKey = `${budget.id}-${Math.floor(percentage / 10)}`;

      if (lastChecked.current[budget.id] !== checkKey) {
        if (percentage >= 100) {
          addNotification({
            title: `Budget ${category.name} dépassé!`,
            message: `Vous avez dépassé le budget "${category.name}" de ${(spent - budget.amount).toLocaleString()}.`,
            type: "error",
          });
        } else if (percentage >= 80 && percentage < 100) {
          addNotification({
            title: `Alerte budget ${category.name}`,
            message: `Vous avez utilisé ${percentage.toFixed(0)}% du budget "${category.name}".`,
            type: "warning",
          });
        } else if (percentage >= 50 && percentage < 70) {
          addNotification({
            title: `Budget ${category.name} à mi-chemin`,
            message: `${percentage.toFixed(0)}% du budget "${category.name}" utilisé.`,
            type: "info",
          });
        }
        lastChecked.current[budget.id] = checkKey;
      }
    });
  }, [transactions, globalBudget, budgets, categories, addNotification, settings?.notifications_enabled]);
};
