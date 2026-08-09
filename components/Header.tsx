"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

export default function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  };

  return (
    <header className="flex items-center justify-between bg-white px-4 py-4 shadow-sm sm:px-6">
      <div className="flex items-center gap-3">
        <Logo size={42} />

        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Melitax Montări
          </h1>

          <p className="text-xs text-gray-500 sm:text-sm">
            Panou de administrare
          </p>
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 transition hover:bg-gray-300"
          aria-label="Meniu utilizator"
        >
          <span className="text-sm font-semibold text-gray-700">
            VB
          </span>
        </button>

        {open && (
          <div className="absolute right-0 top-12 z-50 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">
                Administrator
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Melitax Montări
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingOut ? "Se deconectează..." : "Deconectare"}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}