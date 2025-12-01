import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransactionStore } from "@/store/transactionStore";
import { useCategoryStore } from "@/store/categoryStore";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { TrendingUp, TrendingDown } from "lucide-react";

const Stats = () => {
  const user = useAuthStore((state) => state.user);
  const transactions = useTransactionStore((state) => state.transactions);
  const categories = useCategoryStore((state) => state.categories);
  const detailedStatsEnabled = useSettingsStore(
    (state) => state.detailedStatsEnabled
  );
  const [period, setPeriod] = useState<"day" | "week" | "month">("month");

  const stats = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    if (period === "day") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === "week") {
      const dayOfWeek = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - dayOfWeek);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const periodTransactions = transactions.filter(
      (t) => new Date(t.date) >= startDate
    );

    const income = periodTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = periodTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const byCategory = categories.map((cat) => {
      const catExpenses = periodTransactions
        .filter((t) => t.type === "expense" && t.category === cat.name)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        name: cat.name,
        icon: cat.icon,
        amount: catExpenses,
        percentage: expenses > 0 ? (catExpenses / expenses) * 100 : 0,
      };
    });

    return {
      income,
      expenses,
      balance: income - expenses,
      byCategory: byCategory.filter((c) => c.amount > 0).sort((a, b) => b.amount - a.amount),
    };
  }, [transactions, categories, period]);

  return (
    <div className="min-h-screen pb-24 safe-area-top">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Statistiques</h1>
          <p className="text-sm text-muted-foreground">
            Vue d'ensemble de vos finances
          </p>
        </div>

        <Tabs value={period} onValueChange={(v: any) => setPeriod(v)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="day">Jour</TabsTrigger>
            <TabsTrigger value="week">Semaine</TabsTrigger>
            <TabsTrigger value="month">Mois</TabsTrigger>
          </TabsList>

          <TabsContent value={period} className="space-y-6 mt-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <span className="text-sm text-muted-foreground">Revenus</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.income.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {user?.currency}
                </p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-danger" />
                  <span className="text-sm text-muted-foreground">Dépenses</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.expenses.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {user?.currency}
                </p>
              </Card>
            </div>

            {/* Balance */}
            <Card className="p-6 bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <p className="text-sm opacity-90">Solde</p>
              <p className="text-3xl font-bold mt-1">
                {stats.balance.toLocaleString()} {user?.currency}
              </p>
            </Card>

            {/* Category Breakdown */}
            {detailedStatsEnabled && (
              <Card className="p-6 space-y-4">
                <h3 className="font-semibold text-foreground">
                  Dépenses par catégorie
                </h3>

                {stats.byCategory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Aucune dépense pour cette période
                  </p>
                ) : (
                  <div className="space-y-4">
                    {stats.byCategory.map((cat, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{cat.icon}</span>
                            <span className="text-sm font-medium">
                              {cat.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">
                              {cat.amount.toLocaleString()} {user?.currency}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {cat.percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all duration-500"
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Stats;
