import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QcmGameProvider, useQcmGame } from '../../contexts/QcmGameContext';
import qcmGameService from '../../services/qcmGame.service';
import { Loader2, HelpCircle, Zap, Timer, Clock, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';

const MODES = [
  {
    key: 'BLITZ',
    label: 'Blitz',
    sub: '2 min',
    icon: Zap,
    initialTime: 60,
    maxTime: 90,
    desc: 'Sprint intense. Questions enchaînées à vitesse maximale.',
    pts: '+15 pts/q',
  },
  {
    key: 'RUSH',
    label: 'Rush',
    sub: '5 min',
    icon: Timer,
    initialTime: 120,
    maxTime: 150,
    desc: 'Rythme soutenu. Bon équilibre entre vitesse et précision.',
    pts: '+10 pts/q',
  },
  {
    key: 'CLASSIC',
    label: 'Classic',
    sub: '10 min',
    icon: Clock,
    initialTime: 300,
    maxTime: 360,
    desc: 'Session longue. Conçu pour atteindre les niveaux EXPERT.',
    pts: '+8 pts/q',
  },
];

export const GAME_MODES = Object.fromEntries(
  MODES.map(m => [m.key, { initialTime: m.initialTime, maxTime: m.maxTime, label: m.label, description: m.sub, icon: m.icon }])
);

const STEPS = ['Catégorie', 'Tags', 'Mode', 'Options'];

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

function StepIndicator({ step, labels }) {
  return (
    <div className="flex items-center gap-1.5">
      {labels.map((label, i) => {
        const idx = i + 1;
        const done = idx < step;
        const active = idx === step;
        return (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-black transition-all ${
              done ? 'bg-primary text-white' :
              active ? 'border border-primary text-primary' :
              'border border-white/[0.12] text-white/20'
            }`}>
              {done ? '✓' : idx}
            </div>
            <span className={`text-[10px] font-semibold hidden sm:block transition-colors ${active ? 'text-white/70' : 'text-white/20'}`}>
              {label}
            </span>
            {i < labels.length - 1 && (
              <div className={`w-5 h-px mx-0.5 ${done ? 'bg-primary/60' : 'bg-white/[0.08]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function QcmGameConfigContent() {
  const navigate = useNavigate();
  const { setSession, setConfig, setLoading, setError } = useQcmGame();

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [gameMode, setGameMode] = useState(null);
  const [showHints, setShowHints] = useState(true);
  const [showExplanations, setShowExplanations] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagsLoading, setTagsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    qcmGameService.getCategories()
      .then(r => setCategories(r.data || r))
      .catch(() => setError('Failed to load categories'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSelectCategory = async (cat) => {
    setSelectedCategory(cat);
    setSelectedTags([]);
    setTagsLoading(true);
    try {
      const r = await qcmGameService.getTagsByCategory(cat.id);
      const tags = r.data || r;
      setAvailableTags(tags);
      setStep(tags.length > 0 ? 2 : 3);
    } catch {
      setAvailableTags([]);
      setStep(3);
    } finally {
      setTagsLoading(false);
    }
  };

  const handleSelectMode = (key) => {
    setGameMode(key);
    setStep(4);
  };

  const toggleTag = (id) =>
    setSelectedTags(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleSubmit = async () => {
    if (!selectedCategory || !gameMode) return;
    setIsSubmitting(true);
    setLoading(true);
    try {
      const config = {
        categoryId: selectedCategory.id,
        tagIds: selectedTags.length > 0 ? selectedTags : undefined,
        gameMode,
        showHints,
        showExplanations,
      };
      const response = await qcmGameService.createGameSession(config);
      setSession(response);
      setConfig(config);
      navigate(`/dashboard/play/qcm/${response.sessionId}`, {
        state: { showHints, showExplanations },
      });
    } catch (error) {
      setError(error.message || 'Failed to create game session');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 1) navigate('/dashboard/play');
    else if (step === 2) setStep(1);
    else if (step === 3) setStep(availableTags.length > 0 ? 2 : 1);
    else if (step === 4) setStep(3);
  };

  const visibleSteps = availableTags.length > 0 ? STEPS : ['Catégorie', 'Mode', 'Options'];
  const visibleStep = availableTags.length > 0 ? step : (step >= 3 ? step - 1 : step);

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Back + step */}
        <div className="flex items-center justify-between">
          <button onClick={goBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/70 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            {step === 1 ? 'Retour' : 'Précédent'}
          </button>
          <StepIndicator step={visibleStep} labels={visibleSteps} />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <HelpCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black leading-none tracking-tight text-white">QCM</h1>
            <p className="text-[10px] text-white/25 uppercase tracking-wider mt-0.5">Choix multiple · classé</p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ── Step 1: Category ── */}
          {step === 1 && (
            <motion.div key="step1"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
              className="space-y-4"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25">Choisissez une catégorie</p>
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-white/20" />
                </div>
              ) : (
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 cursor-pointer hover:border-primary/30 hover:bg-primary/[0.03] transition-all duration-300"
                      onClick={() => handleSelectCategory(cat)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] shrink-0">
                          <BookOpen className="h-4 w-4 text-white/40" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-black text-white/80">{cat.name}</p>
                          {cat.description && (
                            <p className="text-xs text-white/30 mt-0.5 truncate">{cat.description}</p>
                          )}
                        </div>
                        {tagsLoading && selectedCategory?.id === cat.id
                          ? <Loader2 className="h-4 w-4 animate-spin text-white/25 shrink-0" />
                          : <ArrowRight className="h-4 w-4 text-white/20 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        }
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Step 2: Tags ── */}
          {step === 2 && (
            <motion.div key="step2"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
              className="space-y-5"
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25 mb-1">Filtrer par tags</p>
                <p className="text-xs text-white/30">
                  Optionnel — laissez vide pour inclure tous les sujets de{" "}
                  <span className="text-white/60 font-semibold">{selectedCategory?.name}</span>.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => {
                  const sel = selectedTags.includes(tag.id);
                  return (
                    <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                      className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 ${
                        sel
                          ? 'border-primary/40 bg-primary/10 text-primary'
                          : 'border-white/[0.08] text-white/35 hover:border-white/20 hover:text-white/60'
                      }`}>
                      {tag.name}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setStep(3)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-white text-sm font-black hover:brightness-110 transition-all shadow-xl shadow-primary/20">
                {selectedTags.length > 0
                  ? `Continuer avec ${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''}`
                  : 'Continuer (tous les sujets)'
                }
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {/* ── Step 3: Mode ── */}
          {step === 3 && (
            <motion.div key="step3"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
              className="space-y-4"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25">Choisissez un mode</p>
              <div className="space-y-2">
                {MODES.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <div
                      key={mode.key}
                      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 cursor-pointer hover:border-primary/30 hover:bg-primary/[0.03] transition-all duration-300"
                      onClick={() => handleSelectMode(mode.key)}
                    >
                      <div className="flex items-center gap-5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] shrink-0">
                          <Icon className="h-5 w-5 text-white/40" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-base font-black text-white/80">{mode.label}</h3>
                            <span className="text-xs font-mono text-white/25">{mode.sub}</span>
                            <span className="text-xs font-black text-primary ml-auto">{mode.pts}</span>
                          </div>
                          <p className="text-xs text-white/30 mt-0.5 leading-relaxed">{mode.desc}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-white/20 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Options ── */}
          {step === 4 && (
            <motion.div key="step4"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
              className="space-y-6"
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25 mb-1">Options de jeu</p>
                <p className="text-xs text-white/30">
                  {selectedCategory?.name} · {MODES.find(m => m.key === gameMode)?.label} · {MODES.find(m => m.key === gameMode)?.sub}
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] divide-y divide-white/[0.05]">
                {[
                  { id: 'hints', label: 'Afficher les indices', sub: 'Révéler un indice avant de répondre', value: showHints, set: setShowHints },
                  { id: 'expl', label: 'Afficher les explications', sub: "Afficher l'explication après chaque réponse", value: showExplanations, set: setShowExplanations },
                ].map(opt => (
                  <div key={opt.id} className="flex items-center justify-between gap-4 p-5">
                    <div>
                      <p className="text-sm font-semibold text-white/75">{opt.label}</p>
                      <p className="text-xs text-white/30 mt-0.5">{opt.sub}</p>
                    </div>
                    <button type="button" onClick={() => opt.set(!opt.value)}
                      className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${opt.value ? 'bg-primary' : 'bg-white/12'}`}>
                      <span className={`absolute top-[4px] w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${opt.value ? 'left-[calc(100%-20px)]' : 'left-[4px]'}`} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-white text-sm font-black hover:brightness-110 transition-all shadow-xl shadow-primary/20 disabled:opacity-40"
              >
                {isSubmitting
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Création en cours…</>
                  : <><ArrowRight className="h-4 w-4" /> Lancer la partie</>
                }
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

export default function QcmGameConfig() {
  return (
    <QcmGameProvider>
      <QcmGameConfigContent />
    </QcmGameProvider>
  );
}
