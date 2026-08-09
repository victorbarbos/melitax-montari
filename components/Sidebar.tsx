"use client";

import { useState } from "react";
import Link from "next/link";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Buton meniu telefon */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-melitax-primary px-3 py-2 text-xl text-white shadow-lg md:hidden"
        aria-label="Deschide meniul"
      >
        ☰
      </button>

      {/* Overlay telefon */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-64 flex-col
          bg-melitax-primary p-6 text-white transition-transform duration-300
          md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Titlu */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Melitax Montări
          </h2>

          <button
            onClick={() => setOpen(false)}
            className="rounded-lg px-2 py-1 text-2xl hover:bg-melitax-primary-hover md:hidden"
            aria-label="Închide meniul"
          >
            ×
          </button>
        </div>

        {/* Meniu */}
        <nav className="space-y-2">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="block rounded-lg p-3 transition hover:bg-melitax-primary-hover"
          >
            🏠 Dashboard
          </Link>

          <Link
            href="/calendar"
            onClick={() => setOpen(false)}
            className="block rounded-lg p-3 transition hover:bg-melitax-primary-hover"
          >
            📅 Calendar
          </Link>

          <Link
            href="/solicitari"
            onClick={() => setOpen(false)}
            className="block rounded-lg p-3 transition hover:bg-melitax-primary-hover"
          >
            📋 Solicitări
          </Link>

          <Link
            href="/interventii"
            onClick={() => setOpen(false)}
            className="block rounded-lg p-3 transition hover:bg-melitax-primary-hover"
          >
            🔧 Intervenții
          </Link>

          <Link
            href="/montatori"
            onClick={() => setOpen(false)}
            className="block rounded-lg p-3 transition hover:bg-melitax-primary-hover"
          >
            👷 Montatori
          </Link>

          <Link
            href="/clienti"
            onClick={() => setOpen(false)}
            className="block rounded-lg p-3 transition hover:bg-melitax-primary-hover"
          >
            👥 Clienți
          </Link>

          <Link
            href="/setari"
            onClick={() => setOpen(false)}
            className="block rounded-lg p-3 transition hover:bg-melitax-primary-hover"
          >
            ⚙️ Setări
          </Link>
        </nav>
      </aside>
    </>
  );
}