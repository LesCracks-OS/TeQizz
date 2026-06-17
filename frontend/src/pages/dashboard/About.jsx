import { motion } from "framer-motion";
import {
  HelpCircle,
  Shuffle,
  TrendingUp,
  Mail,
  Github,
  Zap,
  Timer,
  Clock,
  Infinity,
  Heart,
  Star,
  Shield,
  BookOpen,
} from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

const SectionTitle = ({ icon: Icon, title, color = "text-primary" }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className={`flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card`}>
      <Icon className={`h-5 w-5 ${color}`} />
    </div>
    <h2 className="text-xl font-black tracking-tight">{title}</h2>
  </div>
);

const ModeCard = ({ label, timer, points, desc }) => (
  <div className="rounded-xl border border-border bg-card p-4 space-y-1">
    <div className="flex items-center justify-between">
      <span className="text-sm font-black text-foreground">{label}</span>
      <span className="text-xs font-bold text-muted-foreground">{timer}</span>
    </div>
    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    <p className="text-xs font-semibold text-primary">+{points} pts par bonne réponse</p>
  </div>
);

const DifficultyRow = ({ range, level, color }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
    <span className="w-24 text-xs font-mono text-muted-foreground">{range}</span>
    <span className={`text-sm font-bold ${color}`}>{level}</span>
  </div>
);

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <motion.div {...fadeUp(0)}>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Plateforme</p>
        <h1 className="mt-1 text-4xl font-black tracking-tight">À propos.</h1>
        <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
          Documentation complète de la plateforme TeQizz — mécaniques, modes de jeu et progression.
        </p>
      </motion.div>

      {/* Platform overview */}
      <motion.div {...fadeUp(0.05)}>
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <span className="text-2xl font-black text-primary-foreground">T</span>
            </div>
            <div>
              <h2 className="text-lg font-black">TeQizz</h2>
              <p className="text-xs text-muted-foreground">Plateforme d'apprentissage par le jeu</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            TeQizz est une plateforme d'apprentissage gamifiée conçue pour les étudiants, enseignants et
            passionnés de culture générale. Elle transforme la révision en expérience compétitive : chaque
            session de jeu fait progresser votre score, améliore votre rang et adapte automatiquement le
            niveau de difficulté à vos performances.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Deux modes de jeu sont disponibles : le <span className="font-semibold text-foreground">QCM</span> (questions à choix multiples chronométrées)
            et le <span className="font-semibold text-foreground">Smatch</span> (association rapide de termes et définitions). Chaque mode
            possède trois variantes adaptées à différents profils d'apprenants.
          </p>
        </div>
      </motion.div>

      {/* QCM Section */}
      <motion.div {...fadeUp(0.1)} className="space-y-5 border-t border-border pt-8">
        <SectionTitle icon={HelpCircle} title="QCM — Questions à choix multiples" />

        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-black uppercase tracking-wider">Mécaniques</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Timer className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span><span className="font-semibold text-foreground">Timer global</span> — chaque mode dispose d'une durée fixe. Le compteur tourne dès le démarrage de la session.</span>
            </li>
            <li className="flex items-start gap-2">
              <Heart className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
              <span><span className="font-semibold text-foreground">3 vies</span> — chaque mauvaise réponse coûte une vie. La partie se termine quand les 3 vies sont épuisées ou quand le timer atteint zéro.</span>
            </li>
            <li className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
              <span><span className="font-semibold text-foreground">Difficulté progressive</span> — les questions deviennent plus difficiles à mesure que votre score augmente : EASY → MEDIUM → HARD → EXPERT.</span>
            </li>
            <li className="flex items-start gap-2">
              <Star className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
              <span><span className="font-semibold text-foreground">Scoring</span> — chaque bonne réponse rapporte des points selon le mode choisi. Plus la difficulté est élevée, plus les points sont multiplicateurs.</span>
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Les 3 modes</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <ModeCard
              label="Blitz"
              timer="2 minutes"
              points="15"
              desc="Sprint intense. Questions enchaînées à vitesse maximale. Idéal pour les révisions rapides."
            />
            <ModeCard
              label="Rush"
              timer="5 minutes"
              points="10"
              desc="Rythme soutenu mais gérable. Bon équilibre entre vitesse et précision."
            />
            <ModeCard
              label="Classic"
              timer="10 minutes"
              points="8"
              desc="Session longue et endurante. Conçu pour aller chercher les niveaux HARD et EXPERT."
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Conseils</p>
          <p className="text-sm text-muted-foreground">• En Blitz, ne réfléchissez pas trop — la vitesse prime sur la perfection.</p>
          <p className="text-sm text-muted-foreground">• En Classic, ménagez vos vies : les questions EXPERT en fin de partie rapportent beaucoup.</p>
          <p className="text-sm text-muted-foreground">• Filtrez par tags pour cibler un thème précis et progresser plus vite dans ce domaine.</p>
        </div>
      </motion.div>

      {/* Smatch Section */}
      <motion.div {...fadeUp(0.15)} className="space-y-5 border-t border-border pt-8">
        <SectionTitle icon={Shuffle} title="Smatch — Association rapide" color="text-orange-400" />

        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Shuffle className="h-4 w-4 text-orange-400" />
            <h3 className="text-sm font-black uppercase tracking-wider">Mécaniques</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Shuffle className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
              <span><span className="font-semibold text-foreground">Association termes / définitions</span> — un ensemble de termes et leurs définitions s'affichent mélangés. Vous devez les relier correctement le plus vite possible.</span>
            </li>
            <li className="flex items-start gap-2">
              <Heart className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
              <span><span className="font-semibold text-foreground">3 vies</span> — chaque association incorrecte coûte une vie. Réfléchissez avant de valider.</span>
            </li>
            <li className="flex items-start gap-2">
              <Zap className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
              <span><span className="font-semibold text-foreground">Combo bonus</span> — enchaîner des associations correctes sans faute multiplie les points gagnés à chaque paire validée.</span>
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Les 3 modes</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <ModeCard
              label="Time Attack"
              timer="90 secondes"
              points="10"
              desc="Course contre la montre. Associez un maximum de paires avant la fin du chrono."
            />
            <ModeCard
              label="Zen"
              timer="Illimité"
              points="5"
              desc="Aucune pression temporelle. Idéal pour mémoriser et étudier sans stress."
            />
            <ModeCard
              label="Survival"
              timer="120 secondes"
              points="15"
              desc="Plus de temps mais moindre marge d'erreur. Chaque faute est pénalisante."
            />
          </div>
        </div>
      </motion.div>

      {/* Progression System */}
      <motion.div {...fadeUp(0.2)} className="space-y-5 border-t border-border pt-8">
        <SectionTitle icon={TrendingUp} title="Système de progression" color="text-emerald-400" />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <h3 className="text-sm font-black">XP et points</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Chaque bonne réponse rapporte des points XP. Votre score cumulé détermine votre position
              dans le classement global et votre niveau de difficulté en jeu. Plus vous jouez, plus vous progressez.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-black">Difficulté automatique</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              La difficulté des questions s'adapte en temps réel selon votre score dans la session.
              Tout le monde commence à EASY — les meilleurs grimpent jusqu'à EXPERT.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Seuils de difficulté (QCM)</p>
          <div className="divide-y divide-border">
            <DifficultyRow range="0 – 99 pts" level="EASY" color="text-emerald-400" />
            <DifficultyRow range="100 – 249 pts" level="MEDIUM" color="text-yellow-400" />
            <DifficultyRow range="250 – 499 pts" level="HARD" color="text-orange-400" />
            <DifficultyRow range="500+ pts" level="EXPERT" color="text-red-400" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-black">Classement global</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Chaque session terminée met à jour votre classement. Le leaderboard affiche le score moyen,
            la précision et le nombre de parties jouées. Filtrez par mode (Blitz, Rush, Classic)
            pour comparer vos performances par format de jeu.
          </p>
        </div>
      </motion.div>

      {/* Contact */}
      <motion.div {...fadeUp(0.25)} className="border-t border-border pt-8 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Contact</p>
        <div className="flex flex-wrap gap-4">
          <a
            href="mailto:brandoniscoding4@gmail.com"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail className="h-4 w-4" />
            brandoniscoding4@gmail.com
          </a>
          <a
            href="https://github.com/brandonkamga-dev"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-4 w-4" />
            brandonkamga-dev
          </a>
        </div>
        <p className="text-xs text-muted-foreground">TeQizz v1.0 — Tous droits réservés</p>
      </motion.div>
    </div>
  );
}
