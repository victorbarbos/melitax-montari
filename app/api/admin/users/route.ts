import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAuditLog } from "@/lib/supabase/audit";

// ======================================================
// VARIABILE SUPABASE
// ======================================================

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// ======================================================
// VERIFICARE CONFIGURAȚIE
// ======================================================

if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL is required."
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required."
  );
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is required."
  );
}

// ======================================================
// CLIENT SUPABASE ADMIN
// ======================================================

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
  const cookieStore =
    await cookies();

  const supabase =
    createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },

          setAll(
            cookiesToSet
          ) {
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
    data: {
      user,
    },
    error,
  } =
    await supabase.auth.getUser();

  return {
    user,
    error:
      error?.message ??
      null,
  };
}

// ======================================================
// VERIFICĂ PROFILUL UTILIZATORULUI CURENT
// ======================================================

async function getCurrentProfile(
  userId: string
) {
  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from("profiles")
      .select(
        "id, role, active"
      )
      .eq(
        "id",
        userId
      )
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

    const {
      profile: currentProfile,
      error: profileError,
    } =
      await getCurrentProfile(
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

    if (
      currentProfile.active !==
        true ||
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

    const {
      data: profiles,
      error: profilesError,
    } =
      await supabaseAdmin
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

    const emailMap =
      new Map<
        string,
        string | null
      >();

    for (
      const authUser of
      authUsersData.users
    ) {
      emailMap.set(
        authUser.id,
        authUser.email ??
          null
      );
    }

    const users = (
      profiles ?? []
    ).map(
      (profile) => ({
        ...profile,

        email:
          emailMap.get(
            profile.id
          ) ?? null,
      })
    );

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

    const {
      profile: currentProfile,
      error: profileError,
    } =
      await getCurrentProfile(
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

    if (
      currentProfile.active !==
        true ||
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

    const body =
      await request.json();

    const fullName =
      String(
        body.fullName ?? ""
      ).trim();

    const phone =
      String(
        body.phone ?? ""
      ).trim();

    const email =
      String(
        body.email ?? ""
      )
        .trim()
        .toLowerCase();

    const password =
      String(
        body.password ?? ""
      );

    const role =
      String(
        body.role ?? ""
      );

    const teamId =
      body.teamId
        ? String(
            body.teamId
          )
        : null;

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

    if (
      currentProfile.role ===
        "administrator" &&
      role ===
        "administrator"
    ) {
      return NextResponse.json(
        {
          error:
            "Administratorii nu pot crea alți Administratori.",
        },
        {
          status: 403,
        }
      );
    }

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
            createUserError?.message ??
            "Utilizatorul nu a putut fi creat.",
        },
        {
          status: 400,
        }
      );
    }

    const newUser =
      createdUserData.user;

    const {
      data: profile,
      error: insertProfileError,
    } =
      await supabaseAdmin
        .from("profiles")
        .insert({
          id: newUser.id,
          full_name:
            fullName,
          phone:
            phone || null,
          role,
          team_id:
            teamId,
          active: true,
        })
        .select()
        .single();

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
            insertProfileError?.message ??
            "Profilul utilizatorului nu a putut fi creat.",
        },
        {
          status: 400,
        }
      );
    }

    try {
      await createAuditLog({
        userId:
          currentUser.id,

        action:
          "CREATE",

        entityType:
          "USER",

        entityId:
          newUser.id,

        entityName:
          fullName,

        oldData:
          null,

        newData: {
          full_name:
            fullName,

          phone:
            phone || null,

          email,

          role,

          team_id:
            teamId,

          active:
            true,
        },
      });
    } catch (auditError) {
      console.error(
        "CREATE USER AUDIT LOG ERROR:",
        auditError
      );
    }

    return NextResponse.json(
      {
        success: true,

        user: {
          id:
            newUser.id,

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

// ======================================================
// PUT — MODIFICARE UTILIZATOR
// ======================================================

export async function PUT(
  request: Request
) {
  try {
    // --------------------------------------------------
    // 1. UTILIZATOR AUTENTIFICAT
    // --------------------------------------------------

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

    // --------------------------------------------------
    // 2. PROFIL CURENT
    // --------------------------------------------------

    const {
      profile: currentProfile,
      error: profileError,
    } =
      await getCurrentProfile(
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

    // --------------------------------------------------
    // 3. PERMISIUNI
    // --------------------------------------------------

    if (
      currentProfile.active !==
        true ||
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
            "Nu ai permisiunea de a modifica utilizatori.",
        },
        {
          status: 403,
        }
      );
    }

    // --------------------------------------------------
    // 4. DATE PRIMITE
    // --------------------------------------------------

    const body =
      await request.json();

    const temporaryPassword =
      body.temporaryPassword !== undefined
        ? String(body.temporaryPassword)
        : "";

    const hasTemporaryPassword =
      temporaryPassword.length > 0;

    const targetUserId =
      String(
        body.id ??
          body.userId ??
          ""
      ).trim();

    if (!targetUserId) {
      return NextResponse.json(
        {
          error:
            "ID-ul utilizatorului este obligatoriu.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // 5. UTILIZATORUL ȚINTĂ
    // --------------------------------------------------

    const {
      data: targetProfile,
      error: targetProfileError,
    } =
      await supabaseAdmin
        .from("profiles")
        .select(`
          id,
          full_name,
          phone,
          role,
          team_id,
          active
        `)
        .eq(
          "id",
          targetUserId
        )
        .single();

    if (
      targetProfileError ||
      !targetProfile
    ) {
      return NextResponse.json(
        {
          error:
            "Utilizatorul nu a fost găsit.",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------
    // 6. PROTECȚIE SUPER ADMINISTRATOR
    // --------------------------------------------------

    if (
      targetProfile.role ===
        "super_admin"
    ) {
      if (
        currentProfile.role !==
        "super_admin"
      ) {
        return NextResponse.json(
          {
            error:
              "Nu poți modifica Super Administratorul.",
          },
          {
            status: 403,
          }
        );
      }

      if (
        targetUserId ===
          currentUser.id &&
        body.role !==
          undefined &&
        body.role !==
          "super_admin"
      ) {
        return NextResponse.json(
          {
            error:
              "Nu îți poți schimba propriul rol de Super Administrator.",
          },
          {
            status: 403,
          }
        );
      }

      if (
        targetUserId ===
          currentUser.id &&
        body.active ===
          false
      ) {
        return NextResponse.json(
          {
            error:
              "Nu îți poți dezactiva propriul cont de Super Administrator.",
          },
          {
            status: 403,
          }
        );
      }
    }

    // --------------------------------------------------
    // 7. PAROLĂ TEMPORARĂ
    // --------------------------------------------------

    // Parola temporară este opțională.
    // Dacă este goală, parola utilizatorului NU se modifică.
    if (hasTemporaryPassword) {
      if (
        currentProfile.role !==
        "super_admin"
      ) {
        return NextResponse.json(
          {
            error:
              "Doar Super Administratorul poate seta o parolă temporară.",
          },
          {
            status: 403,
          }
        );
      }

      if (
        targetUserId ===
        currentUser.id
      ) {
        return NextResponse.json(
          {
            error:
              "Parola temporară poate fi setată doar pentru alt utilizator.",
          },
          {
            status: 403,
          }
        );
      }

      if (
        temporaryPassword.length < 8
      ) {
        return NextResponse.json(
          {
            error:
              "Parola temporară trebuie să conțină cel puțin 8 caractere.",
          },
          {
            status: 400,
          }
        );
      }
    }

    // --------------------------------------------------
    // 8. DATE VECHI
    // --------------------------------------------------

    const oldData = {
      full_name:
        targetProfile.full_name,

      phone:
        targetProfile.phone,

      role:
        targetProfile.role,

      team_id:
        targetProfile.team_id,

      active:
        targetProfile.active,
    };

    let newFullName =
      targetProfile.full_name;

    let newPhone =
      targetProfile.phone;

    let newRole =
      targetProfile.role;

    let newTeamId =
      targetProfile.team_id;

    let newActive =
      targetProfile.active;

    // --------------------------------------------------
    // 9. NUME
    // --------------------------------------------------

    if (
      body.fullName !==
      undefined
    ) {
      newFullName =
        String(
          body.fullName ?? ""
        ).trim();

      if (!newFullName) {
        return NextResponse.json(
          {
            error:
              "Numele complet nu poate fi gol.",
          },
          {
            status: 400,
          }
        );
      }
    }

    // --------------------------------------------------
    // 10. TELEFON
    // --------------------------------------------------

    if (
      body.phone !==
      undefined
    ) {
      newPhone =
        body.phone
          ? String(
              body.phone
            ).trim()
          : null;
    }

    // --------------------------------------------------
    // 11. ROL
    // --------------------------------------------------

    if (
      body.role !==
      undefined
    ) {
      newRole =
        String(
          body.role
        );

      if (
        newRole ===
          "super_admin" &&
        targetProfile.role !==
          "super_admin"
      ) {
        return NextResponse.json(
          {
            error:
              "Super Administrator nu poate fi atribuit altui utilizator.",
          },
          {
            status: 403,
          }
        );
      }

      const allowedRoles = [
        "administrator",
        "manager",
        "inginer",
        "personal_teren",
        "super_admin",
      ];

      if (
        !allowedRoles.includes(
          newRole
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Rol invalid.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        currentProfile.role ===
          "administrator" &&
        newRole !==
          targetProfile.role
      ) {
        return NextResponse.json(
          {
            error:
              "Administratorii nu pot modifica rolurile utilizatorilor.",
          },
          {
            status: 403,
          }
        );
      }
    }

    // --------------------------------------------------
    // 12. ECHIPĂ
    // --------------------------------------------------

    if (
      body.teamId !==
      undefined
    ) {
      newTeamId =
        body.teamId
          ? String(
              body.teamId
            )
          : null;

      if (newTeamId) {
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
              newTeamId
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
    }

    // --------------------------------------------------
    // 13. ACTIV / INACTIV
    // --------------------------------------------------

    if (
      body.active !==
      undefined
    ) {
      const requestedActive =
        Boolean(
          body.active
        );

      const activeChanged =
        requestedActive !==
        targetProfile.active;

      if (
        activeChanged &&
        currentProfile.role !==
          "super_admin"
      ) {
        return NextResponse.json(
          {
            error:
              "Doar Super Administratorul poate modifica statusul Activ/Inactiv.",
          },
          {
            status: 403,
          }
        );
      }

      newActive =
        requestedActive;
    }

    // --------------------------------------------------
    // 14. ADMINISTRATOR → NU POATE MODIFICA SUPER ADMIN
    // --------------------------------------------------

    if (
      currentProfile.role ===
        "administrator" &&
      targetProfile.role ===
        "super_admin"
    ) {
      return NextResponse.json(
        {
          error:
            "Administratorii nu pot modifica Super Administratorul.",
        },
        {
          status: 403,
        }
      );
    }

    // --------------------------------------------------
    // 15. EXISTĂ MODIFICĂRI?
    // --------------------------------------------------

    const hasChanges =
      newFullName !==
        targetProfile.full_name ||
      newPhone !==
        targetProfile.phone ||
      newRole !==
        targetProfile.role ||
      newTeamId !==
        targetProfile.team_id ||
      newActive !==
        targetProfile.active ||
      hasTemporaryPassword;

    if (!hasChanges) {
      return NextResponse.json(
        {
          success: true,
          message:
            "Nu există modificări.",
        },
        {
          status: 200,
        }
      );
    }

    // --------------------------------------------------
    // 16. ACTUALIZARE PAROLĂ ÎN SUPABASE AUTH
    // --------------------------------------------------

    if (hasTemporaryPassword) {
      const {
        error: passwordUpdateError,
      } =
        await supabaseAdmin.auth.admin.updateUserById(
          targetUserId,
          {
            password:
              temporaryPassword,
          }
        );

      if (passwordUpdateError) {
        console.error(
          "UPDATE TEMPORARY PASSWORD ERROR:",
          passwordUpdateError
        );

        return NextResponse.json(
          {
            error:
              passwordUpdateError.message ??
              "Parola temporară nu a putut fi setată.",
          },
          {
            status: 400,
          }
        );
      }
    }

    // --------------------------------------------------
    // 17. ACTUALIZARE PROFIL
    // --------------------------------------------------

    const {
      data: updatedProfile,
      error: updateError,
    } =
      await supabaseAdmin
        .from("profiles")
        .update({
          full_name:
            newFullName,

          phone:
            newPhone,

          role:
            newRole,

          team_id:
            newTeamId,

          active:
            newActive,

          ...(hasTemporaryPassword
            ? {
                must_change_password:
                  true,
              }
            : {}),

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          targetUserId
        )
        .select()
        .single();

    if (
      updateError ||
      !updatedProfile
    ) {
      console.error(
        "UPDATE PROFILE ERROR:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            updateError?.message ??
            "Utilizatorul nu a putut fi modificat.",
        },
        {
          status: 500,
        }
      );
    }

    // --------------------------------------------------
    // 17. DATE NOI
    // --------------------------------------------------

    const newData = {
      full_name:
        updatedProfile.full_name,

      phone:
        updatedProfile.phone,

      role:
        updatedProfile.role,

      team_id:
        updatedProfile.team_id,

      active:
        updatedProfile.active,
    };

    // --------------------------------------------------
    // 18. AUDIT — UPDATE
    // --------------------------------------------------

    try {
      await createAuditLog({
        userId:
          currentUser.id,

        action:
          "UPDATE",

        entityType:
          "USER",

        entityId:
          targetUserId,

        entityName:
          updatedProfile.full_name,

        oldData,

        newData,
      });
    } catch (auditError) {
      console.error(
        "UPDATE USER AUDIT LOG ERROR:",
        auditError
      );
    }

    // --------------------------------------------------
    // 19. AUDIT — SCHIMBARE ROL
    // --------------------------------------------------

    if (
      oldData.role !==
      newData.role
    ) {
      try {
        await createAuditLog({
          userId:
            currentUser.id,

          action:
            "ROLE_CHANGE",

          entityType:
            "USER",

          entityId:
            targetUserId,

          entityName:
            updatedProfile.full_name,

          oldData: {
            role:
              oldData.role,
          },

          newData: {
            role:
              newData.role,
          },
        });
      } catch (auditError) {
        console.error(
          "ROLE CHANGE AUDIT ERROR:",
          auditError
        );
      }
    }

    // --------------------------------------------------
    // 20. AUDIT — SCHIMBARE ECHIPĂ
    // --------------------------------------------------

    if (
      oldData.team_id !==
      newData.team_id
    ) {
      try {
        await createAuditLog({
          userId:
            currentUser.id,

          action:
            "TEAM_CHANGE",

          entityType:
            "USER",

          entityId:
            targetUserId,

          entityName:
            updatedProfile.full_name,

          oldData: {
            team_id:
              oldData.team_id,
          },

          newData: {
            team_id:
              newData.team_id,
          },
        });
      } catch (auditError) {
        console.error(
          "TEAM CHANGE AUDIT ERROR:",
          auditError
        );
      }
    }

    // --------------------------------------------------
    // 21. AUDIT — STATUS
    // --------------------------------------------------

    if (
      oldData.active !==
      newData.active
    ) {
      try {
        await createAuditLog({
          userId:
            currentUser.id,

          action:
            "STATUS_CHANGE",

          entityType:
            "USER",

          entityId:
            targetUserId,

          entityName:
            updatedProfile.full_name,

          oldData: {
            active:
              oldData.active,
          },

          newData: {
            active:
              newData.active,
          },
        });
      } catch (auditError) {
        console.error(
          "STATUS CHANGE AUDIT ERROR:",
          auditError
        );
      }
    }

    // --------------------------------------------------
    // 22. AUDIT — PAROLĂ TEMPORARĂ
    // --------------------------------------------------

    if (hasTemporaryPassword) {
      try {
        await createAuditLog({
          userId:
            currentUser.id,

          action:
            "PASSWORD_RESET",

          entityType:
            "USER",

          entityId:
            targetUserId,

          entityName:
            updatedProfile.full_name,

          oldData:
            null,

          newData: {
            must_change_password:
              true,
          },
        });
      } catch (auditError) {
        console.error(
          "PASSWORD RESET AUDIT ERROR:",
          auditError
        );
      }
    }

    // --------------------------------------------------
    // 23. RĂSPUNS
    // --------------------------------------------------

    return NextResponse.json(
      {
        success: true,

        user: {
          id:
            updatedProfile.id,

          full_name:
            updatedProfile.full_name,

          phone:
            updatedProfile.phone,

          role:
            updatedProfile.role,

          team_id:
            updatedProfile.team_id,

          active:
            updatedProfile.active,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "UPDATE USER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "A apărut o eroare la modificarea utilizatorului.",
      },
      {
        status: 500,
      }
    );
  }
}