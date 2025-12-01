import { useState, useMemo } from "react";
import { Search, Filter, Edit, Trash2, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTransactionStore } from "@/store/transactionStore";
import { useCategoryStore } from "@/store/categoryStore";
import { useAuthStore } from "@/store/authStore";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

const History = () => {
  const user = useAuthStore((state) => state.user);
  const { transactions, deleteTransaction } = useTransactionStore();
  const categories = useCategoryStore((state) => state.categories);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        if (filterType !== "all" && t.type !== filterType) return false;
        if (
          searchQuery &&
          !t.category.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !t.note?.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchQuery, filterType]);

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette transaction?")) {
      deleteTransaction(id);
      toast.success("Transaction supprimée");
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName);
    return category?.icon || "📦";
  };

  return (
    <div className="min-h-screen pb-24 safe-area-top">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Historique</h1>
          <p className="text-sm text-muted-foreground">
            {filteredTransactions.length} transactions
          </p>
        </div>

        {/* Search & Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
              className="flex-1"
            >
              Tous
            </Button>
            <Button
              variant={filterType === "income" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("income")}
              className="flex-1"
            >
              Revenus
            </Button>
            <Button
              variant={filterType === "expense" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("expense")}
              className="flex-1"
            >
              Dépenses
            </Button>
          </div>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Aucune transaction</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
                        transaction.type === "income"
                          ? "bg-success/10"
                          : "bg-danger/10"
                      }`}
                    >
                      {getCategoryIcon(transaction.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {transaction.category}
                        </h3>
                        {transaction.isFixed && (
                          <span className="text-[10px] bg-muted px-2 py-0.5 rounded">
                            Fixe
                          </span>
                        )}
                      </div>
                      {transaction.subcategory && (
                        <p className="text-xs text-muted-foreground">
                          {transaction.subcategory}
                        </p>
                      )}
                      {transaction.note && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {transaction.note}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(transaction.date), "PPp", {
                          locale: fr,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-lg font-bold ${
                        transaction.type === "income"
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {transaction.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.currency}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <Button variant="ghost" size="sm" className="text-xs flex-1">
                    <Edit className="w-3 h-3 mr-1" />
                    Modifier
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs flex-1">
                    <Copy className="w-3 h-3 mr-1" />
                    Dupliquer
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(transaction.id)}
                    className="text-xs flex-1 text-danger"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
