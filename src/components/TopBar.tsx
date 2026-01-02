import { Bell, Menu, User, Clock, Settings, LogOut, Grid3X3, HelpCircle, Download, Wallet } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useBudgets } from "@/hooks/useBudgets";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import mondjaiLogo from "@/assets/mondjai-logo.png";

export const TopBar = () => {
  const { profile, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { budgets, globalBudget } = useBudgets();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleExportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      user: profile?.username,
      transactions,
      categories,
      budgets,
      globalBudget,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mondjai-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const firstLetter = profile?.username?.charAt(0).toUpperCase() || "U";

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/30 safe-area-top"
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center"
        >
          <img src={mondjaiLogo} alt="MonDjai" className="h-8" />
        </motion.div>

        {/* Right side: Notifications & Menu */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <NavLink to="/notifications" className="relative">
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" className="relative h-10 w-10">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1.5 right-1.5 bg-danger rounded-full w-2.5 h-2.5"
                  />
                )}
              </Button>
            </motion.div>
          </NavLink>

          {/* Menu Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="w-5 h-5" />
                </Button>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover shadow-xl border-border/50">
              {/* User Profile */}
              <DropdownMenuItem 
                onClick={() => navigate("/settings")} 
                className="flex items-center gap-3 py-3 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent text-white font-bold text-sm flex items-center justify-center">
                  {firstLetter}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{profile?.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {profile?.is_student ? "Étudiant" : "Utilisateur"}
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/manage-transactions")} className="flex items-center gap-3 py-2.5 cursor-pointer">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                <span>Gérer mes entrées/dépenses</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/history")} className="flex items-center gap-3 py-2.5 cursor-pointer">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Historique</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/categories")} className="flex items-center gap-3 py-2.5 cursor-pointer">
                <Grid3X3 className="w-4 h-4 text-muted-foreground" />
                <span>Catégories</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")} className="flex items-center gap-3 py-2.5 cursor-pointer">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span>Réglages</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/help")} className="flex items-center gap-3 py-2.5 cursor-pointer">
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                <span>Aide & Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportData} className="flex items-center gap-3 py-2.5 cursor-pointer">
                <Download className="w-4 h-4 text-muted-foreground" />
                <span>Exporter les données</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-3 py-2.5 cursor-pointer text-danger">
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
};
