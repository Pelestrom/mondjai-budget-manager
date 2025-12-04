import { useState, useMemo } from "react";
import { Search, Calendar, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTransactionStore } from "@/store/transactionStore";
import { useCategoryStore } from "@/store/categoryStore";
import { useAuthStore } from "@/store/authStore";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";

const History = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { transactions } = useTransactionStore();
  const categories = useCategoryStore((state) => state.categories);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

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
        if (dateRange.from && new Date(t.date) < dateRange.from) return false;
        if (dateRange.to && new Date(t.date) > dateRange.to) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchQuery, filterType, dateRange]);

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName);
    if (category?.icon && (LucideIcons as any)[category.icon]) {
      const IconComponent = (LucideIcons as any)[category.icon];
      return <IconComponent className="w-5 h-5" />;
    }
    return <LucideIcons.Package className="w-5 h-5" />;
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
            <h1 className="text-2xl font-bold text-foreground">Historique</h1>
            <p className="text-sm text-muted-foreground">
              {filteredTransactions.length} transactions
            </p>
          </div>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
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

          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd MMM", { locale: fr })} -{" "}
                      {format(dateRange.to, "dd MMM yyyy", { locale: fr })}
                    </>
                  ) : (
                    format(dateRange.from, "dd MMM yyyy", { locale: fr })
                  )
                ) : (
                  "Filtrer par date"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                locale={fr}
                className={cn("p-3 pointer-events-auto")}
              />
              {(dateRange.from || dateRange.to) && (
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setDateRange({})}
                  >
                    Réinitialiser
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </motion.div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-12 text-center card-gradient">
              <p className="text-muted-foreground">Aucune transaction</p>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 card-gradient">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          transaction.type === "income"
                            ? "bg-success/10 text-success"
                            : "bg-danger/10 text-danger"
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
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
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
                          <p className="text-sm text-muted-foreground mt-1 truncate">
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
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;