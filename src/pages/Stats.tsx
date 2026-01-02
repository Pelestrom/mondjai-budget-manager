import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import * as LucideIcons from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['#00A86B', '#F2C94C', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#74B9FF', '#A29BFE', '#FD79A8', '#00B894'];

const Stats = () => {
  const { profile } = useAuth();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { settings, isLoading: settingsLoading } = useSettings();
  const [period, setPeriod] = useState<"day" | "week" | "month">("month");

  const stats = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (period === "day") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === "week") {
      startDate = startOfWeek(now, { locale: fr });
      endDate = endOfWeek(now, { locale: fr });
    } else {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    }

    const periodTransactions = transactions.filter(
      (t) => isWithinInterval(new Date(t.date), { start: startDate, end: endDate })
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
        color: cat.color,
        amount: catExpenses,
        percentage: expenses > 0 ? (catExpenses / expenses) * 100 : 0,
      };
    });

    // Daily data for charts
    const days = period === "day" ? 1 : period === "week" ? 7 : 30;
    const dailyData = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = subDays(now, i);
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);
      
      const dayTransactions = transactions.filter(
        (t) => isWithinInterval(new Date(t.date), { start: dayStart, end: dayEnd })
      );
      
      const dayIncome = dayTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
      const dayExpenses = dayTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
      
      dailyData.push({
        date: format(day, period === "month" ? "dd" : "EEE", { locale: fr }),
        fullDate: format(day, "dd MMM", { locale: fr }),
        income: dayIncome,
        expenses: dayExpenses,
      });
    }

    return {
      income,
      expenses,
      balance: income - expenses,
      byCategory: byCategory.filter((c) => c.amount > 0).sort((a, b) => b.amount - a.amount),
      dailyData,
    };
  }, [transactions, categories, period]);

  const getCategoryIcon = (iconName: string) => {
    if (iconName && (LucideIcons as any)[iconName]) {
      const IconComponent = (LucideIcons as any)[iconName];
      return <IconComponent className="w-5 h-5" />;
    }
    return <LucideIcons.Package className="w-5 h-5" />;
  };

  const pieData = stats.byCategory.map((cat, index) => ({
    name: cat.name,
    value: cat.amount,
    color: cat.color || COLORS[index % COLORS.length],
  }));

  const isLoading = transactionsLoading || categoriesLoading || settingsLoading;
  const detailedStatsEnabled = settings.detailed_stats_enabled;

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24 pt-20">
        <div className="p-6 space-y-6">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48 mt-1" />
          </div>
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 pt-20">
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Statistiques</h1>
          <p className="text-sm text-muted-foreground">
            Vue d'ensemble de vos finances
          </p>
        </motion.div>

        <Tabs value={period} onValueChange={(v: any) => setPeriod(v)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="day">Jour</TabsTrigger>
            <TabsTrigger value="week">Semaine</TabsTrigger>
            <TabsTrigger value="month">Mois</TabsTrigger>
          </TabsList>

          <TabsContent value={period} className="space-y-6 mt-6">
            {/* Summary Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 gap-4"
            >
              <Card className="p-4 card-gradient">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-success" />
                  </div>
                  <span className="text-sm text-muted-foreground">Revenus</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.income.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {profile?.currency}
                </p>
              </Card>

              <Card className="p-4 card-gradient">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-danger" />
                  </div>
                  <span className="text-sm text-muted-foreground">Dépenses</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.expenses.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {profile?.currency}
                </p>
              </Card>
            </motion.div>

            {/* Balance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <p className="text-sm opacity-90">Solde</p>
                <p className="text-3xl font-bold mt-1">
                  {stats.balance.toLocaleString()} {profile?.currency}
                </p>
              </Card>
            </motion.div>

            {/* Charts - Detailed Stats */}
            {detailedStatsEnabled && (
              <>
                {/* Line Chart - Daily Evolution */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="p-6 card-gradient">
                    <h3 className="font-semibold text-foreground mb-4">
                      Évolution des dépenses
                    </h3>
                    {stats.dailyData.length > 0 && stats.dailyData.some(d => d.expenses > 0 || d.income > 0) ? (
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={stats.dailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis 
                              dataKey="date" 
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={12}
                            />
                            <YAxis 
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={12}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                              }}
                              labelFormatter={(label, payload) => {
                                const item = payload?.[0]?.payload;
                                return item?.fullDate || label;
                              }}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="expenses" 
                              name="Dépenses"
                              stroke="#FF6B6B" 
                              strokeWidth={2}
                              dot={{ fill: "#FF6B6B" }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="income" 
                              name="Revenus"
                              stroke="#00A86B" 
                              strokeWidth={2}
                              dot={{ fill: "#00A86B" }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Aucune donnée pour cette période
                      </p>
                    )}
                  </Card>
                </motion.div>

                {/* Bar Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="p-6 card-gradient">
                    <h3 className="font-semibold text-foreground mb-4">
                      Comparaison revenus/dépenses
                    </h3>
                    {stats.dailyData.length > 0 && stats.dailyData.some(d => d.expenses > 0 || d.income > 0) ? (
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.dailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis 
                              dataKey="date" 
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={12}
                            />
                            <YAxis 
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={12}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                              }}
                            />
                            <Bar dataKey="income" name="Revenus" fill="#00A86B" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expenses" name="Dépenses" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Aucune donnée pour cette période
                      </p>
                    )}
                  </Card>
                </motion.div>

                {/* Pie Chart */}
                {stats.byCategory.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Card className="p-6 card-gradient">
                      <h3 className="font-semibold text-foreground mb-4">
                        Répartition par catégorie
                      </h3>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                              }}
                              formatter={(value: number) => [`${value.toLocaleString()} ${profile?.currency}`, ""]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </>
            )}

            {/* Category Breakdown */}
            {detailedStatsEnabled && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="p-6 space-y-4 card-gradient">
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
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * idx }}
                          className="space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: cat.color ? `${cat.color}20` : "hsl(var(--primary) / 0.1)" }}
                              >
                                <span style={{ color: cat.color || "hsl(var(--primary))" }}>
                                  {getCategoryIcon(cat.icon)}
                                </span>
                              </div>
                              <span className="text-sm font-medium">
                                {cat.name}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">
                                {cat.amount.toLocaleString()} {profile?.currency}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {cat.percentage.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${cat.percentage}%` }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: cat.color || "hsl(var(--primary))" }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Stats;
