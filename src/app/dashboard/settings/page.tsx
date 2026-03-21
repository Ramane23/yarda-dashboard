"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { useAppStore } from "@/lib/store";

export default function SettingsPage() {
  const { clientId, apiKey, setClientId, setApiKey } = useAppStore();
  const [localClientId, setLocalClientId] = useState(clientId);
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalClientId(clientId);
    setLocalApiKey(apiKey);
  }, [clientId, apiKey]);

  const handleSave = () => {
    setClientId(localClientId.trim());
    setApiKey(localApiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <Header title="Settings" />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-lg space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">
              API Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Client ID
                </label>
                <input
                  type="text"
                  value={localClientId}
                  onChange={(e) => setLocalClientId(e.target.value)}
                  placeholder="e.g. sako, nita"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  API Key
                </label>
                <input
                  type="password"
                  value={localApiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                  placeholder="Your API key"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <button
                onClick={handleSave}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
              >
                {saved ? "Saved!" : "Save Configuration"}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">
              About
            </h3>
            <p className="text-xs text-slate-500">
              YARDA Dashboard v0.1.0 — Real-time fraud monitoring for MTO clients.
              Connected to the YARDA backend API.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
