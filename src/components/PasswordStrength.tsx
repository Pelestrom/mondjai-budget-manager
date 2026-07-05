import { Check, X } from "lucide-react";

export type PwdCheck = {
  length: boolean;
  upper: boolean;
  lower: boolean;
  digit: boolean;
  special: boolean;
};

export const checkPassword = (pwd: string): PwdCheck => ({
  length: pwd.length >= 8,
  upper: /[A-Z]/.test(pwd),
  lower: /[a-z]/.test(pwd),
  digit: /\d/.test(pwd),
  special: /[!@#$%^&*(),.?":{}|<>_\-+=/[\]\\;'`~]/.test(pwd),
});

export const isPasswordValid = (pwd: string) => {
  const c = checkPassword(pwd);
  return c.length && c.upper && c.lower && c.digit && c.special;
};

const rules: { key: keyof PwdCheck; label: string }[] = [
  { key: "length", label: "Au moins 8 caractères" },
  { key: "upper", label: "Une lettre majuscule" },
  { key: "lower", label: "Une lettre minuscule" },
  { key: "digit", label: "Un chiffre" },
  { key: "special", label: "Un caractère spécial (!@#$…)" },
];

export const PasswordStrength = ({ password }: { password: string }) => {
  const checks = checkPassword(password);
  return (
    <ul className="space-y-1.5 mt-2">
      {rules.map((r) => {
        const ok = checks[r.key];
        return (
          <li key={r.key} className="flex items-center gap-2 text-xs">
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                ok ? "bg-success text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {ok ? <Check className="w-3 h-3" strokeWidth={3} /> : <X className="w-3 h-3" strokeWidth={2.5} />}
            </span>
            <span className={ok ? "text-success font-medium" : "text-muted-foreground"}>{r.label}</span>
          </li>
        );
      })}
    </ul>
  );
};
