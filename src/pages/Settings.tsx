import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Settings as SettingsIcon, HelpCircle, LogOut, Download, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { toast } from "sonner";

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
  const [currency, setCurrency] = useState(user?.currency || "FCFA");

  const currencies = ["FCFA", "€", "$", "GBP", "Yen", "Pesos", "Rand", "Naira", "Autre"];

  const handleLogout = () => {
    if (confirm("Êtes-vous sûr de vouloir vous déconnecter?")) {
      logout();
      toast.success("Déconnexion réussie");
      navigate("/login");
    }
  };

  const handleSaveCurrency = () => {
    updateUser({ currency });
    setIsProfileOpen(false);
    toast.success("Devise mise à jour");
  };

  return (
    <div className="min-h-screen pb-24 safe-area-top">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Réglages</h1>
          <p className="text-sm text-muted-foreground">
            Personnalisez votre expérience
          </p>
        </div>

        {/* Profile Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{user?.username}</h3>
                <p className="text-sm text-muted-foreground">
                  {user?.isStudent ? "Étudiant" : "Non-étudiant"}
                </p>
              </div>
            </div>
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Modifier
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Profil</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium">Nom d'utilisateur</label>
                    <p className="text-lg font-semibold mt-1">{user?.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Devise</label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((curr) => (
                          <SelectItem key={curr} value={curr}>
                            {curr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSaveCurrency} className="w-full btn-primary">
                    Enregistrer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Security */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Sécurité
          </h2>
          <Card className="p-4">
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
          <Card className="p-4">
            <Button variant="ghost" className="w-full justify-start">
              Changer le mot de passe
            </Button>
          </Card>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Options
          </h2>
          
          <Card className="p-4 space-y-4">
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

            <div className="flex items-center justify-between pt-4 border-t">
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

            <div className="flex items-center justify-between pt-4 border-t">
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

            <div className="flex items-center justify-between pt-4 border-t">
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
        </div>

        {/* Import/Export */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Données</h2>
          <Card className="p-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <Upload className="w-4 h-4 mr-2" />
              Importer des données
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Exporter des données
            </Button>
          </Card>
        </div>

        {/* Help */}
        <Card className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate("/help")}
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Aide et support
          </Button>
        </Card>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full text-danger border-danger hover:bg-danger/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Se déconnecter
        </Button>
      </div>
    </div>
  );
};

export default Settings;
