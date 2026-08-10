import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { confirmCode, listVerifiedFactors } from '../services/mfa';

interface MfaChallengeProps {
  /** Se dispara cuando la sesion ya quedo elevada a aal2. */
  onVerified: () => void;
}

/**
 * Segundo paso del inicio de sesion: la contrasena ya se valido, pero la
 * sesion sigue en aal1 y no da acceso a los datos hasta presentar el codigo.
 */
const MfaChallenge: React.FC<MfaChallengeProps> = ({ onVerified }) => {
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listVerifiedFactors()
      .then((factors) => {
        if (factors[0]) setFactorId(factors[0].id);
        else setError('No se encontro un autenticador enrolado para esta cuenta.');
      })
      .catch(() => setError('No se pudo consultar el segundo factor.'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;
    setError(null);
    setLoading(true);
    try {
      await confirmCode(factorId, code);
      onVerified();
    } catch {
      setError('Codigo incorrecto o vencido. Los codigos cambian cada 30 segundos.');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const cancel = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-600 to-violet-700 p-8 text-white text-center">
          <h1 className="text-2xl font-bold">Verificacion en dos pasos</h1>
          <p className="text-cyan-50 mt-2 text-sm">
            Ingresa el codigo de tu aplicacion autenticadora
          </p>
        </div>
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              autoFocus
              required
              className="w-full text-center text-3xl font-bold tracking-[0.4em] py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-cyan-500 outline-none"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
            />
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading || code.length < 6 || !factorId}
              className="w-full bg-gradient-to-r from-cyan-600 to-violet-700 hover:opacity-90 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-cyan-500/30"
            >
              {loading ? 'Verificandoâ€¦' : 'Verificar'}
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-3">
            <p className="text-xs text-slate-500">
              Â¿Perdiste el acceso a tu autenticador? Un administrador de tu organizacion
              puede restablecer el segundo factor de tu cuenta.
            </p>
            <button onClick={cancel} className="text-sm text-slate-500 hover:underline">
              Cancelar e iniciar sesion con otra cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MfaChallenge;
