"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase/client";

type Client = {
  id: string;
  name: string;
  phone: string | null;
};

type Location = {
  id: string;
  client_id: string;
  name: string;
  address: string;
  active: boolean;
};

type Intervention = {
  id: string;
  request_id: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  work_description: string | null;
  materials: string | null;
  notes: string | null;

  request: {
    client_id: string;
    location_id: string;
    work_title: string;
    description: string | null;
    priority: string;
    desired_date: string | null;

    client: {
      name: string;
    } | null;

    location: {
      name: string;
      address: string;
    } | null;
  } | null;
};

const statusLabels: Record<string, string> = {
  planificata: "Planificată",
  in_lucru: "În lucru",
  finalizata: "Finalizată",
  anulata: "Anulată",
};

const statusStyles: Record<string, string> = {
  planificata: "bg-purple-50 text-purple-700",
  in_lucru: "bg-orange-50 text-orange-700",
  finalizata: "bg-green-50 text-green-700",
  anulata: "bg-red-50 text-red-700",
};

export default function Interventii() {
  const [interventii, setInterventii] = useState<Intervention[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showCreate, setShowCreate] = useState(false);

  const [statusFilter, setStatusFilter] = useState("toate");
  const [search, setSearch] = useState("");

  const [clientId, setClientId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [workTitle, setWorkTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normala");
  const [desiredDate, setDesiredDate] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==================================================
  // ÎNCĂRCARE DATE
  // ==================================================

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      // ==================================================
      // CLIENȚI
      // ==================================================

      const {
        data: clientsData,
        error: clientsError,
      } = await supabase
        .from("clients")
        .select("id, name, phone")
        .eq("active", true)
        .order("name");

      if (clientsError) {
        throw clientsError;
      }

      setClients(clientsData || []);

      // ==================================================
      // LOCAȚII
      // ==================================================

      const {
        data: locationsData,
        error: locationsError,
      } = await supabase
        .from("locations")
        .select(
          "id, client_id, name, address, active"
        )
        .eq("active", true)
        .order("name");

      if (locationsError) {
        throw locationsError;
      }

      setLocations(locationsData || []);

      // ==================================================
      // INTERVENȚII
      // ==================================================

      const {
        data: interventionsData,
        error: interventionsError,
      } = await supabase
        .from("interventions")
        .select(`
          id,
          request_id,
          status,
          started_at,
          completed_at,
          work_description,
          materials,
          notes,
          request:requests (
            client_id,
            location_id,
            work_title,
            description,
            priority,
            desired_date,
            client:clients (
              name
            ),
            location:locations (
              name,
              address
            )
          )
        `)
        .order("created_at", {
          ascending: false,
        });

      if (interventionsError) {
        throw interventionsError;
      }

      setInterventii(
        (interventionsData || []) as unknown as Intervention[]
      );
    } catch (err: any) {
      console.error(
        "INTERVENTII LOAD ERROR:",
        err
      );

      setError(
        err?.message ||
          "Nu au putut fi încărcate datele."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==================================================
  // LOCAȚIILE CLIENTULUI SELECTAT
  // ==================================================

  const clientLocations = locations.filter(
    (location) =>
      location.client_id === clientId
  );

  // ==================================================
  // CREARE INTERVENȚIE
  // ==================================================

  async function createIntervention() {
    setError("");
    setSuccess("");

    if (!clientId) {
      setError("Selectează clientul.");
      return;
    }

    if (!locationId) {
      setError("Selectează locația.");
      return;
    }

    if (!workTitle.trim()) {
      setError(
        "Introdu denumirea lucrării."
      );
      return;
    }

    setSaving(true);

    try {
      // ==================================================
      // UTILIZATOR AUTENTIFICAT
      // ==================================================

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "Sesiunea a expirat. Autentifică-te din nou."
        );
      }

      // ==================================================
      // CLIENT SELECTAT
      // ==================================================

      const selectedClient =
        clients.find(
          (client) =>
            client.id === clientId
        );

      // ==================================================
      // 1. CREĂM CEREREA
      // ==================================================

      const {
        data: request,
        error: requestError,
      } = await supabase
        .from("requests")
        .insert({
          client_id: clientId,
          location_id: locationId,
          client_phone:
            selectedClient?.phone || "",
          work_title:
            workTitle.trim(),
          description:
            description.trim() || null,
          priority,
          desired_date:
            desiredDate || null,
          status: "noua",
          created_by: user.id,
        })
        .select("id")
        .single();

      if (requestError) {
        throw requestError;
      }

      if (!request) {
        throw new Error(
          "Cererea nu a fost creată."
        );
      }

      // ==================================================
      // 2. CREĂM AUTOMAT INTERVENȚIA
      // ==================================================

      const {
        error: interventionError,
      } = await supabase
        .from("interventions")
        .insert({
          request_id: request.id,
          created_by: user.id,
          status: "planificata",
        });

      if (interventionError) {
        // Dacă intervenția nu se poate crea,
        // ștergem cererea creată.
        await supabase
          .from("requests")
          .delete()
          .eq("id", request.id);

        throw interventionError;
      }

      // ==================================================
      // RESET FORMULAR
      // ==================================================

      setClientId("");
      setLocationId("");
      setWorkTitle("");
      setDescription("");
      setPriority("normala");
      setDesiredDate("");

      setShowCreate(false);

      setSuccess(
        "Intervenția a fost creată cu succes."
      );

      await loadData();
    } catch (err: any) {
      console.error(
        "CREATE INTERVENTION ERROR:",
        err
      );

      setError(
        err?.message ||
          "Intervenția nu a putut fi creată."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==================================================
  // FILTRARE
  // ==================================================

  const filteredInterventii =
    interventii.filter(
      (interventie) => {
        const request =
          interventie.request;

        if (!request) {
          return false;
        }

        if (
          statusFilter !== "toate" &&
          interventie.status !==
            statusFilter
        ) {
          return false;
        }

        const text = [
          request.client?.name,
          request.location?.name,
          request.location?.address,
          request.work_title,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(
          search.toLowerCase()
        );
      }
    );

  // ==================================================
  // STATISTICI
  // ==================================================

  const planificate =
    interventii.filter(
      (item) =>
        item.status ===
        "planificata"
    ).length;

  const inLucru =
    interventii.filter(
      (item) =>
        item.status ===
        "in_lucru"
    ).length;

  const finalizate =
    interventii.filter(
      (item) =>
        item.status ===
        "finalizata"
    ).length;

  // ==================================================
  // FORMAT DATĂ
  // ==================================================

  function formatDate(
    date: string | null
  ) {
    if (!date) {
      return "—";
    }

    const [
      year,
      month,
      day,
    ] = date.split("-");

    return `${day}.${month}.${year}`;
  }

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <>
      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <Sidebar />

      {/* ==================================================
          CONȚINUT
      ================================================== */}

      <main className="min-h-screen min-w-0 overflow-x-hidden md:ml-64">
        <div className="w-full min-w-0 p-4 pt-20 md:p-8 md:pt-8">

          {/* ==================================================
              HEADER
          ================================================== */}

          <Header />

          <div className="mt-6">

            {/* ==================================================
                HEADER PAGINĂ
            ================================================== */}

            <div className="rounded-xl bg-white p-6 shadow-sm">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Intervenții
                  </h1>

                  <p className="mt-1 text-gray-500">
                    Gestionarea intervențiilor și atribuirea echipei
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowCreate(true);
                    setError("");
                    setSuccess("");
                  }}
                  className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  + Creează intervenție
                </button>

              </div>

            </div>

            {/* ==================================================
                SUCCES
            ================================================== */}

            {success && (
              <div className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-700">
                {success}
              </div>
            )}

            {/* ==================================================
                EROARE
            ================================================== */}

            {error && (
              <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* ==================================================
                STATISTICI
            ================================================== */}

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Planificate
                </p>

                <p className="mt-1 text-2xl font-bold text-purple-600">
                  {planificate}
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  În lucru
                </p>

                <p className="mt-1 text-2xl font-bold text-orange-500">
                  {inLucru}
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Finalizate
                </p>

                <p className="mt-1 text-2xl font-bold text-green-600">
                  {finalizate}
                </p>
              </div>

            </div>

            {/* ==================================================
                FILTRE
            ================================================== */}

            <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">

              <div className="flex flex-col gap-3 sm:flex-row">

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-slate-400 sm:w-52"
                >
                  <option value="toate">
                    Toate statusurile
                  </option>

                  <option value="planificata">
                    Planificată
                  </option>

                  <option value="in_lucru">
                    În lucru
                  </option>

                  <option value="finalizata">
                    Finalizată
                  </option>

                  <option value="anulata">
                    Anulată
                  </option>
                </select>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Caută client, locație sau lucrare..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                />

              </div>

            </div>

            {/* ==================================================
                LISTĂ INTERVENȚII
            ================================================== */}

            <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">

              {loading ? (
                <div className="p-10 text-center text-gray-500">
                  Se încarcă intervențiile...
                </div>
              ) : filteredInterventii.length === 0 ? (
                <div className="p-10 text-center text-gray-500">
                  Nu există intervenții.
                </div>
              ) : (
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
                          Prioritate
                        </th>

                        <th className="px-5 py-4 font-medium">
                          Data
                        </th>

                        <th className="px-5 py-4 font-medium">
                          Status
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {filteredInterventii.map(
                        (interventie) => {

                          const request =
                            interventie.request;

                          return (
                            <tr
                              key={
                                interventie.id
                              }
                              className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                            >

                              <td className="px-5 py-4 font-medium text-gray-900">
                                {request
                                  ?.client
                                  ?.name ||
                                  "—"}
                              </td>

                              <td className="px-5 py-4 text-gray-600">

                                {request
                                  ?.location
                                  ?.name ||
                                  "—"}

                                {request
                                  ?.location
                                  ?.address && (
                                  <div className="mt-1 text-xs text-gray-400">
                                    {
                                      request
                                        .location
                                        .address
                                    }
                                  </div>
                                )}

                              </td>

                              <td className="px-5 py-4 text-gray-700">
                                {request
                                  ?.work_title ||
                                  "—"}
                              </td>

                              <td className="px-5 py-4">

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                                    request?.priority ===
                                    "urgenta"
                                      ? "bg-red-50 text-red-700"
                                      : "bg-blue-50 text-blue-700"
                                  }`}
                                >
                                  {request?.priority ===
                                  "urgenta"
                                    ? "Urgentă"
                                    : "Normală"}
                                </span>

                              </td>

                              <td className="px-5 py-4 text-sm text-gray-500">
                                {formatDate(
                                  request
                                    ?.desired_date ||
                                    null
                                )}
                              </td>

                              <td className="px-5 py-4">

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                                    statusStyles[
                                      interventie
                                        .status
                                    ] ||
                                    "bg-gray-50 text-gray-700"
                                  }`}
                                >
                                  {statusLabels[
                                    interventie
                                      .status
                                  ] ||
                                    interventie.status}
                                </span>

                              </td>

                            </tr>
                          );
                        }
                      )}

                    </tbody>

                  </table>

                </div>
              )}

            </div>

          </div>
        </div>
      </main>

      {/* ==================================================
          MODAL CREARE INTERVENȚIE
      ================================================== */}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

            {/* ==================================================
                MODAL HEADER
            ================================================== */}

            <div className="flex items-center justify-between border-b border-gray-100 p-6">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Creează intervenție
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Completează datele lucrării
                </p>
              </div>

              <button
                onClick={() =>
                  setShowCreate(false)
                }
                className="rounded-lg px-3 py-2 text-2xl text-gray-500 hover:bg-gray-100"
              >
                ×
              </button>

            </div>

            {/* ==================================================
                FORMULAR
            ================================================== */}

            <div className="space-y-5 p-6">

              {/* CLIENT */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Client *
                </label>

                <select
                  value={clientId}
                  onChange={(e) => {
                    setClientId(
                      e.target.value
                    );
                    setLocationId("");
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-400"
                >
                  <option value="">
                    Selectează clientul
                  </option>

                  {clients.map(
                    (client) => (
                      <option
                        key={client.id}
                        value={client.id}
                      >
                        {client.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* LOCAȚIE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Locație *
                </label>

                <select
                  value={locationId}
                  onChange={(e) =>
                    setLocationId(
                      e.target.value
                    )
                  }
                  disabled={!clientId}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm outline-none disabled:bg-gray-50 focus:border-slate-400"
                >
                  <option value="">
                    {clientId
                      ? "Selectează locația"
                      : "Selectează mai întâi clientul"}
                  </option>

                  {clientLocations.map(
                    (location) => (
                      <option
                        key={location.id}
                        value={location.id}
                      >
                        {location.name}

                        {location.address
                          ? ` — ${location.address}`
                          : ""}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* LUCRARE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Lucrare *
                </label>

                <input
                  type="text"
                  value={workTitle}
                  onChange={(e) =>
                    setWorkTitle(
                      e.target.value
                    )
                  }
                  placeholder="Ex: Instalare sistem de supraveghere"
                  className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              {/* DESCRIERE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Descriere
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  rows={4}
                  placeholder="Descrierea lucrării..."
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              {/* PRIORITATE + DATA */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Prioritate
                  </label>

                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-400"
                  >
                    <option value="normala">
                      Normală
                    </option>

                    <option value="urgenta">
                      Urgentă
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Data dorită
                  </label>

                  <input
                    type="date"
                    value={desiredDate}
                    onChange={(e) =>
                      setDesiredDate(
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-slate-400"
                  />
                </div>

              </div>

            </div>

            {/* ==================================================
                MODAL FOOTER
            ================================================== */}

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 p-6 sm:flex-row sm:justify-end">

              <button
                onClick={() =>
                  setShowCreate(false)
                }
                disabled={saving}
                className="rounded-lg border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Anulează
              </button>

              <button
                onClick={
                  createIntervention
                }
                disabled={saving}
                className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Se salvează..."
                  : "Creează intervenția"}
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
}