import { useEffect, useMemo, useRef } from 'react';
import { format, startOfMonth, startOfWeek, endOfMonth, endOfWeek, isPast, isWithinInterval, differenceInHours } from 'date-fns';
import { useAuth } from './useAuth';
import { useBudgets } from './useBudgets';
import { useCategories } from './useCategories';
import { useNotifications } from './useNotifications';
import { useSettings } from './useSettings';
import { useTransactions } from './useTransactions';

type NotifType = 'info' | 'warning' | 'success' | 'error';

// Cooldown in hours for warning/error notifications to prevent spam
const ALERT_COOLDOWN_HOURS = 12;

export const useBudgetNotificationsDB = () => {
  const { user } = useAuth();
  const { budgets, globalBudget } = useBudgets();
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { notifications, addNotification, isLoading: notificationsLoading } = useNotifications();
  const { settings, isLoading: settingsLoading } = useSettings();

  const storageKey = useMemo(() => {
    if (!user?.id) return null;
    return `mondjai:budget-notif-dedupe:${user.id}`;
  }, [user?.id]);

  const lastChecked = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      lastChecked.current = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    } catch {
      lastChecked.current = {};
    }
  }, [storageKey]);

  const persist = () => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(lastChecked.current));
    } catch {
      // ignore storage quota / private mode
    }
  };

  const markSent = (key: string) => {
    lastChecked.current[key] = new Date().toISOString();
    persist();
  };

  const alreadySent = (key: string) => Boolean(lastChecked.current[key]);

  // Check if a notification was sent within the cooldown period (for warning/error types)
  const isWithinCooldown = (key: string) => {
    const lastSentTime = lastChecked.current[key];
    if (!lastSentTime) return false;
    
    const hoursSinceLastSent = differenceInHours(new Date(), new Date(lastSentTime));
    return hoursSinceLastSent < ALERT_COOLDOWN_HOURS;
  };

  const getBudgetPeriod = (period: string, startDate?: string, endDate?: string) => {
    const now = new Date();
    if (period === 'weekly') {
      return { start: startOfWeek(now), end: endOfWeek(now) };
    }
    if (period === 'custom' && startDate && endDate) {
      return { start: new Date(startDate), end: new Date(endDate) };
    }
    return { start: startOfMonth(now), end: endOfMonth(now) };
  };

  const periodKey = (start: Date, end: Date) =>
    `${format(start, 'yyyy-MM-dd')}..${format(end, 'yyyy-MM-dd')}`;

  const hasSameNotificationInPeriod = (params: {
    type: NotifType;
    title: string;
    message: string;
    start: Date;
    end: Date;
  }) => {
    const { type, title, message, start, end } = params;
    return notifications.some((n) => {
      if (n.type !== type) return false;
      if (n.title !== title) return false;
      if (n.message !== message) return false;
      return isWithinInterval(new Date(n.created_at), { start, end });
    });
  };

  // Check if a similar notification (same title) was already sent recently (within 12h) for warning/error types
  const hasSimilarRecentNotification = (params: {
    type: NotifType;
    title: string;
  }) => {
    const { type, title } = params;
    
    // Only apply cooldown for warning and error types
    if (type !== 'warning' && type !== 'error') return false;
    
    return notifications.some((n) => {
      if (n.type !== type) return false;
      if (n.title !== title) return false;
      
      const hoursSinceCreated = differenceInHours(new Date(), new Date(n.created_at));
      return hoursSinceCreated < ALERT_COOLDOWN_HOURS;
    });
  };

  const notifyOnce = (params: {
    key: string;
    type: NotifType;
    title: string;
    message: string;
    start?: Date;
    end?: Date;
  }) => {
    const { key, type, title, message, start, end } = params;

    // For warning/error types, check cooldown first
    if ((type === 'warning' || type === 'error') && isWithinCooldown(key)) {
      return;
    }

    if (alreadySent(key) && type !== 'warning' && type !== 'error') {
      return;
    }

    // Check if a similar notification exists in DB recently (within 12h) for warning/error
    if (!notificationsLoading && hasSimilarRecentNotification({ type, title })) {
      markSent(key); // Mark as sent to sync local storage
      return;
    }

    // If we already have it in DB for this period, consider it "sent" to prevent duplicates on navigation.
    if (start && end && !notificationsLoading) {
      if (hasSameNotificationInPeriod({ type, title, message, start, end })) {
        markSent(key);
        return;
      }
    }

    void addNotification({ title, message, type })
      .then(() => markSent(key))
      .catch(() => {
        // If it fails, we don't mark as sent so it can retry later.
      });
  };

  useEffect(() => {
    if (!user) return;
    if (settingsLoading || notificationsLoading) return;
    if (!settings?.notifications_enabled) return;

    // -------- Global budget --------
    if (globalBudget && globalBudget.amount > 0) {
      const { start, end } = getBudgetPeriod(
        globalBudget.period,
        globalBudget.start_date ?? undefined,
        globalBudget.end_date ?? undefined
      );
      const pKey = periodKey(start, end);

      // Expiration (custom)
      if (globalBudget.period === 'custom' && globalBudget.end_date && isPast(new Date(globalBudget.end_date))) {
        notifyOnce({
          key: `global-expired|${globalBudget.end_date}`,
          type: 'info',
          title: 'Budget expiré',
          message: 'Votre budget global a expiré. Veuillez le réinitialiser et en définir un nouveau si nécessaire.',
        });
      }

      const totalExpenses = transactions
        .filter((t) => t.type === 'expense' && isWithinInterval(new Date(t.date), { start, end }))
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const percentage = (totalExpenses / Number(globalBudget.amount)) * 100;

      const stage = percentage >= 100 ? '100' : percentage >= 80 ? '80' : percentage >= 50 ? '50' : null;
      if (stage) {
        if (stage === '100') {
          notifyOnce({
            key: `global|${pKey}|100`,
            type: 'error',
            title: 'Budget global dépassé!',
            message: `Vous avez dépassé votre budget global de ${(totalExpenses - Number(globalBudget.amount)).toLocaleString()}.`,
            start,
            end,
          });
        } else if (stage === '80') {
          notifyOnce({
            key: `global|${pKey}|80`,
            type: 'warning',
            title: 'Attention au budget!',
            message: `Vous avez utilisé ${percentage.toFixed(0)}% de votre budget global.`,
            start,
            end,
          });
        } else {
          notifyOnce({
            key: `global|${pKey}|50`,
            type: 'info',
            title: 'Mi-parcours budget',
            message: `Vous avez utilisé ${percentage.toFixed(0)}% de votre budget global.`,
            start,
            end,
          });
        }
      }
    }

    // -------- Category budgets --------
    budgets.forEach((budget) => {
      if (!budget.category_id) return;
      if (!budget.amount || Number(budget.amount) <= 0) return;

      const category = categories.find((c) => c.id === budget.category_id);
      if (!category) return;

      const { start, end } = getBudgetPeriod(
        budget.period,
        budget.start_date ?? undefined,
        budget.end_date ?? undefined
      );
      const pKey = periodKey(start, end);

      // Expiration (custom)
      if (budget.period === 'custom' && budget.end_date && isPast(new Date(budget.end_date))) {
        notifyOnce({
          key: `cat-expired|${budget.id}|${budget.end_date}`,
          type: 'info',
          title: `Budget ${category.name} expiré`,
          message: `Le budget "${category.name}" a expiré. Veuillez le réinitialiser.`,
        });
      }

      const spent = transactions
        .filter(
          (t) =>
            t.type === 'expense' &&
            t.category === category.name &&
            isWithinInterval(new Date(t.date), { start, end })
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const percentage = (spent / Number(budget.amount)) * 100;
      const stage = percentage >= 100 ? '100' : percentage >= 80 ? '80' : percentage >= 50 ? '50' : null;
      if (!stage) return;

      if (stage === '100') {
        notifyOnce({
          key: `cat|${budget.id}|${pKey}|100`,
          type: 'error',
          title: `Budget ${category.name} dépassé!`,
          message: `Vous avez dépassé le budget "${category.name}" de ${(spent - Number(budget.amount)).toLocaleString()}.`,
          start,
          end,
        });
      } else if (stage === '80') {
        notifyOnce({
          key: `cat|${budget.id}|${pKey}|80`,
          type: 'warning',
          title: `Alerte budget ${category.name}`,
          message: `Vous avez utilisé ${percentage.toFixed(0)}% du budget "${category.name}".`,
          start,
          end,
        });
      } else {
        notifyOnce({
          key: `cat|${budget.id}|${pKey}|50`,
          type: 'info',
          title: `Budget ${category.name} à mi-chemin`,
          message: `${percentage.toFixed(0)}% du budget "${category.name}" utilisé.`,
          start,
          end,
        });
      }
    });
  }, [
    user,
    budgets,
    globalBudget,
    categories,
    transactions,
    settings?.notifications_enabled,
    settingsLoading,
    notificationsLoading,
    notifications,
    addNotification,
  ]);
};
