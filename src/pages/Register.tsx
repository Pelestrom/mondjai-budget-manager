import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";
import { useCategoryStore } from "@/store/categoryStore";
import { toast } from "sonner";
import mondjaiLogo from "@/assets/mondjai-logo.png";

const Register = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const initializeCategories = useCategoryStore((state) => state.initializeDefaultCategories);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isStudent, setIsStudent] = useState<string>("yes");
  const [currency, setCurrency] = useState("FCFA");

  const currencies = ["FCFA", "€", "$", "GBP", "Yen", "Pesos", "Rand", "Naira", "Autre"];

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    // Initialize default categories
    initializeCategories();

    // Create user
    login({
      id: crypto.randomUUID(),
      username,
      isStudent: isStudent === "yes",
      currency,
      rememberMe: false,
    });

    toast.success("Compte créé avec succès!");
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
          <h1 className="text-3xl font-bold text-foreground">Bienvenue !</h1>
          <p className="text-muted-foreground">
            Créez votre compte pour commencer
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6 mt-8">
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Êtes-vous étudiant ?
              </label>
              <Select value={isStudent} onValueChange={setIsStudent}>
                <SelectTrigger className="input-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Oui</SelectItem>
                  <SelectItem value="no">Non</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Devise
              </label>
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
          </div>

          <Button type="submit" className="w-full btn-primary">
            S'inscrire
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Déjà un compte?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
