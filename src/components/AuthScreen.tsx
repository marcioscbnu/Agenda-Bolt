import { useState } from 'react';
import { Calendar, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    if (mode === 'signup') {
      const { error } = await signUp(email, password);
      setLoading(false);
      if (error) {
        setError(error);
      } else {
        setInfo('Conta criada com sucesso! Verifique seu email se necessário, depois faça login.');
        setMode('login');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setLoading(false);
        setError('Email ou senha incorretos.');
      }
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-black via-neutral-900 to-black p-4 overflow-hidden">
      {/* Abstract decorative shapes */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-15%] right-[5%] w-[600px] h-[600px] bg-rose-500/8 rounded-full blur-3xl" />
        <div className="absolute top-[30%] right-[35%] w-[250px] h-[250px] bg-fuchsia-500/5 rounded-full blur-3xl" />
        <div className="absolute top-[15%] right-[10%] w-[200px] h-[200px] bg-white/5 rounded-full blur-2xl" />
        <div className="absolute bottom-[25%] left-[20%] w-[300px] h-[300px] bg-slate-300/5 rounded-full blur-3xl" />
        {/* Diagonal strokes */}
        <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-pink-500/15 to-transparent rotate-12" />
        <div className="absolute top-0 left-2/3 w-px h-full bg-gradient-to-b from-transparent via-white/8 to-transparent -rotate-6" />
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-400/10 to-transparent" />
        <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-400/10 to-transparent" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-400 shadow-lg shadow-pink-500/30 mb-4">
            <Calendar className="w-8 h-8 text-white" strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Agenda</h1>
          <p className="text-sm text-slate-400 mt-1">
            {mode === 'login' ? 'Acesse sua conta para continuar' : 'Crie sua conta para começar'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Mode toggle */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setInfo(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); setInfo(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'signup'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Nome</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            {info && (
              <div className="text-sm text-green-300 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-lg text-sm hover:from-pink-400 hover:to-rose-400 transition-all shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Agenda de Compromissos · Windows
        </p>
      </div>
    </div>
  );
}
