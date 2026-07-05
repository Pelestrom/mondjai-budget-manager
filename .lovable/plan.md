# Plan d'implémentation — 9 chantiers

Je vais tout traiter en une passe cohérente. Voici l'ordre et l'approche.

## 1. Mot de passe sécurisé (Register)
- Ajout d'un composant `PasswordStrength` (5 critères avec ✓ vert en temps réel).
- Blocage soumission si non conforme + message d'erreur sous le champ.
- Règles : ≥8 car., 1 maj, 1 min, 1 chiffre, 1 spécial.

## 2. Suppression du toggle "Statut étudiant" (Register)
- Retrait du bloc UI + state.
- **DB** : la colonne `profiles.is_student` reste (safe), on n'envoie plus la valeur (default false).
- Vérification qu'aucune autre page ne l'utilise activement.

## 3. Scroll page d'accueil
- Correction du conteneur Dashboard (`overflow-y-auto`, padding-bottom pour la BottomTabBar).

## 4. Cards vertes
- Suppression cloche interne du HeroCard Dashboard (déjà dans TopBar).
- Suppression des lignes vagues (SVG aurora) sur les HeroCard (garde le dégradé propre).
- Marge inférieure Dashboard pour ne pas coller à la BottomTabBar.

## 5. Dépenses fixes (modèles réutilisables)
- **Nouvelle table** `fixed_expenses` (user_id, amount, type, category, subcategory, note, created_at, updated_at) avec RLS + GRANTs.
- Hook `useFixedExpenses` (CRUD).
- Sur AddTransaction : bouton "Choisir une dépense fixe" → sheet avec liste (edit/delete + confirm).
- Case "Dépense fixe" cochée → crée transaction ET modèle.

## 6. "Se souvenir de moi" fonctionnel
- Supabase gère déjà la persistance ; on ajoute une logique : si non coché → `signOut` planifié à la fermeture (session en `sessionStorage` clone), si coché → localStorage (comportement actuel).
- Approche simple : flag `mondjai-remember` en localStorage ; si false et pas de user au chargement après reload, on force `signOut`.

## 7. Splash screen
- Nouveau composant `Splash` affiché 1,5–2s au boot, avec logo + nom + fade-in.
- Redirection selon session Supabase.

## 8. Google OAuth (Login + Register)
- Bouton "Continuer avec Google" + séparateur "ou".
- `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin }})`.
- Google est déjà géré par défaut par Lovable Cloud (managed credentials).

## 9. Refonte PDF Bilan
- En-tête compact vert, logo à gauche, titre + période + nom user dessous.
- 3 cartes résumé avec icônes (↑ ↓ 💼) et ombre.
- Camembert répartition catégories (via canvas SVG rendu en image, ou barres HTML→PDF).
- Tableau zébré, montants alignés droite, ligne de total.
- Pied de page fixe (logo mini + date + n° page) sur chaque page.
- Section dédiée **Dépenses fixes** et **Entrées fixes** avec sous-totaux.
- Palette vert/rouge cohérente, typographie 2 niveaux.

## Ordre d'exécution
1. Migration DB (`fixed_expenses`) — attente approbation.
2. En parallèle après approbation : chantiers 1–4, 6–8 (front only).
3. Chantier 5 (hook + UI) une fois la table créée.
4. Chantier 9 (PDF) en dernier — le plus lourd, nécessite les données fixes.

## Question technique
Pour le camembert dans le PDF : je vais utiliser un rendu SVG inline dans le HTML→PDF (via `html2pdf.js` ou `jsPDF` + Chart.js sur canvas offscreen selon la lib actuellement utilisée dans `Reports.tsx`). J'inspecterai le fichier existant avant de choisir.

**OK pour lancer ? Je commence par la migration DB puis j'enchaîne tout.**