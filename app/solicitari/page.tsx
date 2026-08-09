"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const solicitari = [
  {
    id: 1,
    client: "SRL Exemplu",
    locatie: "Sediu central",
    lucrare: "Instalare cameră video",
    prioritate: "Normală",
    status: "Nouă",
    data: "09.08.2026",
  },
  {
    id: 2,
    client: "Bloc Central",
    locatie: "Scara 2",
    lucrare: "Reparare interfon",
    prioritate: "Urgentă",
    status: "Atribuită",
    data: "09.08.2026",
  },
  {
    id: 3,
    client: "ABC Construct",
    locatie: "Șantier principal",
    lucrare: "Montare sistem alarmă",
    prioritate: "Urgentă",
    status: "În lucru",
    data: "08.08.2026",
  },
  {
    id: 4,
    client: "Compania Delta",
    locatie: "Depozit",
    lucrare: "Instalare control acces",
    prioritate: "Normală",
    status: "Finalizată",
    data: "07.08.2026",
  },
];

const statusStyles: Record<string, string> = {
  Nouă: "bg-blue-50 text-blue-700",
  Atribuită: "bg-purple-50 text-purple-700",
  "În lucru": "bg-orange-50 text-orange-700",
  Finalizată: "bg-green-50 text-green-700",
};

const priorityStyles: Record<string, string> = {
  Normală: "text-gray-600",
  Urgentă: "font-semibold text-red-600",
};

export default function Solicitari() {
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    client: "",
    locatie: "",
    telefon: "",
    lucrare: "",
    descriere: "",
    data: "",
    prioritate: "Normală",
    observatii: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.client) {
      newErrors.client = "Clientul este obligatoriu.";
    }

    if (!formData.locatie) {
      newErrors.locatie = "Locația este obligatorie.";
    }

    if (!formData.telefon) {
      newErrors.telefon = "Telefonul este obligatoriu.";
    } else if (!/^[+0-9\s()-]{8,20}$/.test(formData.telefon)) {
      newErrors.telefon = "Introdu un număr de telefon valid.";
    }

    if (!formData.lucrare) {
      newErrors.lucrare = "Tipul lucrării este obligatoriu.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    alert("Solicitarea este validă.");
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
            {/* Header pagină */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Solicitări
                  </h1>

                  <p className="mt-1 text-gray-500">
                    Gestionarea solicitărilor de intervenție
                  </p>
                </div>

                <button
                  onClick={() => setShowForm(true)}
                  className="w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-800 sm:w-auto"
                >
                  + Solicitare nouă
                </button>
              </div>
            </div>

            {/* Statistici */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Noi</p>
                <p className="mt-1 text-2xl font-bold text-blue-600">1</p>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Atribuite</p>
                <p className="mt-1 text-2xl font-bold text-purple-600">
                  1
                </p>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">În lucru</p>
                <p className="mt-1 text-2xl font-bold text-orange-500">
                  1
                </p>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Finalizate</p>
                <p className="mt-1 text-2xl font-bold text-green-600">
                  1
                </p>
              </div>
            </div>

            {/* Filtre */}
            <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row">
                <select className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-slate-400 sm:w-48">
                  <option>Toate statusurile</option>
                  <option>Nouă</option>
                  <option>Atribuită</option>
                  <option>În lucru</option>
                  <option>Finalizată</option>
                </select>

                <select className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-slate-400 sm:w-48">
                  <option>Toate prioritățile</option>
                  <option>Normală</option>
                  <option>Urgentă</option>
                </select>

                <input
                  type="text"
                  placeholder="Caută client sau lucrare..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                />
              </div>
            </div>

            {/* Desktop - tabel */}
            <div className="mt-6 hidden overflow-hidden rounded-xl bg-white shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-left text-sm text-gray-500">
                      <th className="px-5 py-4 font-medium">Client</th>
                      <th className="px-5 py-4 font-medium">Locație</th>
                      <th className="px-5 py-4 font-medium">Lucrare</th>
                      <th className="px-5 py-4 font-medium">
                        Prioritate
                      </th>
                      <th className="px-5 py-4 font-medium">Status</th>
                      <th className="px-5 py-4 font-medium">Data</th>
                    </tr>
                  </thead>

                  <tbody>
                    {solicitari.map((solicitare) => (
                      <tr
                        key={solicitare.id}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                      >
                        <td className="px-5 py-4 font-medium text-gray-900">
                          {solicitare.client}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {solicitare.locatie}
                        </td>

                        <td className="px-5 py-4 text-gray-700">
                          {solicitare.lucrare}
                        </td>

                        <td
                          className={`px-5 py-4 text-sm ${
                            priorityStyles[solicitare.prioritate]
                          }`}
                        >
                          {solicitare.prioritate}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              statusStyles[solicitare.status]
                            }`}
                          >
                            {solicitare.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-500">
                          {solicitare.data}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Telefon - carduri */}
            <div className="mt-6 space-y-4 md:hidden">
              {solicitari.map((solicitare) => (
                <div
                  key={solicitare.id}
                  className="rounded-xl bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {solicitare.client}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {solicitare.locatie}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusStyles[solicitare.status]
                      }`}
                    >
                      {solicitare.status}
                    </span>
                  </div>

                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <p className="font-medium text-gray-800">
                      {solicitare.lucrare}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span
                        className={
                          priorityStyles[solicitare.prioritate]
                        }
                      >
                        {solicitare.prioritate}
                      </span>

                      <span className="text-gray-500">
                        {solicitare.data}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Modal - Solicitare nouă */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            
            {/* Header formular */}
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Solicitare nouă
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Introdu informațiile despre solicitarea clientului
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

            {/* Formular */}
            <div className="space-y-5 p-5">

              {/* Client */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Client <span className="text-red-500">*</span>
                </label>

                <select
                  value={formData.client}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      client: e.target.value,
                    });

                    setErrors({
                      ...errors,
                      client: "",
                    });
                  }}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none ${
                    errors.client
                      ? "border-red-400"
                      : "border-gray-200"
                  }`}
                >
                  <option value="">Selectează clientul</option>
                  <option>SRL Exemplu</option>
                  <option>Bloc Central</option>
                  <option>ABC Construct</option>
                  <option>Compania Delta</option>
                </select>

                {errors.client && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.client}
                  </p>
                )}
              </div>

              {/* Locație */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Locație <span className="text-red-500">*</span>
                </label>

                <select
                  value={formData.locatie}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      locatie: e.target.value,
                    });

                    setErrors({
                      ...errors,
                      locatie: "",
                    });
                  }}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none ${
                    errors.locatie
                      ? "border-red-400"
                      : "border-gray-200"
                  }`}
                >
                  <option value="">Selectează locația</option>
                  <option>Sediu central</option>
                  <option>Magazin 1</option>
                  <option>Depozit</option>
                </select>

                {errors.locatie && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.locatie}
                  </p>
                )}
              </div>

              {/* Telefon */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Telefon client <span className="text-red-500">*</span>
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

              {/* Tip lucrare */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tip lucrare <span className="text-red-500">*</span>
                </label>

                <select
                  value={formData.lucrare}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      lucrare: e.target.value,
                    });

                    setErrors({
                      ...errors,
                      lucrare: "",
                    });
                  }}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none ${
                    errors.lucrare
                      ? "border-red-400"
                      : "border-gray-200"
                  }`}
                >
                  <option value="">
                    Selectează tipul lucrării
                  </option>
                  <option>Instalare</option>
                  <option>Reparație</option>
                  <option>Mentenanță</option>
                  <option>Intervenție</option>
                  <option>Control / verificare</option>
                  <option>Altă lucrare</option>
                </select>

                {errors.lucrare && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.lucrare}
                  </p>
                )}
              </div>

              {/* Descriere */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Descriere
                </label>

                <textarea
                  rows={4}
                  value={formData.descriere}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      descriere: e.target.value,
                    })
                  }
                  placeholder="Descrie solicitarea clientului..."
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                />
              </div>

              {/* Prioritate + Data */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Prioritate
                  </label>

                  <select
                    value={formData.prioritate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        prioritate: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  >
                    <option>Normală</option>
                    <option>Urgentă</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Data dorită
                  </label>

                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        data: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  />
                </div>

              </div>

              {/* Observații */}
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
                  placeholder="Alte informații importante..."
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                />
              </div>

              {/* Poze */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Poze de la client
                </label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-6 text-center transition hover:bg-gray-50">
                  <span className="text-3xl">📷</span>

                  <span className="mt-2 text-sm font-medium text-gray-700">
                    Adaugă poze
                  </span>

                  <span className="mt-1 text-xs text-gray-400">
                    Opțional • una sau mai multe poze
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                </label>
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
                className="w-full rounded-lg bg-slate-900 px-5 py-2.5 font-medium text-white hover:bg-slate-800 sm:w-auto"
              >
                Creează solicitarea
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}