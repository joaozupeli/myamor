"use client";

import { useEffect, useState } from "react";
import { content } from "@/content/content";
import { subscribeSound, toggleStorySound } from "@/lib/sound";

export function SoundToggle() {
  const [muted, setMuted] = useState(false);

  useEffect(() => subscribeSound(setMuted), []);

  return (
    <button
      type="button"
      className="sound-toggle fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-[48] flex h-12 w-12 items-end justify-center gap-[3px] pb-3"
      aria-pressed={!muted}
      aria-label={muted ? content.soundOffLabel : content.soundOnLabel}
      onClick={() => setMuted(toggleStorySound())}
    >
      {[0, 1, 2, 3].map((index) => (
        <span
          key={index}
          className={muted ? "sound-bar is-quiet" : "sound-bar"}
          style={{ animationDelay: `${index * 0.12}s` }}
        />
      ))}
    </button>
  );
}
