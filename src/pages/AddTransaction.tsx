import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

const AddTransaction = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { transactions, addTransaction } = useTransactions();
  const { categories } = useCategories();

  const typeFromUrl = searchParams.get("type");
  const initialType = typeFromUrl === "income" ? "income" : typeFromUrl === "expense" ? "expense" : "expense";

  const [formData, setFormData] = useState({
    amount: "",
    type: initialType as "income" | "expense",
    category: "",
    subcategory: "",
    note: "",
    date: new Date(),
    isFixed: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const availableBalance = transactions.reduce((acc, t) => {
    return t.type === "income" ? acc + Number(t.amount) : acc - Number(t.amount);
  }, 0);

  useEffect(() => {
    const newType = searchParams.get("type");
    if (newType === "income" || newType === "expense") {
      setFormData(prev => ({ ...prev, type: newType }));
    }
  }, [searchParams]);

  const selectedCategory = categories.find((c) => c.name === formData.category);

  const getCategoryIcon = (iconName: string) => {
    if (iconName && (LucideIcons as any)[iconName]) {
      const IconComponent = (LucideIcons as any)[iconName];
      return <IconComponent className="w-4 h-4" />;
    }
    return <LucideIcons.Package className="w-4 h-4" />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    if (!formData.category) {
      toast.error("Veuillez sélectionner une catégorie");
      return;
    }

    const amount = parseFloat(formData.amount);

    if (formData.type === "expense" && amount > availableBalance) {
      toast.error(`Solde insuffisant. Disponible: ${availableBalance.toLocaleString()}`);
      return;
    }

    setIsLoading(true);
    try {
      await addTransaction({
        amount,
        type: formData.type,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        note: formData.note || undefined,
        date: format(formData.date, 'yyyy-MM-dd'),
        is_fixed: formData.isFixed,
      });
      toast.success("Transaction ajoutée");
      navigate("/");
    } catch (error) {
      toast.error("Erreur lors de l'ajout");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-20">
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Nouvelle transaction</h1>
            <p className="text-sm text-muted-foreground">Enregistrez vos revenus et dépenses</p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
            <label className="text-sm font-medium">Montant</label>
            <Input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0"
              className="text-2xl font-bold h-14"
              autoFocus
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={formData.type === "income" ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, type: "income" })}
                className={cn("h-12", formData.type === "income" && "bg-success hover:bg-success/90")}
              >
                Entrée
              </Button>
              <Button
                type="button"
                variant={formData.type === "expense" ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, type: "expense" })}
                className={cn("h-12", formData.type === "expense" && "bg-danger hover:bg-danger/90")}
              >
                Dépense
              </Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-2">
            <label className="text-sm font-medium">Catégorie</label>
            <Select
              value={formData.category}
              onValueChange={(value) => {
                if (value === "__add_category__") {
                  navigate("/categories");
                } else {
                  setFormData({ ...formData, category: value, subcategory: "" });
                }
              }}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 flex items-center justify-center">{getCategoryIcon(cat.icon)}</span>
                      {cat.name}
                    </span>
                  </SelectItem>
                ))}
                <SelectItem value="__add_category__" className="text-primary font-medium">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center">
                      <LucideIcons.Plus className="w-4 h-4" />
                    </span>
                    Ajouter une catégorie
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              <label className="text-sm font-medium">Sous-catégorie</label>
              <Select value={formData.subcategory} onValueChange={(value) => setFormData({ ...formData, subcategory: value })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Optionnel" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategory.subcategories.map((sub) => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-2">
            <label className="text-sm font-medium">Note (optionnel)</label>
            <Textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Ajouter une description..."
              rows={3}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-12 justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  {format(formData.date, "PPP", { locale: fr })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => date && setFormData({ ...formData, date })}
                  locale={fr}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </motion.div>

          {formData.type === "expense" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex items-center space-x-2">
              <Checkbox
                id="fixed"
                checked={formData.isFixed}
                onCheckedChange={(checked) => setFormData({ ...formData, isFixed: checked as boolean })}
              />
              <label htmlFor="fixed" className="text-sm text-foreground cursor-pointer">
                Dépense fixe (récurrente)
              </label>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Button type="submit" disabled={isLoading} className="w-full h-12 btn-primary">
              {isLoading ? "Enregistrement..." : "Enregistrer la transaction"}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction;
