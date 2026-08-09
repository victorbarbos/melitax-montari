"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

type AuditLog = {
  id: string;
  created_at: string;
  user_id: string | null;
  actor_name: string;
  actor_role: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;

  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;

  old_data_readable: Record<string, unknown> | null;
  new_data_readable: Record<string, unknown> | null;
};

const actionLabels: Record<string, string> = {
  CREATE: "Creare",
  UPDATE: "Modificare",
  ROLE_CHANGE: "Schimbare rol",
  TEAM_CHANGE: "Schimbare echipă",
  STATUS_CHANGE: "Schimbare status",
  DELETE: "Ștergere",
};

const roleLabels: Record<string, string> = {
  super_admin: "Super Administrator",
  administrator: "Administrator",
  manager: "Manager",
  inginer: "Inginer",
  personal_teren: "Personal teren",
};

function formatAction(action: string) {
  return actionLabels[action] || action;
}

function formatRole(role: string | null) {
  if (!role) {
    return "—";
  }

  return roleLabels[role] || role;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(date));
}

function formatValue(
  key: string,
  value: unknown
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  if (
    typeof value === "boolean"
  ) {
    return value ? "Activ" : "Inactiv";
  }

  if (
    key === "role" &&
    typeof value === "string"
  ) {
    return formatRole(value);
  }

  return String(value);
}

// ======================================================
// DIFERENȚELE DINTRE ÎNAINTE / DUPĂ
// ======================================================

function getDifferenceText(
  log: AuditLog
) {
  if (
    !log.old_data_readable ||
    !log.new_data_readable
  ) {
    return null;
  }

  const changes: {
    key: string;
    oldValue: unknown;
    newValue: unknown;
  }[] = [];

  // ==================================================
  // CÂMPURI NORMALE
  // ==================================================

  const keys = new Set([
    ...Object.keys(
      log.old_data_readable
    ),
    ...Object.keys(
      log.new_data_readable
    ),
  ]);

  keys.forEach((key) => {
    // Acestea sunt tratate separat
    // cu denumiri ușor de înțeles.
    if (
      key === "team_id" ||
      key === "team_name" ||
      key === "role" ||
      key === "role_name" ||
      key === "active" ||
      key === "active_name"
    ) {
      return;
    }

    const oldValue =
      log.old_data_readable?.[key];

    const newValue =
      log.new_data_readable?.[key];

    if (
      JSON.stringify(oldValue) !==
      JSON.stringify(newValue)
    ) {
      changes.push({
        key,
        oldValue,
        newValue,
      });
    }
  });

  // ==================================================
  // ECHIPĂ
  // ==================================================

  const oldTeam =
    log.old_data_readable?.team_name;

  const newTeam =
    log.new_data_readable?.team_name;

  if (
    oldTeam !== undefined ||
    newTeam !== undefined
  ) {
    if (oldTeam !== newTeam) {
      changes.push({
        key: "Echipă",
        oldValue:
          oldTeam || "Fără echipă",
        newValue:
          newTeam || "Fără echipă",
      });
    }
  }

  // ==================================================
  // ROL
  // ==================================================

  const oldRole =
    log.old_data_readable?.role_name;

  const newRole =
    log.new_data_readable?.role_name;

  if (
    oldRole !== undefined ||
    newRole !== undefined
  ) {
    if (oldRole !== newRole) {
      changes.push({
        key: "Rol",
        oldValue: oldRole || "—",
        newValue: newRole || "—",
      });
    }
  }

  // ==================================================
  // STATUS
  // ==================================================

  const oldStatus =
    log.old_data_readable?.active_name;

  const newStatus =
    log.new_data_readable?.active_name;

  if (
    oldStatus !== undefined ||
    newStatus !== undefined
  ) {
    if (oldStatus !== newStatus) {
      changes.push({
        key: "Status",
        oldValue: oldStatus || "—",
        newValue: newStatus || "—",
      });
    }
  }

  return changes;
}

export default function AuditPage() {
  const [logs, setLogs] =
    useState<AuditLog[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedLog, setSelectedLog] =
    useState<AuditLog | null>(null);

  const [actionFilter, setActionFilter] =
    useState("ALL");

  const [userFilter, setUserFilter] =
    useState("ALL");

  const [search, setSearch] =
    useState("");

  // ==================================================
  // ÎNCĂRCARE LOGURI
  // ==================================================

  const loadLogs = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/audit",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Audit Log nu a putut fi încărcat."
        );

        setLogs([]);

        return;
      }

      setLogs(
        result.logs || []
      );
    } catch (error) {
      console.error(
        "LOAD AUDIT LOG ERROR:",
        error
      );

      setError(
        "Nu am putut comunica cu serverul."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // ==================================================
  // LISTA ACȚIUNI
  // ==================================================

  const actions =
    useMemo(() => {
      return [
        ...new Set(
          logs.map(
            (log) => log.action
          )
        ),
      ];
    }, [logs]);

  // ==================================================
  // LISTA CELOR CARE AU FĂCUT ACȚIUNI
  // ==================================================

  const actors =
    useMemo(() => {
      const map =
        new Map<string, string>();

      logs.forEach((log) => {
        if (log.user_id) {
          map.set(
            log.user_id,
            log.actor_name
          );
        }
      });

      return Array.from(
        map.entries()
      ).map(
        ([id, name]) => ({
          id,
          name,
        })
      );
    }, [logs]);

  // ==================================================
  // FILTRARE
  // ==================================================

  const filteredLogs =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return logs.filter(
        (log) => {
          if (
            actionFilter !==
              "ALL" &&
            log.action !==
              actionFilter
          ) {
            return false;
          }

          if (
            userFilter !==
              "ALL" &&
            log.user_id !==
              userFilter
          ) {
            return false;
          }

          if (searchValue) {
            const text = [
              log.actor_name,
              log.entity_name,
              log.action,
              log.entity_type,
            ]
              .join(" ")
              .toLowerCase();

            if (
              !text.includes(
                searchValue
              )
            ) {
              return false;
            }
          }

          return true;
        }
      );
    }, [
      logs,
      actionFilter,
      userFilter,
      search,
    ]);

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="min-h-screen bg-gray-100">

      <Sidebar />

      <main className="min-h-screen min-w-0 overflow-x-hidden md:ml-64">

        <div className="w-full min-w-0 p-4 pt-20 md:p-8 md:pt-8">

          <Header />

          {/* ==================================================
              TITLU
          ================================================== */}

          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h1 className="text-2xl font-bold text-gray-900">
                  Audit Log
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Istoricul acțiunilor efectuate în aplicație
                </p>

              </div>

              <div className="rounded-lg bg-slate-50 px-4 py-2">

                <p className="text-xs text-gray-500">
                  Înregistrări
                </p>

                <p className="text-lg font-bold text-gray-900">
                  {
                    filteredLogs.length
                  }
                </p>

              </div>

            </div>

          </div>

          {/* ==================================================
              FILTRE
          ================================================== */}

          <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">

            <div className="grid gap-4 md:grid-cols-3">

              {/* CĂUTARE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Caută
                </label>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Nume, utilizator sau acțiune..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />

              </div>

              {/* ACȚIUNE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Acțiune
                </label>

                <select
                  value={
                    actionFilter
                  }
                  onChange={(event) =>
                    setActionFilter(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none"
                >

                  <option value="ALL">
                    Toate acțiunile
                  </option>

                  {actions.map(
                    (action) => (
                      <option
                        key={action}
                        value={action}
                      >
                        {formatAction(
                          action
                        )}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* CINE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Cine a făcut acțiunea
                </label>

                <select
                  value={
                    userFilter
                  }
                  onChange={(event) =>
                    setUserFilter(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none"
                >

                  <option value="ALL">
                    Toți utilizatorii
                  </option>

                  {actors.map(
                    (actor) => (
                      <option
                        key={actor.id}
                        value={actor.id}
                      >
                        {actor.name}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

            {(search ||
              actionFilter !==
                "ALL" ||
              userFilter !==
                "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActionFilter(
                    "ALL"
                  );
                  setUserFilter(
                    "ALL"
                  );
                }}
                className="mt-4 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Resetează filtrele
              </button>
            )}

          </div>

          {/* ==================================================
              TABEL
          ================================================== */}

          <div className="mt-6 rounded-xl bg-white shadow-sm">

            {/* LOADING */}

            {loading && (
              <div className="p-10 text-center text-sm text-gray-500">
                Se încarcă Audit Log...
              </div>
            )}

            {/* ERROR */}

            {!loading &&
              error && (
                <div className="p-6">

                  <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>

                  <button
                    type="button"
                    onClick={
                      loadLogs
                    }
                    className="mt-4 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Încearcă din nou
                  </button>

                </div>
              )}

            {!loading &&
              !error && (
                <>

                  {/* ==================================================
                      DESKTOP
                  ================================================== */}

                  <div className="hidden overflow-x-auto md:block">

                    <table className="w-full">

                      <thead>

                        <tr className="border-b border-gray-100 text-left">

                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Data și ora
                          </th>

                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Cine
                          </th>

                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Acțiune
                          </th>

                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Utilizator afectat
                          </th>

                          <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Detalii
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {filteredLogs.map(
                          (log) => (
                            <tr
                              key={
                                log.id
                              }
                              className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                            >

                              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                {formatDate(
                                  log.created_at
                                )}
                              </td>

                              <td className="px-6 py-4">

                                <div>

                                  <p className="font-medium text-gray-900">
                                    {
                                      log.actor_name
                                    }
                                  </p>

                                  <p className="text-xs text-gray-500">
                                    {formatRole(
                                      log.actor_role
                                    )}
                                  </p>

                                </div>

                              </td>

                              <td className="px-6 py-4">

                                <span className="inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                                  {formatAction(
                                    log.action
                                  )}
                                </span>

                              </td>

                              <td className="px-6 py-4">

                                <p className="font-medium text-gray-900">
                                  {
                                    log.entity_name
                                  }
                                </p>

                                <p className="text-xs text-gray-500">
                                  {
                                    log.entity_type
                                  }
                                </p>

                              </td>

                              <td className="px-6 py-4 text-right">

                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedLog(
                                      log
                                    )
                                  }
                                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                >
                                  Deschide
                                </button>

                              </td>

                            </tr>
                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                  {/* ==================================================
                      MOBIL
                  ================================================== */}

                  <div className="divide-y divide-gray-100 md:hidden">

                    {filteredLogs.map(
                      (log) => (
                        <div
                          key={
                            log.id
                          }
                          className="p-5"
                        >

                          <div className="flex items-start justify-between gap-3">

                            <div>

                              <p className="font-medium text-gray-900">
                                {
                                  log.entity_name
                                }
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                {formatDate(
                                  log.created_at
                                )}
                              </p>

                            </div>

                            <span className="shrink-0 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                              {formatAction(
                                log.action
                              )}
                            </span>

                          </div>

                          <div className="mt-4 rounded-lg bg-gray-50 p-3">

                            <p className="text-xs text-gray-500">
                              Cine
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                              {
                                log.actor_name
                              }
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {formatRole(
                                log.actor_role
                              )}
                            </p>

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedLog(
                                log
                              )
                            }
                            className="mt-4 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Vezi detaliile
                          </button>

                        </div>
                      )
                    )}

                  </div>

                  {/* NICIUN REZULTAT */}

                  {filteredLogs.length ===
                    0 && (
                    <div className="p-10 text-center">

                      <p className="font-medium text-gray-900">
                        Nu există rezultate
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Încearcă să modifici filtrele.
                      </p>

                    </div>
                  )}

                </>
              )}

          </div>

        </div>

      </main>

      {/* ==================================================
          MODAL DETALII
      ================================================== */}

      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">

            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-gray-100 p-6">

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  Detalii acțiune
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {formatAction(
                    selectedLog.action
                  )}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedLog(
                    null
                  )
                }
                className="rounded-lg px-2 py-1 text-2xl text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                ×
              </button>

            </div>

            {/* ==================================================
                INFORMAȚII GENERALE
            ================================================== */}

            <div className="grid gap-4 p-6 sm:grid-cols-2">

              <div className="rounded-lg bg-gray-50 p-4">

                <p className="text-xs text-gray-500">
                  Cine a făcut acțiunea
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {
                    selectedLog.actor_name
                  }
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {formatRole(
                    selectedLog.actor_role
                  )}
                </p>

              </div>

              <div className="rounded-lg bg-gray-50 p-4">

                <p className="text-xs text-gray-500">
                  Utilizator afectat
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {
                    selectedLog.entity_name
                  }
                </p>

              </div>

              <div className="rounded-lg bg-gray-50 p-4">

                <p className="text-xs text-gray-500">
                  Data și ora
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {formatDate(
                    selectedLog.created_at
                  )}
                </p>

              </div>

              <div className="rounded-lg bg-gray-50 p-4">

                <p className="text-xs text-gray-500">
                  Acțiune
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {formatAction(
                    selectedLog.action
                  )}
                </p>

              </div>

            </div>

            {/* ==================================================
                MODIFICĂRI
            ================================================== */}

            {getDifferenceText(
              selectedLog
            ) &&
              getDifferenceText(
                selectedLog
              )!.length > 0 && (
                <div className="border-t border-gray-100 p-6">

                  <h3 className="font-semibold text-gray-900">
                    Modificări
                  </h3>

                  <div className="mt-4 space-y-3">

                    {getDifferenceText(
                      selectedLog
                    )!.map(
                      (
                        change
                      ) => (
                        <div
                          key={
                            change.key
                          }
                          className="rounded-lg border border-gray-100 p-4"
                        >

                          <p className="text-sm font-medium text-gray-700">
                            {
                              change.key
                            }
                          </p>

                          <div className="mt-2 grid gap-3 sm:grid-cols-2">

                            <div className="rounded-lg bg-red-50 p-3">

                              <p className="text-xs text-red-500">
                                Înainte
                              </p>

                              <p className="mt-1 break-all text-sm text-red-700">
                                {formatValue(
                                  change.key,
                                  change.oldValue
                                )}
                              </p>

                            </div>

                            <div className="rounded-lg bg-green-50 p-3">

                              <p className="text-xs text-green-600">
                                După
                              </p>

                              <p className="mt-1 break-all text-sm text-green-700">
                                {formatValue(
                                  change.key,
                                  change.newValue
                                )}
                              </p>

                            </div>

                          </div>

                        </div>
                      )
                    )}

                  </div>

                </div>
              )}

            {/* ==================================================
                DATE COMPLETE
            ================================================== */}

            <div className="border-t border-gray-100 p-6">

              <h3 className="font-semibold text-gray-900">
                Date complete
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Valorile tehnice și valorile lizibile folosite de sistem.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">

                {/* ÎNAINTE */}

                <div>

                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Înainte
                  </p>

                  <pre className="max-h-64 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-gray-100">
                    {JSON.stringify(
                      selectedLog.old_data_readable,
                      null,
                      2
                    )}
                  </pre>

                </div>

                {/* DUPĂ */}

                <div>

                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                    După
                  </p>

                  <pre className="max-h-64 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-gray-100">
                    {JSON.stringify(
                      selectedLog.new_data_readable,
                      null,
                      2
                    )}
                  </pre>

                </div>

              </div>

            </div>

            {/* ==================================================
                FOOTER
            ================================================== */}

            <div className="flex justify-end border-t border-gray-100 p-6">

              <button
                type="button"
                onClick={() =>
                  setSelectedLog(
                    null
                  )
                }
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Închide
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}