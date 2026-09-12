"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  ExternalLink,
  KeyRound,
  Link2,
  LoaderCircle,
  Plus,
  Trash2,
  AtSign,
  Palette,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PLATFORM_ICONS } from "@/lib/platform-icons";
import { PLATFORM_CATEGORIES, PLATFORM_META } from "@/lib/providers/types";
import type { HandleKey } from "@/lib/validate";
import { HANDLE_KEYS } from "@/lib/validate";
import type { Handles } from "@/lib/providers";
import { SOCIAL_KEYS, SOCIAL_META, type Socials, type ProfileButton } from "@/lib/socials";
import { parseTheme, THEMES, type ThemeKey } from "@/lib/themes";

interface Props {
  slug: string;
  initialToken: string;
  initialHandles: Handles;
  initialSocials: Socials;
  initialTheme?: ThemeKey;
  initialButtons?: ProfileButton[];
  onThemeChange?: (theme: ThemeKey) => void;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function ProfilesPanel({
  slug,
  initialToken,
  initialHandles,
  initialSocials,
  initialTheme,
  initialButtons,
  onThemeChange,
}: Props) {
  const router = useRouter();
  const storageKey = useMemo(() => `cp-edit:${slug}`, [slug]);

  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") return initialToken;
    if (initialToken) return initialToken;
    try {
      return window.localStorage.getItem(storageKey) ?? "";
    } catch {
      return "";
    }
  });
  const [usesStoredToken, setUsesStoredToken] = useState(() => {
    if (typeof window === "undefined") return false;
    if (initialToken) return false;
    try {
      return !!window.localStorage.getItem(storageKey);
    } catch {
      return false;
    }
  });
  const [values, setValues] = useState<Record<HandleKey, string>>(initialHandles);
  const [socials, setSocials] = useState<Socials>(initialSocials);
  const [theme, setTheme] = useState<ThemeKey>(parseTheme(initialTheme));
  const [buttons, setButtons] = useState<ProfileButton[]>(initialButtons?.length ? initialButtons : [{ label: "", url: "" }]);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef("");

  const payload = useMemo(
    () => JSON.stringify({ ...values, socials, theme, buttons }),
    [values, socials, theme, buttons]
  );

  const effectiveToken = token || initialToken;

  const applyTheme = useCallback(
    (next: ThemeKey) => {
      if (next === theme) return;
      setTheme(next);
      onThemeChange?.(next);
    },
    [theme, onThemeChange]
  );

  const doSave = useCallback(
    async (manual: boolean): Promise<boolean> => {
      if (!effectiveToken) return false;
      const snapshot = payload;
      try {
        setSaveState("saving");
        const res = await fetch(`/api/profiles/${slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: effectiveToken, ...values, socials, theme, buttons }),
        });
        const body = await res.json();
        if (!res.ok) {
          setSaveState("error");
          setMessage({
            ok: false,
            text: body.error
              ? Array.isArray(body.error)
                ? body.error.join(" · ")
                : body.error
              : "Could not save.",
          });
          return false;
        }
        lastSaved.current = snapshot;
        if (body.socials) setSocials((s) => ({ ...s, ...body.socials }));
        if (body.theme && body.theme !== theme) applyTheme(parseTheme(body.theme));
        if (body.buttons) setButtons(body.buttons);
        setSaveState("saved");
        setMessage({ ok: true, text: manual ? "Saved — your public page is updated." : "Saved automatically." });
        return true;
      } catch {
        setSaveState("error");
        setMessage({ ok: false, text: "Network error — try again." });
        return false;
      }
    },
    [effectiveToken, payload, slug, values, socials, theme, buttons, applyTheme]
  );

  useEffect(() => {
    if (!payload || lastSaved.current === payload) return;
    if (!effectiveToken) return;
    const t = setTimeout(() => {
      void doSave(false);
    }, 900);
    saveTimer.current = t;
    return () => clearTimeout(t);
  }, [payload, effectiveToken, doSave]);

  const anyHandle =
    HANDLE_KEYS.some((k) => values[k].trim().length > 0) ||
    SOCIAL_KEYS.some((k) => socials[k].trim().length > 0) ||
    buttons.some((b) => b.label.trim().length > 0);

  function updateToken(v: string) {
    setToken(v);
    if (v) {
      setUsesStoredToken(false);
      try {
        window.localStorage.setItem(storageKey, v);
      } catch {
        /* ignore */
      }
    }
  }

  function setButton(i: number, patch: Partial<ProfileButton>) {
    setButtons((prev) => prev.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  }

  function addButton() {
    setButtons((prev) => [...prev, { label: "", url: "" }]);
  }

  function removeButton(i: number) {
    setButtons((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function onDelete() {
    if (!token) return;
    if (!window.confirm("Delete this showcase page permanently?")) return;
    setDeleting(true);
    const res = await fetch(`/api/profiles/${slug}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (res.ok) {
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        /* ignore */
      }
      router.replace("/");
    } else {
      setDeleting(false);
      setMessage({ ok: false, text: "Invalid key — deletion failed." });
    }
  }

  const saveStateClass =
    saveState === "saving"
      ? "text-amber-400"
      : saveState === "saved"
        ? "text-emerald-400"
        : saveState === "error"
          ? "text-red-400"
          : "text-zinc-600";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void doSave(true);
      }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between gap-2 px-1">
        <p className="text-xs text-zinc-600">Auto-saves while you type.</p>
        <SaveStatus state={saveState} className={saveStateClass} />
      </div>

      <div className="cp-card p-5">
        <Label htmlFor="edit-token" className="flex items-center gap-1.5 text-[13px] text-zinc-300">
          <KeyRound className="size-3.5 text-amber-400" />
          Edit key
          {token && (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
              <Check className="mr-0.5 inline size-2.5" />
              {usesStoredToken ? "remembered on this device" : "loaded"}
            </span>
          )}
        </Label>
        <Input
          id="edit-token"
          value={token}
          onChange={(e) => updateToken(e.target.value)}
          placeholder="Paste your edit key"
          autoComplete="off"
          spellCheck={false}
          className="mt-2 h-10 rounded-lg bg-zinc-950/60 font-mono"
        />
        {!token && (
          <p className="mt-1.5 text-xs text-zinc-600">
            Paste the edit key you saved during sign-up — it&apos;s the only way to edit this page.
          </p>
        )}
      </div>

      <section aria-label="Theme">
        <div className="mb-3">
            <h2 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
              <Palette className="size-3.5 text-zinc-500" />
              Theme
            </h2>
          </div>
        <div className="grid grid-cols-1 gap-3 cp-card p-4 sm:grid-cols-2">
          {THEMES.map((t) => {
            const active = theme === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => applyTheme(t.key)}
                aria-pressed={active}
                className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all active:scale-[0.99] ${
                  active
                    ? "border-violet-500/60 bg-violet-500/10"
                    : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
                }`}
              >
                <ThemePreview theme={t.key} />
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-sm text-zinc-200">
                    {t.label}
                    {active && <Check className="size-3.5 text-violet-400" />}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-zinc-500">
                    {t.blurb}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-label="Socials">
        <div className="mb-3">
            <h2 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
              <AtSign className="size-3.5 text-zinc-500" />
              Socials
            </h2>
          </div>
        <div className="grid grid-cols-1 gap-3 cp-card p-4 sm:grid-cols-2">
          {SOCIAL_KEYS.map((key) => {
            const meta = SOCIAL_META[key];
            return (
              <div key={key} className="space-y-1">
                <Label htmlFor={`social-${key}`} className="text-[13px] text-zinc-300">
                  {meta.label}
                </Label>
                <input
                  id={`social-${key}`}
                  type="text"
                  value={socials[key]}
                  onChange={(e) => setSocials((s) => ({ ...s, [key]: e.target.value }))}
                  placeholder={meta.domain}
                  autoComplete="off"
                  spellCheck={false}
                  className="h-10 w-full rounded-lg border border-input bg-zinc-950/60 px-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
            );
          })}
        </div>
      </section>

      <section aria-label="Custom buttons">
        <div className="mb-3">
            <h2 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
              <Link2 className="size-3.5 text-zinc-500" />
              Custom buttons
            </h2>
          </div>
        <div className="space-y-3 cp-card p-4">
          {buttons.map((b, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_2fr_auto]">
              <input
                type="text"
                value={b.label}
                onChange={(e) => setButton(i, { label: e.target.value })}
                placeholder="Label (e.g. Portfolio)"
                autoComplete="off"
                spellCheck={false}
                className="h-10 w-full rounded-lg border border-input bg-zinc-950/60 px-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <input
                type="text"
                value={b.url}
                onChange={(e) => setButton(i, { url: e.target.value })}
                placeholder="https://…"
                autoComplete="off"
                spellCheck={false}
                className="h-10 w-full rounded-lg border border-input bg-zinc-950/60 px-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeButton(i)}
                aria-label={`Remove ${b.label || "button"}`}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addButton} className="w-full">
            <Plus className="size-4" /> Add button
          </Button>
        </div>
      </section>

      {PLATFORM_CATEGORIES.map((cat) => {
        return (
          <section key={cat.id} aria-label={cat.label}>
            <div className="mb-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                {cat.label}
              </h2>
            </div>
            <div className="space-y-3 cp-card p-4">
              {cat.keys.map((key) => {
                const meta = PLATFORM_META[key];
                const Icon = PLATFORM_ICONS[key];
                return (
                  <div key={key} className="space-y-1">
                    <Label htmlFor={`${cat.id}-${key}`} className="flex items-center gap-1.5 text-[13px]">
                      <Icon className="size-4 shrink-0" style={{ color: meta.accent }} />
                      <span className="text-zinc-300">{meta.label}</span>
                    </Label>
                    <input
                      id={`${cat.id}-${key}`}
                      type="text"
                      value={values[key]}
                      onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                      placeholder={meta.domain}
                      autoComplete="off"
                      spellCheck={false}
                      className="h-10 w-full rounded-lg border border-input bg-zinc-950/60 px-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {message && !message.ok && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          {message.text}
        </p>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => void doSave(true)}
          disabled={!token || !anyHandle || saveState === "saving"}
          className="flex-1"
        >
          {saveState === "saving" ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save now
        </Button>
        <Button type="button" variant="destructive" onClick={onDelete} disabled={deleting}>
          {deleting ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
        </Button>
      </div>

      <Button asChild variant="outline" className="w-full">
        <Link href={`/${slug}`}>
          <ExternalLink className="size-4" /> View my public page
        </Link>
      </Button>
    </form>
  );
}

function SaveStatus({ state, className }: { state: SaveState; className: string }) {
  if (state === "idle") return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/40 px-2.5 py-1 text-[11px] font-medium ${className}`}
    >
      {state === "saving" && <LoaderCircle className="size-3 animate-spin" />}
      {state === "saved" && <Check className="size-3" />}
      {state === "saving" ? "Saving…" : state === "saved" ? "Saved" : "Save failed"}
    </span>
  );
}

const PREVIEWS: Record<ThemeKey, { box: string; dot: string }> = {
  default: {
    box: "rounded-md bg-[#fffbea] border-2 border-[#111111] shadow-[4px_4px_0_0_#111111]",
    dot: "bg-[#ffd54d]",
  },
  glass: { box: "rounded-xl bg-white/10 border-white/20 backdrop-blur-[10px]", dot: "bg-cyan-300" },
  "3d": {
    box: "rounded-xl bg-[#dfe4ec] border-[#dfe4ec] shadow-[6px_6px_12px_-6px_rgba(148,162,187,0.6),-6px_-6px_12px_-6px_rgba(255,255,255,0.95)]",
    dot: "bg-[#7e8aa0]",
  },
  code: { box: "rounded-none bg-white border-2 border-black", dot: "bg-black" },
};

function ThemePreview({ theme }: { theme: ThemeKey }) {
  const p = PREVIEWS[theme];
  return (
    <span className={`grid size-10 shrink-0 place-items-center border p-2 ${p.box}`}>
      <span className={`size-2 rounded-full ${p.dot}`} />
    </span>
  );
}