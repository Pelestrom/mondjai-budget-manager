import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Trash2, Search, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTransactionStore, Transaction } from "@/store/transactionStore";
import { useCategoryStore } from "@/store/categoryStore";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import * as LucideIcons from "lucide-react";

const ManageTransactions = () => {
  const navigate = useNavigate();
  const { transactions, updateTransaction, deleteTransaction } = useTransactionStore();
  const categories = useCategoryStore((state) => state.categories);
  const user = useAuthStore((state) => state.user);
  
  const [search, setSearch] = useState("");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editFormData, setEditFormData] = useState({
    amount: "",
    type: "expense" as "income" | "expense",
    category: "",
    note: "",
  });

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

  const handleSaveEdit = () => {
    if (!editingTransaction) return;
    
    updateTransaction(editingTransaction.id, {
      amount: parseFloat(editFormData.amount),
      type: editFormData.type,
      category: editFormData.category,
      note: editFormData.note,
    });
    
    toast.success("Transaction modifiée");
    setEditingTransaction(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette transaction?")) {
      deleteTransaction(id);
      toast.success("Transaction supprimée");
    }
  };

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
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gérer mes transactions</h1>
            <p className="text-sm text-muted-foreground">
              Modifier ou supprimer vos entrées/dépenses
            </p>
          </div>
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
            <ScrollArea className="h-[calc(100vh-250px)]">
              <div className="space-y-3 pr-4">
                {sortedTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className="p-4 card-gradient">
                      <div className="flex items-center gap-3">
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
                            {transaction.type === "income" ? "+" : "-"}{transaction.amount.toLocaleString()} {user?.currency}
                          </p>
                        </div>
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
    </div>
  );
};

export default ManageTransactions;
