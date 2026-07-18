import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Score/number that smoothly counts up to its target and, when `pop` is set, briefly
 * shows a "+delta" on increase. Deliberately restrained (short tween, single accent)
 * to stay on the sober/pro side while still feeling rewarding.
 */
export default function AnimatedNumber({ value, className = "", pop = false }) {
  const [display, setDisplay] = useState(value);
  const [delta, setDelta] = useState(null);
  const fromRef = useRef(value);
  const rafRef = useRef();
  const deltaTimer = useRef();

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;

    if (pop && to > from) {
      setDelta(to - from);
      clearTimeout(deltaTimer.current);
      deltaTimer.current = setTimeout(() => setDelta(null), 850);
    }

    const start = performance.now();
    const duration = 450;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [value, pop]);

  useEffect(() => () => { clearTimeout(deltaTimer.current); }, []);

  return (
    <span className={`relative tabular-nums ${className}`}>
      {display}
      <AnimatePresence>
        {delta != null && (
          <motion.span
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: -14 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-black text-emerald-400 pointer-events-none whitespace-nowrap"
          >
            +{delta}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
