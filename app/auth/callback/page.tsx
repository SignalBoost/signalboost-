"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function validateSession() {
      const supabase = createClient();
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (!mounted) return;

        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
      }

      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        setError(error.message);
        return;
      }

      if (data.session) {
        window.location.replace("/dashboard");
        return;
      }

      setError("We could not validate your account. Please log in again.");
    }

    void validateSession();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="auth-callback-page">
      <section className="auth-callback-card" aria-live="polite">
        <div className="auth-callback-mark">S</div>
        <h1>Validating your account…</h1>
        {error ? <p className="auth-callback-error">{error}</p> : <p>Please wait while SignalBoost finishes secure sign-in.</p>}
      </section>
    </main>
  );
}
