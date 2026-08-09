"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const montatori = [
  {
    id: 1,
    nume: "Ion Popescu",
    telefon: "060000001",
    specializare: "CCTV / Video",
    interventii: 12,
    status: "Activ",
  },
  {
    id: 2,
    nume: "Andrei Rusu",
    telefon: "060000002",
    specializare: "Interfon / Acces",
    interventii: 8,
    status: "Activ",
  },
  {
    id: 3,
    nume: "Mihai Ciobanu",
    telefon: "060000003",
    specializare: "Alarmă",
    interventii: 15,
    status: "Activ",
  },
  {
    id: 4,
    nume: "Vasile Ceban",
    telefon: "060000004",
    specializare: "Rețele / IT",
    interventii: 5,
    status: "Inactiv",
  },
];

const statusStyles: Record<string, string> = {
  Activ: "bg-green-50 text-green-700",
  Inactiv: "bg-gray-100 text-gray-600",
};

export default function Montatori() {
  const [search, setSearch] = useState("");

  const montatoriFiltrati = montatori.filter((montator) => {
    const text = search.toLowerCase();

    return (
      montator.nume.toLowerCase().includes(text) ||
      montator.telefon.toLowerCase().includes(text) ||
      montator.specializare.toLowerCase().includes(text)
    );
  });

  const activi = montatori.filter(
    (montator) => montator.status === "Activ"
  ).length;

  const inactivi = montatori.filter(
    (montator) => montator.status === "Inactiv"
  ).length;

  const totalInterventii = montatori.reduce(
    (total, montator) => total + montator.interventii,
    0
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-100">
      <Sidebar />

      <main className="min-h-screen min-w-0 overflow-x-hidden md:ml-64">
        <div className="w-full min-w-0 p-4 pt-20 md:p-8 md:pt-8">
          <Header />

          <div className="mt-6">

            {/* Header */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Montatori
                  </h1>

                  <p className="mt-1 text-gray-500">
                    Gestionarea echipei de montatori
                  </p>
                </div>

                <button
                  className="w-full rounded-lg bg-melitax-primary px-4 py-2 font-medium text-white transition hover:bg-melitax-primary-hover sm:w-auto"
                >
                  + Montator nou
                </button>
              </div>
            </div>

            {/* Statistici */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Montatori activi
                </p>

                <p className="mt-1 text-2xl font-bold text-green-600">
                  {activi}
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Inactivi
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-600">
                  {inactivi}
                </p>
              </div>

              <div className="col-span-2 rounded-xl bg-white p-5 shadow-sm sm:col-span-1">
                <p className="text-sm text-gray-500">
                  Intervenții
                </p>

                <p className="mt-1 text-2xl font-bold text-melitax-primary">
                  {totalInterventii}
                </p>
              </div>
            </div>

            {/* Căutare */}
            <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Caută montator, telefon sau specializare..."
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
              />
            </div>

            {/* Desktop */}
            <div className="mt-6 hidden overflow-hidden rounded-xl bg-white shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-left text-sm text-gray-500">
                      <th className="px-5 py-4 font-medium">
                        Montator
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Telefon
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Specializare
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Intervenții
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Status
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Acțiuni
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {montatoriFiltrati.map((montator) => (
                      <tr
                        key={montator.id}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                      >
                        <td className="px-5 py-4 font-medium text-gray-900">
                          {montator.nume}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {montator.telefon}
                        </td>

                        <td className="px-5 py-4 text-gray-700">
                          {montator.specializare}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {montator.interventii}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[montator.status]}`}
                          >
                            {montator.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <button className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-200">
                            Vezi
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Telefon */}
            <div className="mt-6 space-y-4 md:hidden">
              {montatoriFiltrati.map((montator) => (
                <div
                  key={montator.id}
                  className="rounded-xl bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {montator.nume}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {montator.telefon}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[montator.status]}`}
                    >
                      {montator.status}
                    </span>
                  </div>

                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-500">
                      Specializare
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {montator.specializare}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Intervenții
                      </span>

                      <span className="font-medium text-gray-800">
                        {montator.interventii}
                      </span>
                    </div>
                  </div>

                  <button className="mt-4 w-full rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-200">
                    Vezi montator
                  </button>
                </div>
              ))}
            </div>

            {/* Niciun rezultat */}
            {montatoriFiltrati.length === 0 && (
              <div className="mt-6 rounded-xl bg-white p-8 text-center shadow-sm">
                <p className="text-gray-500">
                  Nu a fost găsit niciun montator.
                </p>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}