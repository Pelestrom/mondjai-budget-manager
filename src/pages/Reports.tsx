import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { useFixedExpenses } from "@/hooks/useFixedExpenses";
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
  const { fixedExpenses } = useFixedExpenses();
  const { profile } = useAuth();
  const currency = profile?.currency || "FCFA";

  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [isGenerating, setIsGenerating] = useState(false);

  const COLORS = {
    primary: [22, 166, 114] as [number, number, number],
    primaryDeep: [11, 61, 46] as [number, number, number],
    primarySoft: [227, 251, 241] as [number, number, number],
    danger: [240, 68, 82] as [number, number, number],
    dangerSoft: [253, 232, 234] as [number, number, number],
    warning: [245, 166, 35] as [number, number, number],
    dark: [13, 31, 25] as [number, number, number],
    muted: [107, 124, 118] as [number, number, number],
    bgSoft: [247, 249, 248] as [number, number, number],
    border: [228, 235, 232] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
  };

  const hexToRgb = (hex: string): [number, number, number] => {
    const clean = hex.replace("#", "");
    const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
    const n = parseInt(full, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };

  // Manual thousands separator — jsPDF's helvetica can't render narrow no-break space
  // produced by toLocaleString("fr-FR") (renders as "/" or garbage). Use plain space.
  const formatNumber = (n: number) => {
    const rounded = Math.round(n);
    const abs = Math.abs(rounded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return rounded < 0 ? `-${abs}` : abs;
  };
  const fmt = (n: number) => `${formatNumber(n)} ${currency}`;

  const loadLogo = (): Promise<{ data: string; w: number; h: number } | null> =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const c = document.createElement("canvas");
          c.width = img.naturalWidth; c.height = img.naturalHeight;
          c.getContext("2d")!.drawImage(img, 0, 0);
          resolve({ data: c.toDataURL("image/png"), w: img.naturalWidth, h: img.naturalHeight });
        } catch { resolve(null); }
      };
      img.onerror = () => resolve(null);
      img.src = mondjaiLogo;
    });

  const filterByDate = () => {
    const s = new Date(startDate); const e = new Date(endDate);
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= s && d <= e;
    });
  };

  const calcStats = (filtered: typeof transactions) => {
    let income = 0, expenses = 0;
    filtered.forEach((t) => {
      if (t.type === "income") income += Number(t.amount);
      else expenses += Number(t.amount);
    });
    const byCategory = categories.map((cat) => {
      const list = filtered.filter((t) => t.type === "expense" && (t.category === cat.id || t.category === cat.name));
      return { name: cat.name, total: list.reduce((s, t) => s + Number(t.amount), 0), color: cat.color || "#16A672" };
    }).filter((x) => x.total > 0).sort((a, b) => b.total - a.total);
    return { income, expenses, balance: income - expenses, byCategory };
  };

  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      const filtered = filterByDate();
      const stats = calcStats(filtered);
      const fixedIncomes = filtered.filter((t) => t.type === "income" && t.is_fixed);
      const fixedExpsInPeriod = filtered.filter((t) => t.type === "expense" && t.is_fixed);
      const totalFixedIn = fixedIncomes.reduce((s, t) => s + Number(t.amount), 0);
      const totalFixedExp = fixedExpsInPeriod.reduce((s, t) => s + Number(t.amount), 0);

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = pdf.internal.pageSize.getWidth();
      const H = pdf.internal.pageSize.getHeight();
      const M = 15;
      let y = 0;

      // ================= HEADER =================
      const headerH = 34;
      pdf.setFillColor(...COLORS.primaryDeep);
      pdf.rect(0, 0, W, headerH, "F");
      pdf.setFillColor(...COLORS.primary);
      pdf.rect(0, headerH, W, 1.2, "F");

      const logoData = await loadLogo();
      // White pill badge with logo centered
      const BADGE_D = 20; // mm (~56px)
      const badgeCx = M + BADGE_D / 2;
      const badgeCy = headerH / 2;
      try {
        const GState = (pdf as any).GState;
        if (GState) {
          (pdf as any).setGState(new GState({ opacity: 0.18 }));
          pdf.setFillColor(0, 0, 0);
          pdf.circle(badgeCx, badgeCy + 0.6, BADGE_D / 2, "F");
          (pdf as any).setGState(new GState({ opacity: 1 }));
        }
      } catch { /**/ }
      pdf.setFillColor(255, 255, 255);
      pdf.circle(badgeCx, badgeCy, BADGE_D / 2, "F");

      if (logoData) {
        const inner = BADGE_D - 6;
        const ratio = logoData.w / logoData.h;
        const lw = ratio >= 1 ? inner : inner * ratio;
        const lh = ratio >= 1 ? inner / ratio : inner;
        pdf.addImage(logoData.data, "PNG", badgeCx - lw / 2, badgeCy - lh / 2, lw, lh);
      }

      const textX = M + BADGE_D + 6;
      pdf.setTextColor(...COLORS.white);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("Bilan Financier", textX, headerH / 2 - 1);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      const dateRange = `${format(new Date(startDate), "dd MMM yyyy", { locale: fr })} au ${format(new Date(endDate), "dd MMM yyyy", { locale: fr })}`;
      pdf.text(dateRange, textX, headerH / 2 + 4.5);
      if (profile?.username) {
        pdf.setFontSize(8);
        pdf.setTextColor(210, 240, 228);
        pdf.text(profile.username, W - M, headerH / 2 + 4.5, { align: "right" });
      }

      y = headerH + 12;

      // ================= SUMMARY CARDS =================
      pdf.setTextColor(...COLORS.dark);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text("Résumé de la période", M, y);
      y += 5;

      const gap = 4;
      const cardW = (W - M * 2 - gap * 2) / 3;
      const cardH = 26;

      const drawSummaryCard = (
        x: number, label: string, value: string,
        accent: [number, number, number], soft: [number, number, number],
        arrow: "up" | "down" | "wallet"
      ) => {
        // Soft shadow (below card)
        try {
          const GState = (pdf as any).GState;
          if (GState) {
            (pdf as any).setGState(new GState({ opacity: 0.08 }));
            pdf.setFillColor(0, 0, 0);
            pdf.roundedRect(x, y + 1.2, cardW, cardH, 3, 3, "F");
            (pdf as any).setGState(new GState({ opacity: 1 }));
          }
        } catch { /* ignore */ }
        // Card
        pdf.setFillColor(...COLORS.white);
        pdf.roundedRect(x, y, cardW, cardH, 3, 3, "F");
        pdf.setDrawColor(...COLORS.border);
        pdf.roundedRect(x, y, cardW, cardH, 3, 3, "S");
        // Icon circle
        pdf.setFillColor(...soft);
        pdf.circle(x + 8, y + 9, 4.5, "F");
        pdf.setDrawColor(...accent);
        pdf.setLineWidth(0.6);
        // draw small arrow glyph
        const cx = x + 8, cy = y + 9;
        pdf.setDrawColor(...accent);
        if (arrow === "up") {
          pdf.line(cx - 2, cy + 1.5, cx + 2, cy - 2);
          pdf.line(cx + 2, cy - 2, cx - 0.3, cy - 2);
          pdf.line(cx + 2, cy - 2, cx + 2, cy + 0.3);
        } else if (arrow === "down") {
          pdf.line(cx - 2, cy - 1.5, cx + 2, cy + 2);
          pdf.line(cx + 2, cy + 2, cx - 0.3, cy + 2);
          pdf.line(cx + 2, cy + 2, cx + 2, cy - 0.3);
        } else {
          pdf.roundedRect(cx - 2.2, cy - 1.6, 4.4, 3.2, 0.4, 0.4, "S");
          pdf.line(cx + 0.4, cy - 0.2, cx + 1.6, cy - 0.2);
        }
        pdf.setLineWidth(0.2);
        // Label
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7.5);
        pdf.setTextColor(...COLORS.muted);
        pdf.text(label.toUpperCase(), x + 15, y + 8);
        // Value
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.setTextColor(accent[0], accent[1], accent[2]);
        pdf.text(value, x + 15, y + 16);
        // Bottom stripe
        pdf.setFillColor(accent[0], accent[1], accent[2]);
        pdf.rect(x, y + cardH - 1.5, cardW, 1.5, "F");
      };

      drawSummaryCard(M, "Entrées", fmt(stats.income), COLORS.primary, COLORS.primarySoft, "up");
      drawSummaryCard(M + cardW + gap, "Dépenses", fmt(stats.expenses), COLORS.danger, COLORS.dangerSoft, "down");
      drawSummaryCard(
        M + (cardW + gap) * 2, "Solde", fmt(stats.balance),
        stats.balance >= 0 ? COLORS.primary : COLORS.danger,
        stats.balance >= 0 ? COLORS.primarySoft : COLORS.dangerSoft,
        "wallet"
      );
      y += cardH + 4;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(...COLORS.muted);
      pdf.text(`${filtered.length} transaction(s) sur la période`, M, y);
      y += 8;

      // ================= PIE CHART: repartition catégories =================
      if (stats.byCategory.length > 0) {
        pdf.setTextColor(...COLORS.dark);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text("Répartition des dépenses par catégorie", M, y);
        y += 6;

        const chartBoxH = 55;
        // background card
        pdf.setFillColor(...COLORS.bgSoft);
        pdf.roundedRect(M, y, W - M * 2, chartBoxH, 3, 3, "F");

        const cx = M + 30, cy = y + chartBoxH / 2;
        const r = 20;
        const total = stats.byCategory.reduce((s, c) => s + c.total, 0);
        let a0 = -Math.PI / 2;
        const slices = stats.byCategory.slice(0, 8);
        slices.forEach((s) => {
          const frac = s.total / total;
          const a1 = a0 + frac * Math.PI * 2;
          const rgb = hexToRgb(s.color);
          pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
          // Approximate pie slice via triangles (jsPDF has no path fill for arcs)
          const steps = Math.max(6, Math.ceil((a1 - a0) * 12));
          const pts: [number, number][] = [[cx, cy]];
          for (let i = 0; i <= steps; i++) {
            const a = a0 + (i / steps) * (a1 - a0);
            pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
          }
          // Draw triangles from center
          for (let i = 1; i < pts.length - 1; i++) {
            pdf.triangle(cx, cy, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], "F");
          }
          a0 = a1;
        });
        // Donut hole
        pdf.setFillColor(...COLORS.bgSoft);
        pdf.circle(cx, cy, 9, "F");
        pdf.setTextColor(...COLORS.dark);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.text(`${slices.length}`, cx, cy - 0.5, { align: "center" });
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(6.5);
        pdf.setTextColor(...COLORS.muted);
        pdf.text("catégories", cx, cy + 3, { align: "center" });

        // Legend
        const lx = M + 62;
        let ly = y + 6;
        slices.forEach((s) => {
          const rgb = hexToRgb(s.color);
          pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
          pdf.roundedRect(lx, ly, 3.5, 3.5, 0.6, 0.6, "F");
          pdf.setTextColor(...COLORS.dark);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          const name = s.name.length > 22 ? s.name.slice(0, 21) + "…" : s.name;
          pdf.text(name, lx + 6, ly + 3);
          pdf.setFont("helvetica", "bold");
          const pct = ((s.total / total) * 100).toFixed(0);
          pdf.text(`${pct}%`, W - M - 22, ly + 3, { align: "right" });
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(...COLORS.muted);
          pdf.text(fmt(s.total), W - M - 3, ly + 3, { align: "right" });
          ly += 5.5;
        });
        y += chartBoxH + 6;
      }

      // ================= FIXED SECTION =================
      if (fixedIncomes.length > 0 || fixedExpsInPeriod.length > 0 || fixedExpenses.length > 0) {
        if (y > H - 60) { pdf.addPage(); y = 20; }
        pdf.setTextColor(...COLORS.dark);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text("Entrées & dépenses fixes", M, y);
        y += 5;
        // 2 mini cards
        const mw = (W - M * 2 - 4) / 2;
        pdf.setFillColor(...COLORS.primarySoft);
        pdf.roundedRect(M, y, mw, 16, 2.5, 2.5, "F");
        pdf.setTextColor(...COLORS.primaryDeep);
        pdf.setFont("helvetica", "normal"); pdf.setFontSize(7.5);
        pdf.text("ENTRÉES FIXES", M + 3, y + 6);
        pdf.setFont("helvetica", "bold"); pdf.setFontSize(11);
        pdf.text(fmt(totalFixedIn), M + 3, y + 12.5);

        pdf.setFillColor(...COLORS.dangerSoft);
        pdf.roundedRect(M + mw + 4, y, mw, 16, 2.5, 2.5, "F");
        pdf.setTextColor(139, 30, 40);
        pdf.setFont("helvetica", "normal"); pdf.setFontSize(7.5);
        pdf.text("DÉPENSES FIXES", M + mw + 7, y + 6);
        pdf.setFont("helvetica", "bold"); pdf.setFontSize(11);
        pdf.text(fmt(totalFixedExp), M + mw + 7, y + 12.5);
        y += 20;

        if (fixedExpenses.length > 0) {
          pdf.setTextColor(...COLORS.muted);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          pdf.text(`Modèles enregistrés : ${fixedExpenses.length}`, M, y);
          y += 6;
        }
      }

      // ================= BUDGETS =================
      const allBudgets = [
        ...(globalBudget ? [{ name: "Budget Global", amount: Number(globalBudget.amount), spent: stats.expenses }] : []),
        ...budgets.filter((b) => b.category_id).map((b) => {
          const cat = categories.find((c) => c.id === b.category_id);
          const spent = filtered.filter((t) => t.type === "expense" && (t.category === b.category_id || t.category === cat?.name)).reduce((s, t) => s + Number(t.amount), 0);
          return { name: cat?.name || "Catégorie", amount: Number(b.amount), spent };
        }),
      ];
      if (allBudgets.length > 0) {
        if (y > H - 50) { pdf.addPage(); y = 20; }
        pdf.setTextColor(...COLORS.dark);
        pdf.setFont("helvetica", "bold"); pdf.setFontSize(11);
        pdf.text("Suivi des budgets", M, y);
        y += 6;
        allBudgets.forEach((b) => {
          if (y > H - 25) { pdf.addPage(); y = 20; }
          const pct = b.amount > 0 ? Math.min(100, (b.spent / b.amount) * 100) : 0;
          const fill = b.spent > b.amount ? COLORS.danger : pct >= 80 ? COLORS.warning : COLORS.primary;
          pdf.setFontSize(9); pdf.setFont("helvetica", "bold"); pdf.setTextColor(...COLORS.dark);
          pdf.text(b.name, M, y);
          pdf.setFont("helvetica", "normal"); pdf.setTextColor(...COLORS.muted);
          pdf.text(`${fmt(b.spent)} / ${fmt(b.amount)}  •  ${pct.toFixed(0)}%`, W - M, y, { align: "right" });
          y += 2.5;
          pdf.setFillColor(...COLORS.border); pdf.roundedRect(M, y, W - M * 2, 3, 1.5, 1.5, "F");
          pdf.setFillColor(fill[0], fill[1], fill[2]); pdf.roundedRect(M, y, ((W - M * 2) * pct) / 100, 3, 1.5, 1.5, "F");
          y += 9;
        });
      }

      // ================= TRANSACTIONS TABLE =================
      if (filtered.length > 0) {
        if (y > H - 60) { pdf.addPage(); y = 20; }
        pdf.setTextColor(...COLORS.dark);
        pdf.setFont("helvetica", "bold"); pdf.setFontSize(11);
        pdf.text("Détail des transactions", M, y);
        y += 6;

        const drawTableHeader = () => {
          pdf.setFillColor(...COLORS.primaryDeep);
          pdf.rect(M, y, W - M * 2, 8, "F");
          pdf.setTextColor(...COLORS.white);
          pdf.setFontSize(8); pdf.setFont("helvetica", "bold");
          pdf.text("Date", M + 2, y + 5.3);
          pdf.text("Catégorie", M + 26, y + 5.3);
          pdf.text("Type", M + 78, y + 5.3);
          pdf.text("Fixe", M + 100, y + 5.3);
          pdf.text("Montant", W - M - 2, y + 5.3, { align: "right" });
          y += 8;
        };
        drawTableHeader();

        const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        sorted.forEach((t, i) => {
          if (y > H - 22) { pdf.addPage(); y = 20; drawTableHeader(); }
          if (i % 2 === 0) {
            pdf.setFillColor(...COLORS.bgSoft);
            pdf.rect(M, y, W - M * 2, 6.5, "F");
          }
          pdf.setTextColor(...COLORS.dark);
          pdf.setFontSize(8); pdf.setFont("helvetica", "normal");
          pdf.text(format(new Date(t.date), "dd/MM/yy"), M + 2, y + 4.5);
          const catName = (t.category || "—").slice(0, 26);
          pdf.text(catName, M + 26, y + 4.5);
          pdf.setTextColor(...(t.type === "income" ? COLORS.primary : COLORS.danger));
          pdf.text(t.type === "income" ? "Entrée" : "Dépense", M + 78, y + 4.5);
          pdf.setTextColor(...COLORS.muted);
          pdf.text(t.is_fixed ? "Oui" : "—", M + 100, y + 4.5);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...(t.type === "income" ? COLORS.primary : COLORS.danger));
          pdf.text(`${t.type === "income" ? "+" : "-"}${fmt(Number(t.amount))}`, W - M - 2, y + 4.5, { align: "right" });
          y += 6.5;
        });

        // Totals row
        if (y > H - 22) { pdf.addPage(); y = 20; }
        pdf.setFillColor(...COLORS.primaryDeep);
        pdf.rect(M, y, W - M * 2, 9, "F");
        pdf.setTextColor(...COLORS.white);
        pdf.setFont("helvetica", "bold"); pdf.setFontSize(9);
        pdf.text("TOTAL", M + 2, y + 6);
        pdf.text(`Entrées ${fmt(stats.income)}`, M + 40, y + 6);
        pdf.text(`Dépenses ${fmt(stats.expenses)}`, M + 95, y + 6);
        pdf.text(`Solde ${fmt(stats.balance)}`, W - M - 2, y + 6, { align: "right" });
        y += 12;
      }

      // ================= FOOTER (every page) =================
      const total = pdf.getNumberOfPages();
      for (let p = 1; p <= total; p++) {
        pdf.setPage(p);
        pdf.setDrawColor(...COLORS.border);
        pdf.setLineWidth(0.2);
        pdf.line(M, H - 12, W - M, H - 12);
        const footerLogoH = 5; // ~18px, aspect preserved
        let footerTextX = M;
        if (logoData) {
          const ratio = logoData.w / logoData.h;
          const lw = footerLogoH * ratio;
          const ly = H - 8.2;
          try { pdf.addImage(logoData.data, "PNG", M, ly, lw, footerLogoH); } catch { /**/ }
          footerTextX = M + lw + 2.2; // ~6-8px gap
        }
        pdf.setFontSize(7); pdf.setTextColor(...COLORS.muted); pdf.setFont("helvetica", "normal");
        pdf.text(`• ${format(new Date(), "dd MMM yyyy 'à' HH:mm", { locale: fr })}`, footerTextX, H - 5.5);
        pdf.text(`Page ${p} / ${total}`, W - M, H - 5.5, { align: "right" });
      }

      const fileName = `bilan_mondjai_${format(new Date(startDate), "yyyy-MM-dd")}_${format(new Date(endDate), "yyyy-MM-dd")}.pdf`;
      pdf.save(fileName);
      toast.success("Bilan téléchargé avec succès");
    } catch (error) {
      console.error("PDF error:", error);
      toast.error("Erreur lors de la génération du bilan");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pb-8 pt-20">
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0"><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bilans</h1>
            <p className="text-sm text-muted-foreground">Téléchargez vos bilans financiers en PDF</p>
          </div>
        </motion.div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><Calendar className="w-5 h-5" />Période du rapport</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date de début</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date de fin</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" />
              </div>
            </div>
            <Button onClick={generatePDF} disabled={isGenerating} className="w-full btn-primary">
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? "Génération en cours..." : "Télécharger le bilan"}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Aperçu du rapport</h2>
          {(() => {
            const filtered = filterByDate();
            const stats = calcStats(filtered);
            return (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                  <p className="text-sm text-muted-foreground">Entrées</p>
                  <p className="text-2xl font-bold text-success font-amount">{stats.income.toLocaleString("fr-FR")}</p>
                </div>
                <div className="p-4 rounded-xl bg-danger/10 border border-danger/20">
                  <p className="text-sm text-muted-foreground">Dépenses</p>
                  <p className="text-2xl font-bold text-danger font-amount">{stats.expenses.toLocaleString("fr-FR")}</p>
                </div>
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground">Solde</p>
                  <p className={`text-2xl font-bold font-amount ${stats.balance >= 0 ? "text-success" : "text-danger"}`}>{stats.balance.toLocaleString("fr-FR")}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted border border-border">
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold text-foreground font-amount">{filtered.length}</p>
                </div>
              </div>
            );
          })()}
        </Card>
      </div>
    </div>
  );
};

export default Reports;
