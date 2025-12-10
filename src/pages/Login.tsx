import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import mondjaiLogo from "@/assets/mondjai-logo.png";

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
            <img src={mondjaiLogo} alt="MonDjai" className="h-16 mx-auto" />
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
            {/* Username Field */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="text-sm font-medium">Nom d'utilisateur</label>
              <motion.div
                className="relative"
                whileFocus="focus"
                variants={{
                  focus: { scale: 1.02 },
                }}
              >
                <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Entrez votre nom"
                  className="pl-10 input-field"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </motion.div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="text-sm font-medium">Mot de passe</label>
              <motion.div
                className="relative"
                whileFocus="focus"
                variants={{
                  focus: { scale: 1.02 },
                }}
              >
                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 input-field"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Remember Me */}
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
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
            </motion.div>

            {/* Login Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button onClick={handleLogin} className="w-full btn-primary h-12 text-base shadow-lg">
                Se connecter
              </Button>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <button
              onClick={() => navigate("/register")}
              className="text-sm text-primary hover:underline font-medium transition-colors"
            >
              Créer un compte
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;