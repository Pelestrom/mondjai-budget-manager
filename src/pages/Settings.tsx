import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Settings as SettingsIcon, HelpCircle, LogOut, Download, Upload, Search, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import { currencies } from "@/lib/currencies";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const Settings = () => {
  const navigate = useNavigate();
  const { profile, signOut, updateProfile } = useAuth();
  const { settings, toggleSetting, isLoading: settingsLoading } = useSettings();

  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(profile?.currency || "XOF");

  const currentCurrency = currencies.find(c => c.symbol === profile?.currency || c.code === profile?.currency);

  const filteredCurrencies = currencies.filter(c => 
    c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.symbol.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const handleLogout = async () => {
    if (confirm("Êtes-vous sûr de vouloir vous déconnecter?")) {
      await signOut();
      toast.success("Déconnexion réussie");
      navigate("/login");
    }
  };

  const handleSelectCurrency = async (symbol: string) => {
    setSelectedCurrency(symbol);
    await updateProfile({ currency: symbol });
    setIsCurrencyOpen(false);
    toast.success("Devise mise à jour");
  };

  const handleToggleBiometric = async (checked: boolean) => {
    await updateProfile({ biometric_enabled: checked });
    toast.success(checked ? "Biométrie activée" : "Biométrie désactivée");
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen pb-8 pt-20">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-48 mt-1" />
            </div>
          </div>
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
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
          <div>
            <h1 className="text-2xl font-bold text-foreground">Réglages</h1>
            <p className="text-sm text-muted-foreground">
              Personnalisez votre expérience
            </p>
          </div>
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
                    {profile?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{profile?.username}</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile?.is_student ? "Étudiant" : "Non-étudiant"}
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
                    <span>Devise: {profile?.currency}</span>
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
                checked={profile?.biometric_enabled || false}
                onCheckedChange={handleToggleBiometric}
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
                <p className="font-medium">Entrées/Dépenses fixes</p>
                <p className="text-sm text-muted-foreground">
                  Activer la gestion des transactions récurrentes
                </p>
              </div>
              <Switch
                checked={settings.fixed_expenses_enabled}
                onCheckedChange={() => toggleSetting('fixed_expenses_enabled')}
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
                checked={settings.detailed_stats_enabled}
                onCheckedChange={() => toggleSetting('detailed_stats_enabled')}
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
                checked={settings.smart_bar_enabled}
                onCheckedChange={() => toggleSetting('smart_bar_enabled')}
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
                checked={settings.notifications_enabled}
                onCheckedChange={() => toggleSetting('notifications_enabled')}
              />
            </div>
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
