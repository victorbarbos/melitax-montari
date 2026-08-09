"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function Setari() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-100">
      <Sidebar />

      <main className="min-h-screen min-w-0 overflow-x-hidden md:ml-64">
        <div className="w-full min-w-0 p-4 pt-20 md:p-8 md:pt-8">
          <Header />

          <div className="mt-6">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900">
                Setări
              </h1>

              <p className="mt-1 text-gray-500">
                Configurarea aplicației
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {/* Profil */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900">
                  Profil
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Datele utilizatorului conectat
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Nume
                    </label>

                    <input
                      type="text"
                      value="Victor Barbos"
                      readOnly
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Rol
                    </label>

                    <input
                      type="text"
                      value="Administrator"
                      readOnly
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Aplicație */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900">
                  Aplicație
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Informații despre aplicație
                </p>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Nume aplicație
                      </p>

                      <p className="text-sm text-gray-500">
                        Melitax Montări
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Versiune
                      </p>

                      <p className="text-sm text-gray-500">
                        0.1.0
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* În dezvoltare */}
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
              <p className="font-medium text-blue-900">
                Setările avansate vor fi adăugate ulterior.
              </p>

              <p className="mt-1 text-sm text-blue-700">
                Aici vom configura utilizatorii, rolurile,
                notificările și alte opțiuni ale aplicației.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}