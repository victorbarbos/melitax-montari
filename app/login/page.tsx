"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setError("Email sau parolă incorectă.");
        return;
      }

      if (!data.user) {
        setError("Nu s-a putut realiza autentificarea.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("A apărut o eroare. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">

        {/* Logo și titlu */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Logo size={72} />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Melitax Montări
          </h1>

          <p className="mt-2 text-gray-500">
            Panou de administrare
          </p>
        </div>

        {/* Formular */}
        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Autentificare
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Introdu datele pentru a accesa aplicația.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@exemplu.md"
                disabled={loading}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-100"
              />
            </div>

            {/* Parolă */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Parolă
              </label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Introdu parola"
                disabled={loading}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-100"
              />
            </div>

            {/* Eroare */}
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Buton */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Se autentifică..." : "Logare"}
            </button>

          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            Accesul este disponibil doar utilizatorilor creați de administrator.
          </p>

        </div>
      </div>
    </main>
  );
}