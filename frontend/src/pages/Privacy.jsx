import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const SECTIONS = [
  {
    title: "Informations que nous collectons",
    content: "Nous collectons les informations que vous fournissez lors de la création de votre compte (prénom, nom, adresse email, nom d'utilisateur) ainsi que les données de progression générées lors de vos parties (scores, statistiques, historique de jeu). Des données techniques anonymisées sur votre navigateur et appareil peuvent également être collectées à des fins de diagnostic.",
  },
  {
    title: "Utilisation de vos informations",
    content: "Vos données sont utilisées pour faire fonctionner la plateforme, afficher vos statistiques et votre classement, améliorer l'expérience de jeu, et vous communiquer des informations importantes sur le service. Nous n'utilisons pas vos données à des fins publicitaires.",
  },
  {
    title: "Partage des informations",
    content: "Nous ne vendons ni ne partageons vos données personnelles avec des tiers à des fins commerciales. Certaines données peuvent être partagées avec nos prestataires techniques (hébergement, authentification OAuth) dans le strict cadre de la fourniture du service.",
  },
  {
    title: "Cookies et stockage local",
    content: "Nous utilisons le stockage local de votre navigateur (localStorage) pour mémoriser vos préférences et votre session. Nous n'utilisons pas de cookies publicitaires ni de traceurs tiers.",
  },
  {
    title: "Sécurité",
    content: "Nous appliquons des mesures de sécurité standard : chiffrement des mots de passe (bcrypt), communication HTTPS, et authentification OAuth via des fournisseurs de confiance (Google, GitHub). Aucun mot de passe n'est stocké en clair.",
  },
  {
    title: "Vos droits",
    content: "Vous pouvez à tout moment consulter, modifier ou supprimer vos données depuis les paramètres de votre compte. Pour toute demande relative à vos données personnelles, contactez-nous à : privacy@teqizz.com.",
  },
  {
    title: "Modifications de la politique",
    content: "Nous pouvons mettre à jour cette politique ponctuellement. En cas de changement significatif, vous en serez informé par email ou via une notification dans l'application.",
  },
  {
    title: "Contact",
    content: "Pour toute question concernant cette politique, contactez-nous à : privacy@teqizz.com.",
  },
];

const Privacy = () => {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
        <header className="mb-12">
          <h1 className="text-3xl font-black tracking-tight mb-3">Politique de confidentialité</h1>
          <p className="text-sm text-white/30">Dernière mise à jour : 27 mai 2026</p>
          <p className="mt-6 text-white/60 leading-relaxed">
            Chez TeQizz, la protection de vos données personnelles est une priorité. Cette politique explique quelles informations nous collectons, comment nous les utilisons et quels droits vous disposez concernant vos données.
          </p>
        </header>
        <div className="space-y-10">
          {SECTIONS.map(({ title, content }, i) => (
            <section key={i} className="border-t border-white/[0.07] pt-8">
              <div className="flex items-start gap-4">
                <span className="text-[11px] font-black tabular-nums text-white/20 w-6 shrink-0 pt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="text-base font-bold text-white mb-3">{title}</h2>
                  <p className="text-sm text-white/55 leading-relaxed">{content}</p>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Privacy;
