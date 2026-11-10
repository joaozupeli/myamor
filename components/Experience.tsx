"use client";

import { useEffect, useRef, useState } from "react";
import { Chapter, Interlude } from "@/components/Chapter";
import { FinalLetter } from "@/components/FinalLetter";
import { GrainOverlay } from "@/components/GrainOverlay";
import { Particles } from "@/components/Particles";
import { PetalRain } from "@/components/PetalRain";
import { Preloader } from "@/components/Preloader";
import { RoseHero } from "@/components/RoseHero";
import { SoundToggle } from "@/components/SoundToggle";
import { StemDescent } from "@/components/StemDescent";
import { content } from "@/content/content";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { motion, requestTilt, setTilt } from "@/lib/motion";
import { detectQuality, type Quality } from "@/lib/quality";
import { startSmoothScroll } from "@/lib/smoothScroll";
import { startStorySound } from "@/lib/sound";

export function Experience() {
  const [started, setStarted] = useState(false);
  const [quality, setQuality] = useState<Quality | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const washRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuality(detectQuality());
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("story-locked", !started);
    return () => {
      document.documentElement.classList.remove("story-locked");
    };
  }, [started]);

  useEffect(() => {
    if (!started) return;
    return startSmoothScroll();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const root = document.documentElement;
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = (event.clientY / window.innerHeight) * 2 - 1;
      root.style.setProperty("--pointer-x", x.toFixed(3));
      root.style.setProperty("--pointer-y", y.toFixed(3));
      if (!motion.orientation) setTilt(y * 0.2, x * 0.24);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const timer = window.setTimeout(() => ScrollTrigger.refresh(), 250);
    return () => window.clearTimeout(timer);
  }, [started]);

  useEffect(() => {
    const wash = washRef.current;
    const hero = heroRef.current;
    if (!started || !wash || !hero) return;
    const tween = gsap.to(wash, {
      opacity: 1,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "35% top",
        end: "bottom bottom",
        scrub: true,
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [started]);

  const begin = () => {
    startStorySound(content.music);
    void requestTilt();
    setStarted(true);
  };

  return (
    <>
      <div className="fixed inset-0 bg-[#07060A]" />
      <div
        ref={washRef}
        className="pointer-events-none fixed inset-0 opacity-0"
        style={{ background: "radial-gradient(130% 90% at 50% 115%, #2A0A14 0%, #14070C 40%, #07060A 74%)" }}
      />
      <GrainOverlay />
      {started ? <div className="pointer-light" /> : null}
      {quality ? <Particles count={quality.particles} /> : null}
      <Preloader onStart={begin} />
      <main className="relative z-[2]">
        <section ref={heroRef} className="relative h-[230svh]">
          <div className="sticky top-0 h-[100svh] overflow-hidden">
            <RoseHero started={started} heroRef={heroRef} quality={quality} />
            <StemDescent heroRef={heroRef} />
          </div>
        </section>
        <section className="relative mx-auto max-w-[1180px]">
          {content.chapters.map((chapter, index) => {
            const line = content.interludes[index];
            return (
              <div key={`${chapter.image}-${index}`}>
                <Chapter chapter={chapter} index={index} />
                {line ? <Interlude text={line} /> : null}
              </div>
            );
          })}
        </section>
        <FinalLetter />
      </main>
      {quality ? <PetalRain count={quality.petals} /> : null}
      {started ? <SoundToggle /> : null}
    </>
  );
}
