"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Copy, ExternalLink, Eye, EyeOff, KeyRound, LoaderCircle, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Created {
  slug: string;
  editToken: string;
}

export function ProfileForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [created, setCreated] = useState<Created | null>(null);
  const [savedIt, setSavedIt] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErrors([]);

    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const body = await res.json();
      if (!res.ok) {
        setErrors(Array.isArray(body.error) ? body.error : [body.error ?? "Something went wrong"]);
        return;
      }
      setCreated({ slug: body.slug, editToken: body.editToken });
    } catch {
      setErrors(["Network error — try again."]);
    } finally {
      setSubmitting(false);
    }
  }

  if (created) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pageUrl = `${origin}/${created.slug}`;
    const profilesUrl = `${origin}/${created.slug}/profiles?token=${created.editToken}`;

    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <Check className="size-4 shrink-0" />
            Your link is <span className="font-medium">/{created.slug}</span>
          </div>
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-sm text-violet-300 hover:underline"
          >
            {pageUrl}
          </a>
        </div>

        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4">
          <div className="flex items-start gap-2">
            <KeyRound className="mt-0.5 size-4 shrink-0 text-amber-400" />
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium text-amber-200">Your edit key (shown once)</p>
              <p className="text-xs leading-relaxed text-zinc-400">
                This is the only way to edit or delete your page, and it can&apos;t be recovered. Save
                it like a password in your password manager.
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-2.5">
            <div className="space-y-1">
              <p className="text-xs text-zinc-500">
                Page URL - use as the &quot;username&quot; of the saved entry
              </p>
              <div className="flex items-center gap-2 rounded-lg bg-zinc-950/70 px-3 py-2.5">
                <input
                  id="cred-url"
                  readOnly
                  value={pageUrl}
                  autoComplete="off"
                  spellCheck={false}
                  className="min-w-0 flex-1 truncate bg-transparent font-mono text-xs text-zinc-300 outline-none"
                />
                <button
                  type="button"
                  onClick={() => copy(pageUrl, () => setCopiedUrl(true))}
                  className="shrink-0 rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-400 transition-all hover:text-zinc-200 active:scale-95"
                >
                  {copiedUrl ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-zinc-500">Edit key - save as the &quot;password&quot;</p>
              <div className="flex items-center gap-2 rounded-lg bg-zinc-950/70 px-3 py-2.5">
                <input
                  id="cred-key"
                  readOnly
                  type={showKey ? "text" : "password"}
                  value={created.editToken}
                  autoComplete="off"
                  spellCheck={false}
                  className="min-w-0 flex-1 bg-transparent font-mono text-xs text-zinc-300 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="shrink-0 rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-400 transition-all hover:text-zinc-200 active:scale-95"
                  aria-label={showKey ? "Hide edit key" : "Show edit key"}
                >
                  {showKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => copy(created.editToken, () => setCopiedKey(true))}
                  className="shrink-0 rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-400 transition-all hover:text-zinc-200 active:scale-95"
                >
                  {copiedKey ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={savedIt}
            onChange={(e) => setSavedIt(e.target.checked)}
            className="size-4 rounded border-zinc-700 accent-emerald-500"
          />
          I saved my edit key
        </label>

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            size="lg"
            disabled={!savedIt}
            onClick={() => router.push(profilesUrl)}
            className="w-full"
          >
            Add my profiles
            <ArrowRight className="size-4" />
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href={pageUrl}>
              <ExternalLink className="size-4" /> View my page
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="username" className="flex items-center gap-1.5 text-[13px]">
          <UserRound className="size-3.5 text-violet-400" />
          <span className="text-zinc-300">Pick a username</span>
        </Label>
        <div className="flex items-center overflow-hidden rounded-lg border border-input bg-zinc-950/60 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          <span className="shrink-0 pl-3 text-sm text-zinc-600">/&nbsp;</span>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="codewithjoe"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            className="h-11 border-0 bg-transparent focus-visible:ring-0"
          />
        </div>
        <p className="text-xs leading-relaxed text-zinc-600">
          Lowercase letters, numbers and dashes. Leave blank and we&apos;ll generate one for you.
        </p>
      </div>

      {errors.length > 0 && (
        <ul className="space-y-1 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-xs text-destructive">
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}

      <Button type="submit" size="lg" disabled={submitting} className="w-full">
        {submitting ? <LoaderCircle className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
        {submitting ? "Claiming…" : "Claim this username"}
      </Button>
      <p className="text-center text-xs text-zinc-600">
        Next you&apos;ll get an edit key to save, then add your profiles.
      </p>
    </form>
  );
}

async function copy(text: string, onDone: () => void) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // clipboard may be unavailable
  }
  onDone();
}