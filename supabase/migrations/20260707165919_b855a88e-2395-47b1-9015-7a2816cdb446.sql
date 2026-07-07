ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, username, is_student, currency, terms_accepted_at, privacy_accepted_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', 'Utilisateur'),
    COALESCE((NEW.raw_user_meta_data ->> 'is_student')::boolean, false),
    COALESCE(NEW.raw_user_meta_data ->> 'currency', 'XOF'),
    CASE WHEN (NEW.raw_user_meta_data ->> 'terms_accepted')::boolean THEN now() ELSE NULL END,
    CASE WHEN (NEW.raw_user_meta_data ->> 'privacy_accepted')::boolean THEN now() ELSE NULL END
  );

  INSERT INTO public.settings (user_id) VALUES (NEW.id);

  INSERT INTO public.categories (user_id, name, icon, color) VALUES
    (NEW.id, 'Nourriture', 'UtensilsCrossed', '#FF6B6B'),
    (NEW.id, 'Transport', 'Car', '#4ECDC4'),
    (NEW.id, 'Logement', 'Home', '#45B7D1'),
    (NEW.id, 'Internet', 'Wifi', '#96CEB4'),
    (NEW.id, 'Santé', 'Heart', '#74B9FF'),
    (NEW.id, 'Études', 'GraduationCap', '#00B894'),
    (NEW.id, 'Urgences', 'AlertTriangle', '#FF7675');

  RETURN NEW;
END;
$function$;