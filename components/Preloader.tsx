"use client";

import { useEffect, useRef, useState } from "react";
import { content } from "@/content/content";
import { gsap } from "@/lib/gsap";
import { detectQuality } from "@/lib/quality";

export function Preloader({ onStart }: { onStart: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const budRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [gone, setGone] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const quality = detectQuality();
    const target = { value: 0.08 };
    let pending = quality.showWebgl ? 2 : 1;
    const mark = (amount: number) => {
      pending -= 1;
      target.value = pending <= 0 ? 1 : amount;
    };

    void document.fonts.ready.then(() => mark(0.58));
    if (quality.showWebgl) {
      void import("./RoseScene").then(() => mark(1));
    }

    const startedAt = performance.now();
    let shown = 0;
    let frame = 0;
    const tick = () => {
      shown += (target.value - shown) * 0.08;
      if (target.value >= 1 && shown > 0.992 && performance.now() - startedAt > 1400) {
        setProgress(1);
        setReady(true);
        return;
      }
      setProgress(shown);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const begin = () => {
    if (!ready || leaving) return;
    setLeaving(true);
    onStart();
    const root = rootRef.current;
    const bud = budRef.current;
    if (!root || !bud) {
      setGone(true);
      return;
    }
    const timeline = gsap.timeline({ onComplete: () => setGone(true) });
    timeline.to(bud, {
      scale: 7,
      opacity: 0,
      duration: 1.35,
      ease: "power3.inOut",
    });
    timeline.to(root, {
      opacity: 0,
      duration: 0.9,
      ease: "power2.inOut",
    }, 0.35);
  };

  if (gone) return null;

  const open = progress * 26;

  return (
    <div ref={rootRef} className="preloader fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black px-6 text-center">
      <div ref={budRef} className="relative">
        <div
          className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
          style={{ background: `radial-gradient(circle, rgba(255,59,85,${0.25 + progress * 0.55}), transparent 68%)` }}
        />
        <svg viewBox="0 0 120 120" className="relative h-28 w-28" aria-hidden="true">
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse
              key={angle}
              cx="60"
              cy="40"
              rx={11 + progress * 3}
              ry={24 + progress * 5}
              fill={angle % 144 === 0 ? "#FF3B55" : "#C8102E"}
              opacity={0.85}
              transform={`rotate(${angle + open} 60 60)`}
            />
          ))}
          <circle cx="60" cy="60" r={5 + progress * 2} fill="#F3ECE6" />
        </svg>
      </div>
      <p className="mt-10 max-w-xs font-display text-[1.55rem] italic leading-snug text-[rgba(243,236,230,0.82)]">
        {content.preloaderLine}
      </p>
      {ready ? (
        <button type="button" className="ghost-button mt-8" onClick={begin}>
          {content.startLabel}
        </button>
      ) : (
        <div className="mt-8 h-px w-28 bg-[rgba(232,195,158,0.25)]" aria-hidden="true">
          <div className="h-px bg-[#E8C39E]" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      )}
    </div>
  );
}
