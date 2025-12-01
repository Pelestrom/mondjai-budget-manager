import { useState } from "react";
import { Plus, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useBudgetStore } from "@/store/budgetStore";
import { useCategoryStore } from "@/store/categoryStore";
import { useTransactionStore } from "@/store/transactionStore";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

const Budgets = () => {
  const user = useAuthStore((state) => state.user);
  const { budgets, addBudget, fixedExpenses, toggleFixedExpense } = useBudgetStore();
  const categories = useCategoryStore((state) => state.categories);
  const transactions = useTransactionStore((state) => state.transactions);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: "",
    amount: "",
    period: "monthly" as "monthly" | "weekly" | "daily",
  });

  const handleSubmit = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    addBudget({
      categoryId: formData.categoryId || undefined,
      amount: parseFloat(formData.amount),
      period: formData.period,
    });

    toast.success("Budget ajouté");
    setIsDialogOpen(false);
    setFormData({ categoryId: "", amount: "", period: "monthly" });
  };

  const getBudgetStatus = (budgetId: string, budgetAmount: number) => {
    const budget = budgets.find((b) => b.id === budgetId);
    if (!budget) return { spent: 0, percentage: 0, status: "ok" };

    const category = categories.find((c) => c.id === budget.categoryId);
    const spent = transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          t.category === category?.name &&
          new Date(t.date).getMonth() === new Date().getMonth()
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const percentage = (spent / budgetAmount) * 100;
    return {
      spent,
      percentage,
      status:
        percentage >= 100 ? "exceeded" : percentage >= 80 ? "warning" : "ok",
    };
  };

  return (
    <div className="min-h-screen pb-24 safe-area-top">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Budgets</h1>
            <p className="text-sm text-muted-foreground">
              Gérez vos limites de dépenses
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="btn-primary">
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouveau budget</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Catégorie</label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoryId: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Global" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Budget global</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
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
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Période</label>
                  <Select
                    value={formData.period}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, period: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="daily">Quotidien</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSubmit} className="w-full btn-primary">
                  Créer le budget
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Budgets List */}
        <div className="space-y-4">
          {budgets.map((budget) => {
            const category = categories.find((c) => c.id === budget.categoryId);
            const status = getBudgetStatus(budget.id, budget.amount);

            return (
              <Card key={budget.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {category ? (
                        <>
                          <span className="text-2xl">{category.icon}</span>
                          <span className="font-semibold">{category.name}</span>
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-6 h-6 text-primary" />
                          <span className="font-semibold">Budget global</span>
                        </>
                      )}
                    </div>
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
                  </div>

                  <Progress
                    value={Math.min(status.percentage, 100)}
                    className="h-2"
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
            );
          })}
        </div>

        {/* Fixed Expenses */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Dépenses fixes
          </h2>
          {fixedExpenses.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground text-sm">
                Aucune dépense fixe
              </p>
            </Card>
          ) : (
            fixedExpenses.map((expense) => {
              const category = categories.find((c) => c.id === expense.categoryId);
              return (
                <Card key={expense.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{category?.icon || "📦"}</span>
                      <div>
                        <p className="font-medium">{expense.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {expense.amount.toLocaleString()} {user?.currency}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={expense.enabled}
                      onCheckedChange={() => toggleFixedExpense(expense.id)}
                    />
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Budgets;
