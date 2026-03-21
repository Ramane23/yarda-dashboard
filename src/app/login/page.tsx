"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { clientId: storedClientId, setClientId, setApiKey } = useAppStore();
  const [clientId, setClientIdLocal] = useState("");
  const [apiKey, setApiKeyLocal] = useState("");
  const [error, setError] = useState("");

  // Auto-redirect if already logged in
  useEffect(() => {
    if (storedClientId) router.replace("/dashboard");
  }, [storedClientId, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId.trim()) {
      setError("Client ID is required");
      return;
    }

    setClientId(clientId.trim());
    setApiKey(apiKey.trim());
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg">
              <Activity size={24} />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">YARDA</h1>
            <p className="mt-1 text-xs text-slate-500">
              Fraud Detection Dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Client ID
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => {
                  setClientIdLocal(e.target.value);
                  setError("");
                }}
                placeholder="e.g. sako"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKeyLocal(e.target.value)}
                placeholder="Your API key"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-white/50">
          YARDA v0.1.0
        </p>
      </div>
    </div>
  );
}
