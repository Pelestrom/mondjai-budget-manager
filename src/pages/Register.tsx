import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/store/authStore";
import { useCategoryStore } from "@/store/categoryStore";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { User, Lock, GraduationCap } from "lucide-react";
import mondjaiLogo from "@/assets/mondjai-logo.png";

const Register = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const initializeCategories = useCategoryStore((state) => state.initializeDefaultCategories);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isStudent, setIsStudent] = useState(false);
  const [currency, setCurrency] = useState("FCFA");

  const currencies = ["FCFA", "€", "$", "GBP", "¥", "Pesos", "Rand", "Naira"];

  const handleRegister = () => {
    if (!username || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    initializeCategories();

    login({
      id: Math.random().toString(36).substr(2, 9),
      username,
      isStudent,
      currency,
      rememberMe: true,
    });

    toast.success("Compte créé avec succès");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-accent/20 via-background to-primary/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="floating-card glassmorphism p-8 space-y-6">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="text-center space-y-3"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-3xl shadow-lg flex items-center justify-center p-3">
              <img src={mondjaiLogo} alt="MonDjai" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Créer un compte
            </h1>
            <p className="text-sm text-muted-foreground">
              Commencez à gérer votre budget
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom d'utilisateur</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choisissez un nom"
                  className="pl-10 input-field"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 input-field"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Devise</label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="input-field">
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

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="floating-card p-4 flex items-center justify-between border-border/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Statut étudiant</p>
                  <p className="text-xs text-muted-foreground">Activer les fonctionnalités étudiantes</p>
                </div>
              </div>
              <Switch checked={isStudent} onCheckedChange={setIsStudent} />
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={handleRegister} className="w-full btn-primary h-12 text-base shadow-lg">
                S'inscrire
              </Button>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <div className="text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-primary hover:underline font-medium"
            >
              Déjà un compte ? Se connecter
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
