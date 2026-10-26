import { useState, type FormEvent } from 'react';
import { X, MapPin, Clock, Bell } from 'lucide-react';
import type { EventItem, EventInput } from '@/lib/supabase';

type EventFormProps = {
  selectedDate: Date;
  event?: EventItem | null;
  onSave: (data: EventInput, id?: string) => Promise<void>;
  onClose: () => void;
  onDelete?: (id: string) => Promise<void>;
};

const COLORS = [
  { key: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { key: 'rose', label: 'Rose', class: 'bg-rose-500' },
  { key: 'fuchsia', label: 'Fúcsia', class: 'bg-fuchsia-500' },
  { key: 'blush', label: 'Rosa claro', class: 'bg-pink-300' },
  { key: 'plum', label: 'Ameixa', class: 'bg-rose-700' },
  { key: 'magenta', label: 'Magenta', class: 'bg-fuchsia-700' },
];

const formatDateInput = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatDisplayDate = (date: Date) => {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default function EventForm({
  selectedDate,
  event,
  onSave,
  onClose,
  onDelete,
}: EventFormProps) {
  const isEditing = !!event;
  const [title, setTitle] = useState(event?.title ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [date, setDate] = useState(event?.date ?? formatDateInput(selectedDate));
  const [startTime, setStartTime] = useState(event?.start_time ?? '');
  const [endTime, setEndTime] = useState(event?.end_time ?? '');
  const [location, setLocation] = useState(event?.location ?? '');
  const [color, setColor] = useState(event?.color ?? 'pink');
  const [notify, setNotify] = useState(event?.notify ?? false);
  const [notifyMinutes, setNotifyMinutes] = useState(event?.notify_minutes ?? 15);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('O título é obrigatório.');
      return;
    }
    if (startTime && endTime && endTime <= startTime) {
      setError('O horário de término deve ser depois do início.');
      return;
    }

    setError(null);
    setSaving(true);

    const data: EventInput = {
      title: title.trim(),
      description: description.trim() || null,
      date,
      start_time: startTime || null,
      end_time: endTime || null,
      location: location.trim() || null,
      color,
      notify,
      notify_minutes: notifyMinutes,
    };

    await onSave(data, event?.id);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!event || !onDelete) return;
    setDeleting(true);
    await onDelete(event.id);
    setDeleting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {isEditing ? 'Editar compromisso' : 'Novo compromisso'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 capitalize">{formatDisplayDate(selectedDate)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Título *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Reunião com cliente"
              autoFocus
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-400 transition"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Data *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-400 transition"
            />
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Início
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-400 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Término
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-400 transition"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Local
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Sala 3, Predio B"
                className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-400 transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes do compromisso..."
              rows={3}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-400 transition resize-none"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
              Cor
            </label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setColor(c.key)}
                  title={c.label}
                  className={`w-8 h-8 rounded-full transition-all ${c.class} ${
                    color === c.key
                      ? 'ring-2 ring-offset-2 ring-slate-400 scale-110'
                      : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Notification */}
          <div className="border border-slate-200 rounded-lg p-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => setNotify(!notify)}
                className={`relative w-10 h-6 rounded-full transition ${notify ? 'bg-pink-500' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${notify ? 'left-[1.125rem]' : 'left-0.5'}`} />
              </button>
              <div className="flex items-center gap-1.5">
                <Bell className={`w-4 h-4 ${notify ? 'text-pink-500' : 'text-slate-400'}`} />
                <span className="text-sm font-medium text-slate-700">Avisar do evento</span>
              </div>
            </label>
            {notify && (
              <div className="pl-[3.25rem]">
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Avisar com quantos minutos de antecedência?
                </label>
                <select
                  value={notifyMinutes}
                  onChange={(e) => setNotifyMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-400 transition"
                >
                  <option value={5}>5 minutos antes</option>
                  <option value={10}>10 minutos antes</option>
                  <option value={15}>15 minutos antes</option>
                  <option value={30}>30 minutos antes</option>
                  <option value={60}>1 hora antes</option>
                </select>
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {isEditing && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-sm font-medium text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                >
                  {deleting ? 'Excluindo...' : 'Excluir'}
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg hover:from-pink-400 hover:to-rose-400 transition shadow-md shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar compromisso'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
