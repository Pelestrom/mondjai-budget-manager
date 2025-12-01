import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, Minus, History, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTransactionStore } from "@/store/transactionStore";
import { useBudgetStore } from "@/store/budgetStore";
import { useCategoryStore } from "@/store/categoryStore";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const transactions = useTransactionStore((state) => state.transactions);
  const budgets = useBudgetStore((state) => state.budgets);
  const categories = useCategoryStore((state) => state.categories);
  const smartBarEnabled = useSettingsStore((state) => state.smartBarEnabled);

  const monthlyStats = useMemo(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate >= firstDay && tDate <= lastDay;
    });

    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  const dailyBudget = useMemo(() => {
    const globalBudget = budgets.find((b) => !b.categoryId);
    if (!globalBudget) return null;

    const daysInMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    ).getDate();
    const dailyLimit = globalBudget.amount / daysInMonth;
    const remainingBudget = globalBudget.amount - monthlyStats.expenses;
    const daysRemaining = daysInMonth - new Date().getDate() + 1;
    const smartDaily = remainingBudget / daysRemaining;

    return { dailyLimit, smartDaily, remainingBudget };
  }, [budgets, monthlyStats]);

  const categoryAlerts = useMemo(() => {
    return budgets
      .filter((b) => b.categoryId)
      .map((budget) => {
        const category = categories.find((c) => c.id === budget.categoryId);
        const spent = transactions
          .filter(
            (t) =>
              t.type === "expense" &&
              t.category === category?.name &&
              new Date(t.date).getMonth() === new Date().getMonth()
          )
          .reduce((sum, t) => sum + t.amount, 0);

        const percentage = (spent / budget.amount) * 100;
        return {
          category: category?.name || "Inconnu",
          icon: category?.icon || "📦",
          spent,
          budget: budget.amount,
          percentage,
          status:
            percentage >= 100
              ? "exceeded"
              : percentage >= 80
              ? "warning"
              : "ok",
        };
      })
      .filter((alert) => alert.status !== "ok")
      .slice(0, 3);
  }, [budgets, categories, transactions]);

  return (
    <div className="min-h-screen pb-24 safe-area-top">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Bonjour, {user?.username} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Voici votre situation financière
          </p>
        </div>

        {/* Balance Card */}
        <Card className="p-6 bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg">
          <div className="space-y-4">
            <div>
              <p className="text-sm opacity-90">Solde du mois</p>
              <h2 className="text-4xl font-bold mt-1">
                {monthlyStats.balance.toLocaleString()} {user?.currency}
              </h2>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-primary-foreground/20">
              <div>
                <p className="text-xs opacity-90">Revenus</p>
                <p className="text-lg font-semibold">
                  +{monthlyStats.income.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs opacity-90">Dépenses</p>
                <p className="text-lg font-semibold">
                  -{monthlyStats.expenses.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Reste à vivre */}
        {dailyBudget && (
          <Card className="p-6 space-y-3">
            <h3 className="font-semibold text-foreground">Reste à vivre</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold text-primary">
                  {dailyBudget.remainingBudget.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  {user?.currency}
                </span>
              </div>
              {smartBarEnabled && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">
                    Barre intelligente du jour
                  </p>
                  <p className="text-lg font-semibold text-secondary">
                    {dailyBudget.smartDaily.toFixed(0)} {user?.currency}/jour
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Link to="/add-transaction?type=income" className="block">
            <Card className="p-4 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
                <Plus className="w-6 h-6 text-success" />
              </div>
              <p className="text-xs font-medium">Entrée</p>
            </Card>
          </Link>
          <Link to="/add-transaction?type=expense" className="block">
            <Card className="p-4 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-2">
                <Minus className="w-6 h-6 text-danger" />
              </div>
              <p className="text-xs font-medium">Dépense</p>
            </Card>
          </Link>
          <Link to="/history" className="block">
            <Card className="p-4 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                <History className="w-6 h-6 text-foreground" />
              </div>
              <p className="text-xs font-medium">Historique</p>
            </Card>
          </Link>
        </div>

        {/* Category Alerts */}
        {categoryAlerts.length > 0 && (
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Alertes budgétaires
            </h3>
            <div className="space-y-3">
              {categoryAlerts.map((alert, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{alert.icon}</span>
                      <span className="text-sm font-medium">
                        {alert.category}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        alert.status === "exceeded"
                          ? "text-danger"
                          : "text-warning"
                      }`}
                    >
                      {alert.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <Progress
                    value={Math.min(alert.percentage, 100)}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {alert.spent.toLocaleString()} / {alert.budget.toLocaleString()}{" "}
                    {user?.currency}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
