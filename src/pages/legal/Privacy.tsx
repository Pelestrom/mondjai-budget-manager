import mondjaiLogo from "@/assets/mondjai-logo.png";

const LAST_UPDATE = "7 juillet 2026";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      <div className="max-w-[700px] mx-auto px-5 py-8">
        <header className="flex items-center gap-3 mb-8">
          <img src={mondjaiLogo} alt="MonDjai" className="h-10 w-10 object-contain" />
          <span className="font-bold text-lg text-[#1A1A1A]">MonDjai</span>
        </header>

        <h1 className="text-[24px] font-bold text-[#0F9D58] leading-tight">Politique de Confidentialité</h1>
        <p className="text-xs text-[#6B7280] mt-2 mb-8">Dernière mise à jour : {LAST_UPDATE}</p>

        <div className="space-y-8 text-[15px] leading-[1.6] text-[#1A1A1A]">
          <section>
            <h2 className="text-[17px] font-bold text-[#0F9D58] mb-3">1. Données collectées</h2>
            <p>
              Lors de l'inscription, MonDjai collecte uniquement : votre nom d'utilisateur,
              votre adresse email, un mot de passe (stocké de manière chiffrée) et la devise
              que vous avez choisie.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-bold text-[#0F9D58] mb-3">2. Données financières</h2>
            <p>
              Les données financières saisies (revenus, dépenses, budgets, catégories) restent
              <strong> strictement privées</strong>. Elles ne sont ni vendues, ni partagées avec
              des tiers, ni utilisées à des fins publicitaires.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-bold text-[#0F9D58] mb-3">3. Utilisation de l'email</h2>
            <p>
              Votre email n'est utilisé que pour l'authentification et, occasionnellement, pour
              vous informer des mises à jour et nouveautés de l'application. Vous pouvez vous
              désinscrire de ces communications à tout moment.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-bold text-[#0F9D58] mb-3">4. Partage avec des tiers</h2>
            <p>
              Aucune donnée n'est partagée avec des tiers à des fins publicitaires ou commerciales.
              Nos prestataires techniques (hébergement, base de données) traitent les données
              uniquement pour assurer le fonctionnement du service, sous obligation de
              confidentialité.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-bold text-[#0F9D58] mb-3">5. Connexion via Google</h2>
            <p>
              Si vous choisissez de vous inscrire ou vous connecter avec Google, Google nous
              transmet uniquement votre nom et votre adresse email, conformément à sa propre
              politique de confidentialité. Aucune autre information Google n'est collectée.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-bold text-[#0F9D58] mb-3">6. Suppression des données</h2>
            <p>
              Vous pouvez demander la suppression complète de votre compte et de toutes vos
              données à tout moment depuis les paramètres de l'application. La suppression est
              définitive et effective sous 30 jours.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-bold text-[#0F9D58] mb-3">7. Sécurité</h2>
            <p>
              Vos mots de passe sont vérifiés contre les bases de données publiques de mots de
              passe compromis. Toutes les communications sont chiffrées (HTTPS/TLS).
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-bold text-[#0F9D58] mb-3">8. Contact</h2>
            <p>
              Pour toute question ou demande relative à vos données personnelles :<br />
              <a href="mailto:contact@mondjai.app" className="text-[#0F9D58] underline">contact@mondjai.app</a>
            </p>
          </section>
        </div>

        <footer className="mt-12 pt-6 border-t border-[#E5E7EB] text-xs text-[#6B7280] text-center">
          © {new Date().getFullYear()} MonDjai. Tous droits réservés.
        </footer>
      </div>
    </div>
  );
};

export default Privacy;
