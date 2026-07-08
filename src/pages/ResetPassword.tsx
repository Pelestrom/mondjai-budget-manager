import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/AuroraBackground";
import { PasswordStrength, isPasswordValid } from "@/components/PasswordStrength";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import mondjaiLogo from "@/assets/mondjai-logo.png";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Wait for Supabase to process the recovery link and set the session
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (!isPasswordValid(password)) return toast.error("Mot de passe non conforme aux règles");
    if (password !== confirm) return toast.error("Les mots de passe ne correspondent pas");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    await supabase.auth.signOut();
    toast.success("Mot de passe réinitialisé. Connecte-toi avec le nouveau.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: "var(--gradient-hero-dark)" }}>
      <AuroraBackground />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md z-10">
        <div className="surface-glass p-8 space-y-6">
          <div className="text-center space-y-3">
            <img src={mondjaiLogo} alt="MonDjai" className="mx-auto h-14 w-auto object-contain" />
            <h1 className="font-display text-2xl font-bold text-foreground">Nouveau mot de passe</h1>
            <p className="text-sm text-muted-foreground">Choisis un mot de passe sécurisé</p>
          </div>

          {!ready ? (
            <p className="text-sm text-center text-muted-foreground">Vérification du lien...</p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="label-caps text-muted-foreground flex items-center gap-2"><Lock className="w-3.5 h-3.5" />Nouveau mot de passe</label>
                <div className="relative">
                  <Input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pr-10" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>
              <div className="space-y-2">
                <label className="label-caps text-muted-foreground">Confirmer</label>
                <Input type={show ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input-field" />
              </div>
              <Button onClick={handleSubmit} disabled={loading || !isPasswordValid(password) || password !== confirm} className="w-full btn-primary h-12">
                {loading ? "Enregistrement..." : "Réinitialiser"}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
