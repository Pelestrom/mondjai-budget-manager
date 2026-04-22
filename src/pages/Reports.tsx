import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { motion } from "framer-motion";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";

const Reports = () => {
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  const { budgets } = useBudgets();
  const { categories } = useCategories();

  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [isGenerating, setIsGenerating] = useState(false);

  const filterTransactionsByDate = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate >= start && tDate <= end;
    });
  };

  const calculateStats = (filtered: typeof transactions) => {
    let income = 0;
    let expenses = 0;

    filtered.forEach((t) => {
      if (t.type === "income") {
        income += t.amount;
      } else {
        expenses += t.amount;
      }
    });

    const statsByCategory = categories.map((cat) => {
      const catTransactions = filtered.filter((t) => t.category_id === cat.id);
      const total = catTransactions.reduce((sum, t) => {
        return t.type === "expense" ? sum + t.amount : sum - t.amount;
      }, 0);
      return {
        name: cat.name,
        total,
        count: catTransactions.length,
      };
    }).filter(s => s.total !== 0);

    return { income, expenses, balance: income - expenses, statsByCategory };
  };

  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      const filtered = filterTransactionsByDate();
      const stats = calculateStats(filtered);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      pdf.setFontSize(24);
      pdf.setFont(undefined, "bold");
      pdf.text("Bilan Financier", pageWidth / 2, yPosition, { align: "center" });

      yPosition += 12;
      pdf.setFontSize(10);
      pdf.setFont(undefined, "normal");
      pdf.text(
        `Période: ${format(new Date(startDate), "dd MMMM yyyy", { locale: fr })} - ${format(new Date(endDate), "dd MMMM yyyy", { locale: fr })}`,
        pageWidth / 2,
        yPosition,
        { align: "center" }
      );

      yPosition += 15;

      // Summary Stats
      pdf.setFontSize(12);
      pdf.setFont(undefined, "bold");
      pdf.text("Résumé", 20, yPosition);

      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setFont(undefined, "normal");

      const summaryLines = [
        `Entrées: ${stats.income.toFixed(2)}`,
        `Dépenses: ${stats.expenses.toFixed(2)}`,
        `Solde: ${stats.balance.toFixed(2)}`,
        `Nombre de transactions: ${filtered.length}`,
      ];

      summaryLines.forEach((line) => {
        pdf.text(line, 20, yPosition);
        yPosition += 8;
      });

      yPosition += 5;

      // Categories breakdown
      if (stats.statsByCategory.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, "bold");
        pdf.text("Répartition par Catégorie", 20, yPosition);

        yPosition += 10;
        pdf.setFontSize(9);
        pdf.setFont(undefined, "normal");

        stats.statsByCategory.forEach((stat) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          const categoryLine = `${stat.name}: ${stat.total.toFixed(2)} (${stat.count} transaction(s))`;
          pdf.text(categoryLine, 20, yPosition);
          yPosition += 7;
        });
      }

      yPosition += 5;

      // Budgets information
      if (budgets.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, "bold");
        pdf.text("Budgets", 20, yPosition);

        yPosition += 10;
        pdf.setFontSize(9);
        pdf.setFont(undefined, "normal");

        budgets.forEach((budget) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          const categoryName = categories.find((c) => c.id === budget.category_id)?.name || "N/A";
          const budgetLine = `${categoryName}: ${budget.limit.toFixed(2)} (Période: ${budget.period})`;
          pdf.text(budgetLine, 20, yPosition);
          yPosition += 7;
        });
      }

      yPosition += 10;

      // Footer
      pdf.setFontSize(8);
      pdf.setFont(undefined, "normal");
      const timestamp = format(new Date(), "dd MMMM yyyy 'à' HH:mm", { locale: fr });
      pdf.text(`Généré le ${timestamp}`, pageWidth / 2, pageHeight - 10, { align: "center" });

      // Save PDF
      const fileName = `bilan_${format(new Date(startDate), "yyyy-MM-dd")}_to_${format(new Date(endDate), "yyyy-MM-dd")}.pdf`;
      pdf.save(fileName);

      toast.success("Bilan téléchargé avec succès");
      setIsGenerating(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erreur lors de la génération du bilan");
      setIsGenerating(false);
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
            <h1 className="text-2xl font-bold text-foreground">Bilans</h1>
            <p className="text-sm text-muted-foreground">
              Téléchargez vos bilans financiers en PDF
            </p>
          </div>
        </motion.div>

        {/* Date Range Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 card-gradient">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Période du rapport
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date de début</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date de fin</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
              <Button
                onClick={generatePDF}
                disabled={isGenerating}
                className="w-full btn-primary"
              >
                <Download className="w-4 h-4 mr-2" />
                {isGenerating ? "Génération en cours..." : "Télécharger le bilan"}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Report Summary Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 card-gradient">
            <h2 className="text-lg font-semibold text-foreground mb-4">Aperçu du rapport</h2>
            <div className="space-y-4">
              {(() => {
                const filtered = filterTransactionsByDate();
                const stats = calculateStats(filtered);
                return (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                        <p className="text-sm text-muted-foreground">Entrées</p>
                        <p className="text-2xl font-bold text-success">
                          {stats.income.toFixed(2)}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-danger/10 border border-danger/20">
                        <p className="text-sm text-muted-foreground">Dépenses</p>
                        <p className="text-2xl font-bold text-danger">
                          {stats.expenses.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                      <p className="text-sm text-muted-foreground">Solde</p>
                      <p className={`text-2xl font-bold ${stats.balance >= 0 ? "text-success" : "text-danger"}`}>
                        {stats.balance.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted border border-border">
                      <p className="text-sm text-muted-foreground">Nombre de transactions</p>
                      <p className="text-2xl font-bold text-foreground">{filtered.length}</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;
