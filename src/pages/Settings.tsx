import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Settings as SettingsIcon, HelpCircle, LogOut, Download, Upload, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { currencies } from "@/lib/currencies";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser, biometricEnabled, setBiometric } = useAuthStore();
  const {
    fixedExpensesEnabled,
    detailedStatsEnabled,
    smartBarEnabled,
    notificationsEnabled,
    toggleFixedExpenses,
    toggleDetailedStats,
    toggleSmartBar,
    toggleNotifications,
  } = useSettingsStore();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(user?.currency || "FCFA");

  const currentCurrency = currencies.find(c => c.symbol === user?.currency || c.code === user?.currency);

  const filteredCurrencies = currencies.filter(c => 
    c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.symbol.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const handleLogout = () => {
    if (confirm("Êtes-vous sûr de vouloir vous déconnecter?")) {
      logout();
      toast.success("Déconnexion réussie");
      navigate("/login");
    }
  };

  const handleSelectCurrency = (symbol: string) => {
    setSelectedCurrency(symbol);
    updateUser({ currency: symbol });
    setIsCurrencyOpen(false);
    toast.success("Devise mise à jour");
  };

  return (
    <div className="min-h-screen pb-8 pt-20">
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Réglages</h1>
          <p className="text-sm text-muted-foreground">
            Personnalisez votre expérience
          </p>
        </motion.div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 card-gradient">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{user?.username}</h3>
                  <p className="text-sm text-muted-foreground">
                    {user?.isStudent ? "Étudiant" : "Non-étudiant"}
                  </p>
                </div>
              </div>
            </div>

            {/* Currency Selection */}
            <Dialog open={isCurrencyOpen} onOpenChange={setIsCurrencyOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-between mt-4">
                  <span className="flex items-center gap-2">
                    <span className="text-xl">{currentCurrency?.flag || "🌍"}</span>
                    <span>Devise: {user?.currency}</span>
                  </span>
                  <span className="text-muted-foreground">Modifier</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Choisir une devise</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={currencySearch}
                      onChange={(e) => setCurrencySearch(e.target.value)}
                      placeholder="Rechercher une devise..."
                      className="pl-9"
                    />
                  </div>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-1">
                      {filteredCurrencies.map((currency) => (
                        <button
                          key={currency.code}
                          onClick={() => handleSelectCurrency(currency.symbol)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted ${
                            selectedCurrency === currency.symbol ? "bg-primary/10 border border-primary/20" : ""
                          }`}
                        >
                          <span className="text-2xl">{currency.flag}</span>
                          <div className="text-left flex-1">
                            <p className="font-medium text-foreground">{currency.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {currency.code} - {currency.symbol}
                            </p>
                          </div>
                          {selectedCurrency === currency.symbol && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
          </Card>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Sécurité
          </h2>
          <Card className="p-4 card-gradient">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Authentification biométrique</p>
                <p className="text-sm text-muted-foreground">
                  FaceID / TouchID / Empreinte
                </p>
              </div>
              <Switch
                checked={biometricEnabled}
                onCheckedChange={(checked) => {
                  setBiometric(checked);
                  toast.success(
                    checked
                      ? "Biométrie activée"
                      : "Biométrie désactivée"
                  );
                }}
              />
            </div>
          </Card>
          <Card className="p-4 card-gradient">
            <Button variant="ghost" className="w-full justify-start">
              Changer le mot de passe
            </Button>
          </Card>
        </motion.div>

        {/* Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Options
          </h2>
          
          <Card className="p-4 space-y-4 card-gradient">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dépenses fixes</p>
                <p className="text-sm text-muted-foreground">
                  Activer la gestion des dépenses récurrentes
                </p>
              </div>
              <Switch
                checked={fixedExpensesEnabled}
                onCheckedChange={toggleFixedExpenses}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div>
                <p className="font-medium">Statistiques détaillées</p>
                <p className="text-sm text-muted-foreground">
                  Afficher graphiques et analyses avancées
                </p>
              </div>
              <Switch
                checked={detailedStatsEnabled}
                onCheckedChange={toggleDetailedStats}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div>
                <p className="font-medium">Barre intelligente</p>
                <p className="text-sm text-muted-foreground">
                  Budget quotidien adaptatif
                </p>
              </div>
              <Switch
                checked={smartBarEnabled}
                onCheckedChange={toggleSmartBar}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Alertes et rappels
                </p>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={toggleNotifications}
              />
            </div>
          </Card>
        </motion.div>

        {/* Import/Export */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <h2 className="text-lg font-semibold text-foreground">Données</h2>
          <Card className="p-4 space-y-2 card-gradient">
            <Button variant="ghost" className="w-full justify-start">
              <Upload className="w-4 h-4 mr-2" />
              Importer des données
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Exporter des données
            </Button>
          </Card>
        </motion.div>

        {/* Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-4 card-gradient">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/help")}
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Aide et support
            </Button>
          </Card>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full text-danger border-danger hover:bg-danger/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Se déconnecter
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
