"use client";

import { useState } from "react";

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
        className="min-h-24 bg-gray-50 border border-gray-100"
      />
    );
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(
      <div
        key={day}
        className="min-h-24 bg-white border border-gray-100 p-3 hover:bg-gray-50 cursor-pointer"
      >
        <span className="text-sm font-medium text-gray-700">
          {day}
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="bg-white rounded-xl shadow p-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Calendar
            </h1>

            <p className="text-gray-500 mt-1">
              Programări și intervenții
            </p>
          </div>

          <button
            onClick={today}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Astăzi
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">

          <button
            onClick={previousMonth}
            className="px-4 py-2 rounded-lg hover:bg-gray-100 text-xl"
          >
            ←
          </button>

          <h2 className="text-xl font-semibold text-gray-900">
            {monthNames[month]} {year}
          </h2>

          <button
            onClick={nextMonth}
            className="px-4 py-2 rounded-lg hover:bg-gray-100 text-xl"
          >
            →
          </button>

        </div>

        <div className="grid grid-cols-7">
          {dayNames.map((day) => (
            <div
              key={day}
              className="bg-gray-100 border border-gray-200 p-3 text-center font-semibold text-gray-600"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days}
        </div>

      </div>
    </div>
  );
}