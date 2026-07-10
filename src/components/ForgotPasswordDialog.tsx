import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { passwordResetClient } from "@/lib/supabase";
import { toast } from "sonner";

export const ForgotPasswordDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email) return toast.error("Veuillez saisir votre email");
    setLoading(true);
    const { error } = await passwordResetClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error("Impossible d'envoyer le lien pour le moment. Réessaie dans quelques instants.");
      return;
    }
    setSent(true);
  };

  const close = () => {
    onOpenChange(false);
    setTimeout(() => { setEmail(""); setSent(false); }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) close(); else onOpenChange(v); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" /> Mot de passe oublié
          </DialogTitle>
        </DialogHeader>
        {sent ? (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.
              Vérifiez votre boîte de réception et vos spams.
            </p>
            <Button className="w-full btn-primary" onClick={close}>Fermer</Button>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Saisissez l'email associé à votre compte. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
            <Input type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={close} disabled={loading}>Annuler</Button>
              <Button className="flex-1 btn-primary" onClick={handleSend} disabled={loading || !email}>
                {loading ? "Envoi..." : "Envoyer le lien"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
