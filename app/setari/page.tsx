"use client";

import { useEffect, useState } from "react";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase/client";

type UserProfile = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: string;
  team_id: string | null;
  active: boolean;
  created_at: string;

  teams: {
    name: string;
  } | null;
};

type Team = {
  id: string;
  name: string;
};

const getRoleLabel = (
  role: string,
  teamName?: string | null
) => {
  if (role === "super_admin") {
    return "Super Administrator";
  }

  if (role === "administrator") {
    return "Administrator";
  }

  if (role === "manager") {
    return "Manager";
  }

  if (role === "inginer") {
    return "Inginer";
  }

  if (
    role === "personal_teren" &&
    teamName === "Echipa Montare"
  ) {
    return "Montator";
  }

  if (
    role === "personal_teren" &&
    teamName === "Echipa Deservire"
  ) {
    return "Personal deservire";
  }

  if (role === "personal_teren") {
    return "Personal teren";
  }

  return role;
};

export default function Setari() {
  const [users, setUsers] = useState<UserProfile[]>([]);

  const [teams, setTeams] = useState<Team[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showAddUser, setShowAddUser] = useState(false);

  const [creatingUser, setCreatingUser] = useState(false);

  const [formError, setFormError] = useState("");

  const [formSuccess, setFormSuccess] = useState("");

  const [newName, setNewName] = useState("");

  const [newPhone, setNewPhone] = useState("");

  const [newEmail, setNewEmail] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [newRole, setNewRole] = useState("personal_teren");

  const [newTeam, setNewTeam] = useState("");

  // ==================================================
  // ÎNCĂRCARE UTILIZATORI
  // ==================================================

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("LOAD USERS API ERROR:", result);

        setError(
          result.error ||
            "Nu am putut încărca utilizatorii."
        );

        setUsers([]);

        return;
      }

      setUsers(result.users || []);
    } catch (error) {
      console.error("LOAD USERS ERROR:", error);

      setError(
        "Nu am putut comunica cu serverul."
      );

      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // ÎNCĂRCARE ECHIPE
  // ==================================================

  const loadTeams = async () => {
    const {
      data,
      error,
    } = await supabase
      .from("teams")
      .select("id, name")
      .order("name");

    if (error) {
      console.error("LOAD TEAMS ERROR:", error);
      return;
    }

    setTeams(data || []);
  };

  // ==================================================
  // INITIALIZARE
  // ==================================================

  useEffect(() => {
    loadUsers();
    loadTeams();
  }, []);

  // ==================================================
  // RESET FORMULAR
  // ==================================================

  const resetForm = () => {
    setNewName("");
    setNewPhone("");
    setNewEmail("");
    setNewPassword("");
    setNewRole("personal_teren");
    setNewTeam("");
    setFormError("");
    setFormSuccess("");
  };

  // ==================================================
  // ÎNCHIDERE FORMULAR
  // ==================================================

  const closeAddUser = () => {
    if (creatingUser) {
      return;
    }

    setShowAddUser(false);

    resetForm();
  };

  // ==================================================
  // CREARE UTILIZATOR
  // ==================================================

  const handleCreateUser = async () => {
    setFormError("");
    setFormSuccess("");

    if (!newName.trim()) {
      setFormError(
        "Numele complet este obligatoriu."
      );

      return;
    }

    if (!newEmail.trim()) {
      setFormError(
        "Emailul este obligatoriu."
      );

      return;
    }

    if (newPassword.length < 8) {
      setFormError(
        "Parola trebuie să conțină cel puțin 8 caractere."
      );

      return;
    }

    // Super Administrator nu poate fi creat
    if (newRole === "super_admin") {
      setFormError(
        "Super Administrator nu poate fi creat."
      );

      return;
    }

    setCreatingUser(true);

    try {
      const response = await fetch(
        "/api/admin/users",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            fullName: newName.trim(),

            phone: newPhone.trim(),

            email: newEmail
              .trim()
              .toLowerCase(),

            password: newPassword,

            role: newRole,

            teamId: newTeam || null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setFormError(
          result.error ||
            "Utilizatorul nu a putut fi creat."
        );

        setCreatingUser(false);

        return;
      }

      setFormSuccess(
        "Utilizatorul a fost creat cu succes."
      );

      await loadUsers();

      setTimeout(() => {
        setShowAddUser(false);

        resetForm();
      }, 1000);
    } catch (error) {
      console.error(
        "CREATE USER FRONTEND ERROR:",
        error
      );

      setFormError(
        "Nu am putut comunica cu serverul."
      );
    } finally {
      setCreatingUser(false);
    }
  };

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="min-h-screen bg-gray-100">

      <Sidebar />

      <main className="min-h-screen min-w-0 overflow-x-hidden md:ml-64">

        <div className="w-full min-w-0 p-4 pt-20 md:p-8 md:pt-8">

          <Header />

          <div className="mt-6">

            {/* ========================================
                TITLU
            ======================================== */}

            <div className="rounded-xl bg-white p-6 shadow-sm">

              <h1 className="text-2xl font-bold text-gray-900">
                Setări
              </h1>

              <p className="mt-1 text-gray-500">
                Configurarea aplicației
              </p>

            </div>

            {/* ========================================
                UTILIZATORI
            ======================================== */}

            <div className="mt-6 rounded-xl bg-white shadow-sm">

              <div className="flex flex-col gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h2 className="text-lg font-bold text-gray-900">
                    Utilizatori
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Gestionarea utilizatorilor și a accesului la aplicație
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddUser(true);
                    setFormError("");
                    setFormSuccess("");
                  }}
                  className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  + Adaugă utilizator
                </button>

              </div>

              {/* ======================================
                  FORMULAR ADAUGARE
              ====================================== */}

              {showAddUser && (
                <div className="border-b border-gray-100 bg-gray-50 p-5 sm:p-6">

                  <div className="rounded-xl bg-white p-5 shadow-sm sm:p-6">

                    <div className="mb-6 flex items-start justify-between gap-4">

                      <div>

                        <h3 className="text-lg font-bold text-gray-900">
                          Adaugă utilizator
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Completează datele noului utilizator.
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={closeAddUser}
                        disabled={creatingUser}
                        className="rounded-lg px-2 py-1 text-2xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
                      >
                        ×
                      </button>

                    </div>

                    <div className="grid gap-5 md:grid-cols-2">

                      {/* NUME */}

                      <div>

                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Nume complet
                        </label>

                        <input
                          type="text"
                          value={newName}
                          onChange={(event) =>
                            setNewName(
                              event.target.value
                            )
                          }
                          placeholder="Ex. Ion Popescu"
                          disabled={creatingUser}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-100"
                        />

                      </div>

                      {/* TELEFON */}

                      <div>

                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Telefon
                        </label>

                        <input
                          type="tel"
                          value={newPhone}
                          onChange={(event) =>
                            setNewPhone(
                              event.target.value
                            )
                          }
                          placeholder="Ex. 069123456"
                          disabled={creatingUser}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-100"
                        />

                      </div>

                      {/* EMAIL */}

                      <div>

                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Email
                        </label>

                        <input
                          type="email"
                          value={newEmail}
                          onChange={(event) =>
                            setNewEmail(
                              event.target.value
                            )
                          }
                          placeholder="email@melitax.md"
                          disabled={creatingUser}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-100"
                        />

                      </div>

                      {/* PAROLA */}

                      <div>

                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Parolă temporară
                        </label>

                        <input
                          type="password"
                          value={newPassword}
                          onChange={(event) =>
                            setNewPassword(
                              event.target.value
                            )
                          }
                          placeholder="Minimum 8 caractere"
                          disabled={creatingUser}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-100"
                        />

                      </div>

                      {/* ROL */}

                      <div>

                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Rol
                        </label>

                        <select
                          value={newRole}
                          onChange={(event) =>
                            setNewRole(
                              event.target.value
                            )
                          }
                          disabled={creatingUser}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-100"
                        >

                          <option value="personal_teren">
                            Personal teren
                          </option>

                          <option value="inginer">
                            Inginer
                          </option>

                          <option value="manager">
                            Manager
                          </option>

                          <option value="administrator">
                            Administrator
                          </option>

                        </select>

                      </div>

                      {/* ECHIPĂ */}

                      <div>

                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Echipă
                        </label>

                        <select
                          value={newTeam}
                          onChange={(event) =>
                            setNewTeam(
                              event.target.value
                            )
                          }
                          disabled={creatingUser}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-100"
                        >

                          <option value="">
                            Fără echipă
                          </option>

                          {teams.map((team) => (
                            <option
                              key={team.id}
                              value={team.id}
                            >
                              {team.name}
                            </option>
                          ))}

                        </select>

                      </div>

                    </div>

                    {/* EROARE */}

                    {formError && (
                      <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                        {formError}
                      </div>
                    )}

                    {/* SUCCES */}

                    {formSuccess && (
                      <div className="mt-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                        {formSuccess}
                      </div>
                    )}

                    {/* BUTOANE */}

                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                      <button
                        type="button"
                        onClick={closeAddUser}
                        disabled={creatingUser}
                        className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Anulează
                      </button>

                      <button
                        type="button"
                        onClick={handleCreateUser}
                        disabled={creatingUser}
                        className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {creatingUser
                          ? "Se creează..."
                          : "Creează utilizator"}
                      </button>

                    </div>

                  </div>

                </div>
              )}

              {/* ======================================
                  LOADING
              ====================================== */}

              {loading && (
                <div className="p-8 text-center text-sm text-gray-500">
                  Se încarcă utilizatorii...
                </div>
              )}

              {/* ======================================
                  EROARE
              ====================================== */}

              {!loading && error && (
                <div className="p-6">

                  <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>

                  <button
                    type="button"
                    onClick={loadUsers}
                    className="mt-4 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Încearcă din nou
                  </button>

                </div>
              )}

              {/* ======================================
                  LISTA
              ====================================== */}

              {!loading && !error && (
                <>

                  {/* DESKTOP */}

                  <div className="hidden overflow-x-auto md:block">

                    <table className="w-full">

                      <thead>

                        <tr className="border-b border-gray-100 text-left">

                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Utilizator
                          </th>

                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Telefon
                          </th>

                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Rol
                          </th>

                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Echipă
                          </th>

                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Status
                          </th>

                          <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Acțiuni
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {users.map((user) => (
                          <tr
                            key={user.id}
                            className="border-b border-gray-100 last:border-0"
                          >

                            {/* UTILIZATOR */}

                            <td className="px-6 py-4">

                              <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">

                                  <span className="text-sm font-semibold text-gray-700">

                                    {user.full_name
                                      .split(" ")
                                      .map(
                                        (name) =>
                                          name[0]
                                      )
                                      .slice(0, 2)
                                      .join("")
                                      .toUpperCase()}

                                  </span>

                                </div>

                                <div className="min-w-0">

                                  <p className="font-medium text-gray-900">
                                    {user.full_name}
                                  </p>

                                  <p className="truncate text-sm text-gray-500">
                                    {user.email ||
                                      "Email nespecificat"}
                                  </p>

                                </div>

                              </div>

                            </td>

                            {/* TELEFON */}

                            <td className="px-6 py-4 text-sm text-gray-600">
                              {user.phone || "—"}
                            </td>

                            {/* ROL */}

                            <td className="px-6 py-4">

                              <span className="inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">

                                {getRoleLabel(
                                  user.role,
                                  user.teams?.name
                                )}

                              </span>

                            </td>

                            {/* ECHIPĂ */}

                            <td className="px-6 py-4 text-sm text-gray-600">
                              {user.teams?.name || "—"}
                            </td>

                            {/* STATUS */}

                            <td className="px-6 py-4">

                              {user.active ? (
                                <span className="inline-flex items-center gap-2 text-sm font-medium text-green-600">

                                  <span className="h-2 w-2 rounded-full bg-green-500" />

                                  Activ

                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-500">

                                  <span className="h-2 w-2 rounded-full bg-gray-400" />

                                  Inactiv

                                </span>
                              )}

                            </td>

                            {/* ACȚIUNI */}

                            <td className="px-6 py-4 text-right">

                              <button
                                type="button"
                                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                              >
                                Editează
                              </button>

                            </td>

                          </tr>
                        ))}

                      </tbody>

                    </table>

                  </div>

                  {/* MOBIL */}

                  <div className="divide-y divide-gray-100 md:hidden">

                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="p-5"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-200">

                              <span className="text-sm font-semibold text-gray-700">

                                {user.full_name
                                  .split(" ")
                                  .map(
                                    (name) =>
                                      name[0]
                                  )
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()}

                              </span>

                            </div>

                            <div className="min-w-0">

                              <p className="font-medium text-gray-900">
                                {user.full_name}
                              </p>

                              <p className="truncate text-sm text-gray-500">
                                {user.email ||
                                  "Email nespecificat"}
                              </p>

                            </div>

                          </div>

                          {user.active ? (
                            <span className="shrink-0 text-sm font-medium text-green-600">
                              Activ
                            </span>
                          ) : (
                            <span className="shrink-0 text-sm font-medium text-gray-500">
                              Inactiv
                            </span>
                          )}

                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">

                          <div className="rounded-lg bg-gray-50 p-3">

                            <p className="text-xs text-gray-500">
                              Rol
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                              {getRoleLabel(
                                user.role,
                                user.teams?.name
                              )}
                            </p>

                          </div>

                          <div className="rounded-lg bg-gray-50 p-3">

                            <p className="text-xs text-gray-500">
                              Echipă
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                              {user.teams?.name ||
                                "—"}
                            </p>

                          </div>

                        </div>

                        <button
                          type="button"
                          className="mt-4 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Editează utilizator
                        </button>

                      </div>
                    ))}

                  </div>

                </>
              )}

            </div>

            {/* ========================================
                PROFIL + APLICAȚIE
            ======================================== */}

            <div className="mt-6 grid gap-4 md:grid-cols-2">

              {/* PROFIL */}

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
                      value="Super Administrator"
                      readOnly
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none"
                    />

                  </div>

                </div>

              </div>

              {/* APLICAȚIE */}

              <div className="rounded-xl bg-white p-6 shadow-sm">

                <h2 className="font-semibold text-gray-900">
                  Aplicație
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Informații despre aplicație
                </p>

                <div className="mt-5 space-y-4">

                  <div className="rounded-lg bg-gray-50 p-4">

                    <p className="text-sm font-medium text-gray-900">
                      Nume aplicație
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Melitax Montări
                    </p>

                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">

                    <p className="text-sm font-medium text-gray-900">
                      Versiune
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      0.1.0
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* ========================================
                INFORMAȚIE
            ======================================== */}

            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">

              <p className="font-medium text-blue-900">
                Administrarea utilizatorilor
              </p>

              <p className="mt-1 text-sm text-blue-700">
                Utilizatorii sunt încărcați din profilurile aplicației, iar emailul este preluat securizat din Supabase Auth.
              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}