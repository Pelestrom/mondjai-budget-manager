L'ampleur du brief est très large (design system complet + refonte de tous les écrans + PDF). Je propose de procéder en **4 phases livrables** pour garder de la qualité et te permettre de valider au fur et à mesure — plutôt qu'un seul mega-commit fragile.

## Phase 1 — Fondations design system (base de tout le reste)
Sans ça, aucun écran ne peut être « premium ». Ordre non-négociable.

1. **Tokens `index.css` + `tailwind.config.ts`**
   - Palette complète (vert profond dégradé 3 stops, accents, sémantiques succès/danger/alerte/info avec fonds pastel désaturés).
   - Neutres light (fond `#F7F9F8`, cartes blanches avec ombres 2 couches, bordures `#E4EBE8`, textes `#0D1F19` / `#6B7C76`).
   - Rayons unifiés : cartes 20px, inputs 14px, pills/CTA 999px.
   - Ombres à couches multiples + inset highlight en haut des cartes.
   - Dégradés hero : `--gradient-hero-dark`, `--gradient-cta`, `--glow-primary`.
2. **Typographie** : import Google Fonts (Inter + Clash Display via CDN alternative → `Space Grotesk` pour display si Clash indispo côté free), classes `.font-display`, `.font-amount` (tabular-nums), hiérarchie labels uppercase tracking.
3. **Composants réutilisables nouveaux** :
   - `<HeroCard>` : fond sombre dégradé + SVG « aurora » (courbes + triangles translucides) en background, réutilisable partout.
   - `<GlassCard>` : glassmorphism (blur 20px, bg blanc 92%).
   - `<StatPill>` : pastilles en verre dépoli pour +/- montants.
   - `<IconBadge color>` : icône Lucide dans pastille colorée cohérente.
   - `<AnimatedNumber>` : count-up via framer-motion.
   - `<Skeleton>` shimmer.
4. **Icônes** : garder Lucide mais imposer partout le pattern `IconBadge` (icône + fond pastille de couleur d'accent par catégorie).

## Phase 2 — Écrans prioritaires
1. **Login / Register** : fond sombre dégradé plein écran + SVG aurora animé (parallax léger), carte glass centrée, floating labels, bouton CTA gradient + glow, switch unifié, animation d'entrée fade+slide.
2. **Dashboard (Home)** :
   - Hero `<HeroCard>` avec Solde (police display 48px), StatPills en verre, avatar rond + cloche animée (pulse rouge si non-lu).
   - Carte « Budget par jour » avec progress ring SVG animé.
   - Actions rapides : 3 `<IconBadge>` avec scale-bounce au tap.
   - Mode agni : carte avec flamme lucide animée `animate-pulse`.
   - BottomTabBar : bouton + surélevé (déjà partiellement fait, à peaufiner shadow + rotation), indicator pill qui slide sous l'icône active (framer `layoutId`).

## Phase 3 — Écrans secondaires
- **Stats** : Recharts area chart avec gradient fill + smooth curve, donut chart animé (stagger), bar chart barres arrondies, segmented control pill switcher (`layoutId`).
- **Catégories** : couleur d'accent dédiée cohérente par catégorie (mapping), apparition en cascade.
- **ManageTransactions / History** : cartes avec IconBadge coloré, swipe-to-delete (framer drag).
- **Budgets** : barre progression gradient dynamique vert→orange→rouge selon %.
- **Settings** : avatar cercle avec dégradé de bordure, switches shadcn stylés.
- **Notifications** : icônes alerte glow doux, swipe-to-dismiss.
- **TopBar dropdown** : animation scale+fade origin top-right.

## Phase 4 — PDF Bilan
Refonte complète du générateur PDF : bandeau dégradé header avec logo blanc + titre/période alignés (fix chevauchement), 3 cartes résumé strictement alignées (grille 3 col égales), barres budget avec gradient couleur seuil, colonnes tabulaires alignées, footer discret avec pagination + ligne séparation, marges 32px uniformes.

## Détails techniques
- Framer Motion déjà installé — utilisé pour `layoutId`, `AnimatePresence`, `useSpring` count-up.
- Recharts déjà installé — pour les graphiques Stats.
- Pas de nouveau backend, pas de migration DB. Purement front/présentation.
- Les tokens dans `index.css` restent en HSL pour compatibilité shadcn ; les dégradés custom en hex via variables CSS dédiées.
- Zéro `text-white` / `bg-[#...]` dans les composants → uniquement classes sémantiques ou variables CSS.

## Ce que je te propose maintenant
Confirme et je commence **Phase 1 + Phase 2 (Login/Register + Dashboard)** dans le prochain tour — c'est ce qui aura l'impact visuel le plus fort tout de suite. Phases 3 et 4 suivront ensuite pour rester dans des changesets maîtrisés.

**Question rapide** : ok pour importer les polices Google Fonts (`Inter` + `Space Grotesk` en substitut libre de Clash Display) via `<link>` dans `index.html` ? Sinon dis-moi si tu as une licence Clash Display à fournir.