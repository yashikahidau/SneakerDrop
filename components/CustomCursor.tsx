"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

type CursorLabel = "VIEW" | "EXPLORE" | "DRAG" | null;

function playCue(context: AudioContext, kind: "hover" | "select") {
  if (context.state === "suspended") {
    void context.resume().then(() => playCue(context, kind)).catch(() => undefined);
    return;
  }
  if (context.state !== "running") return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;
  const startFrequency = kind === "select" ? 920 : 840;
  const endFrequency = kind === "select" ? 560 : 760;
  const peak = kind === "select" ? 0.024 : 0.014;
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(startFrequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + 0.028);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.05);
  oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
}

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { stiffness: 420, damping: 34, mass: 0.35 });
  const springY = useSpring(cursorY, { stiffness: 420, damping: 34, mass: 0.35 });
  const audioContext = useRef<AudioContext | null>(null);
  const soundEnabled = useRef(false);
  const [soundOn, setSoundOn] = useState(false);
  const [visible, setVisible] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [label, setLabel] = useState<CursorLabel>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    const move = (event: MouseEvent) => {
      if (!finePointer.matches) return;
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
      setVisible(true);
    };
    const over = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target;
      const labelTarget = target.closest<HTMLElement>("[data-cursor-label]");
      const visualTarget = target.closest(".sneaker-card, .sneaker-card img, [data-cursor='view']");
      const interactiveTarget = target.closest("a, button, input, [data-cursor='active'], .sneaker-card");
      const requestedLabel = labelTarget?.dataset.cursorLabel?.toUpperCase();
      setLabel(visualTarget ? requestedLabel === "DRAG" ? "DRAG" : requestedLabel === "EXPLORE" ? "EXPLORE" : "VIEW" : null);
      setInteractive(Boolean(interactiveTarget));

      if (target.closest("[data-sound-toggle]")) return;
      const currentControl = target.closest("button, a, [data-audio-cue], .sneaker-card");
      const previousControl = event.relatedTarget instanceof Element ? event.relatedTarget.closest("button, a, [data-audio-cue], .sneaker-card") : null;
      if (currentControl && currentControl !== previousControl && soundEnabled.current && audioContext.current) playCue(audioContext.current, "hover");
    };
    const click = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || event.target.closest("[data-sound-toggle]")) return;
      if (event.target.closest("button, a, [data-audio-cue], .sneaker-card") && soundEnabled.current && audioContext.current) playCue(audioContext.current, "select");
    };
    const leave = () => setVisible(false);

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    window.addEventListener("click", click, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("click", click);
      document.documentElement.removeEventListener("mouseleave", leave);
      if (audioContext.current) void audioContext.current.close();
    };
  }, [cursorX, cursorY]);

  const toggleSound = async () => {
    if (soundOn) {
      soundEnabled.current = false;
      setSoundOn(false);
      try {
        if (audioContext.current?.state === "running") await audioContext.current.suspend();
      } catch {
        // The UI remains off even if the browser cannot suspend its audio context.
      }
      return;
    }

    try {
      const context = audioContext.current ?? new window.AudioContext();
      audioContext.current = context;
      await context.resume();
      if (context.state !== "running") return;
      soundEnabled.current = true;
      setSoundOn(true);
      playCue(context, "select");
    } catch {
      soundEnabled.current = false;
      setSoundOn(false);
    }
  };

  const expanded = label !== null;

  return (
    <>
      <motion.div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[115] hidden h-[6px] w-[6px] rounded-full bg-[#F0D98C] md:block" style={{ x: cursorX, y: cursorY, translateX: "-50%", translateY: "-50%" }} animate={{ opacity: visible && !expanded ? 1 : 0, scale: interactive ? 0.7 : 1 }} transition={{ duration: 0.15 }} />
      <motion.div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[114] hidden items-center justify-center overflow-hidden rounded-full border border-[#F0D98C]/70 bg-[#09090b]/75 text-[9px] font-bold uppercase tracking-[.2em] text-[#F0D98C] shadow-[0_0_28px_rgba(240,217,140,.16)] backdrop-blur-xl md:flex" style={{ x: springX, y: springY, translateX: "-50%", translateY: "-50%", mixBlendMode: expanded ? "normal" : interactive ? "difference" : "normal" }} animate={{ width: expanded ? 84 : interactive ? 58 : 36, height: expanded ? 36 : interactive ? 58 : 36, opacity: visible ? 1 : 0, backgroundColor: expanded ? "rgba(9,9,11,.78)" : interactive ? "rgba(240,217,140,.12)" : "rgba(240,217,140,0)", scale: visible ? 1 : 0.75 }} transition={{ type: "spring", stiffness: 300, damping: 26, mass: 0.5 }}>
        <motion.span animate={{ opacity: expanded ? 1 : 0, scale: expanded ? 1 : 0.75 }} transition={{ duration: 0.16, delay: expanded ? 0.05 : 0 }} className="select-none">{label}</motion.span>
      </motion.div>

      <button type="button" data-sound-toggle aria-label={`Turn sound ${soundOn ? "off" : "on"}`} aria-pressed={soundOn} onClick={() => void toggleSound()} className="fixed bottom-4 right-4 z-[90] inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-[#101012]/80 px-4 text-[9px] font-semibold uppercase tracking-[.18em] text-white/55 shadow-[0_8px_30px_rgba(0,0,0,.3)] backdrop-blur-xl transition-colors hover:border-[#F0D98C]/40 hover:text-[#F0D98C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F0D98C] active:scale-95 sm:bottom-6 sm:right-6">
        {soundOn ? <Volume2 size={14} aria-hidden="true" /> : <VolumeX size={14} aria-hidden="true" />}Sound: {soundOn ? "On" : "Off"}
      </button>
    </>
  );
}
