"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import { gsap } from "@/lib/gsap";

export function StemDescent({ heroRef }: { heroRef: RefObject<HTMLElement | null> }) {
  const groupRef = useRef<SVGGElement>(null);

  useLayoutEffect(() => {
    const group = groupRef.current;
    const hero = heroRef.current;
    if (!group || !hero) return;
    const paths = Array.from(group.querySelectorAll("path"));
    paths.forEach((path) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
    });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
    });
    paths.forEach((path) => {
      timeline.fromTo(path, { strokeDashoffset: path.getTotalLength() }, {
        strokeDashoffset: 0,
        ease: "none",
        duration: 0.62,
      }, 0.28);
    });

    return () => {
      timeline.scrollTrigger?.kill();
      timeline.kill();
    };
  }, [heroRef]);

  return (
    <svg className="pointer-events-none absolute inset-0 z-[3] h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="stem-line" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF3B55" />
          <stop offset="55%" stopColor="#C8102E" />
          <stop offset="100%" stopColor="#E8C39E" />
        </linearGradient>
      </defs>
      <g ref={groupRef}>
        <path d="M50 57 C 50.6 72, 49.2 86, 50 100" fill="none" stroke="#C8102E" strokeWidth="5" strokeOpacity="0.28" vectorEffect="non-scaling-stroke" />
        <path d="M50 57 C 50.6 72, 49.2 86, 50 100" fill="none" stroke="url(#stem-line)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}
