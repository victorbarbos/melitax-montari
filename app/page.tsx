export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">

      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">

        <div className="w-full">

          {/* Logo / nume */}
          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-2xl font-bold text-white shadow-sm">
              M
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Melitax Montări
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
              Platformă pentru gestionarea montărilor,
              echipelor și intervențiilor.
            </p>

          </div>

          {/* Card principal */}
          <div className="mx-auto mt-10 max-w-md">

            <div className="rounded-2xl bg-white p-8 shadow-sm">

              <h2 className="text-xl font-semibold text-gray-900">
                Acces aplicație
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Autentifică-te pentru a accesa
                platforma Melitax Montări.
              </p>

              <a
                href="/login"
                className="mt-6 flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Autentificare
              </a>

            </div>

          </div>

          {/* Informații */}
          <div className="mt-12 text-center">

            <p className="text-sm text-gray-400">
              Melitax Montări · Versiunea 0.1.0
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}