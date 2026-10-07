const KEY = "spb.remembered-admin-email";

export function readRememberedAdminEmail(): string {
  try { return localStorage.getItem(KEY) || ""; } catch { return ""; }
}

export function rememberAdminEmail(email: string, remember: boolean): void {
  try {
    if (remember) localStorage.setItem(KEY, email.trim().toLowerCase());
    else localStorage.removeItem(KEY);
  } catch { /* Browser storage may be unavailable. Sign-in still works. */ }
}
