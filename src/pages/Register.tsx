import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { User, Lock, GraduationCap, Eye, EyeOff, Search, Mail } from "lucide-react";
import mondjaiLogo from "@/assets/mondjai-logo.png";
import { getAllDisplayCurrencies } from "@/lib/currencies";

const Register = () => {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [currency, setCurrency] = useState("XAF");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email, password, {
      username,
      is_student: isStudent,
      currency,
    });
    setIsLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("Cet email est déjà utilisé");
      } else {
        toast.error(error.message);
      }
      return;
    }

    toast.success("Compte créé avec succès");
    navigate("/");
  };

  const allCurrencies = useMemo(() => getAllDisplayCurrencies(), []);

  const filteredCurrencies = useMemo(() => {
    if (!searchQuery.trim()) return allCurrencies;
    const query = searchQuery.toLowerCase();
    return allCurrencies.filter(curr =>
      curr.name.toLowerCase().includes(query) ||
      curr.id.toLowerCase().includes(query) ||
      curr.symbol.toLowerCase().includes(query) ||
      curr.searchTerms.toLowerCase().includes(query)
    );
  }, [searchQuery, allCurrencies]);

  const selectedCurrency = useMemo(() => 
    allCurrencies.find(curr => curr.id === currency),
    [currency, allCurrencies]
  );

  useEffect(() => {
    if (filteredCurrencies.length === 1 && searchQuery.trim() !== "") {
      setCurrency(filteredCurrencies[0].id);
    }
  }, [filteredCurrencies, searchQuery]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background split */}
      <div className="absolute inset-0 z-0">
        <div className="h-1/2 bg-primary" />
        <div className="h-1/2 bg-primary/80" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="floating-card glassmorphism p-8 space-y-6">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="text-center space-y-3"
          >
            <img src={mondjaiLogo} alt="MonDjai" className="h-12 mx-auto" />
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
            {/* Username Field */}
            <motion.div
              className="space-y-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <label className="text-sm font-medium">Nom d'utilisateur</label>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 flex-shrink-0" />
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choisissez un nom"
                  className="input-field"
                />
              </div>
            </motion.div>

            {/* Email Field */}
            <motion.div
              className="space-y-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
            >
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <label className="text-sm font-medium">Email</label>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 flex-shrink-0" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="input-field"
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              className="space-y-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <label className="text-sm font-medium">Mot de passe</label>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 flex-shrink-0" />
                <div className="relative flex-1">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Currency Field */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="text-sm font-medium">Devise</label>
              <Select 
                value={currency} 
                onValueChange={setCurrency}
                open={isSelectOpen}
                onOpenChange={setIsSelectOpen}
              >
                <SelectTrigger className="input-field h-12">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{selectedCurrency?.flag || "🏳️"}</span>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{selectedCurrency?.symbol || ""}</span>
                      <span className="text-xs text-muted-foreground">{selectedCurrency?.name || "Sélectionnez"}</span>
                    </div>
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-[400px]">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Rechercher..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {filteredCurrencies.map((curr) => (
                      <SelectItem key={curr.id} value={curr.id}>
                        <span className="flex items-center gap-3">
                          <span className="text-xl">{curr.flag}</span>
                          <span className="flex flex-col items-start">
                            <span className="font-medium">{curr.symbol}</span>
                            <span className="text-xs text-muted-foreground">{curr.name}</span>
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </motion.div>

            {/* Student Status */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="floating-card p-4 flex items-center justify-between border-border/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Statut étudiant</p>
                  <p className="text-xs text-muted-foreground">Fonctionnalités étudiantes</p>
                </div>
              </div>
              <Switch checked={isStudent} onCheckedChange={setIsStudent} />
            </motion.div>

            {/* Register Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button 
                onClick={handleRegister} 
                disabled={isLoading}
                className="w-full btn-primary h-12 text-base shadow-lg"
              >
                {isLoading ? "Création..." : "S'inscrire"}
              </Button>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-primary hover:underline font-medium"
            >
              Déjà un compte ? Se connecter
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
