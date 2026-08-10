"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase/client";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  const [isSuperAdmin, setIsSuperAdmin] =
    useState(false);

  const [canSeeMontatori, setCanSeeMontatori] =
    useState(false);

  // ==================================================
  // VERIFICĂM ROLUL UTILIZATORULUI
  // ==================================================

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        // --------------------------------------------
        // Utilizator autentificat
        // --------------------------------------------

        const {
          data: {
            user,
          },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsSuperAdmin(false);
          setCanSeeMontatori(false);
          return;
        }

        // --------------------------------------------
        // Profilul utilizatorului
        // --------------------------------------------

        const {
          data: profile,
          error,
        } = await supabase
          .from("profiles")
          .select("role, active")
          .eq("id", user.id)
          .single();

        if (error || !profile) {
          console.error(
            "SIDEBAR PROFILE ERROR:",
            error
          );

          setIsSuperAdmin(false);
          setCanSeeMontatori(false);
          return;
        }

        const activeUser =
          profile.active === true;

        // --------------------------------------------
        // SUPER ADMINISTRATOR
        // --------------------------------------------

        const superAdmin =
          profile.role === "super_admin" &&
          activeUser;

        setIsSuperAdmin(
          superAdmin
        );

        // --------------------------------------------
        // MONTATORI
        //
        // Super Administrator + Administrator
        // --------------------------------------------

        setCanSeeMontatori(
          activeUser &&
          (
            profile.role ===
              "super_admin" ||
            profile.role ===
              "administrator"
          )
        );
      } catch (error) {
        console.error(
          "SIDEBAR ROLE ERROR:",
          error
        );

        setIsSuperAdmin(false);
        setCanSeeMontatori(false);
      }
    };

    loadUserRole();
  }, []);

  return (
    <>
      {/* ==================================================
          BUTON MENIU TELEFON
      ================================================== */}

      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-slate-900 px-3 py-2 text-xl text-white shadow-lg md:hidden"
        aria-label="Deschide meniul"
      >
        ☰
      </button>

      {/* ==================================================
          OVERLAY TELEFON
      ================================================== */}

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-64 flex-col
          bg-slate-950 p-6 text-white transition-transform duration-300
          md:translate-x-0
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* ==================================================
            LOGO
        ================================================== */}

        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={42} />

            <div>
              <h2 className="text-lg font-bold">
                Melitax
              </h2>

              <p className="text-sm text-slate-400">
                Montări
              </p>
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="rounded-lg px-2 py-1 text-2xl hover:bg-slate-800 md:hidden"
            aria-label="Închide meniul"
          >
            ×
          </button>
        </div>

        {/* ==================================================
            NAVIGARE
        ================================================== */}

        <nav className="space-y-2">

          {/* DASHBOARD */}

          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="block rounded-lg p-3 transition hover:bg-slate-800"
          >
            🏠 Dashboard
          </Link>

          {/* CALENDAR */}

          <Link
            href="/calendar"
            onClick={() => setOpen(false)}
            className="block rounded-lg p-3 transition hover:bg-slate-800"
          >
            📅 Calendar
          </Link>

          {/* INTERVENȚII */}

          <Link
            href="/interventii"
            onClick={() => setOpen(false)}
            className="block rounded-lg p-3 transition hover:bg-slate-800"
          >
            📋 Intervenții
          </Link>

          {/* ==================================================
              MONTATORI
              DOAR SUPER ADMINISTRATOR + ADMINISTRATOR
          ================================================== */}

          {canSeeMontatori && (
            <Link
              href="/montatori"
              onClick={() => setOpen(false)}
              className="block rounded-lg p-3 transition hover:bg-slate-800"
            >
              👷 Montatori
            </Link>
          )}

          {/* CLIENȚI */}

          <Link
            href="/clienti"
            onClick={() => setOpen(false)}
            className="block rounded-lg p-3 transition hover:bg-slate-800"
          >
            👥 Clienți
          </Link>

          {/* ==================================================
              SETĂRI
              DOAR SUPER ADMINISTRATOR ACTIV
          ================================================== */}

          {isSuperAdmin && (
            <Link
              href="/setari"
              onClick={() => setOpen(false)}
              className="block rounded-lg p-3 transition hover:bg-slate-800"
            >
              ⚙️ Setări
            </Link>
          )}

          {/* ==================================================
              AUDIT LOG
              DOAR SUPER ADMINISTRATOR
          ================================================== */}

          {isSuperAdmin && (
            <Link
              href="/audit"
              onClick={() => setOpen(false)}
              className="block rounded-lg p-3 transition hover:bg-slate-800"
            >
              🛡️ Audit Log
            </Link>
          )}

        </nav>
      </aside>
    </>
  );
}