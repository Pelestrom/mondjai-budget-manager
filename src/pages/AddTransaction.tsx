import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useTransactionStore } from "@/store/transactionStore";
import { useCategoryStore } from "@/store/categoryStore";
import { toast } from "sonner";

const AddTransaction = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const categories = useCategoryStore((state) => state.categories);

  const [formData, setFormData] = useState({
    amount: "",
    type: (searchParams.get("type") || "expense") as "income" | "expense",
    category: "",
    subcategory: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
    isFixed: false,
  });

  const selectedCategory = categories.find((c) => c.name === formData.category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    if (!formData.category) {
      toast.error("Veuillez sélectionner une catégorie");
      return;
    }

    addTransaction({
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      subcategory: formData.subcategory || undefined,
      note: formData.note || undefined,
      date: new Date(formData.date).toISOString(),
      isFixed: formData.isFixed,
    });

    toast.success("Transaction ajoutée");
    navigate("/");
  };

  return (
    <div className="min-h-screen pb-24 safe-area-top">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Nouvelle transaction
            </h1>
            <p className="text-sm text-muted-foreground">
              Enregistrez vos revenus et dépenses
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Montant</label>
            <Input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="0"
              className="input-field text-2xl font-bold"
              autoFocus
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={formData.type === "income" ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, type: "income" })}
                className={
                  formData.type === "income" ? "bg-success hover:bg-success/90" : ""
                }
              >
                Entrée
              </Button>
              <Button
                type="button"
                variant={formData.type === "expense" ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, type: "expense" })}
                className={
                  formData.type === "expense" ? "bg-danger hover:bg-danger/90" : ""
                }
              >
                Dépense
              </Button>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Catégorie</label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value, subcategory: "" })
              }
            >
              <SelectTrigger className="input-field">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory */}
          {selectedCategory?.subcategories &&
            selectedCategory.subcategories.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Sous-catégorie</label>
                <Select
                  value={formData.subcategory}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subcategory: value })
                  }
                >
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Optionnel" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCategory.subcategories.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

          {/* Note */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Note (optionnel)</label>
            <Textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Ajouter une description..."
              className="input-field"
              rows={3}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input-field"
            />
          </div>

          {/* Fixed Expense */}
          {formData.type === "expense" && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fixed"
                checked={formData.isFixed}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isFixed: checked as boolean })
                }
              />
              <label
                htmlFor="fixed"
                className="text-sm text-foreground cursor-pointer"
              >
                Dépense fixe (récurrente)
              </label>
            </div>
          )}

          <Button type="submit" className="w-full btn-primary">
            Enregistrer la transaction
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction;
