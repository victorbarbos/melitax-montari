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
  avatar_url?: string | null;

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

const getInitials = (name: string) => {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"
  );
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

  const [currentUserProfile, setCurrentUserProfile] =
    useState<UserProfile | null>(null);

  const [loadingCurrentUser, setLoadingCurrentUser] =
    useState(true);

  // ==================================================
  // PROFIL PERSONAL
  // ==================================================

  const [profilePhone, setProfilePhone] =
    useState("");

  const [profileAvatarPath, setProfileAvatarPath] =
    useState<string | null>(null);

  const [profileAvatarUrl, setProfileAvatarUrl] =
    useState<string | null>(null);

  const [selectedAvatarFile, setSelectedAvatarFile] =
    useState<File | null>(null);

  const [avatarPreviewUrl, setAvatarPreviewUrl] =
    useState<string | null>(null);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [profileError, setProfileError] =
    useState("");

  const [profileSuccess, setProfileSuccess] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [savingPassword, setSavingPassword] =
    useState(false);

  const [passwordError, setPasswordError] =
    useState("");

  const [passwordSuccess, setPasswordSuccess] =
    useState("");

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

  const [newPasswordCreate, setNewPasswordCreate] =
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

  // Parolă temporară pentru alt utilizator - vizibilă doar Super Administratorului
  const [editingTemporaryPassword, setEditingTemporaryPassword] =
    useState("");

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
  // URL POZĂ PROFIL
  // ==================================================

  const loadAvatarUrl = async (
    avatarPath: string | null
  ) => {
    if (!avatarPath) {
      setProfileAvatarUrl(null);
      return;
    }

    const {
      data,
      error,
    } =
      await supabase.storage
        .from("avatars")
        .createSignedUrl(
          avatarPath,
          60 * 60
        );

    if (error) {
      console.error(
        "LOAD AVATAR URL ERROR:",
        error
      );

      setProfileAvatarUrl(null);
      return;
    }

    setProfileAvatarUrl(
      data?.signedUrl || null
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

      const userId =
        data.user.id;

      setCurrentUserId(
        userId
      );

      const {
        data: profile,
        error: profileError,
      } =
        await supabase
          .from("profiles")
          .select(
            `
              id,
              full_name,
              phone,
              role,
              team_id,
              active,
              avatar_url
            `
          )
          .eq(
            "id",
            userId
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

      const profileTeam =
        teams.find(
          (team) =>
            team.id ===
            profile.team_id
        );

      const profileWithTeam: UserProfile =
        {
          ...profile,
          email:
            data.user.email ||
            null,
          created_at: "",
          teams:
            profileTeam
              ? {
                  name:
                    profileTeam.name,
                }
              : null,
        };

      setCurrentUserProfile(
        profileWithTeam
      );

      setCurrentUserRole(
        profile.role
      );

      setProfilePhone(
        profile.phone || ""
      );

      setProfileAvatarPath(
        profile.avatar_url || null
      );

      await loadAvatarUrl(
        profile.avatar_url || null
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
  }, []);

  useEffect(() => {
    if (!loadingCurrentUser) {
      return;
    }

    if (teams.length === 0) {
      return;
    }

    loadCurrentUser();
  }, [teams]);

  // ==================================================
  // RESET FORMULAR CREARE
  // ==================================================

  const resetForm = () => {
    setNewName("");
    setNewPhone("");
    setNewEmail("");
    setNewPasswordCreate("");
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
        newPasswordCreate.length < 8
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
                  newPasswordCreate,

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

    setEditingTemporaryPassword("");

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
    setEditingTemporaryPassword("");

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

      const temporaryPassword =
        editingTemporaryPassword.trim();

      const hasTemporaryPassword =
        temporaryPassword.length > 0;

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
          originalActive ||
        hasTemporaryPassword;

      if (!hasChanges) {
        setEditSuccess(
          "Nu există modificări."
        );

        return;
      }

      if (!newNameValue) {
        setEditError(
          "Numele complet este obligatoriu."
        );

        return;
      }

      if (hasTemporaryPassword) {
        if (currentUserRole !== "super_admin") {
          setEditError(
            "Doar Super Administratorul poate seta o parolă temporară."
          );

          return;
        }

        if (editingUser.id === currentUserId) {
          setEditError(
            "Parola temporară poate fi setată doar pentru alt utilizator."
          );

          return;
        }

        if (temporaryPassword.length < 8) {
          setEditError(
            "Parola temporară trebuie să conțină cel puțin 8 caractere."
          );

          return;
        }
      }

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

                temporaryPassword:
                  hasTemporaryPassword
                    ? temporaryPassword
                    : "",
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
  // SELECTARE POZĂ
  // ==================================================

  const handleAvatarChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setProfileError("");
    setProfileSuccess("");

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setProfileError(
        "Te rog selectează o imagine."
      );

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setProfileError(
        "Imaginea nu poate depăși 5 MB."
      );

      return;
    }

    if (
      avatarPreviewUrl
    ) {
      URL.revokeObjectURL(
        avatarPreviewUrl
      );
    }

    const preview =
      URL.createObjectURL(
        file
      );

    setSelectedAvatarFile(
      file
    );

    setAvatarPreviewUrl(
      preview
    );
  };

  // ==================================================
  // SALVARE PROFIL
  // ==================================================

  const handleSaveProfile =
    async () => {
      if (!currentUserId) {
        setProfileError(
          "Utilizatorul nu este autentificat."
        );

        return;
      }

      setProfileError("");
      setProfileSuccess("");

      setSavingProfile(
        true
      );

      try {
        let avatarPath =
          profileAvatarPath;

        // ----------------------------------------------
        // UPLOAD POZĂ
        // ----------------------------------------------

        if (
          selectedAvatarFile
        ) {
          avatarPath =
            `${currentUserId}/avatar`;

          const {
            error: uploadError,
          } =
            await supabase.storage
              .from("avatars")
              .upload(
                avatarPath,
                selectedAvatarFile,
                {
                  upsert: true,
                  contentType:
                    selectedAvatarFile.type,
                  cacheControl:
                    "3600",
                }
              );

          if (uploadError) {
            console.error(
              "AVATAR UPLOAD ERROR:",
              uploadError
            );

            throw new Error(
              "Poza nu a putut fi încărcată."
            );
          }
        }

        // ----------------------------------------------
        // UPDATE PROFIL
        // ----------------------------------------------

        const {
          error: profileUpdateError,
        } =
          await supabase
            .from("profiles")
            .update({
              phone:
                profilePhone.trim() ||
                null,

              avatar_url:
                avatarPath,
            })
            .eq(
              "id",
              currentUserId
            );

        if (profileUpdateError) {
          console.error(
            "PROFILE UPDATE ERROR:",
            profileUpdateError
          );

          throw new Error(
            profileUpdateError.message ||
              "Profilul nu a putut fi salvat."
          );
        }

        // UPDATE-ul a reușit.
        // Nu folosim .select().single() aici deoarece
        // RLS poate permite UPDATE, dar poate bloca
        // returnarea rândului actualizat.
        const updatedPhone =
          profilePhone.trim() ||
          "";

        const updatedProfile = {
          ...(currentUserProfile || {
            id: currentUserId,
            full_name: "Utilizator",
            email: null,
            phone: null,
            role: "personal_teren",
            team_id: null,
            active: true,
            created_at: "",
            teams: null,
          }),

          phone:
            updatedPhone,

          avatar_url:
            avatarPath,
        };

        setCurrentUserProfile(
          updatedProfile
        );

        setProfilePhone(
          updatedPhone
        );

        setProfileAvatarPath(
          avatarPath ||
            null
        );

        await loadAvatarUrl(
          avatarPath ||
            null
        );

        if (
          avatarPreviewUrl
        ) {
          URL.revokeObjectURL(
            avatarPreviewUrl
          );
        }

        setSelectedAvatarFile(
          null
        );

        setAvatarPreviewUrl(
          null
        );

        setProfileSuccess(
          "Profilul a fost salvat cu succes."
        );
      } catch (error) {
        console.error(
          "SAVE PROFILE ERROR:",
          error
        );

        setProfileError(
          error instanceof Error
            ? error.message
            : "Profilul nu a putut fi salvat."
        );
      } finally {
        setSavingProfile(
          false
        );
      }
    };

  // ==================================================
  // SCHIMBARE PAROLĂ
  // ==================================================

  const handleChangePassword =
    async () => {
      setPasswordError("");
      setPasswordSuccess("");

      if (
        newPassword.length < 8
      ) {
        setPasswordError(
          "Parola trebuie să conțină cel puțin 8 caractere."
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setPasswordError(
          "Parolele nu coincid."
        );

        return;
      }

      setSavingPassword(
        true
      );

      try {
        const {
          error,
        } =
          await supabase.auth.updateUser(
            {
              password:
                newPassword,
            }
          );

        if (error) {
          console.error(
            "PASSWORD UPDATE ERROR:",
            error
          );

          setPasswordError(
            error.message ||
              "Parola nu a putut fi schimbată."
          );

          return;
        }

        setNewPassword("");
        setConfirmPassword("");

        setPasswordSuccess(
          "Parola a fost schimbată cu succes."
        );
      } catch (error) {
        console.error(
          "CHANGE PASSWORD ERROR:",
          error
        );

        setPasswordError(
          "Parola nu a putut fi schimbată."
        );
      } finally {
        setSavingPassword(
          false
        );
      }
    };

  // ==================================================
  // RENDER
  // ==================================================

  const profileName =
    currentUserProfile?.full_name ||
    "Utilizator";

  const profileRole =
    currentUserProfile
      ? getRoleLabel(
          currentUserProfile.role,
          currentUserProfile.teams?.name
        )
      : "—";

  const profileTeam =
    currentUserProfile?.teams?.name ||
    "Fără echipă";

  const displayedAvatar =
    avatarPreviewUrl ||
    profileAvatarUrl;

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
                            newPasswordCreate
                          }
                          onChange={(event) =>
                            setNewPasswordCreate(
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

                        {/* PAROLĂ TEMPORARĂ - DOAR SUPER ADMINISTRATOR PENTRU ALT UTILIZATOR */}

                        {currentUserRole === "super_admin" &&
                          editingUser.id !== currentUserId && (
                            <div className="md:col-span-2">

                              <label className="mb-2 block text-sm font-medium text-gray-700">
                                Parolă temporară
                              </label>

                              <input
                                type="password"
                                value={editingTemporaryPassword}
                                onChange={(event) =>
                                  setEditingTemporaryPassword(
                                    event.target.value
                                  )
                                }
                                disabled={savingUser}
                                placeholder="Minimum 8 caractere"
                                autoComplete="new-password"
                                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-100"
                              />

                              <p className="mt-1 text-xs text-gray-400">
                                Parola va fi temporară și utilizatorul va trebui să o schimbe la prima autentificare.
                              </p>

                            </div>
                          )}

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

                                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-200">

                                      {user.avatar_url ? (
                                        <div className="flex h-full w-full items-center justify-center bg-gray-200">
                                          <span className="text-sm font-semibold text-gray-700">
                                            {getInitials(
                                              user.full_name
                                            )}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-sm font-semibold text-gray-700">
                                          {getInitials(
                                            user.full_name
                                          )}
                                        </span>
                                      )}

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

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">

                                  <span className="text-sm font-semibold text-gray-700">
                                    {getInitials(
                                      user.full_name
                                    )}
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

            <div className="mt-6 grid gap-4 lg:grid-cols-2">

              {/* ==================================================
                  PROFIL PERSONAL
              ================================================== */}

              <div className="rounded-xl bg-white p-6 shadow-sm">

                <h2 className="font-semibold text-gray-900">
                  Profilul meu
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Datele tale personale și fotografia de profil
                </p>

                {loadingCurrentUser ? (
                  <div className="mt-6 rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-500">
                    Se încarcă profilul...
                  </div>
                ) : (
                  <>

                    {/* POZĂ */}

                    <div className="mt-6 flex flex-col items-center sm:flex-row sm:items-center sm:gap-5">

                      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">

                        {displayedAvatar ? (
                          <img
                            src={
                              displayedAvatar
                            }
                            alt="Poza de profil"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-semibold text-gray-600">
                            {getInitials(
                              profileName
                            )}
                          </span>
                        )}

                      </div>

                      <div className="mt-4 text-center sm:mt-0 sm:text-left">

                        <label className="inline-flex cursor-pointer rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">

                          Schimbă poza

                          <input
                            type="file"
                            accept="image/*"
                            onChange={
                              handleAvatarChange
                            }
                            className="hidden"
                          />

                        </label>

                        <p className="mt-2 text-xs text-gray-400">
                          JPG, PNG, WEBP — maximum 5 MB
                        </p>

                      </div>

                    </div>

                    {/* NUME */}

                    <div className="mt-6">

                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Nume
                      </label>

                      <input
                        type="text"
                        value={
                          profileName
                        }
                        readOnly
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700"
                      />

                      <p className="mt-1 text-xs text-gray-400">
                        Numele poate fi modificat doar de administrator.
                      </p>

                    </div>

                    {/* TELEFON */}

                    <div className="mt-5">

                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Telefon
                      </label>

                      <input
                        type="tel"
                        value={
                          profilePhone
                        }
                        onChange={(event) =>
                          setProfilePhone(
                            event.target.value
                          )
                        }
                        disabled={
                          savingProfile
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-100"
                      />

                    </div>

                    {/* ROL */}

                    <div className="mt-5">

                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Rol
                      </label>

                      <input
                        type="text"
                        value={
                          profileRole
                        }
                        readOnly
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700"
                      />

                    </div>

                    {/* ECHIPĂ */}

                    <div className="mt-5">

                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Echipă
                      </label>

                      <input
                        type="text"
                        value={
                          profileTeam
                        }
                        readOnly
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700"
                      />

                    </div>

                    {profileError && (
                      <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                        {
                          profileError
                        }
                      </div>
                    )}

                    {profileSuccess && (
                      <div className="mt-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                        {
                          profileSuccess
                        }
                      </div>
                    )}

                    <div className="mt-6 flex justify-end">

                      <button
                        type="button"
                        onClick={
                          handleSaveProfile
                        }
                        disabled={
                          savingProfile ||
                          loadingCurrentUser
                        }
                        className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                      >
                        {savingProfile
                          ? "Se salvează..."
                          : "Salvează profilul"}
                      </button>

                    </div>

                  </>
                )}

              </div>

              {/* ==================================================
                  PAROLĂ + APLICAȚIE
              ================================================== */}

              <div className="space-y-4">

                {/* SCHIMBARE PAROLĂ */}

                <div className="rounded-xl bg-white p-6 shadow-sm">

                  <h2 className="font-semibold text-gray-900">
                    Securitate
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Schimbarea parolei contului tău
                  </p>

                  <div className="mt-5 space-y-4">

                    <div>

                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Parolă nouă
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
                          savingPassword
                        }
                        placeholder="Minimum 8 caractere"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-100"
                      />

                    </div>

                    <div>

                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Confirmă parola
                      </label>

                      <input
                        type="password"
                        value={
                          confirmPassword
                        }
                        onChange={(event) =>
                          setConfirmPassword(
                            event.target.value
                          )
                        }
                        disabled={
                          savingPassword
                        }
                        placeholder="Repetă parola"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-100"
                      />

                    </div>

                    {passwordError && (
                      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                        {
                          passwordError
                        }
                      </div>
                    )}

                    {passwordSuccess && (
                      <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                        {
                          passwordSuccess
                        }
                      </div>
                    )}

                    <div className="flex justify-end">

                      <button
                        type="button"
                        onClick={
                          handleChangePassword
                        }
                        disabled={
                          savingPassword
                        }
                        className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                      >
                        {savingPassword
                          ? "Se schimbă..."
                          : "Schimbă parola"}
                      </button>

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