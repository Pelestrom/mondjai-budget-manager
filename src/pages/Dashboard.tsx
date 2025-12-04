import { ArrowUpCircle, ArrowDownCircle, TrendingUp } from "lucide-react";
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
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen pb-24 pt-20 bg-gradient-to-br from-background via-primary/5 to-background">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="p-6 space-y-6"
      >
        {/* Main Balance Card */}
        <motion.div variants={item}>
          <Card className="floating-card p-8 bg-gradient-to-br from-primary to-accent text-white border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
            
            <div className="relative z-10">
              <p className="text-sm opacity-90 mb-2">Solde du mois</p>
              <h1 className="text-4xl font-bold mb-4">
                {balance.toLocaleString()} {user?.currency || "FCFA"}
              </h1>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <ArrowUpCircle className="w-4 h-4" />
                  <span>+{totalIncome.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowDownCircle className="w-4 h-4" />
                  <span>-{totalExpenses.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Remaining Budget & Daily Average */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div variants={item}>
            <Card className="floating-card p-5 bg-gradient-to-br from-card to-card/50 border-border/50">
              <p className="text-xs text-muted-foreground mb-2">Reste à vivre</p>
              <p className="text-2xl font-bold text-primary">
                {globalBudgetAmount > 0 ? remaining.toLocaleString() : "—"}
              </p>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="floating-card p-5 bg-gradient-to-br from-card to-card/50 border-border/50">
              <p className="text-xs text-muted-foreground mb-2">Par jour</p>
              <p className="text-2xl font-bold text-secondary">
                {dailyAmount !== null ? dailyAmount.toFixed(0) : "Pas de budget"}
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div variants={item}>
          <div className="grid grid-cols-3 gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => navigate("/add-transaction?type=income")}
                className="w-full h-20 flex flex-col gap-2 bg-gradient-to-br from-success to-success/80 hover:from-success/90 hover:to-success/70 text-white border-0 shadow-lg"
              >
                <ArrowUpCircle className="w-6 h-6" />
                <span className="text-xs">Entrée</span>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => navigate("/add-transaction?type=expense")}
                className="w-full h-20 flex flex-col gap-2 bg-gradient-to-br from-danger to-danger/80 hover:from-danger/90 hover:to-danger/70 text-white border-0 shadow-lg"
              >
                <ArrowDownCircle className="w-6 h-6" />
                <span className="text-xs">Dépense</span>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => navigate("/history")}
                variant="outline"
                className="w-full h-20 flex flex-col gap-2 glassmorphism border-border/50 hover:bg-accent/10"
              >
                <TrendingUp className="w-6 h-6" />
                <span className="text-xs">Historique</span>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;