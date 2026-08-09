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
// VERIFICĂ UTILIZATORUL CURENT
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
    supabaseUrl!,
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
    error: error?.message || null,
  };
}

// ======================================================
// VERIFICĂ DACĂ UTILIZATORUL ESTE ADMINISTRATOR
// ======================================================

async function getCurrentProfile(
  userId: string
) {
  const {
    data,
    error,
  } = await supabaseAdmin
    .from("profiles")
    .select(
      "id, role, active"
    )
    .eq("id", userId)
    .single();

  return {
    profile: data,
    error,
  };
}

// ======================================================
// GET — LISTA UTILIZATORILOR
// ======================================================

export async function GET() {
  try {
    // -----------------------------------------------
    // 1. Utilizator autentificat
    // -----------------------------------------------

    const {
      user: currentUser,
      error: authError,
    } = await getCurrentUser();

    if (authError || !currentUser) {
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
    // 2. Profilul utilizatorului curent
    // -----------------------------------------------

    const {
      profile: currentProfile,
      error: profileError,
    } = await getCurrentProfile(
      currentUser.id
    );

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
    // 3. Doar Super Admin și Administrator
    // pot vedea utilizatorii
    // -----------------------------------------------

    if (
      currentProfile.active !== true ||
      ![
        "super_admin",
        "administrator",
      ].includes(
        currentProfile.role
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Nu ai permisiunea de a vedea utilizatorii.",
        },
        {
          status: 403,
        }
      );
    }

    // -----------------------------------------------
    // 4. Luăm profilele
    // -----------------------------------------------

    const {
      data: profiles,
      error: profilesError,
    } = await supabaseAdmin
      .from("profiles")
      .select(`
        id,
        full_name,
        phone,
        role,
        team_id,
        active,
        created_at,
        teams (
          name
        )
      `)
      .order(
        "created_at",
        {
          ascending: true,
        }
      );

    if (profilesError) {
      console.error(
        "GET PROFILES ERROR:",
        profilesError
      );

      return NextResponse.json(
        {
          error:
            profilesError.message,
        },
        {
          status: 500,
        }
      );
    }

    // -----------------------------------------------
    // 5. Luăm utilizatorii din Supabase Auth
    // -----------------------------------------------

    const {
      data: authUsersData,
      error: authUsersError,
    } =
      await supabaseAdmin.auth.admin.listUsers(
        {
          page: 1,
          perPage: 1000,
        }
      );

    if (authUsersError) {
      console.error(
        "GET AUTH USERS ERROR:",
        authUsersError
      );

      return NextResponse.json(
        {
          error:
            authUsersError.message,
        },
        {
          status: 500,
        }
      );
    }

    // -----------------------------------------------
    // 6. Facem map pentru email
    // -----------------------------------------------

    const emailMap = new Map<
      string,
      string | null
    >();

    for (const authUser of
      authUsersData.users) {
      emailMap.set(
        authUser.id,
        authUser.email || null
      );
    }

    // -----------------------------------------------
    // 7. Combinăm profiles + Auth
    // -----------------------------------------------

    const users = (
      profiles || []
    ).map((profile) => ({
      ...profile,

      email:
        emailMap.get(
          profile.id
        ) || null,
    }));

    // -----------------------------------------------
    // 8. Răspuns
    // -----------------------------------------------

    return NextResponse.json(
      {
        users,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET USERS ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "A apărut o eroare la încărcarea utilizatorilor.",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// POST — CREARE UTILIZATOR
// ======================================================

export async function POST(
  request: Request
) {
  try {
    // -----------------------------------------------
    // 1. Utilizator autentificat
    // -----------------------------------------------

    const {
      user: currentUser,
      error: authError,
    } = await getCurrentUser();

    if (authError || !currentUser) {
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
    // 2. Profil utilizator curent
    // -----------------------------------------------

    const {
      profile: currentProfile,
      error: profileError,
    } = await getCurrentProfile(
      currentUser.id
    );

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
    // 3. Doar Super Admin și Administrator
    // pot crea utilizatori
    // -----------------------------------------------

    if (
      currentProfile.active !== true ||
      ![
        "super_admin",
        "administrator",
      ].includes(
        currentProfile.role
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Nu ai permisiunea de a crea utilizatori.",
        },
        {
          status: 403,
        }
      );
    }

    // -----------------------------------------------
    // 4. Citim formularul
    // -----------------------------------------------

    const body =
      await request.json();

    const fullName = String(
      body.fullName || ""
    ).trim();

    const phone = String(
      body.phone || ""
    ).trim();

    const email = String(
      body.email || ""
    )
      .trim()
      .toLowerCase();

    const password = String(
      body.password || ""
    );

    const role = String(
      body.role || ""
    );

    const teamId = body.teamId
      ? String(body.teamId)
      : null;

    // -----------------------------------------------
    // 5. Validări
    // -----------------------------------------------

    if (!fullName) {
      return NextResponse.json(
        {
          error:
            "Numele complet este obligatoriu.",
        },
        {
          status: 400,
        }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          error:
            "Emailul este obligatoriu.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !password ||
      password.length < 8
    ) {
      return NextResponse.json(
        {
          error:
            "Parola trebuie să conțină cel puțin 8 caractere.",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------------
    // 6. Rolurile permise
    //
    // IMPORTANT:
    // super_admin NU poate fi creat.
    // -----------------------------------------------

    const allowedRoles = [
      "administrator",
      "manager",
      "inginer",
      "personal_teren",
    ];

    if (
      !allowedRoles.includes(
        role
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Rol invalid. Super Administrator nu poate fi creat.",
        },
        {
          status: 403,
        }
      );
    }

    // -----------------------------------------------
    // 7. Verificăm echipa
    // -----------------------------------------------

    if (teamId) {
      const {
        data: team,
        error: teamError,
      } =
        await supabaseAdmin
          .from("teams")
          .select(
            "id, name"
          )
          .eq(
            "id",
            teamId
          )
          .single();

      if (
        teamError ||
        !team
      ) {
        return NextResponse.json(
          {
            error:
              "Echipa selectată nu există.",
          },
          {
            status: 400,
          }
        );
      }
    }

    // -----------------------------------------------
    // 8. Creăm utilizatorul în Auth
    // -----------------------------------------------

    const {
      data: createdUserData,
      error: createUserError,
    } =
      await supabaseAdmin.auth.admin.createUser(
        {
          email,
          password,
          email_confirm: true,
        }
      );

    if (
      createUserError ||
      !createdUserData.user
    ) {
      return NextResponse.json(
        {
          error:
            createUserError?.message ||
            "Utilizatorul nu a putut fi creat.",
        },
        {
          status: 400,
        }
      );
    }

    const newUser =
      createdUserData.user;

    // -----------------------------------------------
    // 9. Creăm profilul
    //
    // IMPORTANT:
    // Nu punem email în profiles.
    // Emailul rămâne în Supabase Auth.
    // -----------------------------------------------

    const {
      data: profile,
      error: insertProfileError,
    } =
      await supabaseAdmin
        .from("profiles")
        .insert({
          id: newUser.id,
          full_name: fullName,
          phone:
            phone || null,
          role,
          team_id: teamId,
          active: true,
        })
        .select()
        .single();

    // -----------------------------------------------
    // 10. Dacă profilul eșuează,
    // ștergem utilizatorul Auth
    // -----------------------------------------------

    if (
      insertProfileError ||
      !profile
    ) {
      await supabaseAdmin.auth.admin.deleteUser(
        newUser.id
      );

      return NextResponse.json(
        {
          error:
            insertProfileError?.message ||
            "Profilul utilizatorului nu a putut fi creat.",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------------
    // 11. Răspuns
    // -----------------------------------------------

    return NextResponse.json(
      {
        success: true,

        user: {
          id: newUser.id,
          email:
            newUser.email,
          full_name:
            profile.full_name,
          phone:
            profile.phone,
          role:
            profile.role,
          team_id:
            profile.team_id,
          active:
            profile.active,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE USER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "A apărut o eroare la crearea utilizatorului.",
      },
      {
        status: 500,
      }
    );
  }
}