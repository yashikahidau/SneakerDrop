"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface Props {
  children: ReactNode;
  onClose?: () => void;
}

let activeLocks = 0;
let previousDocumentState: {
  htmlOverflow: string;
  htmlPointerEvents: string;
  bodyOverflow: string;
  bodyPointerEvents: string;
  htmlHadLockClass: boolean;
  bodyHadLockClass: boolean;
} | null = null;

function lockDocument() {
  if (activeLocks === 0) {
    const html = document.documentElement;
    const body = document.body;
    previousDocumentState = {
      htmlOverflow: html.style.overflow,
      htmlPointerEvents: html.style.pointerEvents,
      bodyOverflow: body.style.overflow,
      bodyPointerEvents: body.style.pointerEvents,
      htmlHadLockClass: html.classList.contains("modal-open"),
      bodyHadLockClass: body.classList.contains("modal-open"),
    };
    html.classList.add("modal-open");
    body.classList.add("modal-open");
    html.style.overflow = "hidden";
    html.style.pointerEvents = "none";
    body.style.overflow = "hidden";
    body.style.pointerEvents = "none";
  }
  activeLocks += 1;
}

function unlockDocument() {
  activeLocks = Math.max(0, activeLocks - 1);
  if (activeLocks !== 0 || !previousDocumentState) return;

  const html = document.documentElement;
  const body = document.body;
  const previous = previousDocumentState;
  html.style.overflow = previous.htmlOverflow;
  html.style.pointerEvents = previous.htmlPointerEvents;
  body.style.overflow = previous.bodyOverflow;
  body.style.pointerEvents = previous.bodyPointerEvents;
  if (!previous.htmlHadLockClass) html.classList.remove("modal-open");
  if (!previous.bodyHadLockClass) body.classList.remove("modal-open");
  previousDocumentState = null;
}

export default function ModalPortal({ children, onClose }: Props) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const root = document.createElement("div");
    root.dataset.modalLayer = "";
    document.body.appendChild(root);
    lockDocument();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current?.();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = root.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    let focusFrame = 0;
    const mountFrame = window.requestAnimationFrame(() => {
      setPortalRoot(root);
      focusFrame = window.requestAnimationFrame(() => {
        root.querySelector<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')?.focus({ preventScroll: true });
      });
    });

    return () => {
      window.cancelAnimationFrame(mountFrame);
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      root.remove();
      unlockDocument();
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  return portalRoot ? createPortal(children, portalRoot) : null;
}
