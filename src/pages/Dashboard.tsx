import { useState, useEffect, useRef } from "react";
import { ArrowUpCircle, ArrowDownCircle, Clock, AlertTriangle, Lightbulb, Info, Sparkles, Target, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTransactionStore } from "@/store/transactionStore";
import { useBudgetStore } from "@/store/budgetStore";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, useSpring, useTransform } from "framer-motion";
import { useBudgetNotifications } from "@/hooks/useBudgetNotifications";

// Animated counter component
const AnimatedNumber = ({ value, currency, hidden }: { value: number; currency: string; hidden: boolean }) => {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (current) => 
    hidden ? "••••••" : `${Math.round(current).toLocaleString()} ${currency}`
  );
  const [displayValue, setDisplayValue] = useState(hidden ? "••••••" : `${value.toLocaleString()} ${currency}`);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = display.on("change", (v) => setDisplayValue(v));
    return unsubscribe;
  }, [display]);

  return <span>{displayValue}</span>;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const transactions = useTransactionStore((state) => state.transactions);
  const { budgets, globalBudget } = useBudgetStore();
  const user = useAuthStore((state) => state.user);
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.getUnreadCount());
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const prevBalance = useRef<number | null>(null);

  // Use budget notifications hook
  useBudgetNotifications();

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
  
  // Use globalBudget from store (set via setGlobalBudget) OR find one without categoryId
  const effectiveGlobalBudget = globalBudget || budgets.find((b) => !b.categoryId);
  const globalBudgetAmount = effectiveGlobalBudget?.amount || 0;
  const remaining = globalBudgetAmount - totalExpenses;
  
  // Calculate daily amount from smart bar logic
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = new Date().getDate();
  const remainingDays = daysInMonth - today + 1;
  const dailyAmount = globalBudgetAmount > 0 ? Math.max(0, remaining / remainingDays) : null;

  // Get notification message
  const getStatusMessage = () => {
    if (!globalBudgetAmount) {
      return { text: "Gère ton budget", icon: Target, type: "budget" };
    }
    if (unreadCount > 0) {
      return { text: "Consulte tes notifications", icon: Info, type: "notification" };
    }
    return { text: "Tu gères bien le budget, mode agni activé 🔥", icon: Sparkles, type: "success" };
  };

  const statusMessage = getStatusMessage();

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
              <div className="flex items-center justify-between">
                <p className="text-sm opacity-80 font-medium">Solde</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary-foreground hover:bg-white/20"
                  onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                >
                  {isBalanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <h1 className="text-3xl font-bold mt-1">
                <AnimatedNumber value={balance} currency={user?.currency || "FCFA"} hidden={isBalanceHidden} />
              </h1>
              <div className="flex items-center gap-5 mt-4 text-sm">
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5">
                  <ArrowUpCircle className="w-4 h-4" />
                  <span className="font-medium">
                    {isBalanceHidden ? "••••" : `+${totalIncome.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5">
                  <ArrowDownCircle className="w-4 h-4" />
                  <span className="font-medium">
                    {isBalanceHidden ? "••••" : `-${totalExpenses.toLocaleString()}`}
                  </span>
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

        {/* Status Message */}
        <motion.div variants={item}>
          <Card 
            onClick={() => navigate(statusMessage.type === "budget" ? "/budgets" : "/notifications")}
            className={`p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] ${
              statusMessage.type === "success" 
                ? "bg-gradient-to-r from-success/10 to-primary/10 border-success/30" 
                : statusMessage.type === "notification"
                ? "bg-gradient-to-r from-secondary/20 to-accent/10 border-secondary/30"
                : "bg-gradient-to-r from-muted to-muted/50 border-border/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${
                statusMessage.type === "success" 
                  ? "bg-success/20 text-success" 
                  : statusMessage.type === "notification"
                  ? "bg-secondary/30 text-secondary-foreground"
                  : "bg-primary/20 text-primary"
              }`}>
                <statusMessage.icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">
                {statusMessage.text}
              </p>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
