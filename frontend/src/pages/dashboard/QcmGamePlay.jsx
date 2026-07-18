import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QcmGameProvider, useQcmGame } from '../../contexts/QcmGameContext';
import qcmGameService from '../../services/qcmGame.service';
import AnimatedNumber from '../../components/dashboard/AnimatedNumber';
import {
  Heart, Clock, Medal, Loader2, Lightbulb,
  CheckCircle2, XCircle, ArrowRight, AlertTriangle, Bolt,
} from 'lucide-react';

function fmt(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

const DIFF_STYLE = {
  EASY:   'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  MEDIUM: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  HARD:   'text-orange-400 border-orange-500/30 bg-orange-500/10',
  EXPERT: 'text-red-400 border-red-500/30 bg-red-500/10',
};

function TimerBar({ remaining, max }) {
  const pct = max > 0 ? (remaining / max) * 100 : 100;
  const urgent = remaining <= 20;
  const warn = remaining <= 60 && remaining > 20;
  const color = urgent ? 'bg-red-500' : warn ? 'bg-yellow-400' : 'bg-primary';

  return (
    <div className="flex items-center gap-3">
      <Clock className={`h-3.5 w-3.5 shrink-0 ${urgent ? 'text-red-400 animate-pulse' : 'text-white/25'}`} />
      <div className="relative flex-1 h-1 bg-white/[0.07] rounded-full overflow-hidden">
        <motion.div className={`absolute inset-y-0 left-0 rounded-full ${color}`}
          style={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
      </div>
      <span className={`font-mono text-xs font-black w-9 text-right tabular-nums ${urgent ? 'text-red-400' : 'text-white/40'}`}>
        {fmt(remaining)}
      </span>
    </div>
  );
}

function Hearts({ count }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: Math.max(count, 0) }).map((_, i) => (
        <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.06 }}>
          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
        </motion.div>
      ))}
      {count === 0 && <span className="text-xs text-red-400 font-semibold">No lives</span>}
    </div>
  );
}

function AnswerBtn({ answer, index, selected, correct, revealed, onClick, disabled }) {
  let ring = 'border-white/[0.07] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]';
  let badge = 'bg-white/[0.07] text-white/40';

  if (revealed) {
    if (correct) {
      ring = 'border-emerald-500/40 bg-emerald-500/10';
      badge = 'bg-emerald-500/25 text-emerald-300';
    } else if (selected && !correct) {
      ring = 'border-red-500/40 bg-red-500/[0.08]';
      badge = 'bg-red-500/20 text-red-300';
    }
  } else if (selected) {
    ring = 'border-primary/40 bg-primary/10';
    badge = 'bg-primary/25 text-primary';
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled && !revealed ? { scale: 1.01 } : {}}
      whileTap={!disabled && !revealed ? { scale: 0.99 } : {}}
      className={`w-full p-3 text-left rounded-xl border transition-all duration-150 ${ring} ${
        !disabled && !revealed ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black transition-colors ${badge}`}>
          {LABELS[index]}
        </span>
        <span className="flex-1 text-sm leading-snug font-medium text-white/80">{answer.content}</span>
        {revealed && correct && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
        {revealed && selected && !correct && <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
      </div>
    </motion.button>
  );
}

function QcmGamePlayContent() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Read config from route state — set by QcmGameConfig on navigate()
  const routeConfig = location.state || {};
  const hintsEnabled = routeConfig.showHints !== false;
  const explanationsEnabled = routeConfig.showExplanations !== false;

  const {
    currentQuestion, questionIndex, score, livesRemaining,
    isLoading, isGameOver, lastAnswerResult,
    globalTimerDuration, maxTimerDuration,
    setSession, setQuestion, updateGameState, setLoading, setError, gameOver,
  } = useQcmGame();

  const [selectedId, setSelectedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!sessionId || loaded) return;
    setLoading(true);
    qcmGameService.getSessionState(sessionId)
      .then((data) => { setSession(data); setLoaded(true); })
      .catch((e) => { setError(e.message); navigate('/dashboard/play'); })
      .finally(() => setLoading(false));
  }, [sessionId, loaded]);

  useEffect(() => {
    if (globalTimerDuration && !timerOn) {
      setTimeLeft(globalTimerDuration);
      setTimerOn(true);
    }
  }, [globalTimerDuration, timerOn]);

  useEffect(() => {
    if (lastAnswerResult?.timeAdjustment && maxTimerDuration) {
      setTimeLeft((p) => Math.min(Math.max(p + lastAnswerResult.timeAdjustment, 0), maxTimerDuration));
    }
  }, [lastAnswerResult?.timeAdjustment]);

  useEffect(() => {
    if (timerOn && timeLeft > 0 && !isGameOver) {
      timerRef.current = setInterval(() => {
        setTimeLeft((p) => {
          if (p <= 1) { clearInterval(timerRef.current); onTimerEnd(); return 0; }
          return p - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerOn, isGameOver]);

  const onTimerEnd = useCallback(async () => {
    try { await qcmGameService.abandonGameSession(sessionId); } catch (_) {}
    navigate(`/dashboard/play/qcm/${sessionId}/results`);
  }, [sessionId, navigate]);

  const fetchNext = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setSelectedId(null);
    setShowHint(false);
    try {
      const res = await qcmGameService.getNextQuestion(sessionId);
      setQuestion(res);
    } catch (e) {
      const m = e.message || '';
      // Any terminal condition (out of questions, already completed, game over) → results screen,
      // never a stuck error state.
      if (m.includes('No more questions') || m.includes('completed') || m.includes('Game over')) {
        navigate(`/dashboard/play/qcm/${sessionId}/results`);
      } else {
        setError(m);
      }
    } finally { setLoading(false); }
  }, [sessionId, setQuestion, setLoading, setError, gameOver]);

  useEffect(() => {
    if (loaded && sessionId && !currentQuestion) fetchNext();
  }, [loaded, sessionId, currentQuestion, fetchNext]);

  const submit = async (id = selectedId) => {
    if (!id || submitting || !currentQuestion) return;
    setSubmitting(true);
    try {
      const res = await qcmGameService.submitAnswer(sessionId, {
        questionId: currentQuestion.questionId,
        selectedAnswerId: id,
        timeTakenSeconds: 0,
        usedHint: showHint,
      });
      updateGameState(res);
      if (res.isGameOver) setTimeout(() => navigate(`/dashboard/play/qcm/${sessionId}/results`), 2000);
    } catch (e) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  const abandon = async () => {
    if (!window.confirm('Abandonner cette partie ?')) return;
    try { await qcmGameService.abandonGameSession(sessionId); } catch (_) {}
    navigate('/dashboard/play');
  };

  /* ─── Loading ─── */
  if ((isLoading && !currentQuestion) || !loaded) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="relative w-14 h-14 mx-auto">
            <div className="absolute inset-0 bg-primary/15 rounded-full animate-ping" />
            <div className="relative flex items-center justify-center w-14 h-14 bg-primary/10 border border-primary/20 rounded-full">
              <Bolt className="h-6 w-6 text-primary" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Chargement...</p>
        </div>
      </div>
    );
  }

  /* ─── Game over ─── */
  if (isGameOver) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-sm w-full space-y-7">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-red-500/10 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
            <div className="relative flex items-center justify-center w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-full">
              <AlertTriangle className="h-10 w-10 text-red-400" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-400/70 mb-2">Fin du jeu</p>
            <h2 className="text-3xl font-black text-white">Toutes les vies perdues</h2>
          </div>
          <div className="flex justify-center gap-10">
            <div className="text-center">
              <p className="text-4xl font-black text-primary tabular-nums">{score}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/25 mt-1">Points</p>
            </div>
            <div className="w-px bg-white/[0.07]" />
            <div className="text-center">
              <p className="text-4xl font-black text-white tabular-nums">{questionIndex - 1}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/25 mt-1">Correct</p>
            </div>
          </div>
          <button onClick={() => navigate(`/dashboard/play/qcm/${sessionId}/results`)}
            className="w-full py-3.5 rounded-2xl bg-primary text-white font-black text-sm hover:brightness-110 transition-all shadow-xl shadow-primary/20">
            Voir les résultats
          </button>
        </motion.div>
      </div>
    );
  }

  const diff = currentQuestion?.difficultyLevel;

  /*
   * Layout: fixed-height flex column that fills exactly the space below the topbar.
   * This guarantees the action panel (Submit / Next) is always visible — never off-screen.
   */
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">

      {/* ─── HUD ─── */}
      <div className="shrink-0 border-b border-white/[0.07] backdrop-blur-sm" style={{ background: 'rgba(8,8,8,0.92)' }}>
        <div className="max-w-2xl mx-auto px-5 py-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Hearts count={livesRemaining} />
              <span className="text-[10px] font-black font-mono text-white/25 border border-white/[0.07] rounded-md px-1.5 py-0.5">
                Q{questionIndex}
              </span>
              {diff && (
                <span className={`text-[10px] font-black border rounded-md px-1.5 py-0.5 ${DIFF_STYLE[diff] || 'text-white/30 border-white/10'}`}>
                  {diff}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
                <Medal className="h-3 w-3 text-primary" />
                <AnimatedNumber value={score} pop className="font-black text-primary text-xs" />
              </div>
              <button onClick={abandon}
                className="text-[10px] text-white/20 hover:text-white/55 px-2 py-1 rounded-lg hover:bg-white/[0.05] transition-colors">
                Quit
              </button>
            </div>
          </div>
          {globalTimerDuration && (
            <TimerBar remaining={timeLeft} max={maxTimerDuration || globalTimerDuration} />
          )}
        </div>
      </div>

      {/* ─── Scrollable content ─── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-4 space-y-3">

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion?.questionId}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {/* Question number + card */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                    Question {String(questionIndex).padStart(2, '0')}
                  </span>
                  {hintsEnabled && currentQuestion?.showHint && currentQuestion?.hint && (
                    <button onClick={() => setShowHint(!showHint)}
                      className="flex items-center gap-1 text-[10px] text-yellow-400/60 hover:text-yellow-400 transition-colors ml-auto">
                      <Lightbulb className="h-3 w-3" />
                      {showHint ? 'Masquer' : 'Indice'}
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {showHint && currentQuestion?.hint && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-2">
                      <div className="p-3 rounded-xl bg-yellow-500/[0.07] border border-yellow-500/15 text-xs text-yellow-300/70 leading-relaxed">
                        {currentQuestion.hint}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4">
                  <p className="text-base font-semibold leading-relaxed text-white/90">
                    {currentQuestion?.content}
                  </p>
                </div>
              </div>

              {/* Answers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentQuestion?.answers?.map((ans, i) => (
                  <AnswerBtn
                    key={ans.answerId}
                    answer={ans}
                    index={i}
                    selected={selectedId === ans.answerId}
                    correct={lastAnswerResult?.correctAnswerId === ans.answerId}
                    revealed={!!lastAnswerResult}
                    onClick={() => !lastAnswerResult && setSelectedId(ans.answerId)}
                    disabled={!!lastAnswerResult || submitting}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </div>

      {/* ─── Action panel — always visible, in-flow at bottom ─── */}
      <div className="shrink-0 border-t border-white/[0.07]" style={{ background: 'rgba(8,8,8,0.97)' }}>
        <div className="max-w-2xl mx-auto px-5 py-3">
          <AnimatePresence mode="wait">
            {!lastAnswerResult ? (
              <motion.button
                key="submit"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                onClick={() => submit()}
                disabled={!selectedId || submitting}
                className="w-full h-12 rounded-2xl bg-primary text-white font-black text-sm shadow-xl shadow-primary/20 hover:brightness-110 transition-all disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <><CheckCircle2 className="h-4 w-4" />Valider</>
                }
              </motion.button>
            ) : (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                className={`rounded-2xl border px-4 py-2.5 flex items-center gap-3 ${
                  lastAnswerResult.isCorrect
                    ? 'border-emerald-500/30 bg-emerald-500/[0.07]'
                    : 'border-red-500/30 bg-red-500/[0.07]'
                }`}
              >
                {lastAnswerResult.isCorrect
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  : <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-black ${lastAnswerResult.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                    {lastAnswerResult.isCorrect ? 'Bonne réponse !' : 'Mauvaise réponse'}
                  </p>
                  {!lastAnswerResult.isCorrect && (
                    <p className="text-xs text-white/35 truncate">
                      → <span className="text-emerald-400 font-semibold">{lastAnswerResult.correctAnswerContent}</span>
                    </p>
                  )}
                  {explanationsEnabled && lastAnswerResult.explanation && (
                    <p className="text-xs text-white/25 mt-0.5 line-clamp-1 leading-relaxed">{lastAnswerResult.explanation}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {lastAnswerResult.timeAdjustment && (
                    <span className={`text-xs font-black tabular-nums ${lastAnswerResult.timeAdjustment > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {lastAnswerResult.timeAdjustment > 0 ? `+${lastAnswerResult.timeAdjustment}s` : `${lastAnswerResult.timeAdjustment}s`}
                    </span>
                  )}
                  {lastAnswerResult.hasNextQuestion && (
                    <button
                      onClick={fetchNext}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-black hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                    >
                      Suivant <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}

export default function QcmGamePlay() {
  return (
    <QcmGameProvider>
      <QcmGamePlayContent />
    </QcmGameProvider>
  );
}
