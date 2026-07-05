import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Calendar, ArrowLeft, Repeat, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useFixedExpenses, FixedExpense } from "@/hooks/useFixedExpenses";
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
  const { fixedExpenses, addFixedExpense, updateFixedExpense, deleteFixedExpense } = useFixedExpenses();

  const typeFromUrl = searchParams.get("type");
  const initialType = typeFromUrl === "income" ? "income" : "expense";

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
  const [fixedSheetOpen, setFixedSheetOpen] = useState(false);
  const [editItem, setEditItem] = useState<FixedExpense | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const availableBalance = transactions.reduce((acc, t) => t.type === "income" ? acc + Number(t.amount) : acc - Number(t.amount), 0);

  useEffect(() => {
    const newType = searchParams.get("type");
    if (newType === "income" || newType === "expense") setFormData(prev => ({ ...prev, type: newType }));
  }, [searchParams]);

  const selectedCategory = categories.find((c) => c.name === formData.category);
  const getCategoryIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Package;
    return <Icon className="w-4 h-4" />;
  };

  const applyFixed = (f: FixedExpense) => {
    setFormData((prev) => ({
      ...prev,
      amount: String(f.amount),
      type: f.type,
      category: f.category,
      subcategory: f.subcategory || "",
      note: f.note || "",
      isFixed: true,
    }));
    setFixedSheetOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) return toast.error("Veuillez entrer un montant valide");
    if (!formData.category) return toast.error("Veuillez sélectionner une catégorie");
    const amount = parseFloat(formData.amount);
    if (formData.type === "expense" && amount > availableBalance) return toast.error(`Solde insuffisant. Disponible: ${availableBalance.toLocaleString()}`);

    setIsLoading(true);
    try {
      await addTransaction({
        amount, type: formData.type, category: formData.category,
        subcategory: formData.subcategory || undefined,
        note: formData.note || undefined,
        date: format(formData.date, 'yyyy-MM-dd'),
        is_fixed: formData.isFixed,
      });
      if (formData.isFixed) {
        try {
          await addFixedExpense({
            amount, type: formData.type, category: formData.category,
            subcategory: formData.subcategory || undefined,
            note: formData.note || undefined,
            label: formData.note || formData.category,
          });
        } catch { /* non-blocking */ }
      }
      toast.success("Transaction ajoutée");
      navigate("/");
    } catch {
      toast.error("Erreur lors de l'ajout");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-32 pt-20">
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0"><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Nouvelle transaction</h1>
            <p className="text-sm text-muted-foreground">Enregistrez vos revenus et dépenses</p>
          </div>
        </motion.div>

        {/* Choisir une dépense fixe */}
        <Sheet open={fixedSheetOpen} onOpenChange={setFixedSheetOpen}>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" className="w-full h-12 justify-start gap-2">
              <Repeat className="w-4 h-4" /> Choisir une dépense/entrée fixe
              {fixedExpenses.length > 0 && <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{fixedExpenses.length}</span>}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Mes modèles fixes</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-2">
              {fixedExpenses.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Aucun modèle enregistré. Coche « fixe » lors d'un ajout pour l'enregistrer ici.</p>
              )}
              {fixedExpenses.map((f) => (
                <div key={f.id} className="surface-card p-3 flex items-center gap-3">
                  <button className="flex-1 text-left" onClick={() => applyFixed(f)}>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", f.type === "income" ? "chip-success" : "chip-danger")}>
                        {f.type === "income" ? "Entrée" : "Dépense"}
                      </span>
                      <span className="font-semibold text-foreground">{f.label || f.category}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 font-amount">
                      {Number(f.amount).toLocaleString("fr-FR")} • {f.category}
                    </p>
                  </button>
                  <Button size="icon" variant="ghost" onClick={() => setEditItem(f)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleteId(f.id)}><Trash2 className="w-4 h-4 text-danger" /></Button>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Montant</label>
            <Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0" className="text-2xl font-bold h-14" autoFocus />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant={formData.type === "income" ? "default" : "outline"} onClick={() => setFormData({ ...formData, type: "income" })} className={cn("h-12", formData.type === "income" && "bg-success hover:bg-success/90")}>Entrée</Button>
              <Button type="button" variant={formData.type === "expense" ? "default" : "outline"} onClick={() => setFormData({ ...formData, type: "expense" })} className={cn("h-12", formData.type === "expense" && "bg-danger hover:bg-danger/90")}>Dépense</Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Catégorie</label>
            <Select value={formData.category} onValueChange={(value) => value === "__add_category__" ? navigate("/categories") : setFormData({ ...formData, category: value, subcategory: "" })}>
              <SelectTrigger className="h-12"><SelectValue placeholder="Sélectionner une catégorie" /></SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    <span className="flex items-center gap-2"><span className="w-5 h-5 flex items-center justify-center">{getCategoryIcon(cat.icon)}</span>{cat.name}</span>
                  </SelectItem>
                ))}
                <SelectItem value="__add_category__" className="text-primary font-medium">
                  <span className="flex items-center gap-2"><Plus className="w-4 h-4" />Ajouter une catégorie</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Sous-catégorie</label>
              <Select value={formData.subcategory} onValueChange={(value) => setFormData({ ...formData, subcategory: value })}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Optionnel" /></SelectTrigger>
                <SelectContent>{selectedCategory.subcategories.map((sub) => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Note (optionnel)</label>
            <Textarea value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} placeholder="Ajouter une description..." rows={3} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-12 justify-start"><Calendar className="w-4 h-4 mr-2" />{format(formData.date, "PPP", { locale: fr })}</Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent mode="single" selected={formData.date} onSelect={(date) => date && setFormData({ ...formData, date })} locale={fr} className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="fixed" checked={formData.isFixed} onCheckedChange={(checked) => setFormData({ ...formData, isFixed: checked as boolean })} />
            <label htmlFor="fixed" className="text-sm text-foreground cursor-pointer">
              {formData.type === "income" ? "Entrée fixe (récurrente)" : "Dépense fixe (récurrente)"} — enregistrée comme modèle réutilisable
            </label>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-12 btn-primary">
            {isLoading ? "Enregistrement..." : "Enregistrer la transaction"}
          </Button>
        </form>
      </div>

      {/* Edit fixed modal */}
      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier le modèle</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-3">
              <div>
                <label className="text-xs label-caps text-muted-foreground">Montant</label>
                <Input type="number" value={editItem.amount} onChange={(e) => setEditItem({ ...editItem, amount: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="text-xs label-caps text-muted-foreground">Catégorie</label>
                <Select value={editItem.category} onValueChange={(v) => setEditItem({ ...editItem, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs label-caps text-muted-foreground">Note</label>
                <Textarea value={editItem.note || ""} onChange={(e) => setEditItem({ ...editItem, note: e.target.value })} rows={2} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Annuler</Button>
            <Button
              className="btn-primary"
              onClick={async () => {
                if (!editItem) return;
                await updateFixedExpense({ id: editItem.id, updates: { amount: editItem.amount, category: editItem.category, note: editItem.note } });
                toast.success("Modèle mis à jour");
                setEditItem(null);
              }}
            >Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce modèle ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le modèle sera supprimé mais les transactions déjà enregistrées dans l'historique seront conservées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-danger hover:bg-danger/90"
              onClick={async () => {
                if (deleteId) {
                  await deleteFixedExpense(deleteId);
                  toast.success("Modèle supprimé");
                }
                setDeleteId(null);
              }}
            >Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AddTransaction;
