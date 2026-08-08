import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-6">
      <h2 className="text-2xl font-bold mb-10">
        Melitax Montări
      </h2>

      <nav className="space-y-2">
        <Link
          href="/dashboard"
          className="block p-3 rounded-lg hover:bg-slate-800"
        >
          🏠 Dashboard
        </Link>

        <Link
          href="/calendar"
          className="block p-3 rounded-lg hover:bg-slate-800"
        >
          📅 Calendar
        </Link>

        <Link
          href="/interventii"
          className="block p-3 rounded-lg hover:bg-slate-800"
        >
          📋 Intervenții
        </Link>

        <Link
          href="/montatori"
          className="block p-3 rounded-lg hover:bg-slate-800"
        >
          👷 Montatori
        </Link>

        <Link
          href="/clienti"
          className="block p-3 rounded-lg hover:bg-slate-800"
        >
          👥 Clienți
        </Link>

        <Link
          href="/setari"
          className="block p-3 rounded-lg hover:bg-slate-800"
        >
          ⚙️ Setări
        </Link>
      </nav>
    </aside>
  );
}