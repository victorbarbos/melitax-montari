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
  // ==================================================
  // UTILIZATORI
  // ==================================================

  const [users, setUsers] =
    useState<UserProfile[]>([]);

  const [teams, setTeams] =
    useState<Team[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==================================================
  // UTILIZATOR CURENT
  // ==================================================

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [currentUserRole, setCurrentUserRole] =
    useState<string | null>(null);

  const [loadingCurrentUser, setLoadingCurrentUser] =
    useState(true);

  // ==================================================
  // CREARE UTILIZATOR
  // ==================================================

  const [showAddUser, setShowAddUser] =
    useState(false);

  const [creatingUser, setCreatingUser] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  const [formSuccess, setFormSuccess] =
    useState("");

  const [newName, setNewName] =
    useState("");

  const [newPhone, setNewPhone] =
    useState("");

  const [newEmail, setNewEmail] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [newRole, setNewRole] =
    useState("personal_teren");

  const [newTeam, setNewTeam] =
    useState("");

  // ==================================================
  // EDITARE UTILIZATOR
  // ==================================================

  const [showEditUser, setShowEditUser] =
    useState(false);

  const [editingUser, setEditingUser] =
    useState<UserProfile | null>(null);

  const [editingName, setEditingName] =
    useState("");

  const [editingPhone, setEditingPhone] =
    useState("");

  const [editingRole, setEditingRole] =
    useState("");

  const [editingTeam, setEditingTeam] =
    useState("");

  const [editingActive, setEditingActive] =
    useState(true);

  const [savingUser, setSavingUser] =
    useState(false);

  const [editError, setEditError] =
    useState("");

  const [editSuccess, setEditSuccess] =
    useState("");

  // ==================================================
  // ÎNCĂRCARE UTILIZATORI
  // ==================================================

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/users",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        console.error(
          "LOAD USERS API ERROR:",
          result
        );

        setError(
          result.error ||
            "Nu am putut încărca utilizatorii."
        );

        setUsers([]);

        return;
      }

      setUsers(
        result.users || []
      );
    } catch (error) {
      console.error(
        "LOAD USERS ERROR:",
        error
      );

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
    } =
      await supabase
        .from("teams")
        .select(
          "id, name"
        )
        .order("name");

    if (error) {
      console.error(
        "LOAD TEAMS ERROR:",
        error
      );

      return;
    }

    setTeams(
      data || []
    );
  };

  // ==================================================
  // UTILIZATOR CURENT
  // ==================================================

  const loadCurrentUser = async () => {
    setLoadingCurrentUser(true);

    try {
      const {
        data,
        error,
      } =
        await supabase.auth.getUser();

      if (
        error ||
        !data.user
      ) {
        console.error(
          "CURRENT USER ERROR:",
          error
        );

        return;
      }

      setCurrentUserId(
        data.user.id
      );

      const {
        data: profile,
        error: profileError,
      } =
        await supabase
          .from("profiles")
          .select(
            "role, active"
          )
          .eq(
            "id",
            data.user.id
          )
          .single();

      if (
        profileError ||
        !profile
      ) {
        console.error(
          "CURRENT PROFILE ERROR:",
          profileError
        );

        return;
      }

      setCurrentUserRole(
        profile.role
      );
    } catch (error) {
      console.error(
        "LOAD CURRENT USER ERROR:",
        error
      );
    } finally {
      setLoadingCurrentUser(false);
    }
  };

  // ==================================================
  // INITIALIZARE
  // ==================================================

  useEffect(() => {
    loadUsers();
    loadTeams();
    loadCurrentUser();
  }, []);

  // ==================================================
  // RESET FORMULAR CREARE
  // ==================================================

  const resetForm = () => {
    setNewName("");
    setNewPhone("");
    setNewEmail("");
    setNewPassword("");
    setNewRole(
      "personal_teren"
    );
    setNewTeam("");
    setFormError("");
    setFormSuccess("");
  };

  // ==================================================
  // ÎNCHIDERE FORMULAR CREARE
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

  const handleCreateUser =
    async () => {
      setFormError("");
      setFormSuccess("");

      if (
        !newName.trim()
      ) {
        setFormError(
          "Numele complet este obligatoriu."
        );

        return;
      }

      if (
        !newEmail.trim()
      ) {
        setFormError(
          "Emailul este obligatoriu."
        );

        return;
      }

      if (
        newPassword.length < 8
      ) {
        setFormError(
          "Parola trebuie să conțină cel puțin 8 caractere."
        );

        return;
      }

      if (
        newRole ===
        "super_admin"
      ) {
        setFormError(
          "Super Administrator nu poate fi creat."
        );

        return;
      }

      setCreatingUser(true);

      try {
        const response =
          await fetch(
            "/api/admin/users",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                fullName:
                  newName.trim(),

                phone:
                  newPhone.trim(),

                email:
                  newEmail
                    .trim()
                    .toLowerCase(),

                password:
                  newPassword,

                role:
                  newRole,

                teamId:
                  newTeam ||
                  null,
              }),
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          setFormError(
            result.error ||
              "Utilizatorul nu a putut fi creat."
          );

          return;
        }

        setFormSuccess(
          "Utilizatorul a fost creat cu succes."
        );

        await loadUsers();

        setTimeout(() => {
          setShowAddUser(
            false
          );

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
        setCreatingUser(
          false
        );
      }
    };

  // ==================================================
  // DESCHIDE EDITARE
  // ==================================================

  const openEditUser = (
    user: UserProfile
  ) => {
    setEditingUser(user);

    setEditingName(
      user.full_name
    );

    setEditingPhone(
      user.phone || ""
    );

    setEditingRole(
      user.role
    );

    setEditingTeam(
      user.team_id || ""
    );

    setEditingActive(
      Boolean(user.active)
    );

    setEditError("");
    setEditSuccess("");

    setShowEditUser(
      true
    );
  };

  // ==================================================
  // ÎNCHIDE EDITARE
  // ==================================================

  const closeEditUser = () => {
    if (savingUser) {
      return;
    }

    setShowEditUser(
      false
    );

    setEditingUser(
      null
    );

    setEditingName("");
    setEditingPhone("");
    setEditingRole("");
    setEditingTeam("");
    setEditingActive(true);

    setEditError("");
    setEditSuccess("");
  };

  // ==================================================
  // SALVARE EDITARE
  // ==================================================

  const handleSaveUser =
    async () => {
      if (!editingUser) {
        return;
      }

      setEditError("");
      setEditSuccess("");

      // ----------------------------------------------
      // VALORI ORIGINALE
      // ----------------------------------------------

      const originalName =
        editingUser.full_name;

      const originalPhone =
        editingUser.phone ||
        "";

      const originalRole =
        editingUser.role;

      const originalTeam =
        editingUser.team_id ||
        "";

      const originalActive =
        Boolean(
          editingUser.active
        );

      // ----------------------------------------------
      // VALORI NOI
      // ----------------------------------------------

      const newNameValue =
        editingName.trim();

      const newPhoneValue =
        editingPhone.trim();

      const newRoleValue =
        editingRole;

      const newTeamValue =
        editingTeam;

      const newActiveValue =
        Boolean(
          editingActive
        );

      // ----------------------------------------------
      // VERIFICĂM DACĂ EXISTĂ MODIFICĂRI
      // ----------------------------------------------

      const hasChanges =
        newNameValue !==
          originalName ||
        newPhoneValue !==
          originalPhone ||
        newRoleValue !==
          originalRole ||
        newTeamValue !==
          originalTeam ||
        newActiveValue !==
          originalActive;

      // ----------------------------------------------
      // IMPORTANT:
      // dacă NU există modificări,
      // NU verificăm permisiunile de modificare.
      // ----------------------------------------------

      if (!hasChanges) {
        setEditSuccess(
          "Nu există modificări."
        );

        return;
      }

      // ----------------------------------------------
      // VALIDARE NUME
      // ----------------------------------------------

      if (!newNameValue) {
        setEditError(
          "Numele complet este obligatoriu."
        );

        return;
      }

      // ----------------------------------------------
      // ADMINISTRATOR → NU POATE MODIFICA
      // SUPER ADMINISTRATOR
      // ----------------------------------------------

      if (
        currentUserRole ===
          "administrator" &&
        editingUser.role ===
          "super_admin"
      ) {
        setEditError(
          "Administratorii nu pot modifica Super Administratorul."
        );

        return;
      }

      // ----------------------------------------------
      // ADMINISTRATOR → NU POATE SCHIMBA ROLUL
      // ----------------------------------------------

      if (
        currentUserRole ===
          "administrator" &&
        newRoleValue !==
          originalRole
      ) {
        setEditError(
          "Administratorii nu pot modifica rolurile utilizatorilor."
        );

        return;
      }

      // ----------------------------------------------
      // DOAR SUPER ADMIN → STATUS
      // ----------------------------------------------

      if (
        currentUserRole !==
          "super_admin" &&
        newActiveValue !==
          originalActive
      ) {
        setEditError(
          "Doar Super Administratorul poate modifica statusul Activ/Inactiv."
        );

        return;
      }

      // ----------------------------------------------
      // NIMENI NU POATE CREA SUPER ADMIN
      // PRIN MODIFICAREA UNUI USER
      // ----------------------------------------------

      if (
        newRoleValue ===
          "super_admin" &&
        originalRole !==
          "super_admin"
      ) {
        setEditError(
          "Super Administrator nu poate fi atribuit altui utilizator."
        );

        return;
      }

      // ----------------------------------------------
      // SUPER ADMIN NU ÎȘI POATE SCHIMBA ROLUL
      // ----------------------------------------------

      if (
        editingUser.id ===
          currentUserId &&
        originalRole ===
          "super_admin" &&
        newRoleValue !==
          "super_admin"
      ) {
        setEditError(
          "Nu îți poți schimba propriul rol de Super Administrator."
        );

        return;
      }

      // ----------------------------------------------
      // SUPER ADMIN NU SE POATE DEZACTIVA
      // ----------------------------------------------

      if (
        editingUser.id ===
          currentUserId &&
        originalRole ===
          "super_admin" &&
        newActiveValue ===
          false
      ) {
        setEditError(
          "Nu îți poți dezactiva propriul cont de Super Administrator."
        );

        return;
      }

      // ----------------------------------------------
      // SALVARE
      // ----------------------------------------------

      setSavingUser(
        true
      );

      try {
        const response =
          await fetch(
            "/api/admin/users",
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                id:
                  editingUser.id,

                fullName:
                  newNameValue,

                phone:
                  newPhoneValue,

                role:
                  newRoleValue,

                teamId:
                  newTeamValue ||
                  null,

                active:
                  newActiveValue,
              }),
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          setEditError(
            result.error ||
              "Utilizatorul nu a putut fi modificat."
          );

          return;
        }

        setEditSuccess(
          "Utilizatorul a fost modificat cu succes."
        );

        await loadUsers();

        setTimeout(() => {
          closeEditUser();
        }, 800);
      } catch (error) {
        console.error(
          "UPDATE USER FRONTEND ERROR:",
          error
        );

        setEditError(
          "Nu am putut comunica cu serverul."
        );
      } finally {
        setSavingUser(
          false
        );
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

            {/* ==================================================
                TITLU
            ================================================== */}

            <div className="rounded-xl bg-white p-6 shadow-sm">

              <h1 className="text-2xl font-bold text-gray-900">
                Setări
              </h1>

              <p className="mt-1 text-gray-500">
                Configurarea aplicației
              </p>

            </div>

            {/* ==================================================
                UTILIZATORI
            ================================================== */}

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
                    setShowAddUser(
                      true
                    );

                    setFormError(
                      ""
                    );

                    setFormSuccess(
                      ""
                    );
                  }}
                  className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  + Adaugă utilizator
                </button>

              </div>

              {/* ==================================================
                  FORMULAR CREARE
              ================================================== */}

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
                        onClick={
                          closeAddUser
                        }
                        disabled={
                          creatingUser
                        }
                        className="rounded-lg px-2 py-1 text-2xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
                      >
                        ×
                      </button>

                    </div>

                    <div className="grid gap-5 md:grid-cols-2">

                      <div>

                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Nume complet
                        </label>

                        <input
                          type="text"
                          value={
                            newName
                          }
                          onChange={(event) =>
                            setNewName(
                              event.target.value
                            )
                          }
                          disabled={
                            creatingUser
                          }
                          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-100"
                        />

                      </div>

                      <div>

                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Telefon
                        </label>

                        <input
                          type="tel"
                          value={
                            newPhone
                          }
                          onChange={(event) =>
                            setNewPhone(
                              event.target.value
                            )
                          }
                          disabled={
                            creatingUser
                          }
                          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-100"
                        />

                      </div>

                      <div>

                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Email
                        </label>

                        <input
                          type="email"
                          value={
                            newEmail
                          }
                          onChange={(event) =>
                            setNewEmail(
                              event.target.value
                            )
                          }
                          disabled={
                            creatingUser
                          }
                          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-100"
                        />

                      </div>

                      <div>

                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Parolă temporară
                        </label>

                        <input
                          type="password"
                          value={
                            newPassword
                          }
                          onChange={(event) =>
                            setNewPassword(
                              event.target.value
                            )
                          }
                          disabled={
                            creatingUser
                          }
                          placeholder="Minimum 8 caractere"
                          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-100"
                        />

                      </div>

                      <div>

                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Rol
                        </label>

                        <select
                          value={
                            newRole
                          }
                          onChange={(event) =>
                            setNewRole(
                              event.target.value
                            )
                          }
                          disabled={
                            creatingUser
                          }
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none disabled:bg-gray-100"
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

                      <div>

                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Echipă
                        </label>

                        <select
                          value={
                            newTeam
                          }
                          onChange={(event) =>
                            setNewTeam(
                              event.target.value
                            )
                          }
                          disabled={
                            creatingUser
                          }
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none disabled:bg-gray-100"
                        >

                          <option value="">
                            Fără echipă
                          </option>

                          {teams.map(
                            (team) => (
                              <option
                                key={
                                  team.id
                                }
                                value={
                                  team.id
                                }
                              >
                                {
                                  team.name
                                }
                              </option>
                            )
                          )}

                        </select>

                      </div>

                    </div>

                    {formError && (
                      <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                        {
                          formError
                        }
                      </div>
                    )}

                    {formSuccess && (
                      <div className="mt-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                        {
                          formSuccess
                        }
                      </div>
                    )}

                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                      <button
                        type="button"
                        onClick={
                          closeAddUser
                        }
                        disabled={
                          creatingUser
                        }
                        className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Anulează
                      </button>

                      <button
                        type="button"
                        onClick={
                          handleCreateUser
                        }
                        disabled={
                          creatingUser
                        }
                        className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                      >
                        {creatingUser
                          ? "Se creează..."
                          : "Creează utilizator"}
                      </button>

                    </div>

                  </div>

                </div>
              )}

              {/* ==================================================
                  FORMULAR EDITARE
              ================================================== */}

              {showEditUser &&
                editingUser && (
                  <div className="border-b border-gray-100 bg-gray-50 p-5 sm:p-6">

                    <div className="rounded-xl bg-white p-5 shadow-sm sm:p-6">

                      <div className="mb-6 flex items-start justify-between">

                        <div>

                          <h3 className="text-lg font-bold text-gray-900">
                            Editează utilizator
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            Modifică datele utilizatorului.
                          </p>

                        </div>

                        <button
                          type="button"
                          onClick={
                            closeEditUser
                          }
                          disabled={
                            savingUser
                          }
                          className="rounded-lg px-2 py-1 text-2xl text-gray-500 hover:bg-gray-100"
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
                            value={
                              editingName
                            }
                            onChange={(event) =>
                              setEditingName(
                                event.target.value
                              )
                            }
                            disabled={
                              savingUser
                            }
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                          />

                        </div>

                        {/* TELEFON */}

                        <div>

                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Telefon
                          </label>

                          <input
                            type="tel"
                            value={
                              editingPhone
                            }
                            onChange={(event) =>
                              setEditingPhone(
                                event.target.value
                              )
                            }
                            disabled={
                              savingUser
                            }
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                          />

                        </div>

                        {/* EMAIL */}

                        <div>

                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Email
                          </label>

                          <input
                            type="email"
                            value={
                              editingUser.email ||
                              ""
                            }
                            readOnly
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500"
                          />

                          <p className="mt-1 text-xs text-gray-400">
                            Emailul nu se modifică în acest pas.
                          </p>

                        </div>

                        {/* ROL */}

                        <div>

                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Rol
                          </label>

                          <select
                            value={
                              editingRole
                            }
                            onChange={(event) =>
                              setEditingRole(
                                event.target.value
                              )
                            }
                            disabled={
                              savingUser ||
                              loadingCurrentUser ||
                              currentUserRole !==
                                "super_admin" ||
                              editingUser.role ===
                                "super_admin"
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none disabled:bg-gray-100"
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

                            <option value="super_admin">
                              Super Administrator
                            </option>

                          </select>

                          {currentUserRole !==
                            "super_admin" && (
                            <p className="mt-1 text-xs text-gray-400">
                              Doar Super Administratorul poate modifica rolurile.
                            </p>
                          )}

                        </div>

                        {/* ECHIPĂ */}

                        <div>

                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Echipă
                          </label>

                          <select
                            value={
                              editingTeam
                            }
                            onChange={(event) =>
                              setEditingTeam(
                                event.target.value
                              )
                            }
                            disabled={
                              savingUser
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none disabled:bg-gray-100"
                          >

                            <option value="">
                              Fără echipă
                            </option>

                            {teams.map(
                              (team) => (
                                <option
                                  key={
                                    team.id
                                  }
                                  value={
                                    team.id
                                  }
                                >
                                  {
                                    team.name
                                  }
                                </option>
                              )
                            )}

                          </select>

                        </div>

                        {/* STATUS */}

                        <div>

                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Status cont
                          </label>

                          <select
                            value={
                              editingActive
                                ? "active"
                                : "inactive"
                            }
                            onChange={(event) =>
                              setEditingActive(
                                event.target.value ===
                                  "active"
                              )
                            }
                            disabled={
                              savingUser ||
                              loadingCurrentUser ||
                              currentUserRole !==
                                "super_admin" ||
                              editingUser.id ===
                                currentUserId
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none disabled:bg-gray-100"
                          >

                            <option value="active">
                              Activ
                            </option>

                            <option value="inactive">
                              Inactiv
                            </option>

                          </select>

                          {currentUserRole !==
                            "super_admin" && (
                            <p className="mt-1 text-xs text-gray-400">
                              Doar Super Administratorul poate modifica acest status.
                            </p>
                          )}

                          {editingUser.id ===
                            currentUserId && (
                            <p className="mt-1 text-xs text-gray-400">
                              Contul tău nu poate fi dezactivat.
                            </p>
                          )}

                        </div>

                      </div>

                      {editError && (
                        <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                          {
                            editError
                          }
                        </div>
                      )}

                      {editSuccess && (
                        <div className="mt-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                          {
                            editSuccess
                          }
                        </div>
                      )}

                      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                        <button
                          type="button"
                          onClick={
                            closeEditUser
                          }
                          disabled={
                            savingUser
                          }
                          className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Anulează
                        </button>

                        <button
                          type="button"
                          onClick={
                            handleSaveUser
                          }
                          disabled={
                            savingUser
                          }
                          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                        >
                          {savingUser
                            ? "Se salvează..."
                            : "Salvează modificările"}
                        </button>

                      </div>

                    </div>

                  </div>
                )}

              {/* ==================================================
                  LOADING
              ================================================== */}

              {loading && (
                <div className="p-8 text-center text-sm text-gray-500">
                  Se încarcă utilizatorii...
                </div>
              )}

              {/* ==================================================
                  EROARE
              ================================================== */}

              {!loading &&
                error && (
                  <div className="p-6">

                    <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                      {error}
                    </div>

                    <button
                      type="button"
                      onClick={
                        loadUsers
                      }
                      className="mt-4 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Încearcă din nou
                    </button>

                  </div>
                )}

              {/* ==================================================
                  LISTA DESKTOP
              ================================================== */}

              {!loading &&
                !error && (
                  <>

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

                          {users.map(
                            (user) => (
                              <tr
                                key={
                                  user.id
                                }
                                className="border-b border-gray-100 last:border-0"
                              >

                                <td className="px-6 py-4">

                                  <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">

                                      <span className="text-sm font-semibold text-gray-700">

                                        {user.full_name
                                          .split(
                                            " "
                                          )
                                          .map(
                                            (name) =>
                                              name[0]
                                          )
                                          .slice(
                                            0,
                                            2
                                          )
                                          .join(
                                            ""
                                          )
                                          .toUpperCase()}

                                      </span>

                                    </div>

                                    <div className="min-w-0">

                                      <p className="font-medium text-gray-900">
                                        {
                                          user.full_name
                                        }
                                      </p>

                                      <p className="truncate text-sm text-gray-500">
                                        {user.email ||
                                          "Email nespecificat"}
                                      </p>

                                    </div>

                                  </div>

                                </td>

                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {user.phone ||
                                    "—"}
                                </td>

                                <td className="px-6 py-4">

                                  <span className="inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                                    {getRoleLabel(
                                      user.role,
                                      user
                                        .teams
                                        ?.name
                                    )}
                                  </span>

                                </td>

                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {user
                                    .teams
                                    ?.name ||
                                    "—"}
                                </td>

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

                                <td className="px-6 py-4 text-right">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEditUser(
                                        user
                                      )
                                    }
                                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                  >
                                    Editează
                                  </button>

                                </td>

                              </tr>
                            )
                          )}

                        </tbody>

                      </table>

                    </div>

                    {/* ==================================================
                        LISTA MOBIL
                    ================================================== */}

                    <div className="divide-y divide-gray-100 md:hidden">

                      {users.map(
                        (user) => (
                          <div
                            key={
                              user.id
                            }
                            className="p-5"
                          >

                            <div className="flex items-start justify-between gap-3">

                              <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-200">

                                  <span className="text-sm font-semibold text-gray-700">

                                    {user.full_name
                                      .split(
                                        " "
                                      )
                                      .map(
                                        (name) =>
                                          name[0]
                                      )
                                      .slice(
                                        0,
                                        2
                                      )
                                      .join(
                                        ""
                                      )
                                      .toUpperCase()}

                                  </span>

                                </div>

                                <div className="min-w-0">

                                  <p className="font-medium text-gray-900">
                                    {
                                      user.full_name
                                    }
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
                                    user
                                      .teams
                                      ?.name
                                  )}
                                </p>

                              </div>

                              <div className="rounded-lg bg-gray-50 p-3">

                                <p className="text-xs text-gray-500">
                                  Echipă
                                </p>

                                <p className="mt-1 text-sm font-medium text-gray-900">
                                  {user
                                    .teams
                                    ?.name ||
                                    "—"}
                                </p>

                              </div>

                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                openEditUser(
                                  user
                                )
                              }
                              className="mt-4 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              Editează utilizator
                            </button>

                          </div>
                        )
                      )}

                    </div>

                  </>
                )}

            </div>

            {/* ==================================================
                PROFIL + APLICAȚIE
            ================================================== */}

            <div className="mt-6 grid gap-4 md:grid-cols-2">

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
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700"
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Rol
                    </label>

                    <input
                      type="text"
                      value={
                        currentUserRole ===
                        "super_admin"
                          ? "Super Administrator"
                          : currentUserRole ===
                            "administrator"
                          ? "Administrator"
                          : currentUserRole ||
                            "—"
                      }
                      readOnly
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700"
                    />

                  </div>

                </div>

              </div>

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

            {/* ==================================================
                INFORMAȚIE
            ================================================== */}

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