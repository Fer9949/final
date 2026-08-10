import React, { useEffect, useState } from 'react';
import {
  confirmCode,
  listVerifiedFactors,
  removeFactor,
  startEnrollment,
  type EnrollResult,
} from '../services/mfa';

type Stage = 'cargando' | 'activo' | 'qr' | 'codigo' | 'listo';

interface MfaSetupProps {
  /** Se dispara al cerrar el enrolamiento, para que quien lo use reevalue el acceso. */
  onDone?: () => void;
}

const MfaSetup: React.FC<MfaSetupProps> = ({ onDone }) => {
  const [stage, setStage] = useState<Stage>('cargando');
  const [enrollment, setEnrollment] = useState<EnrollResult | null>(null);
  const [activeFactorId, setActiveFactorId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listVerifiedFactors()
      .then((factors) => {
        if (factors[0]) {
          setActiveFactorId(factors[0].id);
          setStage('activo');
        } else {
          setStage('qr');
        }
      })
      .catch(() => {
        setError('No se pudo consultar el estado del segundo factor.');
        setStage('qr');
      });
  }, []);

  // El QR se pide a Supabase recien cuando hace falta mostrarlo.
  useEffect(() => {
    if (stage !== 'qr' || enrollment) return;
    setLoading(true);
    startEnrollment()
      .then(setEnrollment)
      .catch(() => setError('No se pudo generar el codigo QR. Intenta nuevamente.'))
      .finally(() => setLoading(false));
  }, [stage, enrollment]);

  const handleVerify = async () => {
    if (!enrollment) return;
    setError(null);
    setLoading(true);
    try {
      await confirmCode(enrollment.factorId, code);
      setStage('listo');
    } catch {
      setError('Codigo incorrecto o vencido. Los codigos cambian cada 30 segundos.');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!activeFactorId) return;
    setError(null);
    setLoading(true);
    try {
      await removeFactor(activeFactorId);
      setActiveFactorId(null);
      setEnrollment(null);
      setStage('qr');
    } catch {
      setError('No se pudo desactivar el segundo factor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Seguridad en Dos Pasos</h2>
            <p className="text-slate-500 text-sm">Protege tu cuenta con un nivel extra de seguridad.</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-violet-700 rounded-2xl flex items-center justify-center text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
        </div>

        <div className="p-10">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {stage === 'cargando' && (
            <p className="text-center text-slate-400 py-12">Cargandoâ€¦</p>
          )}

          {stage === 'activo' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 text-green-600 mx-auto rounded-full flex items-center justify-center">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Segundo factor activo</h3>
                <p className="text-sm text-slate-500">
                  Tu cuenta pide un codigo de tu aplicacion autenticadora en cada inicio de sesion.
                </p>
              </div>
              <button
                onClick={handleDisable}
                disabled={loading}
                className="text-sm text-red-600 font-semibold hover:underline disabled:opacity-50"
              >
                {loading ? 'Desactivandoâ€¦' : 'Desactivar segundo factor'}
              </button>
            </div>
          )}

          {stage === 'qr' && (
            <div className="text-center space-y-6">
              <div className="w-48 h-48 bg-white mx-auto rounded-3xl flex items-center justify-center border-4 border-slate-100 shadow-inner overflow-hidden">
                {enrollment ? (
                  <img src={enrollment.qrCode} alt="Codigo QR para la aplicacion autenticadora" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-sm text-slate-400">{loading ? 'Generandoâ€¦' : 'Sin codigo'}</span>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-800">1. Escanea el codigo QR</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Usa Google Authenticator, Microsoft Authenticator o cualquier app compatible con TOTP.
                </p>
              </div>
              {enrollment && (
                <details className="text-left max-w-sm mx-auto">
                  <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
                    Â¿No puedes escanear? Ingresa la clave manualmente
                  </summary>
                  <code className="mt-2 block break-all bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-700">
                    {enrollment.secret}
                  </code>
                </details>
              )}
              <button
                onClick={() => setStage('codigo')}
                disabled={!enrollment}
                className="w-full bg-gradient-to-r from-cyan-600 to-violet-700 text-white py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-colors"
              >
                He escaneado el codigo
              </button>
            </div>
          )}

          {stage === 'codigo' && (
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <h3 className="text-lg font-bold text-slate-800">2. Verifica el dispositivo</h3>
                <p className="text-sm text-slate-500">Ingresa el codigo de 6 digitos que aparece en tu aplicacion.</p>
              </div>
              <div className="flex justify-center">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  autoFocus
                  className="w-48 text-center text-3xl font-bold tracking-[0.4em] py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-cyan-500 outline-none"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                />
              </div>
              <div className="flex gap-4">
                <button onClick={() => { setStage('qr'); setError(null); }} className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50">
                  Atras
                </button>
                <button
                  onClick={handleVerify}
                  disabled={loading || code.length < 6}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-violet-700 text-white py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Verificandoâ€¦' : 'Confirmar'}
                </button>
              </div>
            </div>
          )}

          {stage === 'listo' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 text-green-600 mx-auto rounded-full flex items-center justify-center">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Segundo factor activado</h3>
                <p className="text-sm text-slate-500">
                  A partir del proximo inicio de sesion se te pedira el codigo de tu autenticador.
                </p>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-2xl text-left">
                <p className="text-xs font-bold text-yellow-800 uppercase tracking-widest mb-2">Guarda tu acceso</p>
                <p className="text-xs text-yellow-900 leading-relaxed">
                  Si pierdes el dispositivo perderas el acceso a tu cuenta. Un administrador de tu
                  organizacion debera restablecer el segundo factor para que puedas volver a entrar.
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveFactorId(enrollment?.factorId ?? null);
                  setStage('activo');
                  onDone?.();
                }}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold"
              >
                Finalizar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MfaSetup;
