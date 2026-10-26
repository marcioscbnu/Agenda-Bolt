import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, LogOut, Plus, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type EventItem, type EventInput } from '@/lib/supabase';
import CalendarView from '@/components/CalendarView';
import EventList from '@/components/EventList';
import EventForm from '@/components/EventForm';
import NotificationModal from '@/components/NotificationModal';

const getEventDateTime = (event: EventItem): Date | null => {
  if (!event.start_time) return null;
  return new Date(`${event.date}T${event.start_time}`);
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [search, setSearch] = useState('');
  const [notificationEvent, setNotificationEvent] = useState<EventItem | null>(null);
  const eventsRef = useRef<EventItem[]>([]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('Erro ao carregar eventos:', error);
    } else {
      const fetched = data as EventItem[];
      setEvents(fetched);
      eventsRef.current = fetched;
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const markNotified = async (id: string) => {
    await supabase.from('events').update({ notified: true }).eq('id', id);
  };

  // Notification checker — runs every 30 seconds
  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date();
      const currentEvents = eventsRef.current;

      for (const event of currentEvents) {
        if (!event.notify || event.notified) continue;
        const eventDateTime = getEventDateTime(event);
        if (!eventDateTime) continue;

        const notifyTime = new Date(eventDateTime.getTime() - event.notify_minutes * 60000);

        // Show notification when current time is at or past the notify time,
        // but before the event start time
        if (now >= notifyTime && now < eventDateTime) {
          setNotificationEvent(event);
          markNotified(event.id);
          // update local state
          setEvents((prev) =>
            prev.map((e) => (e.id === event.id ? { ...e, notified: true } : e))
          );
          eventsRef.current = eventsRef.current.map((e) =>
            e.id === event.id ? { ...e, notified: true } : e
          );
          break;
        }
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = async (data: EventInput, id?: string) => {
    if (id) {
      const { error } = await supabase.from('events').update(data).eq('id', id);
      if (error) {
        console.error('Erro ao atualizar:', error);
        return;
      }
    } else {
      const { error } = await supabase.from('events').insert(data);
      if (error) {
        console.error('Erro ao criar:', error);
        return;
      }
    }
    await fetchEvents();
    setShowForm(false);
    setEditingEvent(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      console.error('Erro ao excluir:', error);
      return;
    }
    await fetchEvents();
    if (editingEvent?.id === id) {
      setShowForm(false);
      setEditingEvent(null);
    }
  };

  const filteredEvents = useMemo(() => {
    if (!search.trim()) return events;
    const q = search.toLowerCase();
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q)
    );
  }, [events, search]);

  const upcomingCount = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return events.filter((e) => e.date >= todayStr).length;
  }, [events]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  })();

  return (
    <div className="min-h-screen relative flex flex-col bg-gradient-to-br from-black via-neutral-900 to-black overflow-hidden">
      {/* Abstract decorative shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Pink strokes */}
        <div className="absolute top-[-10%] left-[5%] w-[500px] h-[500px] bg-pink-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-[-15%] right-[10%] w-[600px] h-[600px] bg-rose-500/6 rounded-full blur-3xl" />
        <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-fuchsia-500/5 rounded-full blur-3xl" />
        {/* White/light gray strokes */}
        <div className="absolute top-[10%] right-[5%] w-[200px] h-[200px] bg-white/4 rounded-full blur-2xl" />
        <div className="absolute bottom-[20%] left-[15%] w-[350px] h-[350px] bg-slate-300/5 rounded-full blur-3xl" />
        {/* Diagonal pink lines */}
        <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-pink-500/10 to-transparent rotate-12" />
        <div className="absolute top-0 left-2/3 w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent -rotate-6" />
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-400/8 to-transparent" />
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-400/10 to-transparent" />
      </div>

      {/* Top bar */}
      <header className="relative bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center shadow-sm shadow-pink-500/30">
              <Calendar className="w-5 h-5 text-white" strokeWidth={2.2} />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-white leading-tight">Agenda</p>
              <p className="text-[11px] text-slate-400 leading-tight">Windows</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar compromissos..."
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:bg-white/10 focus:border-pink-400/50 focus:ring-2 focus:ring-pink-500/20 transition"
            />
          </div>

          {/* User + logout */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:block text-right">
              <p className="text-xs text-slate-400">{greeting}</p>
              <p className="text-sm font-medium text-white max-w-[160px] truncate">
                {user?.email}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-sm font-semibold text-white">
              {(user?.email ?? '?')[0].toUpperCase()}
            </div>
            <button
              onClick={signOut}
              title="Sair"
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 z-10">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3.5">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Total</p>
            <p className="text-2xl font-bold text-white mt-1">{events.length}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3.5">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Próximos</p>
            <p className="text-2xl font-bold text-pink-400 mt-1">{upcomingCount}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3.5 col-span-2 sm:col-span-1">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Hoje</p>
            <p className="text-2xl font-bold text-rose-400 mt-1">
              {events.filter((e) => e.date === new Date().toISOString().split('T')[0]).length}
            </p>
          </div>
        </div>

        {/* Calendar + Event list */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <CalendarView
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              events={filteredEvents}
            />
          </div>
          <div className="lg:col-span-1">
            <EventList
              selectedDate={selectedDate}
              events={filteredEvents}
              onEdit={(e) => {
                setEditingEvent(e);
                setShowForm(true);
              }}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={() => {
          setEditingEvent(null);
          setShowForm(true);
        }}
        className="fixed bottom-6 right-6 z-20 w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-xl shadow-pink-500/30 hover:scale-105 hover:shadow-pink-500/40 transition-all flex items-center justify-center group"
        title="Novo compromisso"
      >
        <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" strokeWidth={2.5} />
      </button>

      {/* Form modal */}
      {showForm && (
        <EventForm
          selectedDate={selectedDate}
          event={editingEvent}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingEvent(null);
          }}
          onDelete={handleDelete}
        />
      )}

      {/* Notification modal */}
      {notificationEvent && (
        <NotificationModal
          event={notificationEvent}
          onConfirm={() => setNotificationEvent(null)}
        />
      )}

      {/* Loading overlay */}
      {loading && events.length === 0 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="w-8 h-8 border-[3px] border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
