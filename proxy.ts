import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Supabase configuration is missing."
    );

    return new NextResponse(
      "Supabase configuration is missing.",
      {
        status: 500,
      }
    );
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(
                name,
                value
              );
            }
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({
              name,
              value,
              options,
            }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname =
    request.nextUrl.pathname;

  // ==========================================
  // PAGINI PUBLICE
  // ==========================================

  const publicPaths = [
    "/",
    "/login",
  ];

  const isPublicPath =
    publicPaths.includes(pathname);

  // ==========================================
  // UTILIZATOR NEAUTENTIFICAT
  // ==========================================

  if (!user && !isPublicPath) {
    const loginUrl =
      request.nextUrl.clone();

    loginUrl.pathname = "/login";

    return NextResponse.redirect(
      loginUrl
    );
  }

  // ==========================================
  // UTILIZATOR AUTENTIFICAT
  // ==========================================

  if (
    user &&
    pathname === "/login"
  ) {
    const dashboardUrl =
      request.nextUrl.clone();

    dashboardUrl.pathname =
      "/dashboard";

    return NextResponse.redirect(
      dashboardUrl
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};