"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const MODE_KEY = "cp-mode";

const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function readMode(): "light" | "dark" {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(MODE_KEY);
  } catch {
    // storage unavailable
  }
  return stored === "dark" ? "dark" : "light";
}

function getSnapshot(): "light" | "dark" {
  return readMode();
}

function getServerSnapshot(): "light" | "dark" {
  return "light";
}

export function ModeToggle() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const dark = mode === "dark";

  useEffect(() => {
    document.documentElement.dataset.mode = readMode();
  }, []);

  function toggle() {
    const next = dark ? "light" : "dark";
    const el = document.documentElement;
    el.classList.add("cp-no-anim");
    el.dataset.mode = next;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => el.classList.remove("cp-no-anim"));
    });
    try {
      localStorage.setItem(MODE_KEY, next);
    } catch {
      // storage unavailable
    }
    listeners.forEach((l) => l());
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="cp-pill inline-flex size-8 items-center justify-center rounded-full text-zinc-300 transition-all hover:bg-zinc-800/60 hover:-translate-y-px active:scale-95"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}