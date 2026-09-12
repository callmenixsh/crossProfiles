export default function ProfileLoading() {
  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center gap-4">
      <div className="cp-loader size-10 animate-spin rounded-full border-2 border-current border-t-transparent bg-transparent" />
      <p className="text-sm text-foreground/60">Loading profile…</p>
    </div>
  );
}