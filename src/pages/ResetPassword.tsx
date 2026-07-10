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
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const expiredMessage = "Ce lien de réinitialisation est invalide ou a expiré. Demande un nouveau lien.";
    const cleanRecoveryUrl = () => {
      window.history.replaceState(window.history.state, "", `${window.location.origin}${window.location.pathname}`);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
        setLinkError(null);
      }
    });

    (async () => {
      const url = new URL(window.location.href);
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const recoveryType = hashParams.get("type");

      // Implicit recovery links: #access_token=...&refresh_token=...&type=recovery
      if (accessToken && refreshToken && (!recoveryType || recoveryType === "recovery")) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (cancelled) return;
        if (error || !data.session) {
          setLinkError(expiredMessage);
          return;
        }
        cleanRecoveryUrl();
        setReady(true);
        setLinkError(null);
        return;
      }

      // PKCE recovery links generated before this fix: ?code=...
      const code = url.searchParams.get("code");
      if (code) {
        const { data: current } = await supabase.auth.getSession();
        if (cancelled) return;
        if (current.session) {
          cleanRecoveryUrl();
          setReady(true);
          return;
        }

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (error || !data.session) {
          const { data: retry } = await supabase.auth.getSession();
          if (retry.session) {
            cleanRecoveryUrl();
            setReady(true);
            return;
          }
          setLinkError(expiredMessage);
          return;
        }
        cleanRecoveryUrl();
        setReady(true);
        setLinkError(null);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) {
        setReady(true);
      } else {
        setLinkError(expiredMessage);
      }
    })();

    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, []);

  const handleSubmit = async () => {
    if (!isPasswordValid(password)) return toast.error("Mot de passe non conforme aux règles");
    if (password !== confirm) return toast.error("Les mots de passe ne correspondent pas");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      if (/session/i.test(error.message)) {
        return toast.error("Le lien de réinitialisation a expiré. Merci de refaire une demande.");
      }
      return toast.error("Une erreur est survenue. Réessaie ou demande un nouveau lien.");
    }
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

          {linkError ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-destructive">{linkError}</p>
              <Button onClick={() => navigate("/login?forgot=1")} className="w-full btn-primary h-12">
                Demander un nouveau lien
              </Button>
            </div>
          ) : !ready ? (
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
