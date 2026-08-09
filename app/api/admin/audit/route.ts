import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL is required."
  );
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is required."
  );
}

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// ======================================================
// UTILIZATOR CURENT
// ======================================================

async function getCurrentUser() {
  if (!supabaseAnonKey) {
    return {
      user: null,
      error: "Supabase public key is missing.",
    };
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) => {
                cookieStore.set(
                  name,
                  value,
                  options
                );
              }
            );
          } catch {
            // Cookie update unavailable.
          }
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return {
    user,
    error:
      error?.message ||
      null,
  };
}

// ======================================================
// GET — AUDIT LOG
// DOAR SUPER ADMINISTRATOR
// ======================================================

export async function GET() {
  try {
    // -----------------------------------------------
    // 1. AUTENTIFICARE
    // -----------------------------------------------

    const {
      user: currentUser,
      error: authError,
    } = await getCurrentUser();

    if (
      authError ||
      !currentUser
    ) {
      return NextResponse.json(
        {
          error:
            "Nu ești autentificat.",
        },
        {
          status: 401,
        }
      );
    }

    // -----------------------------------------------
    // 2. PROFIL CURENT
    // -----------------------------------------------

    const {
      data: currentProfile,
      error: profileError,
    } =
      await supabaseAdmin
        .from("profiles")
        .select(
          "id, role, active"
        )
        .eq(
          "id",
          currentUser.id
        )
        .single();

    if (
      profileError ||
      !currentProfile
    ) {
      return NextResponse.json(
        {
          error:
            "Profilul utilizatorului nu a fost găsit.",
        },
        {
          status: 403,
        }
      );
    }

    // -----------------------------------------------
    // 3. DOAR SUPER ADMINISTRATOR
    // -----------------------------------------------

    if (
      currentProfile.active !==
        true ||
      currentProfile.role !==
        "super_admin"
    ) {
      return NextResponse.json(
        {
          error:
            "Doar Super Administratorul poate vedea Audit Log.",
        },
        {
          status: 403,
        }
      );
    }

    // -----------------------------------------------
    // 4. AUDIT LOG
    // -----------------------------------------------

    const {
      data: logs,
      error: logsError,
    } =
      await supabaseAdmin
        .from("audit_logs")
        .select(`
          id,
          created_at,
          user_id,
          action,
          entity_type,
          entity_id,
          entity_name,
          old_data,
          new_data
        `)
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .limit(500);

    if (logsError) {
      console.error(
        "GET AUDIT LOG ERROR:",
        logsError
      );

      return NextResponse.json(
        {
          error:
            logsError.message,
        },
        {
          status: 500,
        }
      );
    }

    // -----------------------------------------------
    // 5. UTILIZATORII CARE AU FĂCUT ACȚIUNILE
    // -----------------------------------------------

    const userIds = [
      ...new Set(
        (logs || [])
          .map(
            (log) =>
              log.user_id
          )
          .filter(Boolean)
      ),
    ];

    let actorMap =
      new Map<
        string,
        {
          id: string;
          full_name: string;
          role: string;
        }
      >();

    if (
      userIds.length > 0
    ) {
      const {
        data: actors,
        error: actorsError,
      } =
        await supabaseAdmin
          .from("profiles")
          .select(
            "id, full_name, role"
          )
          .in(
            "id",
            userIds
          );

      if (actorsError) {
        console.error(
          "GET AUDIT ACTORS ERROR:",
          actorsError
        );
      } else {
        actorMap =
          new Map(
            (actors || []).map(
              (actor) => [
                actor.id,
                actor,
              ]
            )
          );
      }
    }

    // -----------------------------------------------
    // 6. ECHIPE
    //
    // Folosim aceste date pentru a transforma:
    //
    // team_id
    //      ↓
    // Echipa Deservire / Echipa Montare
    // -----------------------------------------------

    const {
      data: teams,
      error: teamsError,
    } =
      await supabaseAdmin
        .from("teams")
        .select(
          "id, name"
        );

    if (teamsError) {
      console.error(
        "GET AUDIT TEAMS ERROR:",
        teamsError
      );
    }

    const teamMap =
      new Map<
        string,
        string
      >();

    (
      teams || []
    ).forEach(
      (team) => {
        teamMap.set(
          team.id,
          team.name
        );
      }
    );

    // -----------------------------------------------
    // 7. TRANSFORMĂ DATELE PENTRU AFIȘARE
    // -----------------------------------------------

    const makeReadableData = (
      data: Record<
        string,
        unknown
      > | null
    ) => {
      if (!data) {
        return null;
      }

      const readable = {
        ...data,
      };

      // -----------------------------
      // ECHIPĂ
      // -----------------------------

      if (
        typeof readable.team_id ===
          "string"
      ) {
        readable.team_name =
          teamMap.get(
            readable.team_id
          ) ||
          readable.team_id;
      }

      // -----------------------------
      // ROL
      // -----------------------------

      if (
        typeof readable.role ===
          "string"
      ) {
        const roleLabels: Record<
          string,
          string
        > = {
          super_admin:
            "Super Administrator",

          administrator:
            "Administrator",

          manager:
            "Manager",

          inginer:
            "Inginer",

          personal_teren:
            "Personal teren",
        };

        readable.role_name =
          roleLabels[
            readable.role
          ] ||
          readable.role;
      }

      // -----------------------------
      // STATUS
      // -----------------------------

      if (
        typeof readable.active ===
          "boolean"
      ) {
        readable.active_name =
          readable.active
            ? "Activ"
            : "Inactiv";
      }

      return readable;
    };

    // -----------------------------------------------
    // 8. CONSTRUIM REZULTATUL
    // -----------------------------------------------

    const result = (
      logs || []
    ).map(
      (log) => {
        const actor =
          log.user_id
            ? actorMap.get(
                log.user_id
              )
            : null;

        return {
          id: log.id,

          created_at:
            log.created_at,

          user_id:
            log.user_id,

          actor_name:
            actor?.full_name ||
            "Utilizator necunoscut",

          actor_role:
            actor?.role ||
            null,

          action:
            log.action,

          entity_type:
            log.entity_type,

          entity_id:
            log.entity_id,

          entity_name:
            log.entity_name,

          old_data:
            log.old_data,

          new_data:
            log.new_data,

          // ---------------------------------------
          // DATE PENTRU AFIȘARE
          // ---------------------------------------

          old_data_readable:
            makeReadableData(
              log.old_data
            ),

          new_data_readable:
            makeReadableData(
              log.new_data
            ),
        };
      }
    );

    // -----------------------------------------------
    // 9. RĂSPUNS
    // -----------------------------------------------

    return NextResponse.json(
      {
        logs: result,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "AUDIT API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "A apărut o eroare la încărcarea Audit Log.",
      },
      {
        status: 500,
      }
    );
  }
}