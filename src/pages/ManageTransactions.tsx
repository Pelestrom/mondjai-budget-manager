import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Trash2, Search, ArrowUpCircle, ArrowDownCircle, CheckSquare, Square, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useTransactions, Transaction } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import * as LucideIcons from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

const ManageTransactions = () => {
  const navigate = useNavigate();
  const { transactions, updateTransaction, deleteTransaction, isLoading: transactionsLoading } = useTransactions();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { profile } = useAuth();
  
  const [search, setSearch] = useState("");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editFormData, setEditFormData] = useState({
    amount: "",
    type: "expense" as "income" | "expense",
    category: "",
    note: "",
  });
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDeleteSelectedDialog, setShowDeleteSelectedDialog] = useState(false);

  const filteredTransactions = transactions.filter((t) =>
    t.category.toLowerCase().includes(search.toLowerCase()) ||
    t.note?.toLowerCase().includes(search.toLowerCase()) ||
    t.amount.toString().includes(search)
  );

  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName);
    if (category?.icon && (LucideIcons as any)[category.icon]) {
      const IconComponent = (LucideIcons as any)[category.icon];
      return <IconComponent className="w-5 h-5" />;
    }
    return <LucideIcons.Package className="w-5 h-5" />;
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName);
    return category?.color || "hsl(var(--primary))";
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditFormData({
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      note: transaction.note || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingTransaction) return;
    
    try {
      await updateTransaction({
        id: editingTransaction.id,
        updates: {
          amount: parseFloat(editFormData.amount),
          type: editFormData.type,
          category: editFormData.category,
          note: editFormData.note,
        },
      });
      
      toast.success("Transaction modifiée");
      setEditingTransaction(null);
    } catch (error) {
      toast.error("Une erreur est survenue");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette transaction?")) {
      try {
        await deleteTransaction(id);
        toast.success("Transaction supprimée");
      } catch (error) {
        toast.error("Une erreur est survenue");
      }
    }
  };

  // Selection handlers
  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const selectAll = () => {
    setSelectedIds(new Set(sortedTransactions.map(t => t.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteTransaction(id)));
      toast.success(`${selectedIds.size} transaction(s) supprimée(s)`);
      setSelectedIds(new Set());
      setSelectionMode(false);
    } catch (error) {
      toast.error("Une erreur est survenue");
    }
    setShowDeleteSelectedDialog(false);
  };

  const handleResetAll = async () => {
    try {
      await Promise.all(transactions.map(t => deleteTransaction(t.id)));
      toast.success("Toutes les transactions ont été supprimées");
      setSelectedIds(new Set());
      setSelectionMode(false);
    } catch (error) {
      toast.error("Une erreur est survenue");
    }
    setShowResetDialog(false);
  };

  const isLoading = transactionsLoading || categoriesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen pb-8 pt-20">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32 mt-1" />
            </div>
          </div>
          <Skeleton className="h-10 w-full" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8 pt-20">
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Gérer mes transactions</h1>
            <p className="text-sm text-muted-foreground">
              Modifier ou supprimer vos entrées/dépenses
            </p>
          </div>
        </motion.div>

        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-wrap gap-2"
        >
          <Button
            variant={selectionMode ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSelectionMode(!selectionMode);
              if (selectionMode) setSelectedIds(new Set());
            }}
          >
            {selectionMode ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
            {selectionMode ? "Annuler" : "Sélectionner"}
          </Button>
          
          {selectionMode && (
            <>
              <Button variant="outline" size="sm" onClick={selectAll}>
                Tout sélectionner
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Désélectionner
              </Button>
              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteSelectedDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer ({selectedIds.size})
                </Button>
              )}
            </>
          )}
          
          {transactions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-danger border-danger hover:bg-danger/10"
              onClick={() => setShowResetDialog(true)}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Réinitialiser tout
            </Button>
          )}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une transaction..."
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {sortedTransactions.length === 0 ? (
            <Card className="p-8 text-center card-gradient">
              <p className="text-muted-foreground">Aucune transaction</p>
            </Card>
          ) : (
            <ScrollArea className="h-[calc(100vh-320px)]">
              <div className="space-y-3 pr-4">
                {sortedTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card 
                      className={`p-4 card-gradient ${selectedIds.has(transaction.id) ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => selectionMode && toggleSelection(transaction.id)}
                    >
                      <div className="flex items-center gap-3">
                        {selectionMode && (
                          <Checkbox
                            checked={selectedIds.has(transaction.id)}
                            onCheckedChange={() => toggleSelection(transaction.id)}
                            className="shrink-0"
                          />
                        )}
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${getCategoryColor(transaction.category)}20`,
                            color: getCategoryColor(transaction.category),
                          }}
                        >
                          {getCategoryIcon(transaction.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold truncate">{transaction.category}</span>
                            {transaction.type === "income" ? (
                              <ArrowUpCircle className="w-4 h-4 text-success shrink-0" />
                            ) : (
                              <ArrowDownCircle className="w-4 h-4 text-danger shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(transaction.date), "dd MMM yyyy", { locale: fr })}
                            {transaction.note && ` • ${transaction.note}`}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`font-bold ${transaction.type === "income" ? "text-success" : "text-danger"}`}>
                            {transaction.type === "income" ? "+" : "-"}{transaction.amount.toLocaleString()} {profile?.currency}
                          </p>
                        </div>
                        {!selectionMode && (
                          <div className="flex gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(transaction)}
                            >
                              <Edit2 className="w-4 h-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDelete(transaction.id)}
                            >
                              <Trash2 className="w-4 h-4 text-danger" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </motion.div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">Montant</label>
              <Input
                type="number"
                value={editFormData.amount}
                onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select
                value={editFormData.type}
                onValueChange={(value: "income" | "expense") => setEditFormData({ ...editFormData, type: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Entrée</SelectItem>
                  <SelectItem value="expense">Dépense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Catégorie</label>
              <Select
                value={editFormData.category}
                onValueChange={(value) => setEditFormData({ ...editFormData, category: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Note</label>
              <Input
                value={editFormData.note}
                onChange={(e) => setEditFormData({ ...editFormData, note: e.target.value })}
                placeholder="Note optionnelle"
                className="mt-1"
              />
            </div>
            <Button onClick={handleSaveEdit} className="w-full btn-primary">
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Selected Dialog */}
      <AlertDialog open={showDeleteSelectedDialog} onOpenChange={setShowDeleteSelectedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer les transactions sélectionnées?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous allez supprimer {selectedIds.size} transaction(s). Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected} className="bg-danger hover:bg-danger/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset All Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réinitialiser toutes les transactions?</AlertDialogTitle>
            <AlertDialogDescription>
              Toutes vos transactions ({transactions.length}) seront définitivement supprimées. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetAll} className="bg-danger hover:bg-danger/90">
              Réinitialiser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageTransactions;
