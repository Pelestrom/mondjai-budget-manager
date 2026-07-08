import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock } from "lucide-react";
import { PasswordStrength, isPasswordValid } from "@/components/PasswordStrength";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const ChangePasswordDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) => {
  const { user } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setCurrent(""); setNext(""); setConfirm("");
    setShowCur(false); setShowNext(false);
  };

  const handleSubmit = async () => {
    if (!user?.email) return;
    if (!current || !next || !confirm) return toast.error("Veuillez remplir tous les champs");
    if (!isPasswordValid(next)) return toast.error("Le nouveau mot de passe ne respecte pas les règles");
    if (next !== confirm) return toast.error("Les mots de passe ne correspondent pas");
    if (next === current) return toast.error("Le nouveau mot de passe doit être différent de l'ancien");

    setLoading(true);
    // Re-authenticate by attempting sign-in with current password
    const { error: signErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: current,
    });
    if (signErr) {
      setLoading(false);
      return toast.error("Mot de passe actuel incorrect");
    }
    const { error: updErr } = await supabase.auth.updateUser({ password: next });
    setLoading(false);
    if (updErr) return toast.error(updErr.message);
    toast.success("Mot de passe modifié avec succès");
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" /> Changer le mot de passe
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Mot de passe actuel</label>
            <div className="relative">
              <Input type={showCur ? "text" : "password"} value={current} onChange={(e) => setCurrent(e.target.value)} className="pr-10" />
              <button type="button" onClick={() => setShowCur(!showCur)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showCur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Nouveau mot de passe</label>
            <div className="relative">
              <Input type={showNext ? "text" : "password"} value={next} onChange={(e) => setNext(e.target.value)} className="pr-10" />
              <button type="button" onClick={() => setShowNext(!showNext)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showNext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrength password={next} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Confirmer le nouveau mot de passe</label>
            <Input type={showNext ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            {confirm && next !== confirm && (
              <p className="text-xs text-danger">Les mots de passe ne correspondent pas</p>
            )}
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => { reset(); onOpenChange(false); }} disabled={loading}>
              Annuler
            </Button>
            <Button className="flex-1 btn-primary" onClick={handleSubmit} disabled={loading || !isPasswordValid(next) || next !== confirm || !current}>
              {loading ? "..." : "Enregistrer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
