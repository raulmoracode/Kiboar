export type AuthRedirect = "login" | "home" | null;

/**
 * Decides where the POS should send the cashier. The app asks for the staff
 * account once: every route needs a session except the login screen, and the
 * login screen closes as soon as there is one.
 */
export function resolveAuthRedirect({
  ready,
  hasToken,
  pathname,
}: {
  ready: boolean;
  hasToken: boolean;
  pathname: string;
}): AuthRedirect {
  if (!ready) {
    return null;
  }

  const onLogin = pathname === "/login" || pathname.startsWith("/login?");

  if (!hasToken && !onLogin) {
    return "login";
  }

  if (hasToken && onLogin) {
    return "home";
  }

  return null;
}
