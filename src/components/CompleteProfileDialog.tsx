import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const isValidName = (s: string) => {
  const t = s.trim();
  return t.length >= 2 && t.length <= 30 && /^[\p{L}0-9 _.'-]+$/u.test(t);
};

export const CompleteProfileDialog = () => {
  const { profile, updateProfile } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const needsCompletion =
    !!profile &&
    (!profile.username || profile.username.trim() === "" || profile.username === "Utilisateur");

  const handleSave = async () => {
    if (!isValidName(name)) {
      return toast.error("Nom invalide (2-30 caractères, sans caractères spéciaux)");
    }
    setSaving(true);
    await updateProfile({ username: name.trim() });
    setSaving(false);
    toast.success("Profil complété");
  };

  return (
    <Dialog open={needsCompletion}>
      <DialogContent
        className="max-w-md [&>button.absolute]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Complète ton profil
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <p className="text-sm text-muted-foreground">
            Choisis un nom d'utilisateur pour continuer.
          </p>
          <Input
            placeholder="Nom d'utilisateur"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            autoFocus
          />
          <Button className="w-full btn-primary" disabled={saving || !isValidName(name)} onClick={handleSave}>
            {saving ? "Enregistrement..." : "Continuer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
