"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { useT } from "@/lib/useT";
import { LocaleToggle } from "@/components/locale-toggle";
import { ThemeToggle } from "@/components/theme-toggle";

function SetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const mode = searchParams.get("mode") || (token ? "invite" : "forgot");
  const t = useT();

  // Forgot mode state
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Set/reset password state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setEmailSent(true);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError(t("setPassword.tooShort"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("setPassword.mismatch"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const endpoint =
        mode === "reset" ? "/api/v1/auth/reset-password" : "/api/v1/auth/set-password";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || t("setPassword.invalidToken"));
        return;
      }
      setSuccess(true);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  // Determine title
  const title =
    mode === "forgot"
      ? t("setPassword.forgotTitle")
      : mode === "reset"
        ? t("setPassword.resetTitle")
        : t("setPassword.title");

  const inputClass =
    "w-full rounded-lg border border-surface-300 bg-surface-50 px-3 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-surface-700 dark:bg-surface-800/50 dark:text-white dark:placeholder:text-surface-500";
  const labelClass = "mb-1.5 block text-xs font-semibold text-surface-600 dark:text-surface-400";
  const errorClass =
    "flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:bg-red-950/30 dark:text-red-400";
  const linkClass =
    "flex items-center justify-center gap-1.5 text-xs text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-50 dark:bg-surface-950">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.05)_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)]" />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-100/50 via-transparent to-surface-50 dark:from-brand-950/50 dark:via-transparent dark:to-surface-950" />
      <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-brand-400/10 blur-[128px] dark:bg-brand-600/10" />
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-brand-300/10 blur-[96px] dark:bg-brand-400/10" />

      <div className="absolute right-6 top-6 z-20 flex items-center gap-2">
        <ThemeToggle />
        <LocaleToggle />
      </div>

      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="rounded-2xl border border-surface-200 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-surface-800/50 dark:bg-surface-900/80">
          <div className="mb-8 flex flex-col items-center">
            <Image
              src="/icon.png"
              alt="YARDA"
              width={80}
              height={80}
              className="h-20 w-20"
              priority
            />
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-surface-900 dark:text-white">
              {title}
            </h1>
          </div>

          {/* Success state */}
          {success && (
            <div className="space-y-4 text-center">
              <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                {t("setPassword.success")}
              </p>
              <Link
                href="/login"
                className="block w-full rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-brand-500/25"
              >
                {t("login.signIn")}
              </Link>
            </div>
          )}

          {/* Email sent state (forgot mode) */}
          {emailSent && !success && (
            <div className="space-y-4 text-center">
              <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
              <p className="text-sm text-surface-600 dark:text-surface-300">
                {t("setPassword.emailSent")}
              </p>
              <Link href="/login" className={linkClass}>
                <ArrowLeft size={12} /> {t("setPassword.backToLogin")}
              </Link>
            </div>
          )}

          {/* Forgot password form */}
          {mode === "forgot" && !emailSent && !success && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>{t("login.email")}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder={t("setPassword.enterEmail")}
                  className={inputClass}
                />
              </div>
              {error && (
                <div className={errorClass}>
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-brand-500/40 active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? t("setPassword.sending") : t("setPassword.sendReset")}
              </button>
              <Link href="/login" className={linkClass}>
                <ArrowLeft size={12} /> {t("setPassword.backToLogin")}
              </Link>
            </form>
          )}

          {/* Set/Reset password form */}
          {mode !== "forgot" && token && !success && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>{t("setPassword.newPassword")}</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("setPassword.confirm")}</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
              {error && (
                <div className={errorClass}>
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-brand-500/40 active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? t("setPassword.submitting") : t("setPassword.submit")}
              </button>
              <Link href="/login" className={linkClass}>
                <ArrowLeft size={12} /> {t("setPassword.backToLogin")}
              </Link>
            </form>
          )}

          {/* No token and not forgot mode — invalid state */}
          {mode !== "forgot" && !token && !success && (
            <div className="space-y-4 text-center">
              <AlertCircle size={48} className="mx-auto text-red-500" />
              <p className="text-sm text-red-600 dark:text-red-400">
                {t("setPassword.invalidToken")}
              </p>
              <Link href="/login" className={linkClass}>
                <ArrowLeft size={12} /> {t("setPassword.backToLogin")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-surface-50 dark:bg-surface-950">
          <div className="text-surface-900 dark:text-white">Loading...</div>
        </div>
      }
    >
      <SetPasswordContent />
    </Suspense>
  );
}
