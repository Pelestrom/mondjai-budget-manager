import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Lock, User } from "lucide-react";
import mondjaiLogo from "@/assets/mondjai-logo.png";

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    if (!username || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    login({
      id: Math.random().toString(36).substr(2, 9),
      username,
      isStudent: false,
      currency: "FCFA",
      rememberMe,
    });

    toast.success("Connexion réussie");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary/20 via-background to-accent/20">
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
            <img src={mondjaiLogo} alt="MonDjai" className="h-24 mx-auto" />
            <p className="text-sm text-muted-foreground">
              Gérez votre budget intelligemment
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
                  placeholder="Entrez votre nom"
                  className="pl-10 input-field"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Se souvenir de moi
              </label>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={handleLogin} className="w-full btn-primary h-12 text-base shadow-lg">
                Se connecter
              </Button>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <div className="text-center">
            <button
              onClick={() => navigate("/register")}
              className="text-sm text-primary hover:underline font-medium"
            >
              Créer un compte
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;