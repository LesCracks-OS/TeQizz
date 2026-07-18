import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import qcmGameService from '../../services/qcmGame.service';
import {
  Medal, Crosshair, Clock, ChartSpline, CheckCircle2, XCircle,
  Lightbulb, Loader2, Play, Home, ChevronDown, ChevronUp, Bolt,
} from 'lucide-react';

const DIFFICULTY_COLORS = {
  EASY:   'text-emerald-400',
  MEDIUM: 'text-yellow-400',
  HARD:   'text-orange-400',
  EXPERT: 'text-red-400',
};

const GAME_MODE_CONFIG = {
  BLITZ:   { label: 'Blitz',   color: 'text-violet-400', border: 'border-violet-500/20 bg-violet-500/10' },
  RUSH:    { label: 'Rush',    color: 'text-blue-400',   border: 'border-blue-500/20 bg-blue-500/10' },
  CLASSIC: { label: 'Classic', color: 'text-emerald-400', border: 'border-emerald-500/20 bg-emerald-500/10' },
};

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

function QuestionReviewCard({ review, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 border-l-2 ${
      review.wasCorrect ? 'border-l-emerald-500/60' : 'border-l-red-500/40'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs font-black text-white/40 shrink-0">
            {index}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-black ${DIFFICULTY_COLORS[review.difficultyLevel] || 'text-white/30'}`}>
                {review.difficultyLevel}
              </span>
              {review.wasCorrect
                ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                : <XCircle className="h-4 w-4 text-red-400 shrink-0" />
              }
            </div>
            <p className="text-sm font-medium text-white/65 truncate">{review.questionContent}</p>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)}
          className="text-white/25 hover:text-white/60 transition-colors shrink-0 p-1">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pl-10 space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-white/25 mb-0.5">Votre réponse</p>
              <p className={`text-sm font-medium ${review.wasCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                {review.userAnswerContent}
              </p>
            </div>
            {!review.wasCorrect && (
              <div>
                <p className="text-xs text-white/25 mb-0.5">Bonne réponse</p>
                <p className="text-sm font-medium text-emerald-400">{review.correctAnswerContent}</p>
              </div>
            )}
          </div>
          {review.explanation && (
            <div className="bg-yellow-500/[0.06] border border-yellow-500/15 rounded-xl p-3 text-xs text-white/40 leading-relaxed">
              <Lightbulb className="h-3 w-3 inline mr-1.5 text-yellow-400/70" />
              {review.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function QcmGameResults() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replaying, setReplaying] = useState(false);

  // Replay instantly with the exact same config as the last game — no reconfiguration.
  const handleReplay = async () => {
    setReplaying(true);
    let config = null;
    try { config = JSON.parse(localStorage.getItem('teqizz:lastQcmConfig')); } catch { /* ignore */ }
    if (!config) { navigate('/dashboard/play/qcm/config'); return; }
    try {
      const session = await qcmGameService.createGameSession(config);
      navigate(`/dashboard/play/qcm/${session.sessionId}`, {
        state: { showHints: config.showHints, showExplanations: config.showExplanations },
      });
    } catch {
      setReplaying(false);
      navigate('/dashboard/play/qcm/config');
    }
  };

  useEffect(() => {
    if (!sessionId) return;
    setIsLoading(true);
    qcmGameService.getGameResults(sessionId)
      .then(setResults)
      .catch(e => setError(e.message || 'Failed to load results'))
      .finally(() => setIsLoading(false));
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 bg-primary/15 rounded-full animate-ping" />
            <div className="relative flex items-center justify-center w-12 h-12 bg-primary/10 border border-primary/20 rounded-full">
              <Medal className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/25">Chargement des résultats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full mx-auto px-6 text-center space-y-4">
          <XCircle className="h-12 w-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-black text-white">Erreur</h2>
          <p className="text-sm text-white/40">{error}</p>
          <button onClick={() => navigate('/dashboard/play')}
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-black hover:brightness-110 transition-all">
            Retour aux jeux
          </button>
        </div>
      </div>
    );
  }

  if (!results) return null;

  const {
    categoryName, gameMode, totalScore, correctAnswers, wrongAnswers,
    totalQuestionsAnswered, accuracy, efficiency, durationSeconds,
    endingDifficulty, maxDifficultyReached, questionReviews, endReason,
  } = results;

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getInsight = () => {
    if (accuracy >= 90) return { icon: Medal,    text: "Excellent ! Tu maîtrises cette catégorie !", color: 'text-yellow-400' };
    if (accuracy >= 75) return { icon: ChartSpline, text: "Belle performance ! Continue à t'entraîner.", color: 'text-primary' };
    if (accuracy >= 50) return { icon: Crosshair,     text: "Bon effort ! Revois les questions manquées.", color: 'text-yellow-400' };
    return                      { icon: Lightbulb,  text: "Continue à t'entraîner — concentre-toi sur les concepts.", color: 'text-orange-400' };
  };

  const insight = getInsight();
  const InsightIcon = insight.icon;
  const modeConfig = GAME_MODE_CONFIG[gameMode];
  const wrongReviews = questionReviews ? questionReviews.filter(r => !r.wasCorrect) : [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

      {/* Score header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
        className="relative text-center space-y-4"
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-yellow-400/[0.06] blur-3xl rounded-full" />

        <div className="relative">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-yellow-400/10 border border-yellow-400/20 rounded-2xl mb-4">
            <Medal className="h-7 w-7 text-yellow-400" />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/25 mb-2">Résultats</p>
          <h1 className="text-[5rem] font-black tabular-nums leading-none text-white">{totalScore}</h1>
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/25 mt-1">Points</p>
        </div>

        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-sm text-white/40">{categoryName}</span>
          {gameMode && modeConfig && (
            <span className={`text-xs font-black px-3 py-1 rounded-full border ${modeConfig.color} ${modeConfig.border}`}>
              {modeConfig.label}
            </span>
          )}
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease: EASE_OUT_EXPO }}
        className="grid grid-cols-4 gap-3"
      >
        {[
          { icon: Crosshair,      value: `${(accuracy || 0).toFixed(0)}%`, label: "Précision",  iconClass: 'text-primary' },
          { icon: Bolt,         value: (efficiency || 0).toFixed(1),    label: "Efficacité", iconClass: 'text-orange-400' },
          { icon: Clock,       value: formatDuration(durationSeconds),  label: "Durée",      iconClass: 'text-purple-400' },
          { icon: CheckCircle2, value: `${correctAnswers || 0}/${totalQuestionsAnswered || 0}`, label: "Correct", iconClass: 'text-emerald-400' },
        ].map(({ icon: Icon, value, label, iconClass }) => (
          <div key={label} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 text-center space-y-1.5">
            <Icon className={`h-4 w-4 mx-auto ${iconClass}`} />
            <p className="text-lg font-black tabular-nums text-white">{value}</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/30">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Insight card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.14, ease: EASE_OUT_EXPO }}
        className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] shrink-0">
            <InsightIcon className={`h-5 w-5 ${insight.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-white/80">{insight.text}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-white/30">
              <span className="flex items-center gap-1">
                <ChartSpline className="h-3.5 w-3.5" />
                Atteint :{" "}
                <span className={`font-bold ml-0.5 ${DIFFICULTY_COLORS[maxDifficultyReached || endingDifficulty] || ''}`}>
                  {maxDifficultyReached || endingDifficulty}
                </span>
              </span>
              <span>{
                endReason === 'LIVES_DEPLETED' ? "Vies épuisées"
                : endReason === 'TIMER_EXPIRED' ? "Temps écoulé"
                : "Toutes les questions jouées"
              }</span>
            </div>
          </div>
        </div>

        {/* Accuracy bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-white/30">Précision</span>
            <span className="font-semibold text-white/60">{(accuracy || 0).toFixed(1)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(accuracy || 0, 100)}%` }}
              transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT_EXPO }}
            />
          </div>
        </div>

        {efficiency > 0 && (
          <div className="flex items-center gap-2 text-xs text-white/30">
            <Bolt className="h-3.5 w-3.5 text-orange-400" />
            <span>Score par minute :</span>
            <span className="font-semibold text-white/50">{efficiency.toFixed(1)} pts/min</span>
          </div>
        )}
      </motion.div>

      {/* Wrong answers review */}
      {wrongReviews.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-400" />
            <h2 className="text-sm font-black text-white/60">
              Erreurs à revoir <span className="text-white/25">({wrongReviews.length})</span>
            </h2>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {wrongReviews.map((review, index) => (
              <QuestionReviewCard
                key={index}
                review={review}
                index={questionReviews.indexOf(review) + 1}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, ease: EASE_OUT_EXPO }}
        className="flex gap-3"
      >
        <button
          onClick={handleReplay}
          disabled={replaying}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-primary text-white text-sm font-black hover:brightness-110 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
        >
          {replaying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {replaying ? 'Relance…' : 'Rejouer'}
        </button>
        <button
          onClick={() => navigate('/dashboard/play')}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-white/[0.07] bg-white/[0.02] text-sm font-black text-white/50 hover:text-white/80 hover:border-white/20 transition-all"
        >
          <Home className="h-4 w-4" />
          Retour aux jeux
        </button>
      </motion.div>

    </div>
  );
}
