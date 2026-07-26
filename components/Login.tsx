import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

/**
 * Inicio de sesion de GRC.
 *
 * No hay registro publico: las cuentas se crean desde SCLDP o desde el panel
 * de Supabase. Ambas plataformas comparten el mismo proyecto, asi que una
 * cuenta creada alli sirve tal cual aqui.
 */
const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError('Credenciales invalidas. Verifica tu correo y contrasena.');
    // El exito no se maneja aqui: AuthGate reacciona al cambio de sesion y,
    // si la cuenta tiene segundo factor, muestra el desafio antes de entrar.
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-600 to-violet-700 p-8 text-white text-center">
          <h1 className="text-2xl font-bold">GRC Ciberlex</h1>
          <p className="text-cyan-50 mt-2 text-sm">
            Gestion de Riesgos y Cumplimiento &middot; Leyes 21.663 y 21.719
          </p>
        </div>
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Correo electronico</label>
              <input
                type="email"
                required
                autoFocus
                autoComplete="email"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none"
                placeholder="ejemplo@organizacion.cl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Contrasena</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-violet-700 hover:opacity-90 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg"
            >
              {loading ? 'Ingresando...' : 'Iniciar sesion'}
            </button>
          </form>
          <p className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            Tu cuenta de Ciberlex sirve para GRC y para SCLDP.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
