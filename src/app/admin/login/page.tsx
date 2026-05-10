import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/admin";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ next?: string; error?: string }>;
}

async function login(formData: FormData) {
  "use server";
  const passphrase = String(formData.get("passphrase") ?? "");
  const next = String(formData.get("next") ?? "/scans");
  const expected = process.env.ADMIN_PASSPHRASE;

  if (!expected || passphrase !== expected) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const c = await cookies();
  c.set(ADMIN_COOKIE, passphrase, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect(next);
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const { next = "/scans", error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6">
      <form
        action={login}
        className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-8"
      >
        <h1 className="text-xl font-semibold text-white">Admin login</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Internal access for promote-to-strategy.
        </p>
        <input type="hidden" name="next" value={next} />
        <label className="mt-6 block text-xs uppercase tracking-wider text-zinc-500">
          Passphrase
        </label>
        <input
          name="passphrase"
          type="password"
          autoFocus
          required
          className="mt-2 w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm text-white outline-none focus:border-zinc-600"
        />
        {error ? (
          <p className="mt-3 text-sm text-red-400">Wrong passphrase.</p>
        ) : null}
        <button
          type="submit"
          className="mt-6 w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
