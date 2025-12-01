import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import mondjaiLogo from "@/assets/mondjai-logo.png";

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    // Mock login - in real app, validate against stored credentials
    login({
      id: crypto.randomUUID(),
      username,
      isStudent: true,
      currency: "FCFA",
      rememberMe,
    });

    toast.success("Connexion réussie!");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <img
            src={mondjaiLogo}
            alt="MonDjai"
            className="w-32 h-32 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-foreground">Bon retour !</h1>
          <p className="text-muted-foreground">
            Connectez-vous pour gérer votre budget
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 mt-8">
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
            />
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label
                htmlFor="remember"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Se souvenir de moi
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full btn-primary">
            Se connecter
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Pas encore de compte?{" "}
            <Link
              to="/register"
              className="text-primary font-semibold hover:underline"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
