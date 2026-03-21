"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, LogOut, Save, Check } from "lucide-react";
import { Header } from "@/components/layout/header";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { clientId, apiKey, setClientId, setApiKey } = useAppStore();
  const [localClientId, setLocalClientId] = useState(clientId);
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
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

  const handleLogout = () => {
    setClientId("");
    setApiKey("");
    localStorage.removeItem("client_id");
    localStorage.removeItem("api_key");
    router.push("/login");
  };

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <>
      <Header title="Settings" />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-lg space-y-6">
          {/* Theme */}
          <div className="card p-6">
            <h3 className="section-title mb-4">Appearance</h3>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                    mounted && theme === t.value
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300"
                      : "border-surface-200 text-surface-500 hover:border-surface-300 dark:border-surface-700 dark:text-surface-400 dark:hover:border-surface-600",
                  )}
                >
                  <t.icon size={20} />
                  <span className="text-xs font-semibold">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* API Config */}
          <div className="card p-6">
            <h3 className="section-title mb-4">API Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-surface-500">
                  Client ID
                </label>
                <input
                  type="text"
                  value={localClientId}
                  onChange={(e) => setLocalClientId(e.target.value)}
                  placeholder="e.g. sako, nita"
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-surface-500">
                  API Key
                </label>
                <input
                  type="password"
                  value={localApiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                  placeholder="Your API key"
                  className="input-field"
                />
              </div>
              <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                {saved ? <Check size={16} /> : <Save size={16} />}
                {saved ? "Saved!" : "Save Configuration"}
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card border-red-200 p-6 dark:border-red-900/50">
            <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">Sign Out</h3>
            <p className="mt-1 text-xs text-surface-500">
              This will clear your credentials and return to the login page.
            </p>
            <button
              onClick={handleLogout}
              className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>

          {/* About */}
          <div className="card p-6">
            <h3 className="section-title mb-2">About</h3>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              YARDA v1.0.0 \u2014 Real-time fraud monitoring and analytics platform for MTO clients.
              Powered by machine learning with hybrid scoring (rules + anomaly detection + ML).
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
