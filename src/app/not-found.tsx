import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-5 py-24 text-center">
      <p className="text-5xl">404</p>
      <h1 className="text-lg font-medium text-zinc-100">No showcase here</h1>
      <p className="text-sm text-zinc-500">
        That link doesn&apos;t match any saved profile. Double-check the URL or create your own page.
      </p>
      <Button asChild>
        <Link href="/">Create a showcase page</Link>
      </Button>
    </div>
  );
}