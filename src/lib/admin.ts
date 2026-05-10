import { cookies } from "next/headers";

const COOKIE_NAME = "wcs_admin";

export async function isAdmin(): Promise<boolean> {
  const passphrase = process.env.ADMIN_PASSPHRASE;
  if (!passphrase) return false;
  const c = await cookies();
  return c.get(COOKIE_NAME)?.value === passphrase;
}

export const ADMIN_COOKIE = COOKIE_NAME;
