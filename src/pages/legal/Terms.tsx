import mondjaiLogo from "@/assets/mondjai-logo.png";

const LAST_UPDATE = "7 juillet 2026";

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      <div className="max-w-[700px] mx-auto px-5 py-8">
        <header className="flex items-center gap-3 mb-8">
          <img src={mondjaiLogo} alt="MonDjai" className="h-10 w-10 object-contain" />
          <span className="font-bold text-lg text-[#1A1A1A]">MonDjai</span>
        </header>

        <h1 className="text-[24px] font-bold text-[#0F9D58] leading-tight">Conditions d'Utilisation</h1>
        <p className="text-xs text-[#6B7280] mt-2 mb-8">Dernière mise à jour : {LAST_UPDATE}</p>

        <div className="space-y-8 text-[15px] leading-[1.6] text-[#1A1A1A]">
          <section>
            <h2 className="text-[17px] font-bold text-[#0F9D58] mb-3">1. Nature du service</h2>
            <p>
              MonDjai est un outil personnel de gestion de budget. Les montants saisis sont
              purement <strong>déclaratifs</strong> : l'application n'est connectée à aucun compte
              bancaire réel, ne déplace aucun argent réel et n'exécute aucune opération financière.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-bold text-[#0F9D58] mb-3">2. Responsabilité de l'utilisateur</h2>
            <p>
              L'utilisateur est seul responsable de l'exactitude des données qu'il saisit, du choix
              de sa devise, ainsi que de la confidentialité et de la sécurité de son mot de passe.
              Il est recommandé d'utiliser un mot de passe unique et robuste.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-bold text-[#0F9D58] mb-3">3. Disponibilité et usage</h2>
            <p>
              Le service est disponible mondialement, à usage strictement personnel. Il est fourni
              « en l'état », sans garantie explicite ou implicite, et ne constitue en aucun cas un
              conseil financier, juridique ou fiscal professionnel.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-bold text-[#0F9D58] mb-3">4. Suppression de compte</h2>
            <p>
              L'utilisateur peut à tout moment supprimer son compte ainsi que l'ensemble de ses
              données depuis les paramètres de l'application. Cette action est irréversible.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-bold text-[#0F9D58] mb-3">5. Droit applicable</h2>
            <p>
              Les présentes Conditions sont interprétées selon les lois applicables au lieu de
              résidence de l'utilisateur, sauf disposition légale contraire.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] font-bold text-[#0F9D58] mb-3">6. Contact</h2>
            <p>
              Pour toute question relative aux présentes Conditions : <br />
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

export default Terms;
