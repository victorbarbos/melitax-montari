import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar />
      {/* Conținut */}
      <main className="flex-1 p-8">

        <Header />

        <div className="grid grid-cols-3 gap-6 mt-10">

         <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-500">Intervenții azi</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
              <p className="text-sm text-green-600 mt-1">
              +2 față de ieri
              </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
               <p className="text-sm text-gray-500">Montatori activi</p>
               <p className="text-3xl font-bold text-gray-900 mt-2">8</p>
               <p className="text-sm text-green-600 mt-1">
               6 pe teren acum
              </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
               <p className="text-sm text-gray-500">Lucrări urgente</p>
               <p className="text-3xl font-bold text-gray-900 mt-2">3</p>
               <p className="text-sm text-red-600 mt-1">
               Necesită atenție
               </p>
          </div>
<div className="mt-8 bg-white rounded-xl shadow p-6">
  <h2 className="text-lg font-semibold text-gray-900">
    Intervenții recente
  </h2>

  <div className="mt-4 divide-y">
    <div className="py-4 flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-900">
          Instalare cameră video
        </p>
        <p className="text-sm text-gray-500">
          Client: SRL Exemplu
        </p>
      </div>

      <span className="text-sm text-green-600 font-medium">
        Finalizată
      </span>
    </div>

    <div className="py-4 flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-900">
          Reparare interfon
        </p>
        <p className="text-sm text-gray-500">
          Client: Bloc Central
        </p>
      </div>

      <span className="text-sm text-yellow-600 font-medium">
        În lucru
      </span>
    </div>

    <div className="py-4 flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-900">
          Montare sistem alarmă
        </p>
        <p className="text-sm text-gray-500">
          Client: ABC Construct
        </p>
      </div>

      <span className="text-sm text-red-600 font-medium">
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