"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

type Profile = {
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
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

export default function Header() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] =
    useState(false);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [avatarUrl, setAvatarUrl] =
    useState<string | null>(null);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        const {
          data,
          error,
        } = await supabase
          .from("profiles")
          .select(
            "full_name, avatar_url, role"
          )
          .eq("id", user.id)
          .single();

        if (error) {
          console.error(
            "HEADER PROFILE ERROR:",
            error
          );

          return;
        }

        setProfile(data);

        if (data?.avatar_url) {
          const {
            data: signedUrlData,
            error: signedUrlError,
          } = await supabase.storage
            .from("avatars")
            .createSignedUrl(
              data.avatar_url,
              3600
            );

          if (signedUrlError) {
            console.error(
              "HEADER AVATAR ERROR:",
              signedUrlError
            );

            return;
          }

          setAvatarUrl(
            signedUrlData?.signedUrl ||
              null
          );
        } else {
          setAvatarUrl(null);
        }
      } catch (error) {
        console.error(
          "HEADER LOAD PROFILE ERROR:",
          error
        );
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Logout error:",
        error
      );

      setLoggingOut(false);

      return;
    }

    router.replace("/login");
    router.refresh();
  };

  const initials = getInitials(
    profile?.full_name || null
  );

  const roleLabel =
    getRoleLabel(
      profile?.role || null
    );

  return (
    <header className="mb-6 flex items-center justify-between rounded-xl bg-white px-6 py-4 shadow-sm">

      {/* Logo + titlu */}
      <div className="flex items-center gap-4">
        <Logo size={52} />

        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Melitax Montări
          </h1>

          <p className="text-xs text-gray-500 sm:text-sm">
            Panou de administrare
          </p>
        </div>
      </div>

      {/* Avatar + meniu */}
      <div className="relative">

        <button
          type="button"
          onClick={() =>
            setOpen(
              (current) => !current
            )
          }
          className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-200 transition hover:opacity-90"
          aria-label="Meniu utilizator"
          aria-expanded={open}
        >
          {!loadingProfile &&
          avatarUrl ? (
            <img
              src={avatarUrl}
              alt={
                profile?.full_name ||
                "Profil utilizator"
              }
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-gray-700">
              {initials}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-14 z-50 w-60 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">

            {/* HEADER MENIU */}

            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">

                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={
                      profile?.full_name ||
                      "Profil"
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-gray-700">
                    {initials}
                  </span>
                )}

              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-semibold text-gray-900">
                  {profile?.full_name ||
                    "Utilizator"}
                </p>

                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {roleLabel}
                </p>

              </div>

            </div>

            {/* PROFIL */}

            <div className="p-2">

              <Link
                href="/profil"
                onClick={() =>
                  setOpen(false)
                }
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >

                <span className="text-lg">
                  👤
                </span>

                <span>
                  Profilul meu
                </span>

              </Link>

              {/* DELOGARE */}

              <button
                type="button"
                onClick={
                  handleLogout
                }
                disabled={
                  loggingOut
                }
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <span className="text-lg">
                  🚪
                </span>

                <span>
                  {loggingOut
                    ? "Se deconectează..."
                    : "Deconectare"}
                </span>

              </button>

            </div>

          </div>
        )}

      </div>
    </header>
  );
}