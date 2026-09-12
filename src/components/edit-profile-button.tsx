"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, LoaderCircle, PenLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function EditProfileButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function openEditor() {
    try {
      const stored = window.localStorage.getItem(`cp-edit:${slug}`);
      if (stored) {
        const url = `/${slug}/profiles?token=${encodeURIComponent(stored)}`;
        router.push(url);
        return;
      }
    } catch {
      /* ignore */
    }
    setKey("");
    setError(null);
    setOpen(true);
    queueMicrotask(() => inputRef.current?.focus());
  }

  async function submit() {
    const k = key.trim();
    if (!k) {
      setError("Enter your edit key.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/profiles/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, token: k }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        setError(body.error || "Invalid edit key.");
        setBusy(false);
        return;
      }
      try {
        window.localStorage.setItem(`cp-edit:${slug}`, k);
      } catch {
        /* ignore */
      }
      const url = `/${slug}/profiles?token=${encodeURIComponent(k)}`;
      router.push(url);
    } catch {
      setError("Network error — try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={openEditor}
        className="gap-1.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-800/60 hover:text-zinc-200"
      >
        <PenLine className="size-3" />
        Edit profiles
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-1.5 text-sm font-semibold text-zinc-100">
                  <KeyRound className="size-4 text-amber-400" />
                  Enter your edit key
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  The key you saved when you created <span className="font-mono text-zinc-300">/{slug}</span>.
                  It&apos;s saved on this device so you won&apos;t be asked again.
                </p>
              </div>
              {!busy && (
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1 text-zinc-500 transition-all hover:bg-zinc-800 hover:text-zinc-200 active:scale-90"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {error && (
              <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {error}
              </p>
            )}

            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              <Input
                ref={inputRef}
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  setError(null);
                }}
                placeholder="Paste your edit key"
                autoComplete="off"
                spellCheck={false}
                className="h-10 rounded-lg bg-zinc-950/60 font-mono focus-visible:ring-amber-400/40"
              />
              <Button type="submit" disabled={busy} className="w-full">
                {busy ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                {busy ? "Checking…" : "Open editor"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}