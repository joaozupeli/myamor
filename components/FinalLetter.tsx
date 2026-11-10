"use client";

import { useEffect, useRef } from "react";
import { content } from "@/content/content";
import { gsap } from "@/lib/gsap";
import { getLenis } from "@/lib/smoothScroll";
import { motion, pulseRose } from "@/lib/motion";
import { getStoryPulse, setStoryLevel } from "@/lib/sound";

function heartbeat(time: number) {
  const period = 1.18;
  const x = (time % period) / period;
  const first = Math.exp(-(((x - 0.12) / 0.045) ** 2));
  const second = Math.exp(-(((x - 0.28) / 0.05) ** 2)) * 0.7;
  return first + second;
}

export function FinalLetter() {
  const sectionRef = useRef<HTMLElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let frame = 0;
    const loop = () => {
      const pulse = getStoryPulse();
      const rest = heartbeat(performance.now() / 1000);
      const scale = 1 + Math.max(pulse * 0.34, rest * 0.08);
      if (orbRef.current) orbRef.current.style.transform = `scale(${scale})`;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const lines = section.querySelectorAll("[data-line]");
    const signature = section.querySelector("[data-signature]");
    const ending = section.querySelector("[data-ending]");
    const heart = section.querySelector("[data-heart]");
    const button = buttonRef.current;
    const dim = dimRef.current;

    const pieces = [heart, ...lines, signature, ending, button].filter(Boolean);
    const reveal = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });
    pieces.forEach((piece, index) => {
      reveal.from(piece, {
        y: 22,
        duration: 1.15,
        ease: "power3.out",
        immediateRender: false,
      }, index * 0.28);
    });
    const zone = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 70%",
        end: "bottom 40%",
        onEnter: () => {
          motion.finale = 1;
          setStoryLevel(1);
        },
        onLeave: () => setStoryLevel(0.82),
        onEnterBack: () => {
          motion.finale = 1;
          setStoryLevel(1);
        },
        onLeaveBack: () => {
          motion.finale = 0;
          setStoryLevel(0.82);
        },
      },
    });
    if (dim) {
      zone.fromTo(dim, { opacity: 0 }, { opacity: 0.45, ease: "none", duration: 0.4 }, 0);
    }

    return () => {
      reveal.scrollTrigger?.kill();
      reveal.kill();
      zone.scrollTrigger?.kill();
      zone.kill();
      motion.finale = 0;
    };
  }, []);

  const replay = () => {
    pulseRose();
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { duration: 2.4 });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="relative z-[4] px-5 pt-16 pb-32 sm:px-6 sm:py-[18vh]">
      <div ref={dimRef} className="pointer-events-none fixed inset-0 -z-10 bg-[#050308] opacity-0" />
      <div className="mx-auto flex max-w-[40rem] flex-col items-center text-center">
        <div data-heart className="relative mb-10">
          <svg className="absolute left-1/2 top-[-18%] h-24 w-28 -translate-x-1/2" viewBox="0 0 100 80" aria-hidden="true">
            <path d="M50 78 C 50 48, 18 36, 16 12" fill="none" stroke="#E8C39E" strokeOpacity="0.7" strokeWidth="1.4" />
            <path d="M50 78 C 50 50, 82 36, 84 14" fill="none" stroke="#E8C39E" strokeOpacity="0.7" strokeWidth="1.4" />
            <path d="M50 78 L 50 8" fill="none" stroke="#C8102E" strokeOpacity="0.9" strokeWidth="1.6" />
          </svg>
          <div ref={orbRef} className="h-[min(22vw,120px)] w-[min(22vw,120px)] rounded-full bg-[radial-gradient(circle,rgba(255,246,234,0.95)_0%,rgba(255,208,168,0.85)_10%,#FF3B55_30%,rgba(200,16,46,0.28)_54%,transparent_70%)] shadow-[0_0_40px_rgba(255,59,85,0.45),0_0_120px_rgba(232,195,158,0.22)]" />
        </div>
        <div className="mt-2 max-w-[36rem] space-y-7">
          {content.finalLetter.map((line, index) => (
            <p
              key={line}
              data-line
              className={index === 0
                ? "font-display text-[clamp(1.45rem,3.4vw,2.05rem)] leading-snug font-medium text-balance text-[#E8C39E] italic"
                : "font-display text-[clamp(1.15rem,2.7vw,1.55rem)] leading-[1.55] font-medium text-balance text-[#F3ECE6]"}
            >
              {line}
            </p>
          ))}
        </div>
        <p data-signature className="mt-10 font-script text-[clamp(2.2rem,6vw,3.6rem)] leading-none text-[#E8C39E]">
          {content.signature}
        </p>
        <p data-ending className="mt-5 max-w-[28rem] font-display text-[clamp(1.15rem,3vw,1.6rem)] leading-snug text-balance text-[rgba(243,236,230,0.82)] italic">
          {content.finalLine}
        </p>
        <button ref={buttonRef} type="button" className="ghost-button mt-8" onClick={replay}>
          {content.replayLabel}
        </button>
      </div>
    </section>
  );
}
