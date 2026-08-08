export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">
          Melitax Montări
        </h1>

        <p className="text-xl text-slate-300 mb-8">
          Sistem de management al intervențiilor
        </p>

        <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl text-lg font-semibold transition">
          Intră în aplicație
        </button>
      </div>
    </main>
  );
}