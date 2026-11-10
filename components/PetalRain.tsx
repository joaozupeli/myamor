"use client";

import { useEffect, useRef } from "react";
import { motion } from "@/lib/motion";

type Petal = {
  x: number;
  y: number;
  z: number;
  vy: number;
  vx: number;
  rot: number;
  spin: number;
  size: number;
  phase: number;
};

function makePetal() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  if (!context) return canvas;
  context.translate(32, 32);
  context.beginPath();
  context.moveTo(0, -22);
  context.bezierCurveTo(16, -10, 14, 12, 0, 22);
  context.bezierCurveTo(-14, 12, -16, -10, 0, -22);
  const gradient = context.createLinearGradient(0, -22, 0, 22);
  gradient.addColorStop(0, "#FF8A98");
  gradient.addColorStop(0.45, "#C8102E");
  gradient.addColorStop(1, "#5A0F1F");
  context.fillStyle = gradient;
  context.fill();
  return canvas;
}

export function PetalRain({ count }: { count: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const sprite = makePetal();
    let width = 0;
    let height = 0;
    let dpr = 1;

    const make = (above: boolean): Petal => ({
      x: Math.random() * width,
      y: above ? -40 - Math.random() * height : Math.random() * height,
      z: Math.random(),
      vy: 28 + Math.random() * 55,
      vx: (Math.random() - 0.5) * 18,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 1.4,
      size: 12 + Math.random() * 22,
      phase: Math.random() * Math.PI * 2,
    });

    const petals: Petal[] = [];
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      if (petals.length === 0) {
        for (let index = 0; index < count; index += 1) petals.push(make(true));
      }
    };
    resize();

    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const delta = Math.min(0.033, (now - last) / 1000);
      last = now;
      frame = requestAnimationFrame(loop);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      if (motion.finale < 0.62 || document.hidden) return;

      const amount = Math.min(1, (motion.finale - 0.62) / 0.28);
      for (const petal of petals) {
        petal.y += petal.vy * (0.45 + petal.z) * delta;
        petal.x += (petal.vx + Math.sin(petal.y * 0.01 + petal.phase) * 14) * delta;
        petal.rot += petal.spin * delta;
        if (petal.y > height + 40) {
          petal.y = -30;
          petal.x = Math.random() * width;
        }
        const size = petal.size * (0.55 + petal.z * 0.8);
        context.save();
        context.translate(petal.x, petal.y);
        context.rotate(petal.rot);
        context.globalAlpha = amount * (0.35 + petal.z * 0.55);
        context.drawImage(sprite, -size / 2, -size / 2, size, size * 1.35);
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

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[30]" aria-hidden="true" />;
}
