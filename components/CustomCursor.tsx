"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const dotX = useMotionValue(-100), dotY = useMotionValue(-100);
  const ringX = useMotionValue(-100), ringY = useMotionValue(-100);
  const ringXS = useSpring(ringX, { stiffness: 260, damping: 24, mass: 0.4 });
  const ringYS = useSpring(ringY, { stiffness: 260, damping: 24, mass: 0.4 });
  const [hovering, setHovering] = useState(false); const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const move = (event: MouseEvent) => { dotX.set(event.clientX); dotY.set(event.clientY); ringX.set(event.clientX); ringY.set(event.clientY); setVisible(true); };
    const leave = () => setVisible(false);
    const over = (event: MouseEvent) => { const target = event.target as HTMLElement; setHovering(Boolean(target.closest("a, button, input, [data-cursor='active'], .sneaker-card"))); };
    window.addEventListener("mousemove", move); window.addEventListener("mouseover", over); document.documentElement.addEventListener("mouseleave", leave);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseover", over); document.documentElement.removeEventListener("mouseleave", leave); };
  }, [dotX,dotY,ringX,ringY]);
  return <><motion.div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-[6px] w-[6px] rounded-full bg-[#F0D98C] md:block" style={{ x:dotX,y:dotY,translateX:"-50%",translateY:"-50%" }} animate={{opacity:visible?1:0}} /><motion.div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[99] hidden rounded-full border border-[#F0D98C]/70 md:block" style={{x:ringXS,y:ringYS,translateX:"-50%",translateY:"-50%",mixBlendMode:hovering?"difference":"normal"}} animate={{width:hovering?72:38,height:hovering?72:38,opacity:visible?1:0,backgroundColor:hovering?"rgba(240,217,140,.14)":"rgba(240,217,140,0)",boxShadow:hovering?"0 0 38px rgba(240,217,140,.28)":"0 0 18px rgba(240,217,140,.08)"}} /></>;
}
