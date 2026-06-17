import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const SECTIONS = [
  {
    title: "Acceptation des conditions",
    content: "En créant un compte ou en utilisant TeQizz, vous déclarez avoir lu et accepté les présentes conditions. Si vous n'acceptez pas ces conditions, vous ne pouvez pas utiliser notre service.",
  },
  {
    title: "Description du service",
    content: "TeQizz est une plateforme d'apprentissage interactive proposant des jeux de quiz (QCM, Smatch) autour de thématiques technologiques. Le service est fourni gratuitement dans son état actuel et peut évoluer au fil du temps.",
  },
  {
    title: "Inscription et compte",
    content: "Vous devez créer un compte pour accéder à l'ensemble des fonctionnalités. Vous êtes responsable de la confidentialité de vos identifiants et de toute activité effectuée depuis votre compte. Vous vous engagez à fournir des informations exactes lors de l'inscription.",
  },
  {
    title: "Utilisation acceptable",
    content: "Vous vous engagez à utiliser TeQizz uniquement à des fins légales. Il est notamment interdit d'automatiser les interactions avec la plateforme, de tenter de manipuler les classements, ou d'exploiter des failles techniques.",
  },
  {
    title: "Propriété intellectuelle",
    content: "Le contenu de la plateforme (questions, design, code) est la propriété de TeQizz ou de ses contributeurs. Vous bénéficiez d'un droit d'usage personnel et non commercial. Toute reproduction ou distribution non autorisée est interdite.",
  },
  {
    title: "Limitation de responsabilité",
    content: "TeQizz est fourni sans garantie d'aucune sorte. Nous ne saurions être tenus responsables des interruptions de service, pertes de données ou dommages indirects liés à l'utilisation de la plateforme.",
  },
  {
    title: "Résiliation",
    content: "Vous pouvez supprimer votre compte à tout moment depuis les paramètres. Nous nous réservons le droit de suspendre ou de résilier un compte en cas de violation des présentes conditions.",
  },
  {
    title: "Modifications des conditions",
    content: "Ces conditions peuvent être mises à jour. En cas de modification significative, vous serez informé par email ou notification. La poursuite de l'utilisation du service après modification vaut acceptation des nouvelles conditions.",
  },
  {
    title: "Contact",
    content: "Pour toute question relative aux présentes conditions, contactez-nous à : contact@teqizz.com.",
  },
];

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
        <header className="mb-12">
          <h1 className="text-3xl font-black tracking-tight mb-3">Conditions d'utilisation</h1>
          <p className="text-sm text-white/30">Dernière mise à jour : 27 mai 2026</p>
          <p className="mt-6 text-white/60 leading-relaxed">
            Bienvenue sur TeQizz. En utilisant notre plateforme, vous acceptez les présentes conditions d'utilisation. Veuillez les lire attentivement.
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

export default Terms;
