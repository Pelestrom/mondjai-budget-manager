import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Info,
  Sparkles,
  Target,
  Eye,
  EyeOff,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { motion, useSpring, useTransform } from "framer-motion";
import { useBudgetNotificationsDB } from "@/hooks/useBudgetNotificationsDB";
import { HeroCard } from "@/components/HeroCard";
import { IconBadge } from "@/components/IconBadge";

const AnimatedNumber = ({ value, currency, hidden }: { value: number; currency: string; hidden: boolean }) => {
  const spring = useSpring(0, { stiffness: 90, damping: 26 });
  const display = useTransform(spring, (c) =>
    hidden ? "••••••" : `${Math.round(c).toLocaleString("fr-FR")} ${currency}`
  );
  const [displayValue, setDisplayValue] = useState(hidden ? "••••••" : `${value.toLocaleString("fr-FR")} ${currency}`);
  useEffect(() => { spring.set(value); }, [value, spring]);
  useEffect(() => display.on("change", (v) => setDisplayValue(v)), [display]);
  return <span>{displayValue}</span>;
};

/** Progress ring (SVG) — visualise conso du budget quotidien */
const ProgressRing = ({ percent, size = 56 }: { percent: number; size?: number }) => {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = c - (clamped / 100) * c;
  const color = clamped < 60 ? "hsl(var(--success))" : clamped < 90 ? "hsl(var(--warning))" : "hsl(var(--danger))";
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--muted))" strokeWidth={stroke} fill="none" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={color} strokeWidth={stroke} strokeLinecap="round" fill="none"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  const { globalBudget } = useBudgets();
  const { profile } = useAuth();
  const { unreadCount } = useNotifications();
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  useBudgetNotificationsDB();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncome = monthTransactions.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = monthTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const balance = totalIncome - totalExpenses;

  const globalBudgetAmount = globalBudget?.amount || 0;
  const remaining = globalBudgetAmount - totalExpenses;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = now.getDate();
  const remainingDays = daysInMonth - today + 1;
  const dailyAmount = globalBudgetAmount > 0 ? Math.max(0, remaining / remainingDays) : null;
  const dailyPercent = globalBudgetAmount > 0 ? Math.min(100, (totalExpenses / globalBudgetAmount) * 100) : 0;

  const currency = profile?.currency || "FCFA";
  const firstLetter = profile?.username?.charAt(0).toUpperCase() || "U";

  const getStatusMessage = () => {
    if (!globalBudgetAmount) return { text: "Définis ton premier budget", icon: Target, type: "budget" as const };
    if (unreadCount > 0) return { text: "Consulte tes notifications", icon: Info, type: "notification" as const };
    return { text: "Tu gères bien, mode agni activé", icon: Flame, type: "success" as const };
  };
  const statusMessage = getStatusMessage();

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

  return (
    <div className="min-h-screen pb-36 pt-20 bg-background overflow-y-auto">
      <motion.div variants={container} initial="hidden" animate="show" className="px-5 py-4 space-y-5">

        {/* HERO — Solde */}
        <motion.div variants={item}>
          <HeroCard className="p-6" pattern>
            {/* Top row: avatar + greeting */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white"
                style={{ background: "linear-gradient(135deg, #16A672, #3DFFB3)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)" }}>
                {firstLetter}
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-white/60 font-medium">Bonjour</p>
                <p className="text-sm font-semibold text-white">{profile?.username || "—"}</p>
              </div>
            </div>

            {/* Solde */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <p className="label-caps text-white/60">Solde</p>
                <button onClick={() => setIsBalanceHidden(!isBalanceHidden)} className="text-white/70 hover:text-white transition-colors">
                  {isBalanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <h1 className="font-amount text-5xl font-bold text-white mt-2 leading-none">
                <AnimatedNumber value={balance} currency={currency} hidden={isBalanceHidden} />
              </h1>
            </div>

            {/* Stat pills */}
            <div className="flex items-center gap-3 mt-6">
              <div className="flex-1 flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 bg-white/10 border border-white/15 backdrop-blur-md">
                <span className="h-8 w-8 rounded-xl bg-white/15 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-white" strokeWidth={2.6} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-white/60">Entrées</p>
                  <p className="text-sm font-semibold text-white truncate font-amount">
                    {isBalanceHidden ? "••••" : `+${totalIncome.toLocaleString("fr-FR")}`}
                  </p>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 bg-white/10 border border-white/15 backdrop-blur-md">
                <span className="h-8 w-8 rounded-xl bg-white/15 flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4 text-white" strokeWidth={2.6} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-white/60">Dépenses</p>
                  <p className="text-sm font-semibold text-white truncate font-amount">
                    {isBalanceHidden ? "••••" : `-${totalExpenses.toLocaleString("fr-FR")}`}
                  </p>
                </div>
              </div>
            </div>
          </HeroCard>
        </motion.div>

        {/* Daily Budget with progress ring */}
        <motion.div variants={item}>
          <div className="surface-card p-5 flex items-center gap-4">
            <div className="relative flex items-center justify-center">
              <ProgressRing percent={dailyPercent} />
              <span className="absolute text-[10px] font-bold text-foreground font-amount">
                {Math.round(dailyPercent)}%
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="label-caps text-muted-foreground">Budget par jour</p>
              <p className="font-amount text-2xl font-bold text-foreground mt-0.5">
                {dailyAmount !== null ? `${Math.round(dailyAmount).toLocaleString("fr-FR")} ${currency}` : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {dailyAmount !== null ? `${remainingDays} jours restants` : "Aucun budget défini"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={item} className="space-y-3">
          <p className="label-caps text-muted-foreground px-1">Actions rapides</p>
          <div className="grid grid-cols-3 gap-3">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => navigate("/add-transaction?type=income")}
              className="surface-card p-4 flex flex-col items-center gap-2.5 text-center"
            >
              <IconBadge icon={ArrowUpRight} tone="success" size="lg" />
              <span className="text-xs font-semibold text-foreground">Entrée</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => navigate("/add-transaction?type=expense")}
              className="surface-card p-4 flex flex-col items-center gap-2.5 text-center"
            >
              <IconBadge icon={ArrowDownRight} tone="danger" size="lg" />
              <span className="text-xs font-semibold text-foreground">Dépense</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => navigate("/history")}
              className="surface-card p-4 flex flex-col items-center gap-2.5 text-center"
            >
              <IconBadge icon={Clock} tone="info" size="lg" />
              <span className="text-xs font-semibold text-foreground">Historique</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Status card */}
        <motion.div variants={item}>
          <button
            onClick={() => navigate(statusMessage.type === "budget" ? "/budgets" : "/notifications")}
            className="surface-card w-full p-4 flex items-center gap-3 text-left transition-transform active:scale-[0.99]"
          >
            <IconBadge
              icon={statusMessage.icon}
              tone={statusMessage.type === "success" ? "success" : statusMessage.type === "notification" ? "warning" : "primary"}
              size="md"
              className={statusMessage.type === "success" ? "animate-pulse" : ""}
            />
            <p className="text-sm font-medium text-foreground flex-1">{statusMessage.text}</p>
            <Sparkles className="w-4 h-4 text-muted-foreground" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
