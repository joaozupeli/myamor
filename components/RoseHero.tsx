"use client";

import dynamic from "next/dynamic";
import { Component, useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode, type RefObject } from "react";
import { content } from "@/content/content";
import { gsap } from "@/lib/gsap";
import { motion, setTilt } from "@/lib/motion";
import type { Quality } from "@/lib/quality";
import { splitLetters } from "@/lib/splitText";

const RoseCanvas = dynamic(() => import("./RoseScene"), { ssr: false });

class RoseBoundary extends Component<{ children: ReactNode; onFail: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFail();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function RoseDrawing() {
  const petals = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg viewBox="0 0 200 220" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="rose-glow" cx="50%" cy="46%" r="50%">
          <stop offset="0%" stopColor="#FF3B55" stopOpacity="0.85" />
          <stop offset="42%" stopColor="#C8102E" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#C8102E" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="drawn-petal" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#5A0F1F" />
          <stop offset="48%" stopColor="#C8102E" />
          <stop offset="100%" stopColor="#FF8A98" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="104" r="78" fill="url(#rose-glow)" />
      {petals.map((angle) => (
        <ellipse key={angle} cx="100" cy="70" rx="18" ry="34" fill="url(#drawn-petal)" opacity="0.92" transform={`rotate(${angle} 100 104)`} />
      ))}
      {[20, 90, 160, 230, 300].map((angle) => (
        <ellipse key={`inner-${angle}`} cx="100" cy="84" rx="12" ry="22" fill="#FF3B55" opacity="0.8" transform={`rotate(${angle} 100 104)`} />
      ))}
      <circle cx="100" cy="104" r="7" fill="#F3ECE6" />
      <path d="M100 150 C 102 170, 98 190, 100 214" fill="none" stroke="#C8102E" strokeWidth="2" />
    </svg>
  );
}

export function RoseHero({
  started,
  heroRef,
  quality,
}: {
  started: boolean;
  heroRef: RefObject<HTMLElement | null>;
  quality: Quality | null;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const depthRef = useRef(0);
  const [live, setLive] = useState(false);
  const [failed, setFailed] = useState(false);
  const [asleep, setAsleep] = useState(false);
  const showWebgl = Boolean(quality?.showWebgl) && !failed;

  useLayoutEffect(() => {
    const title = titleRef.current;
    if (!started || !title) return;
    const split = splitLetters(title);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return () => split.restore();

    const blur = quality?.bloom ? "blur(14px)" : "blur(0px)";
    const titleTween = gsap.fromTo(split.letters, {
      opacity: 0,
      y: 16,
      filter: blur,
    }, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.5,
      stagger: 0.035,
      ease: "expo.out",
    });
    const subTween = subRef.current
      ? gsap.fromTo(subRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.2, delay: 0.45, ease: "power3.out" })
      : null;

    return () => {
      titleTween.kill();
      subTween?.kill();
      split.restore();
    };
  }, [started, quality?.bloom]);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    const visual = visualRef.current;
    const copy = copyRef.current;
    if (!started || !hero || !visual || !copy) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          const delayed = Math.max(0, (self.progress - 0.22) / 0.78);
          depthRef.current = delayed * delayed * (3 - 2 * delayed);
          const next = self.progress > 0.98;
          setAsleep((current) => (current === next ? current : next));
        },
      },
    });
    timeline.to(copy, { opacity: 0, y: -28, ease: "none", duration: 0.3 }, 0);
    timeline.to(visual, { opacity: 0, ease: "none", duration: 0.22 }, 0.74);

    return () => {
      timeline.scrollTrigger?.kill();
      timeline.kill();
    };
  }, [heroRef, started]);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (motion.orientation) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt(y * 0.16, x * 0.2);
  };

  return (
    <div className="relative h-full w-full" onPointerMove={onPointerMove}>
      <div ref={visualRef} className="absolute inset-x-0 top-0 h-[68%]">
        <div className="absolute left-1/2 top-[58%] h-[78vw] max-h-[520px] w-[78vw] max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,59,85,0.42)_0%,rgba(200,16,46,0.16)_36%,rgba(232,195,158,0.05)_58%,transparent_72%)] blur-3xl" />
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${live ? "opacity-0" : "opacity-100"}`}>
          <div className="breathe h-[min(78vw,520px)] w-[min(78vw,520px)]">
            <RoseDrawing />
          </div>
        </div>
        {showWebgl ? (
          <RoseBoundary onFail={() => setFailed(true)}>
            <div className={`absolute inset-0 transition-opacity duration-1000 ${live ? "opacity-100" : "opacity-0"}`}>
              <RoseCanvas
                bloom={Boolean(quality?.bloom)}
                dpr={quality?.dpr ?? 1}
                lite={Boolean(quality?.lite)}
                asleep={asleep}
                depthRef={depthRef}
                onReady={() => setLive(true)}
              />
            </div>
          </RoseBoundary>
        ) : null}
      </div>
      <div ref={copyRef} className="absolute inset-x-0 bottom-[8vh] z-[4] px-6 text-center">
        <h1 ref={titleRef} className="hero-title font-display text-[clamp(3.4rem,13vw,8.4rem)] leading-[0.86] font-medium tracking-[-0.045em] text-[#F3ECE6]">
          {content.title}
        </h1>
        <p ref={subRef} className="hero-sub mx-auto mt-5 max-w-[18rem] font-display text-[clamp(1.25rem,3.4vw,1.85rem)] leading-snug font-medium italic text-[rgba(243,236,230,0.72)] md:max-w-md">
          {content.subtitle}
        </p>
        <p className="mt-8 font-sans text-[0.68rem] tracking-[0.42em] text-[#E8C39E]/80 uppercase">
          {content.scrollHint}
        </p>
        <div className="mx-auto mt-4 h-14 w-px overflow-hidden bg-[rgba(232,195,158,0.28)]" aria-hidden="true">
          <div className="hint-line h-1/2 w-full bg-[#E8C39E]" />
        </div>
      </div>
    </div>
  );
}
