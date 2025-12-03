import { Book, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

const Help = () => {
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
    <div className="min-h-screen pb-8 pt-20">
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Aide</h1>
          <p className="text-sm text-muted-foreground">
            Trouvez des réponses à vos questions
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          <Card className="p-4 text-center card-gradient hover:scale-105 transition-transform cursor-pointer">
            <Book className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Guide</p>
          </Card>
          <Card className="p-4 text-center card-gradient hover:scale-105 transition-transform cursor-pointer">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Support</p>
          </Card>
        </motion.div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-lg font-semibold text-foreground">
            Questions fréquentes
          </h2>
          <Card className="p-4 card-gradient">
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
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 text-center space-y-3 card-gradient">
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
        </motion.div>
      </div>
    </div>
  );
};

export default Help;
