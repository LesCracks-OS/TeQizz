import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Check, Plus, Trash2, Upload,
  Loader2, AlertCircle, BookOpen, ChevronDown, Send,
  Inbox, X, FileText, PenLine, Code2, HandHeart,
  Github, ExternalLink, Bug, Lightbulb, GitPullRequest,
  Coffee, Star, Heart,
} from 'lucide-react';
import contributionService from '../../services/contribution.service';
import qcmGameService from '../../services/qcmGame.service';

// ─────────────────────────────────────────────────────────────────────────────
// SHARED CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const LEVELS = [
  { key: 'EASY',   label: 'Easy',   desc: 'Accessible à tous',      color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/8' },
  { key: 'MEDIUM', label: 'Medium', desc: 'Quelques bases requises', color: 'text-yellow-400',  border: 'border-yellow-500/30',  bg: 'bg-yellow-500/8'  },
  { key: 'HARD',   label: 'Hard',   desc: 'Niveau expert',          color: 'text-red-400',     border: 'border-red-500/30',     bg: 'bg-red-500/8'     },
];

const STATUS_STYLES = {
  REVIEW:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ACTIVE:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  ARCHIVED: 'bg-muted text-muted-foreground border-border',
};

const STATUS_LABELS = {
  REVIEW:   'En attente de review',
  ACTIVE:   'Approuvée',
  ARCHIVED: 'Refusée',
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTENU — Formulaire pas-à-pas
// ─────────────────────────────────────────────────────────────────────────────

const GAMES = [
  { key: 'QCM',    label: 'QCM',    desc: 'Questions à choix multiples' },
  { key: 'SMATCH', label: 'Smatch', desc: 'Association termes / définitions' },
];

function SubmitForm({ categories }) {
  const [step, setStep] = useState(1);
  const [game, setGame] = useState(null);
  const [category, setCategory] = useState(null);
  const [level, setLevel] = useState(null);
  const [content, setContent] = useState('');
  const [hint, setHint] = useState('');
  const [explanation, setExplanation] = useState('');
  const [answers, setAnswers] = useState([
    { content: '', isCorrect: true  },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setStep(1); setGame(null); setCategory(null); setLevel(null);
    setContent(''); setHint(''); setExplanation('');
    setAnswers([
      { content: '', isCorrect: true  },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
    ]);
    setDone(false); setError('');
  };

  const setAnswer = (i, field, value) =>
    setAnswers(prev => prev.map((a, idx) => idx === i ? { ...a, [field]: value } : a));

  const markCorrect = (i) =>
    setAnswers(prev => prev.map((a, idx) => ({ ...a, isCorrect: idx === i })));

  const canProceed = () => {
    if (step === 1) return game !== null;
    if (step === 2) return category && level;
    if (step === 3) return content.trim().length >= 10;
    if (step === 4) return answers.every(a => a.content.trim()) && answers.some(a => a.isCorrect);
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true); setError('');
    try {
      await contributionService.submitQuestion({
        content,
        hint: hint.trim() || undefined,
        explanation: explanation.trim() || undefined,
        categoryId: category.id,
        level: level.key,
        gameType: game.key,
        answers,
      });
      setDone(true);
    } catch (e) {
      setError(e?.message || 'Échec de la soumission');
    }
    setSubmitting(false);
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center space-y-4"
      >
        <div className="h-14 w-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <Check className="h-7 w-7 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-xl font-black">Soumis !</h3>
          <p className="text-sm text-muted-foreground mt-1">Ta contribution est en attente de validation par l'équipe.</p>
        </div>
        <button onClick={reset}
          className="mt-4 px-6 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-black hover:bg-primary/90 transition-colors">
          Soumettre une autre
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 pb-28">
      {/* Progress */}
      <div className="flex gap-1.5">
        {['Jeu', 'Catégorie', 'Question', 'Réponses', 'Détails'].map((label, i) => {
          const idx = i + 1;
          return (
            <div key={label} className={`flex-1 h-1 rounded-full transition-colors ${
              idx < step ? 'bg-primary' : idx === step ? 'bg-primary/50' : 'bg-border'
            }`} />
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }} className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Pour quel jeu ?</p>
            <div className="grid grid-cols-2 gap-3">
              {GAMES.map(g => (
                <button key={g.key} onClick={() => setGame(g)}
                  className={`flex flex-col gap-2 p-5 rounded-2xl border text-left transition-all ${
                    game?.key === g.key ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-muted/20'
                  }`}>
                  <p className={`font-black text-base ${game?.key === g.key ? 'text-primary' : 'text-foreground'}`}>{g.label}</p>
                  <p className="text-xs text-muted-foreground leading-snug">{g.desc}</p>
                  {game?.key === g.key && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }} className="space-y-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Catégorie</p>
              <div className="mt-3 space-y-2">
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setCategory(cat)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                      category?.id === cat.id ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-muted/20'
                    }`}>
                    <div className="h-9 w-9 rounded-xl border border-border bg-muted/20 flex items-center justify-center shrink-0">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{cat.name}</p>
                      {cat.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{cat.description}</p>}
                    </div>
                    {category?.id === cat.id && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Difficulté</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {LEVELS.map(l => (
                  <button key={l.key} onClick={() => setLevel(l)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      level?.key === l.key ? `${l.border} ${l.bg}` : 'border-border bg-card hover:bg-muted/20'
                    }`}>
                    <p className={`font-black text-sm ${level?.key === l.key ? l.color : 'text-foreground'}`}>{l.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{l.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }} className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Ta question</p>
            <textarea autoFocus value={content} onChange={e => setContent(e.target.value)} rows={5}
              placeholder="Formule une question claire et sans ambiguïté…"
              className="w-full px-4 py-3 text-sm rounded-2xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none leading-relaxed" />
            <p className={`text-xs text-right ${content.length < 10 ? 'text-muted-foreground' : 'text-emerald-400'}`}>
              {content.length} caractères {content.length < 10 && '(min 10)'}
            </p>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }} className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Réponses</p>
              <p className="text-xs text-muted-foreground mt-1">Appuie sur le cercle pour marquer la bonne réponse.</p>
            </div>
            <div className="space-y-3">
              {answers.map((ans, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors ${
                  ans.isCorrect ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border bg-card'
                }`}>
                  <button onClick={() => markCorrect(i)}
                    className={`h-7 w-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      ans.isCorrect ? 'border-emerald-500 bg-emerald-500' : 'border-border hover:border-primary'
                    }`}>
                    {ans.isCorrect && <Check className="h-3.5 w-3.5 text-white" />}
                  </button>
                  <input value={ans.content} onChange={e => setAnswer(i, 'content', e.target.value)}
                    placeholder={`Réponse ${i + 1}`}
                    className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/50" />
                  <button onClick={() => answers.length > 2 && setAnswers(prev => prev.filter((_, idx) => idx !== i))}
                    disabled={answers.length <= 2}
                    className="p-1 rounded-lg text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-30">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            {answers.length < 6 && (
              <button onClick={() => setAnswers(prev => [...prev, { content: '', isCorrect: false }])}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
                <Plus className="h-4 w-4" /> Ajouter une réponse
              </button>
            )}
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }} className="space-y-5">
            <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
              <p className="text-xs text-muted-foreground">
                {game?.label} · {category?.name} · <span className={LEVELS.find(l => l.key === level?.key)?.color}>{level?.label}</span>
              </p>
              <p className="text-sm font-medium leading-snug">{content}</p>
              <p className="text-xs text-muted-foreground">{answers.length} réponses · {answers.filter(a => a.isCorrect).length} correcte</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Indice <span className="font-normal">(optionnel)</span></label>
                <input value={hint} onChange={e => setHint(e.target.value)} placeholder="Un indice pour aider les joueurs…"
                  className="w-full px-4 py-3 text-sm rounded-2xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Explication <span className="font-normal">(optionnel)</span></label>
                <textarea value={explanation} onChange={e => setExplanation(e.target.value)} rows={3}
                  placeholder="Pourquoi cette réponse est-elle correcte ? Affiché après la réponse du joueur…"
                  className="w-full px-4 py-3 text-sm rounded-2xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs rounded-xl border border-red-500/20 bg-red-500/8 p-3">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-[240px] z-30 bg-background/95 backdrop-blur-xl border-t border-border px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => step > 1 && setStep(s => s - 1)} disabled={step === 1}
            className="p-3 rounded-xl text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30">
            <ArrowLeft className="h-4 w-4" />
          </button>
          {step < 5 ? (
            <button disabled={!canProceed()} onClick={() => setStep(s => s + 1)}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-black hover:bg-primary/90 transition-colors disabled:opacity-40">
              Continuer <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button disabled={submitting} onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-black hover:bg-primary/90 transition-colors disabled:opacity-40">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Envoi…</> : <><Send className="h-4 w-4" /> Soumettre</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENU — Import JSON
// ─────────────────────────────────────────────────────────────────────────────

function ImportForm({ categories }) {
  const inputRef = useRef();
  const [game, setGame] = useState(null);
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [parseError, setParseError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f); setParseError(''); setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let data = JSON.parse(e.target.result);
        if (!Array.isArray(data)) data = [data];
        setParsed(data);
      } catch (err) {
        setParseError('JSON invalide : ' + err.message);
      }
    };
    reader.readAsText(f);
  };

  const handleSubmit = async () => {
    if (!parsed?.length) return;
    setSubmitting(true);
    try {
      const r = await contributionService.submitQuestions(parsed);
      setResult(r.data);
    } catch (e) {
      setParseError(e?.message || 'Échec de la soumission');
    }
    setSubmitting(false);
  };

  const downloadTemplate = () => {
    const template = [{
      content: "Quelle est la complexité temporelle d'une recherche dans un arbre binaire équilibré ?",
      level: "MEDIUM",
      categoryId: categories[0]?.id || 1,
      hint: "Pense à la hauteur de l'arbre",
      explanation: "O(log n) car l'arbre est équilibré, la hauteur est log₂(n).",
      answers: [
        { content: "O(log n)", isCorrect: true },
        { content: "O(n)",     isCorrect: false },
        { content: "O(1)",     isCorrect: false },
        { content: "O(n²)",    isCorrect: false },
      ],
    }];
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'template-questions.json'; a.click();
    URL.revokeObjectURL(url);
  };

  if (result) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/8 p-6 text-center">
          <p className="text-3xl font-black text-emerald-400">{result.submitted}</p>
          <p className="text-sm text-muted-foreground mt-1">
            contribution{result.submitted !== 1 ? 's' : ''} soumise{result.submitted !== 1 ? 's' : ''} pour review
          </p>
        </div>
        {result.errors?.length > 0 && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/8 p-4 space-y-1">
            <p className="text-xs font-semibold text-red-400">{result.errors.length} erreur{result.errors.length !== 1 ? 's' : ''} :</p>
            {result.errors.map((e, i) => <p key={i} className="text-xs text-muted-foreground">{e}</p>)}
          </div>
        )}
        <button onClick={() => { setGame(null); setFile(null); setParsed(null); setResult(null); }}
          className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-black hover:bg-primary/90 transition-colors">
          Importer d'autres
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5 pb-28">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Pour quel jeu ?</p>
        <div className="grid grid-cols-2 gap-3">
          {GAMES.map(g => (
            <button key={g.key} onClick={() => setGame(g)}
              className={`flex flex-col gap-1.5 p-4 rounded-2xl border text-left transition-all ${
                game?.key === g.key ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-muted/20'
              }`}>
              <p className={`font-black text-sm ${game?.key === g.key ? 'text-primary' : 'text-foreground'}`}>{g.label}</p>
              <p className="text-[11px] text-muted-foreground leading-snug">{g.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className={`rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${
          file ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-primary/30 bg-muted/10'
        }`}
      >
        <FileText className={`h-8 w-8 mx-auto mb-3 ${file ? 'text-primary' : 'text-muted-foreground'}`} />
        <p className="text-sm font-semibold">{file ? file.name : 'Dépose un fichier ici ou clique pour parcourir'}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {file ? `${parsed?.length ?? 0} entrée${(parsed?.length ?? 0) !== 1 ? 's' : ''} détectée${(parsed?.length ?? 0) !== 1 ? 's' : ''}` : 'JSON uniquement'}
        </p>
        <input ref={inputRef} type="file" accept=".json" className="hidden" onChange={e => handleFile(e.target.files[0])} />
      </div>

      <button onClick={downloadTemplate}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors">
        <Upload className="h-4 w-4" /> Télécharger le template JSON
      </button>

      {parseError && (
        <div className="flex items-start gap-2 text-red-400 text-xs rounded-xl border border-red-500/20 bg-red-500/8 p-3">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {parseError}
        </div>
      )}

      {parsed && !parseError && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold">{parsed.length} entrée{parsed.length !== 1 ? 's' : ''} prête{parsed.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-border">
            {parsed.slice(0, 10).map((q, i) => (
              <div key={i} className="px-4 py-2.5">
                <p className="text-xs font-medium truncate">{q.content || '(sans contenu)'}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{q.level ?? '?'} · {q.answers?.length ?? 0} réponses</p>
              </div>
            ))}
            {parsed.length > 10 && <div className="px-4 py-2.5 text-xs text-muted-foreground">+{parsed.length - 10} de plus…</div>}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 lg:left-[240px] z-30 bg-background/95 backdrop-blur-xl border-t border-border px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <button disabled={!parsed || !game || submitting} onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-black hover:bg-primary/90 transition-colors disabled:opacity-40">
            {submitting
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Envoi…</>
              : <><Send className="h-4 w-4" /> Soumettre {parsed?.length ?? 0} entrée{(parsed?.length ?? 0) !== 1 ? 's' : ''}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENU — Mes soumissions
// ─────────────────────────────────────────────────────────────────────────────

function MySubmissions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    contributionService.getMySubmissions()
      .then(r => setItems(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleWithdraw = async (id) => {
    setWithdrawing(id);
    try {
      await contributionService.withdrawSubmission(id);
      setItems(prev => prev.filter(s => s.id !== id));
    } catch {}
    setWithdrawing(null);
  };

  if (loading) return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />)}
    </div>
  );

  if (items.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
      <Inbox className="h-8 w-8 text-muted-foreground" />
      <p className="font-semibold">Aucune soumission</p>
      <p className="text-sm text-muted-foreground">Tes contributions apparaîtront ici.</p>
    </div>
  );

  return (
    <div className="space-y-3 pb-8">
      {items.map(s => {
        const expanded = expandedId === s.id;
        return (
          <div key={s.id} className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-start gap-3 p-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-snug line-clamp-2">{s.content}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_STYLES[s.status] ?? STATUS_STYLES.REVIEW}`}>
                    {STATUS_LABELS[s.status] ?? s.status}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{s.categoryName}</span>
                  <span className="text-[11px] text-muted-foreground">{new Date(s.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => setExpandedId(expanded ? null : s.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
                {s.status === 'REVIEW' && (
                  <button disabled={withdrawing === s.id} onClick={() => handleWithdraw(s.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50">
                    {withdrawing === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>
            <AnimatePresence>
              {expanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Question complète</p>
                    <p className="text-sm">{s.content}</p>
                    <p className="text-xs text-muted-foreground">{s.answersCount} réponses · {s.level}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ESPACE — Contenu
// ─────────────────────────────────────────────────────────────────────────────

const CONTENT_TABS = [
  { key: 'submit', label: 'Soumettre', icon: Send },
  { key: 'import', label: 'Importer',  icon: Upload },
  { key: 'mine',   label: 'Mes envois', icon: Inbox },
];

function SpaceContent({ categories }) {
  const [tab, setTab] = useState('submit');
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-1">
        <p className="text-sm font-bold">Enrichis les jeux de la plateforme</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Soumets du contenu — questions, ressources, corrections — pour faire évoluer les jeux.
          Chaque contribution est relue par l'équipe avant d'être mise en ligne.
        </p>
      </div>

      <div className="flex gap-1 p-1 rounded-2xl bg-muted/40 border border-border">
        {CONTENT_TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}>
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
          {tab === 'submit' && <SubmitForm categories={categories} />}
          {tab === 'import' && <ImportForm categories={categories} />}
          {tab === 'mine'   && <MySubmissions />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ESPACE — Code
// ─────────────────────────────────────────────────────────────────────────────

function SpaceCode() {
  const ways = [
    { Icon: Bug,           title: "Signaler un bug",         desc: "Tu as trouvé un problème ? Ouvre une issue GitHub avec les étapes pour reproduire." },
    { Icon: Lightbulb,     title: "Proposer une feature",    desc: "Une idée pour améliorer la plateforme ? Décris-la dans une issue et la communauté peut voter." },
    { Icon: GitPullRequest, title: "Contribuer au code",     desc: "Fork le repo, crée une branche, ouvre une PR. Toutes les contributions sont les bienvenues." },
  ];

  return (
    <div className="space-y-5 pb-8">
      <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-1">
        <p className="text-sm font-bold">Améliore la plateforme techniquement</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          TeQizz est un projet ouvert. Que tu signales un bug, proposes une fonctionnalité
          ou contribues directement au code — chaque participation compte.
        </p>
      </div>

      <div className="space-y-3">
        {ways.map(({ Icon, title, desc }, i) => (
          <div key={i} className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card">
            <div className="h-9 w-9 rounded-xl border border-border bg-muted/30 flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">{title}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <a
        href="https://github.com/LesCracks-OS/TeQizz"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-5 rounded-2xl border border-border bg-card hover:border-foreground/30 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <Github className="h-5 w-5 text-foreground" />
          <div>
            <p className="text-sm font-bold">Voir le repository GitHub</p>
            <p className="text-xs text-muted-foreground mt-0.5">Issues · Pull Requests · Discussions</p>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
      </a>

      <div className="rounded-2xl border border-border bg-muted/10 px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Prérequis recommandés</p>
        <div className="space-y-1.5">
          {['Java 17+ / Spring Boot — backend', 'React 18+ / Vite / TailwindCSS — frontend', 'Git + GitHub — workflow'].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-1 w-1 rounded-full bg-muted-foreground/50 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ESPACE — Soutien
// ─────────────────────────────────────────────────────────────────────────────

function SpaceSupport() {
  const finances = [
    { Icon: Coffee,  title: "Ko-fi",           desc: "Un café offert, c'est déjà du temps de développement gagné.", href: "#" },
    { Icon: Star,    title: "GitHub Sponsors",  desc: "Soutien récurrent pour financer les fonctionnalités futures.", href: "#" },
    { Icon: Heart,   title: "Open Collective",  desc: "Contribution transparente avec rapport d'utilisation public.", href: "#" },
  ];

  const enables = [
    "Hébergement et infrastructure serveur",
    "Développement de nouveaux jeux et fonctionnalités",
    "Création et curation de contenu",
    "Maintenance, sécurité et mises à jour",
    "Garder la plateforme 100% gratuite",
  ];

  return (
    <div className="space-y-5 pb-8">
      <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-1">
        <p className="text-sm font-bold">Soutiens le développement du projet</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          TeQizz est gratuit et le restera. Mais héberger, développer et maintenir une plateforme
          a un coût. Ton soutien permet de continuer à l'améliorer sans conditions.
        </p>
      </div>

      <div className="space-y-3">
        {finances.map(({ Icon, title, desc, href }, i) => (
          <a key={i} href={href}
            className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all group">
            <div className="h-10 w-10 rounded-xl border border-border bg-muted/30 flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
          </a>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-muted/10 px-5 py-5 space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Ce que ton soutien finance</p>
        <div className="space-y-2">
          {enables.map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────────────────────────────────────────

const SPACES = [
  {
    key: 'content',
    Icon: PenLine,
    title: 'Contenu',
    objective: 'Enrichis les jeux',
    description: 'Soumets du contenu pour faire évoluer la plateforme.',
  },
  {
    key: 'code',
    Icon: Code2,
    title: 'Code',
    objective: 'Améliore la plateforme',
    description: 'Bugs, features, pull requests — toutes les contributions tech.',
  },
  {
    key: 'support',
    Icon: HandHeart,
    title: 'Soutien',
    objective: 'Finance le projet',
    description: 'Aide à maintenir la plateforme gratuite et en évolution.',
  },
];

export default function Contribute() {
  const [space, setSpace] = useState('content');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    qcmGameService.getCategories()
      .then(r => setCategories(r.data || r || []))
      .catch(() => {});
  }, []);

  const active = SPACES.find(s => s.key === space);

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-2xl mx-auto px-4 pt-6 sm:px-6 sm:pt-10 space-y-6">

        {/* Header */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Communauté</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Contribuer</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Chacun contribue à sa façon. Choisis comment tu veux participer à l'évolution de TeQizz.
          </p>
        </div>

        {/* Space selector */}
        <div className="grid grid-cols-3 gap-3">
          {SPACES.map(({ key, Icon, title, objective }) => {
            const isActive = space === key;
            return (
              <button
                key={key}
                onClick={() => setSpace(key)}
                className={`relative flex flex-col items-start gap-2 p-4 rounded-2xl border text-left transition-all ${
                  isActive
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:bg-muted/20'
                }`}
              >
                <div className={`h-8 w-8 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                  isActive ? 'border-primary/30 bg-primary/15' : 'border-border bg-muted/20'
                }`}>
                  <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className={`text-sm font-black leading-none ${isActive ? 'text-foreground' : 'text-foreground'}`}>
                    {title}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-snug hidden sm:block">
                    {objective}
                  </p>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="space-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-1 w-6 rounded-full bg-primary"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Space content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={space}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {space === 'content' && <SpaceContent categories={categories} />}
            {space === 'code'    && <SpaceCode />}
            {space === 'support' && <SpaceSupport />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
