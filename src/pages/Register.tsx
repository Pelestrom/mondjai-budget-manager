import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { User, Lock, GraduationCap, Eye, EyeOff, Search, Mail } from "lucide-react";
import mondjaiLogo from "@/assets/mondjai-logo.png";
import { getAllDisplayCurrencies } from "@/lib/currencies";
import { AuroraBackground } from "@/components/AuroraBackground";

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
    if (!username || !email || !password) return toast.error("Veuillez remplir tous les champs");
    if (password.length < 6) return toast.error("Le mot de passe doit contenir au moins 6 caractères");

    setIsLoading(true);
    const { error } = await signUp(email, password, { username, is_student: isStudent, currency });
    setIsLoading(false);

    if (error) {
      toast.error(error.message.includes("already registered") ? "Cet email est déjà utilisé" : error.message);
      return;
    }
    toast.success("Compte créé avec succès");
    navigate("/");
  };

  const allCurrencies = useMemo(() => getAllDisplayCurrencies(), []);
  const filteredCurrencies = useMemo(() => {
    if (!searchQuery.trim()) return allCurrencies;
    const q = searchQuery.toLowerCase();
    return allCurrencies.filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q) || c.searchTerms.toLowerCase().includes(q));
  }, [searchQuery, allCurrencies]);
  const selectedCurrency = useMemo(() => allCurrencies.find(c => c.id === currency), [currency, allCurrencies]);

  useEffect(() => { if (filteredCurrencies.length === 1 && searchQuery.trim() !== "") setCurrency(filteredCurrencies[0].id); }, [filteredCurrencies, searchQuery]);
  useEffect(() => { if (user) navigate("/"); }, [user, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "var(--gradient-hero-dark)" }}
    >
      <AuroraBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md z-10 my-8"
      >
        <div className="surface-glass p-8 space-y-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", delay: 0.15, stiffness: 200, damping: 18 }}
            className="text-center space-y-4"
          >
            <img
              src={mondjaiLogo}
              alt="MonDjai"
              className="mx-auto h-16 w-auto object-contain drop-shadow-[0_6px_18px_rgba(15,203,130,0.35)]"
            />
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Créer un compte</h1>
              <p className="text-sm text-muted-foreground mt-1">Commence à gérer ton budget</p>
            </div>
          </motion.div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="label-caps text-muted-foreground flex items-center gap-2"><User className="w-3.5 h-3.5" />Nom d'utilisateur</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choisissez un nom" className="input-field" />
            </div>

            <div className="space-y-2">
              <label className="label-caps text-muted-foreground flex items-center gap-2"><Mail className="w-3.5 h-3.5" />Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" className="input-field" />
            </div>

            <div className="space-y-2">
              <label className="label-caps text-muted-foreground flex items-center gap-2"><Lock className="w-3.5 h-3.5" />Mot de passe</label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input-field pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="label-caps text-muted-foreground">Devise</label>
              <Select value={currency} onValueChange={setCurrency} open={isSelectOpen} onOpenChange={setIsSelectOpen}>
                <SelectTrigger className="input-field h-14">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{selectedCurrency?.flag || "🏳️"}</span>
                    <div className="flex flex-col items-start">
                      <span className="font-semibold text-sm">{selectedCurrency?.symbol || ""}</span>
                      <span className="text-xs text-muted-foreground">{selectedCurrency?.name || "Sélectionnez"}</span>
                    </div>
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-[400px]">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input placeholder="Rechercher..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onClick={(e) => e.stopPropagation()} />
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
            </div>

            <div className="surface-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl chip-info flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Statut étudiant</p>
                  <p className="text-xs text-muted-foreground">Fonctionnalités adaptées</p>
                </div>
              </div>
              <Switch checked={isStudent} onCheckedChange={setIsStudent} />
            </div>

            <motion.div whileTap={{ scale: 0.98 }}>
              <Button onClick={handleRegister} disabled={isLoading} className="w-full btn-primary h-12 text-base">
                {isLoading ? "Création..." : "S'inscrire"}
              </Button>
            </motion.div>
          </div>

          <div className="text-center pt-2">
            <button onClick={() => navigate("/login")} className="text-sm text-primary hover:underline font-medium">
              Déjà un compte ? Se connecter
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
