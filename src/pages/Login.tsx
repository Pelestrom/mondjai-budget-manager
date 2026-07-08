import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import mondjaiLogo from "@/assets/mondjai-logo.png";
import { AuroraBackground } from "@/components/AuroraBackground";
import { GoogleButton, AuthDivider } from "@/components/GoogleButton";
import { ForgotPasswordDialog } from "@/components/ForgotPasswordDialog";

const REMEMBER_KEY = "mondjai-remember-me";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem(REMEMBER_KEY) === "1");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { if (user) navigate("/"); }, [user, navigate]);

  const handleLogin = async () => {
    if (!email || !password) return toast.error("Veuillez remplir tous les champs");
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      toast.error(error.message.includes("Invalid login credentials") ? "Email ou mot de passe incorrect" : error.message);
      return;
    }
    if (rememberMe) localStorage.setItem(REMEMBER_KEY, "1");
    else localStorage.removeItem(REMEMBER_KEY);
    toast.success("Connexion réussie");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: "var(--gradient-hero-dark)" }}>
      <AuroraBackground />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-md z-10">
        <div className="surface-glass p-8 space-y-6">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", delay: 0.15, stiffness: 200, damping: 18 }} className="text-center space-y-4">
            <img src={mondjaiLogo} alt="MonDjai" className="mx-auto h-16 w-auto object-contain drop-shadow-[0_6px_18px_rgba(15,203,130,0.35)]" />
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Bon retour</h1>
              <p className="text-sm text-muted-foreground mt-1">Reprends le contrôle de ton budget</p>
            </div>
          </motion.div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="label-caps text-muted-foreground flex items-center gap-2"><Mail className="w-3.5 h-3.5" />Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" className="input-field" onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
            </div>

            <div className="space-y-2">
              <label className="label-caps text-muted-foreground flex items-center gap-2"><Lock className="w-3.5 h-3.5" />Mot de passe</label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input-field pr-10" onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <Switch id="remember" checked={rememberMe} onCheckedChange={setRememberMe} />
                <label htmlFor="remember" className="text-sm font-medium text-foreground">Se souvenir de moi</label>
              </div>
            </div>

            <motion.div whileTap={{ scale: 0.98 }}>
              <Button onClick={handleLogin} disabled={isLoading} className="w-full btn-primary h-12 text-base">
                {isLoading ? "Connexion..." : "Se connecter"}
              </Button>
            </motion.div>

            <AuthDivider />
            <GoogleButton />
          </div>

          <div className="text-center pt-2">
            <button onClick={() => navigate("/register")} className="text-sm text-primary hover:underline font-medium">
              Créer un compte
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
