import { AlertCircle } from 'lucide-react';
import type { EventItem } from '@/lib/supabase';

type NotificationModalProps = {
  event: EventItem;
  onConfirm: () => void;
};

const formatTime = (time: string | null) => {
  if (!time) return '';
  const [h, m] = time.split(':');
  return `${h}:${m}`;
};

export default function NotificationModal({ event, onConfirm }: NotificationModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header bar */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Atenção!</h2>
            <p className="text-xs text-white/80">Lembrete de compromisso</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 text-center">
          <p className="text-sm text-slate-700 leading-relaxed">
            Não esqueça do evento{' '}
            <span className="font-semibold text-slate-900">"{event.title}"</span>{' '}
            agendado para{' '}
            <span className="font-semibold text-pink-600">
              {formatTime(event.start_time)}
            </span>
            .
          </p>
        </div>

        {/* Action */}
        <div className="px-6 pb-6 flex justify-center">
          <button
            onClick={onConfirm}
            className="px-8 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg hover:from-pink-400 hover:to-rose-400 transition shadow-md shadow-pink-500/20"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
