"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    "Ianuarie",
    "Februarie",
    "Martie",
    "Aprilie",
    "Mai",
    "Iunie",
    "Iulie",
    "August",
    "Septembrie",
    "Octombrie",
    "Noiembrie",
    "Decembrie",
  ];

  const dayNames = [
    "Luni",
    "Marți",
    "Miercuri",
    "Joi",
    "Vineri",
    "Sâmbătă",
    "Duminică",
  ];

  const shortDayNames = [
    "Lun",
    "Mar",
    "Mie",
    "Joi",
    "Vin",
    "Sâm",
    "Dum",
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const startDay = firstDay === 0 ? 6 : firstDay - 1;

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  const days = [];

  for (let i = 0; i < startDay; i++) {
    days.push(
      <div
        key={`empty-${i}`}
        className="min-h-20 border border-gray-100 bg-gray-50 sm:min-h-24 md:min-h-28"
      />
    );
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isToday =
      day === new Date().getDate() &&
      month === new Date().getMonth() &&
      year === new Date().getFullYear();

    days.push(
      <div
        key={day}
        className={`min-h-20 border border-gray-100 bg-white p-2 sm:min-h-24 sm:p-3 md:min-h-28 ${
          isToday ? "bg-blue-50" : ""
        }`}
      >
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium sm:h-8 sm:w-8 ${
            isToday
              ? "bg-blue-600 text-white"
              : "text-gray-700"
          }`}
        >
          {day}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-100">
      <Sidebar />

      <main className="min-h-screen min-w-0 overflow-x-hidden md:ml-64">
        <div className="w-full min-w-0 p-4 pt-20 md:p-8 md:pt-8">
          <Header />

          <div className="mt-6 rounded-xl bg-white p-4 shadow-sm sm:p-6">
            {/* Titlu */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Calendar
                </h1>

                <p className="mt-1 text-gray-500">
                  Programări și intervenții
                </p>
              </div>

              <button
                onClick={today}
                className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 sm:w-auto"
              >
                Astăzi
              </button>
            </div>

            {/* Navigare lună */}
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={previousMonth}
                className="rounded-lg px-3 py-2 text-xl text-gray-700 transition hover:bg-gray-100"
                aria-label="Luna precedentă"
              >
                ←
              </button>

              <h2 className="text-center text-lg font-semibold text-gray-900 sm:text-xl">
                {monthNames[month]} {year}
              </h2>

              <button
                onClick={nextMonth}
                className="rounded-lg px-3 py-2 text-xl text-gray-700 transition hover:bg-gray-100"
                aria-label="Luna următoare"
              >
                →
              </button>
            </div>

            {/* Zilele săptămânii */}
            <div className="grid grid-cols-7">
              {dayNames.map((day, index) => (
                <div
                  key={day}
                  className="border border-gray-200 bg-gray-100 p-2 text-center text-xs font-semibold text-gray-600 sm:p-3 sm:text-sm"
                >
                  <span className="sm:hidden">
                    {shortDayNames[index]}
                  </span>

                  <span className="hidden sm:inline">
                    {day}
                  </span>
                </div>
              ))}
            </div>

            {/* Zilele calendarului */}
            <div className="grid grid-cols-7">
              {days}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}