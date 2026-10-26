import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { EventItem } from '@/lib/supabase';

type CalendarProps = {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  events: EventItem[];
};

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const COLOR_DOTS: Record<string, string> = {
  pink: 'bg-pink-500',
  rose: 'bg-rose-500',
  fuchsia: 'bg-fuchsia-500',
  blush: 'bg-pink-300',
  plum: 'bg-rose-700',
  magenta: 'bg-fuchsia-700',
};

export default function CalendarView({
  currentMonth,
  onMonthChange,
  selectedDate,
  onDateSelect,
  events,
}: CalendarProps) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells: Array<{ day: number; date: Date; current: boolean }> = [];

  // Leading days from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, daysInPrevMonth - i);
    cells.push({ day: d.getDate(), date: d, current: false });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    cells.push({ day: d, date, current: true });
  }
  // Trailing days to fill 6 rows
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d);
    cells.push({ day: d, date, current: false });
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter((e) => e.date === dateStr);
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const prevMonth = () => onMonthChange(new Date(year, month - 1, 1));
  const nextMonth = () => onMonthChange(new Date(year, month + 1, 1));
  const goToday = () => {
    onMonthChange(new Date(today.getFullYear(), today.getMonth(), 1));
    onDateSelect(today);
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-white/10 transition text-slate-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-white/10 transition text-slate-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <h2 className="text-base font-semibold text-white ml-2">
            {MONTHS[month]} <span className="text-slate-400 font-normal">{year}</span>
          </h2>
        </div>
        <button
          onClick={goToday}
          className="text-xs font-medium text-pink-400 hover:text-pink-300 px-3 py-1.5 rounded-lg hover:bg-pink-500/10 transition"
        >
          Hoje
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 px-3 pt-3 pb-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 px-3 pb-3">
        {cells.map((cell, i) => {
          const cellEvents = getEventsForDate(cell.date);
          const isToday = isSameDay(cell.date, today);
          const isSelected = isSameDay(cell.date, selectedDate);

          return (
            <button
              key={i}
              onClick={() => onDateSelect(cell.date)}
              className={`
                relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all
                ${cell.current ? 'text-slate-200' : 'text-slate-600'}
                ${isSelected
                  ? 'bg-pink-500 text-white font-semibold shadow-md shadow-pink-500/30'
                  : isToday
                    ? 'bg-pink-500/15 text-pink-400 font-semibold ring-1 ring-pink-500/30'
                    : 'hover:bg-white/8'}
              `}
            >
              <span className={isToday && !isSelected ? 'text-pink-400' : ''}>
                {cell.day}
              </span>
              {cellEvents.length > 0 && (
                <div className="absolute bottom-1.5 flex gap-0.5 flex-wrap justify-center max-w-[90%]">
                  {cellEvents.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : COLOR_DOTS[e.color] || 'bg-pink-500'}`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
