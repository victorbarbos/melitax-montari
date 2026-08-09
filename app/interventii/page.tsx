"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const interventii = [
  {
    id: 1,
    client: "SRL Exemplu",
    locatie: "Sediu central",
    lucrare: "Instalare cameră video",
    montator: "Ion Popescu",
    status: "În lucru",
    data: "09.08.2026",
  },
  {
    id: 2,
    client: "Bloc Central",
    locatie: "Scara 2",
    lucrare: "Reparare interfon",
    montator: "Andrei Rusu",
    status: "Atribuită",
    data: "09.08.2026",
  },
  {
    id: 3,
    client: "ABC Construct",
    locatie: "Șantier principal",
    lucrare: "Montare sistem alarmă",
    montator: "Mihai Ciobanu",
    status: "Finalizată",
    data: "08.08.2026",
  },
];

const statusStyles: Record<string, string> = {
  "Atribuită": "bg-purple-50 text-purple-700",
  "În lucru": "bg-orange-50 text-orange-700",
  "Finalizată": "bg-green-50 text-green-700",
};

export default function Interventii() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-100">
      <Sidebar />

      <main className="min-h-screen min-w-0 overflow-x-hidden md:ml-64">
        <div className="w-full min-w-0 p-4 pt-20 md:p-8 md:pt-8">
          <Header />

          <div className="mt-6">

            {/* Header pagină */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900">
                Intervenții
              </h1>

              <p className="mt-1 text-gray-500">
                Gestionarea lucrărilor atribuite montatorilor
              </p>
            </div>

            {/* Statistici */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Atribuite
                </p>

                <p className="mt-1 text-2xl font-bold text-purple-600">
                  1
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  În lucru
                </p>

                <p className="mt-1 text-2xl font-bold text-orange-500">
                  1
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Finalizate
                </p>

                <p className="mt-1 text-2xl font-bold text-green-600">
                  1
                </p>
              </div>
            </div>

            {/* Filtre */}
            <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row">

                <select className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-slate-400 sm:w-48">
                  <option>Toate statusurile</option>
                  <option>Atribuită</option>
                  <option>În lucru</option>
                  <option>Finalizată</option>
                </select>

                <input
                  type="text"
                  placeholder="Caută client sau lucrare..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                />

              </div>
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
                        Locație
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Lucrare
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Montator
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Status
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Data
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {interventii.map((interventie) => (
                      <tr
                        key={interventie.id}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                      >
                        <td className="px-5 py-4 font-medium text-gray-900">
                          {interventie.client}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {interventie.locatie}
                        </td>

                        <td className="px-5 py-4 text-gray-700">
                          {interventie.lucrare}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {interventie.montator}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[interventie.status]}`}
                          >
                            {interventie.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-500">
                          {interventie.data}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Telefon */}
            <div className="mt-6 space-y-4 md:hidden">
              {interventii.map((interventie) => (
                <div
                  key={interventie.id}
                  className="rounded-xl bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {interventie.client}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {interventie.locatie}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[interventie.status]}`}
                    >
                      {interventie.status}
                    </span>
                  </div>

                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <p className="font-medium text-gray-800">
                      {interventie.lucrare}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      Montator:{" "}
                      <span className="font-medium text-gray-700">
                        {interventie.montator}
                      </span>
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {interventie.data}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}