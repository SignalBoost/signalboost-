import type { User } from "@supabase/supabase-js";

export type ResolvedAdminSession = {
  user: User;
  accessToken: string;
};

type AuthClient = {
  auth: {
    getUser: (jwt?: string) => Promise<{ data: { user: User | null }; error: unknown }>;
    getSession: () => Promise<{ data: { session: { access_token?: string } | null }; error: unknown }>;
    refreshSession: () => Promise<{ data: { session: { access_token?: string } | null }; error: unknown }>;
  };
};

/**
 * Resolve a verified primary-Supabase user and a current access token.
 *
 * A browser session can survive a Supabase signing-key rotation with an access
 * token whose JWT `kid` is no longer accepted. In that state client UI may
 * still have cached session metadata while server-side getUser() correctly
 * rejects the token. Try the explicit bearer first, then the cookie session,
 * then force a refresh-token exchange and verify the newly minted token.
 */
export async function resolveVerifiedSession(
  authClient: AuthClient,
  bearerAccessToken: string | null
): Promise<ResolvedAdminSession | null> {
  if (bearerAccessToken) {
    const { data } = await authClient.auth.getUser(bearerAccessToken);
    if (data.user) {
      return { user: data.user, accessToken: bearerAccessToken };
    }
  }

  const cookieUser = await authClient.auth.getUser();
  if (cookieUser.data.user) {
    const currentSession = await authClient.auth.getSession();
    const currentToken = currentSession.data.session?.access_token || "";
    if (currentToken) {
      return { user: cookieUser.data.user, accessToken: currentToken };
    }
  }

  const refreshed = await authClient.auth.refreshSession();
  const refreshedToken = refreshed.data.session?.access_token || "";
  if (!refreshedToken) return null;

  const verified = await authClient.auth.getUser(refreshedToken);
  if (!verified.data.user) return null;

  return { user: verified.data.user, accessToken: refreshedToken };
}
