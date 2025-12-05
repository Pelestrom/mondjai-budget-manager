import { ArrowUpCircle, ArrowDownCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTransactionStore } from "@/store/transactionStore";
import { useBudgetStore } from "@/store/budgetStore";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Dashboard = () => {
  const navigate = useNavigate();
  const transactions = useTransactionStore((state) => state.transactions);
  const { budgets } = useBudgetStore();
  const user = useAuthStore((state) => state.user);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const totalIncome = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;
  const globalBudget = budgets.find((b) => !b.categoryId);
  const globalBudgetAmount = globalBudget?.amount || 0;
  const remaining = globalBudgetAmount - totalExpenses;
  
  // Calculate daily amount from smart bar logic
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = new Date().getDate();
  const remainingDays = daysInMonth - today + 1;
  const dailyAmount = globalBudgetAmount > 0 ? Math.max(0, remaining / remainingDays) : null;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen pb-28 pt-20 bg-background">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="px-5 py-6 space-y-5"
      >
        {/* Main Balance Card */}
        <motion.div variants={item}>
          <Card className="p-6 bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground border-0 rounded-3xl overflow-hidden relative shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
            
            <div className="relative z-10">
              <p className="text-sm opacity-80 font-medium">Solde</p>
              <h1 className="text-3xl font-bold mt-1">
                {balance.toLocaleString()} {user?.currency || "FCFA"}
              </h1>
              <div className="flex items-center gap-5 mt-4 text-sm">
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5">
                  <ArrowUpCircle className="w-4 h-4" />
                  <span className="font-medium">+{totalIncome.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5">
                  <ArrowDownCircle className="w-4 h-4" />
                  <span className="font-medium">-{totalExpenses.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Daily Budget Card */}
        <motion.div variants={item}>
          <Card className="p-5 bg-gradient-to-r from-secondary/20 to-secondary/10 border-secondary/30 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Budget par jour</p>
                <p className="text-2xl font-bold text-secondary-foreground mt-1">
                  {dailyAmount !== null 
                    ? `${dailyAmount.toFixed(0)} ${user?.currency || "FCFA"}`
                    : "Pas de budget"
                  }
                </p>
              </div>
              {dailyAmount !== null && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{remainingDays} jours restants</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item}>
          <p className="text-sm font-semibold text-foreground mb-3">Actions rapides</p>
          <div className="grid grid-cols-3 gap-3">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => navigate("/add-transaction?type=income")}
                className="w-full h-20 flex flex-col gap-2 bg-success hover:bg-success/90 text-white border-0 rounded-2xl shadow-lg shadow-success/20"
              >
                <ArrowUpCircle className="w-6 h-6" />
                <span className="text-xs font-medium">Entrée</span>
              </Button>
            </motion.div>

            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => navigate("/add-transaction?type=expense")}
                className="w-full h-20 flex flex-col gap-2 bg-danger hover:bg-danger/90 text-white border-0 rounded-2xl shadow-lg shadow-danger/20"
              >
                <ArrowDownCircle className="w-6 h-6" />
                <span className="text-xs font-medium">Dépense</span>
              </Button>
            </motion.div>

            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => navigate("/history")}
                variant="outline"
                className="w-full h-20 flex flex-col gap-2 bg-card border-border/50 rounded-2xl hover:bg-muted/50"
              >
                <Clock className="w-6 h-6 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Historique</span>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
