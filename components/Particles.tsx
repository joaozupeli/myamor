"use client";

import { useEffect, useRef } from "react";
import { motion } from "@/lib/motion";

type Speck = {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  drift: number;
  alpha: number;
  kind: "dust" | "petal" | "ember";
  rot: number;
  spin: number;
};

function makeGlow(color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext("2d");
  if (!context) return canvas;
  const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "transparent");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 32, 32);
  return canvas;
}

function makePetal() {
  const canvas = document.createElement("canvas");
  canvas.width = 48;
  canvas.height = 48;
  const context = canvas.getContext("2d");
  if (!context) return canvas;
  context.translate(24, 24);
  context.beginPath();
  context.moveTo(0, -15);
  context.bezierCurveTo(12, -8, 11, 8, 0, 16);
  context.bezierCurveTo(-11, 8, -12, -8, 0, -15);
  const gradient = context.createLinearGradient(0, -15, 0, 16);
  gradient.addColorStop(0, "rgba(255,59,85,0.9)");
  gradient.addColorStop(1, "rgba(90,15,31,0.05)");
  context.fillStyle = gradient;
  context.fill();
  return canvas;
}

export function Particles({ count }: { count: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const dust = makeGlow("rgba(232,195,158,0.95)");
    const ember = makeGlow("rgba(200,16,46,0.9)");
    const petal = makePetal();
    let width = 0;
    let height = 0;
    let dpr = 1;

    const spawn = (anywhere: boolean): Speck => {
      const roll = Math.random();
      const kind = roll > 0.78 ? "petal" : roll > 0.5 ? "ember" : "dust";
      return {
        x: Math.random() * width,
        y: anywhere ? Math.random() * height : height + 20,
        z: Math.random(),
        size: kind === "petal" ? 10 + Math.random() * 14 : 2 + Math.random() * 5,
        speed: 8 + Math.random() * 18,
        drift: (Math.random() - 0.5) * 10,
        alpha: kind === "dust" ? 0.25 + Math.random() * 0.45 : 0.35 + Math.random() * 0.4,
        kind,
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.6,
      };
    };

    const specks: Speck[] = [];
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      if (specks.length === 0) {
        for (let index = 0; index < count; index += 1) specks.push(spawn(true));
      }
    };
    resize();

    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const delta = Math.min(0.033, (now - last) / 1000);
      last = now;
      frame = requestAnimationFrame(loop);
      if (document.hidden) return;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      const boost = 1 + Math.min(Math.abs(motion.velocity) * 0.015, 1.4);
      const calm = motion.finale > 0.6 ? 0.22 : 1;
      const soil = motion.progress > 0.2 ? 1 : 0.4;

      for (const speck of specks) {
        speck.y -= speck.speed * boost * calm * delta;
        speck.x += speck.drift * delta;
        speck.rot += speck.spin * delta;
        if (speck.y < -30) {
          speck.y = height + 16;
          speck.x = Math.random() * width;
        }
        const depth = speck.z + 1;
        const x = speck.x + motion.tiltY * 16 * depth;
        const y = speck.y + motion.tiltX * 12 * depth;
        const sprite = speck.kind === "petal" ? petal : speck.kind === "ember" ? ember : dust;
        context.save();
        context.translate(x, y);
        context.rotate(speck.rot);
        context.globalAlpha = speck.alpha * calm * (speck.kind === "ember" ? soil : 1);
        context.drawImage(sprite, -speck.size / 2, -speck.size / 2, speck.size, speck.size * (speck.kind === "petal" ? 1.3 : 1));
        context.restore();
      }
    };
    frame = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[1]" aria-hidden="true" />;
}
