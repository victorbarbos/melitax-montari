"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

export default function SchimbaParolaPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    setError("");

    if (password.length < 8) {
      setError(
        "Parola trebuie să conțină cel puțin 8 caractere."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Parolele nu coincid.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(
          "Sesiunea nu este validă. Te rugăm să te autentifici din nou."
        );
        return;
      }

      const { error: passwordError } =
        await supabase.auth.updateUser({
          password,
        });

      if (passwordError) {
        console.error(
          "CHANGE PASSWORD ERROR:",
          passwordError
        );

        setError(
          passwordError.message ||
            "Parola nu a putut fi schimbată."
        );
        return;
      }

      const { error: profileError } =
        await supabase
          .from("profiles")
          .update({
            must_change_password: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

      if (profileError) {
        console.error(
          "UPDATE PASSWORD FLAG ERROR:",
          profileError
        );

        setError(
          "Parola a fost schimbată, dar profilul nu a putut fi actualizat. Te rugăm să contactezi administratorul."
        );
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      console.error(
        "CHANGE TEMPORARY PASSWORD ERROR:",
        error
      );

      setError(
        "A apărut o eroare. Încearcă din nou."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center">

        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Logo size={72} />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Melitax Montări
          </h1>

          <p className="mt-2 text-gray-500">
            Schimbare parolă obligatorie
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Schimbă parola
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Ai primit o parolă temporară. Pentru securitatea contului, trebuie să alegi o parolă nouă înainte de a continua.
            </p>
          </div>

          <form
            onSubmit={handleChangePassword}
            className="space-y-5"
          >

            <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Parolă nouă
              </label>

              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Minimum 8 caractere"
                disabled={loading}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Confirmă parola
              </label>

              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Repetă parola"
                disabled={loading}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-100"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Se salvează..."
                : "Schimbă parola"}
            </button>

          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            După schimbarea parolei vei putea accesa aplicația.
          </p>

        </div>
      </div>
    </main>
  );
}