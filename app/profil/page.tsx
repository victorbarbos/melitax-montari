"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string | null;
  team_id: string | null;
  avatar_url: string | null;
  active: boolean;
};

type Team = {
  id: string;
  name: string;
};

function getInitials(name: string | null) {
  if (!name?.trim()) {
    return "U";
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

function getRoleLabel(role: string | null) {
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

  if (role === "personal_teren") {
    return "Personal teren";
  }

  return role || "Utilizator";
}

export default function ProfilPage() {
  const router = useRouter();

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [teams, setTeams] =
    useState<Team[]>([]);

  const [avatarUrl, setAvatarUrl] =
    useState<string | null>(null);

  const [profilePhone, setProfilePhone] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  const [passwordSuccess, setPasswordSuccess] =
    useState("");

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.replace("/login");
          return;
        }

        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(
            "id, full_name, phone, role, team_id, avatar_url, active"
          )
          .eq("id", user.id)
          .single();

        if (profileError || !profileData) {
          console.error(
            "PROFILE LOAD ERROR:",
            profileError
          );

          setError(
            profileError?.message ||
              "Profilul nu a putut fi încărcat."
          );

          return;
        }

        setProfile(profileData);
        setProfilePhone(
          profileData.phone || ""
        );

        const {
          data: teamsData,
          error: teamsError,
        } = await supabase
          .from("teams")
          .select("id, name")
          .order("name");

        if (teamsError) {
          console.error(
            "TEAMS LOAD ERROR:",
            teamsError
          );
        } else {
          setTeams(
            teamsData || []
          );
        }

        if (profileData.avatar_url) {
          const {
            data: signedUrlData,
            error: signedUrlError,
          } = await supabase.storage
            .from("avatars")
            .createSignedUrl(
              profileData.avatar_url,
              3600
            );

          if (signedUrlError) {
            console.error(
              "AVATAR LOAD ERROR:",
              signedUrlError
            );
          } else {
            setAvatarUrl(
              signedUrlData?.signedUrl ||
                null
            );
          }
        }
      } catch (loadError) {
        console.error(
          "PROFILE PAGE ERROR:",
          loadError
        );

        setError(
          "A apărut o eroare la încărcarea profilului."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Poza trebuie să fie JPG, PNG sau WEBP."
      );

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Poza nu poate depăși 5 MB."
      );

      return;
    }

    setError("");
    setSuccess("");
    setSelectedFile(file);
  };

  const handleSaveProfile = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!profile) {
      return;
    }

    setError("");
    setSuccess("");
    setSavingProfile(true);

    try {
      let avatarPath =
        profile.avatar_url;

      if (selectedFile) {
        const extension =
          selectedFile.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        const filePath =
          `${profile.id}/${Date.now()}.${extension}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("avatars")
          .upload(
            filePath,
            selectedFile,
            {
              cacheControl: "3600",
              upsert: true,
              contentType:
                selectedFile.type,
            }
          );

        if (uploadError) {
          console.error(
            "AVATAR UPLOAD ERROR:",
            uploadError
          );

          throw new Error(
            uploadError.message ||
              "Poza nu a putut fi încărcată."
          );
        }

        avatarPath = filePath;
      }

      const {
        error: updateError,
      } = await supabase
        .from("profiles")
        .update({
          phone:
            profilePhone.trim() ||
            null,
          avatar_url:
            avatarPath || null,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          profile.id
        );

      if (updateError) {
        console.error(
          "PROFILE UPDATE ERROR:",
          updateError
        );

        throw new Error(
          updateError.message ||
            "Profilul nu a putut fi salvat."
        );
      }

      const {
        data: freshProfile,
        error: freshProfileError,
      } = await supabase
        .from("profiles")
        .select(
          "id, full_name, phone, role, team_id, avatar_url, active"
        )
        .eq(
          "id",
          profile.id
        )
        .single();

      if (
        freshProfileError ||
        !freshProfile
      ) {
        throw new Error(
          "Profilul a fost salvat, dar nu a putut fi reîncărcat."
        );
      }

      setProfile(
        freshProfile
      );

      setProfilePhone(
        freshProfile.phone ||
          ""
      );

      setSelectedFile(null);

      if (freshProfile.avatar_url) {
        const {
          data: signedUrlData,
          error: signedUrlError,
        } = await supabase.storage
          .from("avatars")
          .createSignedUrl(
            freshProfile.avatar_url,
            3600
          );

        if (!signedUrlError) {
          setAvatarUrl(
            signedUrlData?.signedUrl ||
              null
          );
        }
      } else {
        setAvatarUrl(null);
      }

      setSuccess(
        "Profilul a fost salvat cu succes."
      );
    } catch (saveError) {
      console.error(
        "SAVE PROFILE ERROR:",
        saveError
      );

      setError(
        saveError instanceof Error
          ? saveError.message
          : "Profilul nu a putut fi salvat."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 8) {
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

    setChangingPassword(true);

    try {
      const {
        error: passwordErrorResult,
      } = await supabase.auth.updateUser({
        password:
          newPassword,
      });

      if (passwordErrorResult) {
        console.error(
          "PASSWORD UPDATE ERROR:",
          passwordErrorResult
        );

        throw new Error(
          passwordErrorResult.message ||
            "Parola nu a putut fi schimbată."
        );
      }

      const {
        error: flagError,
      } = await supabase
        .from("profiles")
        .update({
          must_change_password:
            false,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          profile?.id
        );

      if (flagError) {
        console.error(
          "PASSWORD FLAG ERROR:",
          flagError
        );

        throw new Error(
          "Parola a fost schimbată, dar statusul de securitate nu a putut fi actualizat."
        );
      }

      setNewPassword("");
      setConfirmPassword("");

      setPasswordSuccess(
        "Parola a fost schimbată cu succes."
      );
    } catch (passwordChangeError) {
      console.error(
        "CHANGE PASSWORD ERROR:",
        passwordChangeError
      );

      setPasswordError(
        passwordChangeError instanceof Error
          ? passwordChangeError.message
          : "Parola nu a putut fi schimbată."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const teamName =
    teams.find(
      (team) =>
        team.id ===
        profile?.team_id
    )?.name || "Fără echipă";

  const initials = getInitials(
    profile?.full_name ||
      null
  );

  const roleLabel =
    getRoleLabel(
      profile?.role ||
        null
    );

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl bg-white p-8 text-gray-500 shadow-sm">
            Se încarcă profilul...
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <p className="text-red-600">
              {error ||
                "Profilul nu a fost găsit."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-6 flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
          <Logo size={52} />

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Profilul meu
            </h1>

            <p className="text-sm text-gray-500">
              Datele tale personale și securitatea contului
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">

          {/* PROFIL */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Date personale
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Poți modifica fotografia și numărul de telefon.
              </p>
            </div>

            <form
              onSubmit={handleSaveProfile}
              className="space-y-5"
            >

              {/* Avatar */}
              <div className="flex items-center gap-5">

                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={
                        profile.full_name ||
                        "Profil"
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-semibold text-gray-700">
                      {initials}
                    </span>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="avatar"
                    className="inline-flex cursor-pointer items-center rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Schimbă poza
                  </label>

                  <input
                    id="avatar"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handleFileChange
                    }
                    className="hidden"
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    JPG, PNG, WEBP — maximum 5 MB
                  </p>

                  {selectedFile && (
                    <p className="mt-1 text-xs text-gray-500">
                      Selectată:{" "}
                      {selectedFile.name}
                    </p>
                  )}
                </div>

              </div>

              {/* Nume */}
              <div>
                <label
                  htmlFor="full-name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Nume
                </label>

                <input
                  id="full-name"
                  value={
                    profile.full_name ||
                    ""
                  }
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Numele poate fi modificat doar de administrator.
                </p>
              </div>

              {/* Telefon */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Telefon
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={
                    profilePhone
                  }
                  onChange={(
                    event
                  ) =>
                    setProfilePhone(
                      event.target.value
                    )
                  }
                  placeholder="Număr de telefon"
                  disabled={
                    savingProfile
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-100"
                />
              </div>

              {/* Rol */}
              <div>
                <label
                  htmlFor="role"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Rol
                </label>

                <input
                  id="role"
                  value={
                    roleLabel
                  }
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700"
                />
              </div>

              {/* Echipa */}
              <div>
                <label
                  htmlFor="team"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Echipă
                </label>

                <input
                  id="team"
                  value={
                    teamName
                  }
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                  {success}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={
                    savingProfile
                  }
                  className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingProfile
                    ? "Se salvează..."
                    : "Salvează profilul"}
                </button>
              </div>

            </form>
          </section>

          {/* SECURITATE */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Securitate
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Schimbă parola contului tău.
              </p>
            </div>

            <form
              onSubmit={
                handleChangePassword
              }
              className="space-y-5"
            >

              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Parolă nouă
                </label>

                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={
                    newPassword
                  }
                  onChange={(
                    event
                  ) =>
                    setNewPassword(
                      event.target.value
                    )
                  }
                  placeholder="Minimum 8 caractere"
                  disabled={
                    changingPassword
                  }
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Confirmă parola
                </label>

                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={
                    confirmPassword
                  }
                  onChange={(
                    event
                  ) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Repetă parola"
                  disabled={
                    changingPassword
                  }
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-100"
                />
              </div>

              {passwordError && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                  {passwordSuccess}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={
                    changingPassword
                  }
                  className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {changingPassword
                    ? "Se salvează..."
                    : "Schimbă parola"}
                </button>
              </div>

            </form>

            <div className="mt-8 rounded-xl bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-800">
                Securitatea contului
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Nu comunica parola altor persoane. Administratorul poate seta o parolă temporară dacă este necesar.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}