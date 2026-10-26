import { Clock, MapPin, Trash2, Pencil, CalendarX, Bell, CheckCircle2 } from 'lucide-react';
import type { EventItem } from '@/lib/supabase';

type EventListProps = {
  selectedDate: Date;
  events: EventItem[];
  onEdit: (event: EventItem) => void;
  onDelete: (id: string) => Promise<void>;
};

const COLOR_BARS: Record<string, string> = {
  pink: 'bg-pink-500',
  rose: 'bg-rose-500',
  fuchsia: 'bg-fuchsia-500',
  blush: 'bg-pink-300',
  plum: 'bg-rose-700',
  magenta: 'bg-fuchsia-700',
};

const COLOR_BG: Record<string, string> = {
  pink: 'bg-pink-500/10 border-pink-500/20',
  rose: 'bg-rose-500/10 border-rose-500/20',
  fuchsia: 'bg-fuchsia-500/10 border-fuchsia-500/20',
  blush: 'bg-pink-500/8 border-pink-400/15',
  plum: 'bg-rose-700/15 border-rose-700/25',
  magenta: 'bg-fuchsia-700/15 border-fuchsia-700/25',
};

const formatTime = (time: string | null) => {
  if (!time) return '';
  const [h, m] = time.split(':');
  return `${h}:${m}`;
};

const isEventPast = (event: EventItem): boolean => {
  if (!event.start_time) {
    const todayStr = new Date().toISOString().split('T')[0];
    return event.date < todayStr;
  }
  const eventDateTime = new Date(`${event.date}T${event.start_time}`);
  return new Date() > eventDateTime;
};

export default function EventList({ selectedDate, events, onEdit, onDelete }: EventListProps) {
  const dateStr = selectedDate.toISOString().split('T')[0];
  const dayEvents = events
    .filter((e) => e.date === dateStr)
    .sort((a, b) => (a.start_time ?? '99').localeCompare(b.start_time ?? '99'));

  const isToday = (() => {
    const t = new Date();
    return t.getFullYear() === selectedDate.getFullYear() &&
      t.getMonth() === selectedDate.getMonth() &&
      t.getDate() === selectedDate.getDate();
  })();

  const dateLabel = selectedDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white capitalize">{dateLabel}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {dayEvents.length} {dayEvents.length === 1 ? 'compromisso' : 'compromissos'}
            </p>
          </div>
          {isToday && (
            <span className="text-[10px] font-bold text-pink-400 bg-pink-500/15 px-2 py-1 rounded-full uppercase tracking-wide">
              Hoje
            </span>
          )}
        </div>
      </div>

      {/* Events */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 min-h-[200px]">
        {dayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <CalendarX className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-sm text-slate-400">Nenhum compromisso</p>
            <p className="text-xs text-slate-600 mt-0.5">Clique em "Novo" para adicionar</p>
          </div>
        ) : (
          dayEvents.map((event) => {
            const past = isEventPast(event);
            return (
              <div
                key={event.id}
                className={`group relative rounded-lg border ${COLOR_BG[event.color] || COLOR_BG.pink} p-3 pl-4 transition hover:shadow-sm ${past ? 'opacity-60' : ''}`}
              >
                {/* Color bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${COLOR_BARS[event.color] || 'bg-pink-500'}`} />

                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className={`text-sm font-semibold text-white truncate ${past ? 'line-through decoration-2 decoration-slate-500' : ''}`}>
                        {event.title}
                      </h4>
                      {past && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                    </div>

                    {(event.start_time || event.end_time) && (
                      <div className={`flex items-center gap-1.5 mt-1 text-xs text-slate-400 ${past ? 'line-through decoration-1 decoration-slate-600' : ''}`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {formatTime(event.start_time)}
                          {event.end_time ? ` — ${formatTime(event.end_time)}` : ''}
                        </span>
                      </div>
                    )}

                    {event.location && (
                      <div className={`flex items-center gap-1.5 mt-1 text-xs text-slate-400 ${past ? 'line-through decoration-1 decoration-slate-600' : ''}`}>
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}

                    {event.description && (
                      <p className={`text-xs text-slate-500 mt-1.5 line-clamp-2 ${past ? 'line-through decoration-1 decoration-slate-300' : ''}`}>
                        {event.description}
                      </p>
                    )}

                    {event.notify && !past && (
                      <div className="flex items-center gap-1 mt-1.5 text-[11px] text-pink-500 font-medium">
                        <Bell className="w-3 h-3" />
                        <span>Aviso {event.notify_minutes}min antes</span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                    <button
                      onClick={() => onEdit(event)}
                      className="p-1.5 rounded-md hover:bg-white/10 text-slate-500 hover:text-slate-200 transition"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(event.id)}
                      className="p-1.5 rounded-md hover:bg-white/10 text-slate-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
