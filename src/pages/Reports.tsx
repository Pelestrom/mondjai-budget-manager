import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import mondjaiLogo from "@/assets/mondjai-logo.png";

const Reports = () => {
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  const { budgets, globalBudget } = useBudgets();
  const { categories } = useCategories();
  const { profile } = useAuth();
  const currency = profile?.currency || "FCFA";

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
      const catTransactions = filtered.filter((t) => t.category === cat.id || t.category === cat.name);
      const expensesTotal = catTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        name: cat.name,
        total: expensesTotal,
        count: catTransactions.length,
        color: cat.color || "#00A86B",
      };
    }).filter((s) => s.total > 0).sort((a, b) => b.total - a.total);

    return { income, expenses, balance: income - expenses, statsByCategory };
  };

  // Brand palette (mirrors index.css design tokens)
  const COLORS = {
    primary: [0, 168, 107] as [number, number, number],     // #00A86B
    secondary: [242, 201, 76] as [number, number, number],  // #F2C94C
    danger: [239, 68, 68] as [number, number, number],      // #EF4444
    dark: [26, 26, 26] as [number, number, number],         // #1A1A1A
    muted: [115, 115, 115] as [number, number, number],
    bgSoft: [248, 249, 250] as [number, number, number],    // #F8F9FA
    border: [229, 229, 229] as [number, number, number],
  };

  const hexToRgb = (hex: string): [number, number, number] => {
    const clean = hex.replace("#", "");
    const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
    const num = parseInt(full, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  };

  const fmt = (n: number) => `${n.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} ${currency}`;

  const loadLogoDataUrl = (): Promise<string | null> =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(null);
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = mondjaiLogo;
    });

  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      const filtered = filterTransactionsByDate();
      const stats = calculateStats(filtered);

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let y = 0;

      // ---------- HEADER (green band with logo) ----------
      pdf.setFillColor(...COLORS.primary);
      pdf.rect(0, 0, pageWidth, 40, "F");

      const logoData = await loadLogoDataUrl();
      if (logoData) {
        try {
          pdf.addImage(logoData, "PNG", margin, 10, 22, 22);
        } catch {
          /* ignore */
        }
      }

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Bilan Financier", pageWidth - margin, 18, { align: "right" });

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `${format(new Date(startDate), "dd MMM yyyy", { locale: fr })} → ${format(new Date(endDate), "dd MMM yyyy", { locale: fr })}`,
        pageWidth - margin,
        26,
        { align: "right" }
      );
      if (profile?.username) {
        pdf.setFontSize(9);
        pdf.text(profile.username, pageWidth - margin, 33, { align: "right" });
      }

      y = 52;

      // ---------- SUMMARY CARDS ----------
      pdf.setTextColor(...COLORS.dark);
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.text("Résumé", margin, y);
      y += 6;

      const cardW = (pageWidth - margin * 2 - 8) / 3;
      const cardH = 24;

      const drawCard = (
        x: number,
        label: string,
        value: string,
        color: [number, number, number]
      ) => {
        pdf.setFillColor(color[0], color[1], color[2]);
        pdf.roundedRect(x, y, cardW, cardH, 3, 3, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text(label, x + 4, y + 7);
        pdf.setFontSize(13);
        pdf.setFont("helvetica", "bold");
        pdf.text(value, x + 4, y + 17);
      };

      drawCard(margin, "Entrées", fmt(stats.income), COLORS.primary);
      drawCard(margin + cardW + 4, "Dépenses", fmt(stats.expenses), COLORS.danger);
      drawCard(
        margin + (cardW + 4) * 2,
        "Solde",
        fmt(stats.balance),
        stats.balance >= 0 ? COLORS.primary : COLORS.danger
      );

      y += cardH + 4;
      pdf.setTextColor(...COLORS.muted);
      pdf.setFontSize(8);
      pdf.text(
        `${filtered.length} transaction(s) sur la période`,
        margin,
        y
      );
      y += 10;

      // ---------- BAR CHART: Categories ----------
      if (stats.statsByCategory.length > 0) {
        pdf.setTextColor(...COLORS.dark);
        pdf.setFontSize(13);
        pdf.setFont("helvetica", "bold");
        pdf.text("Dépenses par catégorie", margin, y);
        y += 6;

        const top = stats.statsByCategory.slice(0, 8);
        const maxVal = Math.max(...top.map((s) => s.total));
        const chartW = pageWidth - margin * 2;
        const rowH = 9;
        const labelW = 40;
        const valueW = 32;
        const barAreaW = chartW - labelW - valueW - 4;

        // Soft background
        pdf.setFillColor(...COLORS.bgSoft);
        pdf.roundedRect(margin, y, chartW, top.length * rowH + 6, 3, 3, "F");
        y += 4;

        top.forEach((s) => {
          const ratio = maxVal > 0 ? s.total / maxVal : 0;
          const barW = Math.max(1, ratio * barAreaW);
          const rgb = hexToRgb(s.color);

          // Label
          pdf.setTextColor(...COLORS.dark);
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "normal");
          const labelText = s.name.length > 18 ? s.name.slice(0, 17) + "…" : s.name;
          pdf.text(labelText, margin + 3, y + 5);

          // Bar background
          pdf.setFillColor(...COLORS.border);
          pdf.roundedRect(margin + labelW, y + 1.5, barAreaW, rowH - 4, 1.2, 1.2, "F");

          // Bar fill
          pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
          pdf.roundedRect(margin + labelW, y + 1.5, barW, rowH - 4, 1.2, 1.2, "F");

          // Value
          pdf.setTextColor(...COLORS.dark);
          pdf.setFont("helvetica", "bold");
          pdf.text(fmt(s.total), margin + chartW - 3, y + 5, { align: "right" });

          y += rowH;
        });
        y += 6;
      }

      // ---------- BUDGETS ----------
      const allBudgets = [
        ...(globalBudget
          ? [{ name: "Budget Global", amount: Number(globalBudget.amount), period: globalBudget.period, spent: stats.expenses }]
          : []),
        ...budgets
          .filter((b) => b.category_id)
          .map((b) => {
            const cat = categories.find((c) => c.id === b.category_id);
            const spent = filtered
              .filter((t) => t.type === "expense" && (t.category === b.category_id || t.category === cat?.name))
              .reduce((sum, t) => sum + t.amount, 0);
            return {
              name: cat?.name || "Catégorie",
              amount: Number(b.amount),
              period: b.period,
              spent,
            };
          }),
      ];

      if (allBudgets.length > 0) {
        if (y > pageHeight - 60) {
          pdf.addPage();
          y = 20;
        }

        pdf.setTextColor(...COLORS.dark);
        pdf.setFontSize(13);
        pdf.setFont("helvetica", "bold");
        pdf.text("Suivi des budgets", margin, y);
        y += 7;

        allBudgets.forEach((b) => {
          if (y > pageHeight - 25) {
            pdf.addPage();
            y = 20;
          }
          const pct = b.amount > 0 ? Math.min(100, (b.spent / b.amount) * 100) : 0;
          const overBudget = b.spent > b.amount;
          const fill = overBudget ? COLORS.danger : pct >= 80 ? COLORS.secondary : COLORS.primary;

          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...COLORS.dark);
          pdf.text(b.name, margin, y);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(...COLORS.muted);
          pdf.text(`${fmt(b.spent)} / ${fmt(b.amount)}  •  ${pct.toFixed(0)}%`, pageWidth - margin, y, {
            align: "right",
          });

          y += 2.5;
          const barW = pageWidth - margin * 2;
          pdf.setFillColor(...COLORS.border);
          pdf.roundedRect(margin, y, barW, 3, 1.5, 1.5, "F");
          pdf.setFillColor(fill[0], fill[1], fill[2]);
          pdf.roundedRect(margin, y, (barW * pct) / 100, 3, 1.5, 1.5, "F");

          y += 9;
        });
      }

      // ---------- TRANSACTIONS LIST (last page section) ----------
      if (filtered.length > 0) {
        if (y > pageHeight - 50) {
          pdf.addPage();
          y = 20;
        }

        pdf.setTextColor(...COLORS.dark);
        pdf.setFontSize(13);
        pdf.setFont("helvetica", "bold");
        pdf.text("Détail des transactions", margin, y);
        y += 6;

        // Table header
        pdf.setFillColor(...COLORS.primary);
        pdf.rect(margin, y, pageWidth - margin * 2, 7, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.text("Date", margin + 2, y + 5);
        pdf.text("Catégorie", margin + 28, y + 5);
        pdf.text("Type", margin + 80, y + 5);
        pdf.text("Montant", pageWidth - margin - 2, y + 5, { align: "right" });
        y += 7;

        const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        sorted.forEach((t, i) => {
          if (y > pageHeight - 15) {
            pdf.addPage();
            y = 20;
          }
          if (i % 2 === 0) {
            pdf.setFillColor(...COLORS.bgSoft);
            pdf.rect(margin, y, pageWidth - margin * 2, 6, "F");
          }
          pdf.setTextColor(...COLORS.dark);
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "normal");
          pdf.text(format(new Date(t.date), "dd/MM/yy"), margin + 2, y + 4);
          const catName = (t.category || "—").slice(0, 22);
          pdf.text(catName, margin + 28, y + 4);
          pdf.setTextColor(...(t.type === "income" ? COLORS.primary : COLORS.danger));
          pdf.text(t.type === "income" ? "Entrée" : "Dépense", margin + 80, y + 4);
          pdf.setFont("helvetica", "bold");
          pdf.text(`${t.type === "income" ? "+" : "-"}${fmt(t.amount)}`, pageWidth - margin - 2, y + 4, {
            align: "right",
          });
          y += 6;
        });
      }

      // ---------- FOOTER on every page ----------
      const totalPages = pdf.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        pdf.setDrawColor(...COLORS.border);
        pdf.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
        pdf.setFontSize(7);
        pdf.setTextColor(...COLORS.muted);
        pdf.setFont("helvetica", "normal");
        pdf.text(
          `MonDjai • Généré le ${format(new Date(), "dd MMM yyyy 'à' HH:mm", { locale: fr })}`,
          margin,
          pageHeight - 7
        );
        pdf.text(`Page ${p} / ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: "right" });
      }

      const fileName = `bilan_mondjai_${format(new Date(startDate), "yyyy-MM-dd")}_${format(new Date(endDate), "yyyy-MM-dd")}.pdf`;
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
