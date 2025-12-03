import { useState, useMemo } from "react";
import { Plus, Wallet, Trash2, AlertTriangle, TrendingDown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useBudgetStore } from "@/store/budgetStore";
import { useCategoryStore } from "@/store/categoryStore";
import { useTransactionStore } from "@/store/transactionStore";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format, startOfWeek, startOfMonth, endOfWeek, endOfMonth, differenceInDays, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

const Budgets = () => {
  const user = useAuthStore((state) => state.user);
  const { budgets, globalBudget, addBudget, deleteBudget, setGlobalBudget } = useBudgetStore();
  const categories = useCategoryStore((state) => state.categories);
  const transactions = useTransactionStore((state) => state.transactions);
  const smartBarEnabled = useSettingsStore((state) => state.smartBarEnabled);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGlobalDialogOpen, setIsGlobalDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: "",
    amount: "",
    period: "monthly" as "monthly" | "weekly" | "custom",
    startDate: new Date(),
    endDate: new Date(),
  });
  const [globalFormData, setGlobalFormData] = useState({
    amount: "",
    period: "monthly" as "monthly" | "weekly" | "custom",
    startDate: new Date(),
    endDate: new Date(),
  });

  // Calculate budget period dates
  const getBudgetPeriod = (period: string, startDate?: string, endDate?: string) => {
    const now = new Date();
    if (period === "weekly") {
      return { start: startOfWeek(now, { locale: fr }), end: endOfWeek(now, { locale: fr }) };
    } else if (period === "custom" && startDate && endDate) {
      return { start: new Date(startDate), end: new Date(endDate) };
    }
    return { start: startOfMonth(now), end: endOfMonth(now) };
  };

  // Calculate global budget status
  const globalBudgetStatus = useMemo(() => {
    if (!globalBudget) return null;
    
    const { start, end } = getBudgetPeriod(globalBudget.period, globalBudget.startDate, globalBudget.endDate);
    const totalExpenses = transactions
      .filter((t) => t.type === "expense" && isWithinInterval(new Date(t.date), { start, end }))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const remaining = globalBudget.amount - totalExpenses;
    const percentage = (totalExpenses / globalBudget.amount) * 100;
    const daysLeft = Math.max(0, differenceInDays(end, new Date()) + 1);
    const dailyBudget = daysLeft > 0 ? remaining / daysLeft : 0;
    
    return {
      spent: totalExpenses,
      remaining,
      percentage,
      daysLeft,
      dailyBudget,
      status: percentage >= 100 ? "exceeded" : percentage >= 80 ? "warning" : "ok",
    };
  }, [globalBudget, transactions]);

  // Calculate category budget status
  const getBudgetStatus = (budget: typeof budgets[0]) => {
    const category = categories.find((c) => c.id === budget.categoryId);
    const { start, end } = getBudgetPeriod(budget.period, budget.startDate, budget.endDate);
    
    const spent = transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          t.category === category?.name &&
          isWithinInterval(new Date(t.date), { start, end })
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const percentage = (spent / budget.amount) * 100;
    return {
      spent,
      percentage,
      remaining: budget.amount - spent,
      status: percentage >= 100 ? "exceeded" : percentage >= 80 ? "warning" : "ok",
    };
  };

  const handleSubmit = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }
    if (!formData.categoryId) {
      toast.error("Veuillez sélectionner une catégorie");
      return;
    }

    addBudget({
      categoryId: formData.categoryId,
      amount: parseFloat(formData.amount),
      period: formData.period,
      startDate: formData.period === "custom" ? formData.startDate.toISOString() : undefined,
      endDate: formData.period === "custom" ? formData.endDate.toISOString() : undefined,
    });

    toast.success("Budget ajouté");
    setIsDialogOpen(false);
    setFormData({ categoryId: "", amount: "", period: "monthly", startDate: new Date(), endDate: new Date() });
  };

  const handleGlobalSubmit = () => {
    if (!globalFormData.amount || parseFloat(globalFormData.amount) <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    setGlobalBudget({
      amount: parseFloat(globalFormData.amount),
      period: globalFormData.period,
      startDate: globalFormData.period === "custom" ? globalFormData.startDate.toISOString() : undefined,
      endDate: globalFormData.period === "custom" ? globalFormData.endDate.toISOString() : undefined,
    });

    toast.success("Budget global mis à jour");
    setIsGlobalDialogOpen(false);
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category?.icon && (LucideIcons as any)[category.icon]) {
      const IconComponent = (LucideIcons as any)[category.icon];
      return <IconComponent className="w-5 h-5" />;
    }
    return <LucideIcons.Package className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen pb-24 pt-20">
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Budgets</h1>
            <p className="text-sm text-muted-foreground">
              Gérez vos limites de dépenses
            </p>
          </div>
        </motion.div>

        {/* Global Budget Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Budget Global</h3>
                  <p className="text-sm text-muted-foreground">
                    {globalBudget 
                      ? `${globalBudget.period === "monthly" ? "Mensuel" : globalBudget.period === "weekly" ? "Hebdomadaire" : "Personnalisé"}`
                      : "Non défini"
                    }
                  </p>
                </div>
              </div>
              <Dialog open={isGlobalDialogOpen} onOpenChange={setIsGlobalDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    {globalBudget ? "Modifier" : "Définir"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Budget Global</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm font-medium">Montant</label>
                      <Input
                        type="number"
                        value={globalFormData.amount}
                        onChange={(e) => setGlobalFormData({ ...globalFormData, amount: e.target.value })}
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Période</label>
                      <Select
                        value={globalFormData.period}
                        onValueChange={(value: any) => setGlobalFormData({ ...globalFormData, period: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Mensuel</SelectItem>
                          <SelectItem value="weekly">Hebdomadaire</SelectItem>
                          <SelectItem value="custom">Personnalisé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {globalFormData.period === "custom" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Début</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full mt-1 justify-start">
                                <Calendar className="w-4 h-4 mr-2" />
                                {format(globalFormData.startDate, "dd/MM/yyyy")}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={globalFormData.startDate}
                                onSelect={(date) => date && setGlobalFormData({ ...globalFormData, startDate: date })}
                                locale={fr}
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Fin</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full mt-1 justify-start">
                                <Calendar className="w-4 h-4 mr-2" />
                                {format(globalFormData.endDate, "dd/MM/yyyy")}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={globalFormData.endDate}
                                onSelect={(date) => date && setGlobalFormData({ ...globalFormData, endDate: date })}
                                locale={fr}
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    )}
                    <Button onClick={handleGlobalSubmit} className="w-full btn-primary">
                      Enregistrer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {globalBudget && globalBudgetStatus && (
              <>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Dépensé: {globalBudgetStatus.spent.toLocaleString()} {user?.currency}</span>
                    <span className={globalBudgetStatus.status === "exceeded" ? "text-danger" : globalBudgetStatus.status === "warning" ? "text-warning" : "text-success"}>
                      {globalBudgetStatus.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(globalBudgetStatus.percentage, 100)} 
                    className={`h-3 ${globalBudgetStatus.status === "exceeded" ? "[&>div]:bg-danger" : globalBudgetStatus.status === "warning" ? "[&>div]:bg-warning" : ""}`}
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Reste: {globalBudgetStatus.remaining.toLocaleString()} {user?.currency}
                    </span>
                    <span className="font-medium">
                      sur {globalBudget.amount.toLocaleString()} {user?.currency}
                    </span>
                  </div>
                </div>

                {/* Smart Bar - Daily Budget */}
                {smartBarEnabled && globalBudgetStatus.daysLeft > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 p-4 rounded-xl bg-background/50 border border-border/50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Barre Intelligente</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">
                      {globalBudgetStatus.dailyBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })} {user?.currency}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      à dépenser par jour ({globalBudgetStatus.daysLeft} jours restants)
                    </p>
                  </motion.div>
                )}

                {/* Alert for exceeded budget */}
                {globalBudgetStatus.status === "exceeded" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-3 rounded-xl bg-danger/10 border border-danger/20 flex items-center gap-3"
                  >
                    <AlertTriangle className="w-5 h-5 text-danger" />
                    <div>
                      <p className="text-sm font-medium text-danger">Budget dépassé!</p>
                      <p className="text-xs text-muted-foreground">
                        Vous avez dépassé votre budget de {Math.abs(globalBudgetStatus.remaining).toLocaleString()} {user?.currency}
                      </p>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </Card>
        </motion.div>

        {/* Category Budgets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Budgets par catégorie</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="btn-primary">
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau budget catégorie</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium">Catégorie</label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-2">
                              {getCategoryIcon(cat.id)}
                              {cat.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Montant</label>
                    <Input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Période</label>
                    <Select
                      value={formData.period}
                      onValueChange={(value: any) => setFormData({ ...formData, period: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensuel</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                        <SelectItem value="custom">Personnalisé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.period === "custom" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Début</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full mt-1 justify-start">
                              <Calendar className="w-4 h-4 mr-2" />
                              {format(formData.startDate, "dd/MM/yyyy")}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={formData.startDate}
                              onSelect={(date) => date && setFormData({ ...formData, startDate: date })}
                              locale={fr}
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Fin</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full mt-1 justify-start">
                              <Calendar className="w-4 h-4 mr-2" />
                              {format(formData.endDate, "dd/MM/yyyy")}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={formData.endDate}
                              onSelect={(date) => date && setFormData({ ...formData, endDate: date })}
                              locale={fr}
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}
                  <Button onClick={handleSubmit} className="w-full btn-primary">
                    Créer le budget
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {budgets.length === 0 ? (
            <Card className="p-8 text-center card-gradient">
              <p className="text-muted-foreground">Aucun budget par catégorie</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ajoutez des budgets pour suivre vos dépenses par catégorie
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {budgets.map((budget, index) => {
                const category = categories.find((c) => c.id === budget.categoryId);
                const status = getBudgetStatus(budget);

                return (
                  <motion.div
                    key={budget.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-4 card-gradient">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: category?.color ? `${category.color}20` : "hsl(var(--primary) / 0.1)" }}
                            >
                              <span style={{ color: category?.color || "hsl(var(--primary))" }}>
                                {getCategoryIcon(budget.categoryId || "")}
                              </span>
                            </div>
                            <div>
                              <span className="font-semibold">{category?.name || "Catégorie"}</span>
                              <p className="text-xs text-muted-foreground">
                                {budget.period === "monthly" ? "Mensuel" : budget.period === "weekly" ? "Hebdo" : "Personnalisé"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-semibold ${
                                status.status === "exceeded"
                                  ? "text-danger"
                                  : status.status === "warning"
                                  ? "text-warning"
                                  : "text-success"
                              }`}
                            >
                              {status.percentage.toFixed(0)}%
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => deleteBudget(budget.id)}
                            >
                              <Trash2 className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>

                        <Progress
                          value={Math.min(status.percentage, 100)}
                          className={`h-2 ${status.status === "exceeded" ? "[&>div]:bg-danger" : status.status === "warning" ? "[&>div]:bg-warning" : ""}`}
                        />

                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {status.spent.toLocaleString()} {user?.currency}
                          </span>
                          <span className="text-muted-foreground">
                            sur {budget.amount.toLocaleString()} {user?.currency}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Budgets;
