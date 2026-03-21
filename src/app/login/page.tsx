"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Shield } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { LocaleToggle } from "@/components/locale-toggle";
import { useT } from "@/lib/useT";

export default function LoginPage() {
  const router = useRouter();
  const { clientId: storedClientId, setClientId, setApiKey } = useAppStore();
  const [clientId, setClientIdLocal] = useState("");
  const [apiKey, setApiKeyLocal] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const t = useT();

  useEffect(() => {
    if (storedClientId) router.replace("/dashboard");
  }, [storedClientId, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId.trim()) {
      setError(t("login.clientIdRequired"));
      return;
    }
    setLoading(true);
    // Small delay for feel
    await new Promise((r) => setTimeout(r, 300));
    setClientId(clientId.trim());
    setApiKey(apiKey.trim());
    router.push("/dashboard");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-950">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-950/50 via-transparent to-surface-950" />

      {/* Glow orbs */}
      <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-brand-600/10 blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-brand-400/10 blur-[96px]" />

      {/* Locale toggle in top-right */}
      <div className="absolute right-6 top-6 z-20">
        <LocaleToggle />
      </div>

      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="rounded-2xl border border-surface-800/50 bg-surface-900/80 p-8 shadow-2xl backdrop-blur-xl">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/30">
              <Activity size={28} strokeWidth={2.5} />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
              {t("login.title")}
            </h1>
            <div className="mt-1 flex items-center gap-1.5 text-surface-400">
              <Shield size={12} />
              <span className="text-xs font-medium uppercase tracking-widest">
                {t("app.subtitle")}
              </span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-surface-400">
                {t("login.clientId")}
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => { setClientIdLocal(e.target.value); setError(""); }}
                placeholder={t("login.clientIdPlaceholder")}
                className="w-full rounded-lg border border-surface-700 bg-surface-800/50 px-3 py-2.5 text-sm text-white placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-surface-400">
                {t("login.apiKey")}
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKeyLocal(e.target.value)}
                placeholder={t("login.apiKeyPlaceholder")}
                className="w-full rounded-lg border border-surface-700 bg-surface-800/50 px-3 py-2.5 text-sm text-white placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {error && (
              <p className="text-xs font-medium text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-brand-500/40 active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? t("login.signingIn") : t("login.signIn")}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-[10px] font-medium uppercase tracking-widest text-surface-600">
          {t("app.version")}
        </p>
      </div>
    </div>
  );
}
