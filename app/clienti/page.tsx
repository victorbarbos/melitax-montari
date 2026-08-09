"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const clienti = [
  {
    id: 1,
    nume: "SRL Exemplu",
    telefon: "060000001",
    email: "contact@exemplu.md",
    locatii: 2,
  },
  {
    id: 2,
    nume: "Bloc Central",
    telefon: "060000002",
    email: "",
    locatii: 1,
  },
  {
    id: 3,
    nume: "ABC Construct",
    telefon: "060000003",
    email: "office@abc.md",
    locatii: 3,
  },
  {
    id: 4,
    nume: "Compania Delta",
    telefon: "060000004",
    email: "",
    locatii: 1,
  },
];

export default function Clienti() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    nume: "",
    telefon: "",
    email: "",
    observatii: "",
    locatieNume: "",
    adresa: "",
    persoanaContact: "",
    telefonLocatie: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const clientiFiltrati = clienti.filter((client) =>
    client.nume.toLowerCase().includes(search.toLowerCase())
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nume.trim()) {
      newErrors.nume = "Numele clientului este obligatoriu.";
    }

    if (!formData.telefon.trim()) {
      newErrors.telefon = "Telefonul clientului este obligatoriu.";
    } else if (!/^[+0-9\s()-]{8,20}$/.test(formData.telefon)) {
      newErrors.telefon = "Introdu un număr de telefon valid.";
    }

    if (formData.email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Introdu o adresă de email validă.";
      }
    }

    if (!formData.locatieNume.trim()) {
      newErrors.locatieNume = "Denumirea locației este obligatorie.";
    }

    if (!formData.adresa.trim()) {
      newErrors.adresa = "Adresa este obligatorie.";
    }

    if (formData.telefonLocatie.trim()) {
      if (
        !/^[+0-9\s()-]{8,20}$/.test(formData.telefonLocatie)
      ) {
        newErrors.telefonLocatie =
          "Introdu un număr de telefon valid.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    alert("Clientul este valid.");
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setErrors({});
  };

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
                    Clienți
                  </h1>

                  <p className="mt-1 text-gray-500">
                    Gestionarea clienților și locațiilor
                  </p>
                </div>

                <button
                  onClick={() => setShowForm(true)}
                  className="w-full rounded-lg bg-melitax-primary px-4 py-2 font-medium text-white transition hover:bg-melitax-primary-hover sm:w-auto"
                >
                  + Client nou
                </button>
              </div>
            </div>

            {/* Căutare */}
            <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Caută client..."
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
                        Client
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Telefon
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Email
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Locații
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Acțiuni
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {clientiFiltrati.map((client) => (
                      <tr
                        key={client.id}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                      >
                        <td className="px-5 py-4 font-medium text-gray-900">
                          {client.nume}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {client.telefon}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {client.email || "—"}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {client.locatii}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200">
                              Vezi
                            </button>

                            <button className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200">
                              Editare
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Telefon */}
            <div className="mt-6 space-y-4 md:hidden">
              {clientiFiltrati.map((client) => (
                <div
                  key={client.id}
                  className="rounded-xl bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {client.nume}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {client.telefon}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-melitax-blue/10 px-3 py-1 text-xs font-medium text-melitax-blue">
                      {client.locatii}{" "}
                      {client.locatii === 1
                        ? "locație"
                        : "locații"}
                    </span>
                  </div>

                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-500">
                      Email
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {client.email || "—"}
                    </p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200">
                      Vezi
                    </button>

                    <button className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200">
                      Editare
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Niciun rezultat */}
            {clientiFiltrati.length === 0 && (
              <div className="mt-6 rounded-xl bg-white p-8 text-center shadow-sm">
                <p className="text-gray-500">
                  Nu a fost găsit niciun client.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Client nou */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

            {/* Header modal */}
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Client nou
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Adaugă clientul și prima lui locație
                </p>
              </div>

              <button
                onClick={handleCloseForm}
                className="rounded-lg px-3 py-2 text-2xl text-gray-500 hover:bg-gray-100"
                aria-label="Închide"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-5">

              {/* Date client */}
              <div>
                <h3 className="mb-4 text-base font-semibold text-gray-900">
                  Date client
                </h3>

                <div className="space-y-5">

                  {/* Nume */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Nume / Denumire client{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={formData.nume}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          nume: e.target.value,
                        });

                        setErrors({
                          ...errors,
                          nume: "",
                        });
                      }}
                      placeholder="Ex. SRL Melitax"
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none ${
                        errors.nume
                          ? "border-red-400"
                          : "border-gray-200"
                      }`}
                    />

                    {errors.nume && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.nume}
                      </p>
                    )}
                  </div>

                  {/* Telefon */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Telefon{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="tel"
                      value={formData.telefon}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          telefon: e.target.value,
                        });

                        setErrors({
                          ...errors,
                          telefon: "",
                        });
                      }}
                      placeholder="+373 6XX XX XXX"
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none ${
                        errors.telefon
                          ? "border-red-400"
                          : "border-gray-200"
                      }`}
                    />

                    {errors.telefon && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.telefon}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Email
                    </label>

                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          email: e.target.value,
                        });

                        setErrors({
                          ...errors,
                          email: "",
                        });
                      }}
                      placeholder="email@exemplu.md"
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none ${
                        errors.email
                          ? "border-red-400"
                          : "border-gray-200"
                      }`}
                    />

                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Observații client */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Observații
                    </label>

                    <textarea
                      rows={3}
                      value={formData.observatii}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          observatii: e.target.value,
                        })
                      }
                      placeholder="Observații despre client..."
                      className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                    />
                  </div>

                </div>
              </div>

              {/* Prima locație */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="mb-1 text-base font-semibold text-gray-900">
                  Prima locație
                </h3>

                <p className="mb-4 text-sm text-gray-500">
                  Clientul poate avea mai multe locații.
                </p>

                <div className="space-y-5">

                  {/* Denumire locație */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Denumire locație{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={formData.locatieNume}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          locatieNume: e.target.value,
                        });

                        setErrors({
                          ...errors,
                          locatieNume: "",
                        });
                      }}
                      placeholder="Ex. Sediu central"
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none ${
                        errors.locatieNume
                          ? "border-red-400"
                          : "border-gray-200"
                      }`}
                    />

                    {errors.locatieNume && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.locatieNume}
                      </p>
                    )}
                  </div>

                  {/* Adresa */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Adresă{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={formData.adresa}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          adresa: e.target.value,
                        });

                        setErrors({
                          ...errors,
                          adresa: "",
                        });
                      }}
                      placeholder="Ex. Chișinău, str. Independenței 10"
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none ${
                        errors.adresa
                          ? "border-red-400"
                          : "border-gray-200"
                      }`}
                    />

                    {errors.adresa && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.adresa}
                      </p>
                    )}
                  </div>

                  {/* Persoană contact */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Persoană de contact
                    </label>

                    <input
                      type="text"
                      value={formData.persoanaContact}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          persoanaContact: e.target.value,
                        })
                      }
                      placeholder="Nume persoană de contact"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                    />
                  </div>

                  {/* Telefon locație */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Telefon locație
                    </label>

                    <input
                      type="tel"
                      value={formData.telefonLocatie}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          telefonLocatie: e.target.value,
                        });

                        setErrors({
                          ...errors,
                          telefonLocatie: "",
                        });
                      }}
                      placeholder="+373 6XX XX XXX"
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none ${
                        errors.telefonLocatie
                          ? "border-red-400"
                          : "border-gray-200"
                      }`}
                    />

                    {errors.telefonLocatie && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.telefonLocatie}
                      </p>
                    )}
                  </div>

                </div>
              </div>
            </div>

            {/* Butoane */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 p-5 sm:flex-row sm:justify-end">

              <button
                onClick={handleCloseForm}
                className="w-full rounded-lg border border-gray-200 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
              >
                Anulează
              </button>

              <button
                onClick={handleSubmit}
                className="w-full rounded-lg bg-melitax-primary px-5 py-2.5 font-medium text-white hover:bg-melitax-primary-hover sm:w-auto"
              >
                Creează client
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}