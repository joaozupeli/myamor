"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { ChapterContent } from "@/content/content";
import { gsap } from "@/lib/gsap";
import { imageBlur } from "@/lib/imageBlur";
import { readPhotoColor } from "@/lib/photoColor";
import { DownRoot } from "@/components/RootPath";
import { splitWords } from "@/lib/splitText";

export function Chapter({ chapter, index }: { chapter: ChapterContent; index: number }) {
  const rootRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
  const [broken, setBroken] = useState(false);
  const [open, setOpen] = useState(false);
  const [glow, setGlow] = useState("#6a2434");
  const side = index % 2 === 0 ? "left" : "right";
  const blur = imageBlur[chapter.image];

  useEffect(() => {
    let alive = true;
    void readPhotoColor(chapter.image).then((color) => {
      if (alive) setGlow(color);
    });
    return () => {
      alive = false;
    };
  }, [chapter.image]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const text = textRef.current;
    const card = cardRef.current;
    if (!root || !text || !card) return;

    const date = root.querySelector("[data-date]");
    const title = root.querySelector("[data-title]");
    const split = splitWords(text);

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
    if (date) timeline.from(date, { y: 12, duration: 0.6, immediateRender: false }, 0);
    if (title) timeline.from(title, { y: 18, duration: 0.7, immediateRender: false }, 0.05);
    timeline.from(split.words, { y: 10, stagger: 0.012, duration: 0.5, immediateRender: false }, 0.12);

    return () => {
      timeline.scrollTrigger?.kill();
      timeline.kill();
      split.restore();
    };
  }, [chapter.text]);

  const lean = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty("--tilt-y", `${(x * 14).toFixed(2)}deg`);
    event.currentTarget.style.setProperty("--tilt-x", `${(-y * 10).toFixed(2)}deg`);
  };

  const rest = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.style.setProperty("--tilt-x", "0deg");
    event.currentTarget.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <article ref={rootRef} className="memory relative">
      <DownRoot />
      <div className="grid min-w-0 items-center gap-8 py-10 pr-4 pl-11 md:min-h-[100svh] md:grid-cols-[minmax(0,1fr)_6rem_minmax(0,1fr)] md:gap-6 md:px-8 md:py-[10vh]">
      <div className={`copy relative z-[1] min-w-0 order-2 md:order-none md:row-start-1 ${side === "left" ? "md:col-start-3" : "md:col-start-1"}`}>
        {chapter.date ? (
          <p data-date className="font-sans text-[0.72rem] tracking-[0.28em] text-[#E8C39E] uppercase sm:tracking-[0.38em]">
            {chapter.date}
          </p>
        ) : null}
        <h2 data-title className="mt-4 max-w-full font-display text-[clamp(2.15rem,10vw,5.3rem)] leading-[0.92] font-medium tracking-[-0.04em] text-balance text-[#F3ECE6] md:max-w-[14ch]">
          {chapter.title}
        </h2>
        <p
          ref={textRef}
          className="mt-6 max-w-[38rem] font-sans text-[1rem] leading-[1.7] font-light text-[rgba(243,236,230,0.78)] sm:text-[1.05rem] sm:leading-[1.8] lg:text-[1.12rem]"
        >
          {chapter.text}
        </p>
      </div>
      <button
        ref={cardRef}
        type="button"
        className={`photo memory-card relative z-[1] order-1 w-full min-w-0 max-w-full md:order-none md:row-start-1 ${side === "left" ? "md:col-start-1" : "md:col-start-3"} ${open ? "is-open" : ""}`}
        style={{ "--glow": glow } as CSSProperties}
        aria-pressed={open}
        aria-label={open ? "Voltar para a foto" : "Virar a foto e ler o verso"}
        onClick={() => setOpen((current) => !current)}
        onPointerMove={lean}
        onPointerLeave={rest}
      >
        <span className="memory-halo" style={{ background: glow }} />
        <span className="memory-tilt">
          <span className="memory-face">
            {broken ? (
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#5A0F1F,#14070C_58%,#07060A)]" />
            ) : (
              <Image
                src={chapter.image}
                alt={chapter.caption ?? chapter.title}
                fill
                sizes="(min-width: 900px) 42vw, 88vw"
                className="object-cover"
                onError={() => setBroken(true)}
                {...(blur ? { placeholder: "blur" as const, blurDataURL: blur } : {})}
              />
            )}
            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pt-12 pb-4 text-center font-sans text-[0.68rem] tracking-[0.28em] text-[#F3ECE6] uppercase">
              toque para virar
            </span>
          </span>
          <span className="memory-face memory-back" style={{ background: `linear-gradient(165deg, color-mix(in srgb, ${glow} 55%, #14070c), #07060a 72%)` }}>
            <span className="max-w-[16rem] font-display text-[clamp(1.25rem,3.2vw,1.7rem)] leading-snug text-balance text-[#F3ECE6]">
              {chapter.caption ?? chapter.title}
            </span>
            <span className="mt-6 font-sans text-[0.68rem] tracking-[0.28em] text-[rgba(243,236,230,0.7)] uppercase">
              toque para voltar
            </span>
          </span>
        </span>
      </button>
      </div>
    </article>
  );
}

export function Interlude({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const block = ref.current;
    if (!block) return;
    const line = block.querySelector("[data-phrase]");
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: block,
        start: "top 86%",
        end: "top 10%",
        scrub: true,
      },
    });
    if (line) {
      timeline.fromTo(line, { opacity: 0, y: 28 }, { opacity: 1, y: 0, ease: "none", duration: 0.35 }, 0.15);
      timeline.to(line, { opacity: 0, y: -20, ease: "none", duration: 0.3 }, 0.7);
    }
    return () => {
      timeline.scrollTrigger?.kill();
      timeline.kill();
    };
  }, [text]);

  return (
    <div ref={ref} className="relative px-5 py-16 text-center sm:py-[14vh]">
      <p data-phrase className="mx-auto max-w-[92vw] font-display text-[clamp(2.15rem,9vw,7.5rem)] leading-[0.95] font-medium tracking-[-0.045em] text-balance text-[#F3ECE6] italic opacity-0">
        {text}
      </p>
    </div>
  );
}
