import { ArrowLeft, Book, MessageCircle, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Help = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "Comment ajouter une transaction?",
      answer:
        "Depuis l'accueil, cliquez sur les boutons 'Entrée' ou 'Dépense', puis remplissez le formulaire avec le montant, la catégorie et les détails.",
    },
    {
      question: "Comment créer un budget?",
      answer:
        "Allez dans l'onglet Budgets, cliquez sur 'Ajouter', sélectionnez une catégorie (ou laissez vide pour un budget global) et définissez le montant.",
    },
    {
      question: "Qu'est-ce que la barre intelligente?",
      answer:
        "La barre intelligente calcule automatiquement votre budget quotidien restant en fonction de vos dépenses actuelles et du temps restant dans le mois.",
    },
    {
      question: "Comment activer l'authentification biométrique?",
      answer:
        "Dans les Réglages > Sécurité, activez l'option 'Authentification biométrique' pour utiliser FaceID, TouchID ou l'empreinte digitale.",
    },
    {
      question: "Mes données sont-elles sauvegardées?",
      answer:
        "Oui, toutes vos données sont sauvegardées localement sur votre appareil. Vous pouvez aussi les exporter via Réglages > Données.",
    },
  ];

  return (
    <div className="min-h-screen pb-24 safe-area-top">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Aide</h1>
            <p className="text-sm text-muted-foreground">
              Trouvez des réponses à vos questions
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 text-center">
            <Book className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Guide</p>
          </Card>
          <Card className="p-4 text-center">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Support</p>
          </Card>
        </div>

        {/* FAQs */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Questions fréquentes
          </h2>
          <Card className="p-4">
            <Accordion type="single" collapsible>
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>

        {/* Contact */}
        <Card className="p-6 text-center space-y-3">
          <Mail className="w-12 h-12 mx-auto text-primary" />
          <div>
            <h3 className="font-semibold text-foreground">Besoin d'aide ?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Contactez notre équipe support
            </p>
          </div>
          <Button className="btn-primary">
            support@mondjai.com
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Help;
