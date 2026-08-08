export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Melitax Montări
        </h1>

        <p className="text-sm text-gray-500">
          Panou de administrare
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-700">
            VB
          </span>
        </div>
      </div>
    </header>
  );
}