import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Conținut principal */}
      <main className="min-h-screen min-w-0 overflow-x-hidden md:ml-64">
        <div className="w-full min-w-0 p-4 pt-20 md:p-8 md:pt-8">

          {/* Header */}
          <Header />

          {/* Statistici */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">

            {/* Intervenții */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                Intervenții azi
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                12
              </p>

              <p className="mt-2 text-sm text-green-600">
                +2 față de ieri
              </p>
            </div>

            {/* Montatori */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                Montatori activi
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                8
              </p>

              <p className="mt-2 text-sm text-green-600">
                6 pe teren acum
              </p>
            </div>

            {/* Urgente */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                Lucrări urgente
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                3
              </p>

              <p className="mt-2 text-sm text-red-600">
                Necesită atenție
              </p>
            </div>

          </div>

          {/* Intervenții recente */}
          <div className="mt-6 max-w-2xl rounded-xl bg-white p-6 shadow-sm">

            <h2 className="text-xl font-semibold text-gray-900">
              Intervenții recente
            </h2>

            <div className="mt-6 divide-y divide-gray-100">

              <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    Instalare cameră video
                  </p>

                  <p className="text-sm text-gray-500">
                    Client: SRL Exemplu
                  </p>
                </div>

                <span className="text-sm font-medium text-green-600">
                  Finalizată
                </span>
              </div>

              <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    Reparare interfon
                  </p>

                  <p className="text-sm text-gray-500">
                    Client: Bloc Central
                  </p>
                </div>

                <span className="text-sm font-medium text-orange-500">
                  În lucru
                </span>
              </div>

              <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    Montare sistem alarmă
                  </p>

                  <p className="text-sm text-gray-500">
                    Client: ABC Construct
                  </p>
                </div>

                <span className="text-sm font-medium text-red-600">
                  Urgent
                </span>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}