import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { hasMfaEnabled, needsMfaChallenge } from '../services/mfa';
import Login from './Login';
import MfaChallenge from './MfaChallenge';
import MfaSetup from './MfaSetup';

/**
 * Si es true, nadie entra sin segundo factor: a quien no lo tenga enrolado se
 * le exige hacerlo antes de ver la aplicacion. Ponerlo en false lo deja
 * opcional (solo se pide el codigo a quien ya lo tenga).
 */
const REQUIRE_MFA = true;

type Stage = 'cargando' | 'login' | 'desafio' | 'enrolar' | 'dentro';

/**
 * Control de acceso de GRC.
 *
 * Envuelve la aplicacion en la raiz en vez de tocar App.tsx, que concentra
 * toda la logica de evaluacion y no tiene nada que ver con la autenticacion.
 *
 * Tener sesion no alcanza: Supabase la abre en aal1 tras validar la
 * contrasena y solo la eleva a aal2 cuando se verifica el TOTP. Sin mirar ese
 * nivel, la contrasena sola daria acceso y el segundo factor seria decorativo.
 */
const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stage, setStage] = useState<Stage>('cargando');
  const [email, setEmail] = useState<string | null>(null);

  const resolveStage = async (session: unknown) => {
    if (!session) {
      setEmail(null);
      setStage('login');
      return;
    }
    try {
      if (await needsMfaChallenge()) {
        setStage('desafio');
        return;
      }
      if (REQUIRE_MFA && !(await hasMfaEnabled())) {
        setStage('enrolar');
        return;
      }
      setStage('dentro');
    } catch {
      // Si no se puede determinar el nivel de la sesion, se pide el segundo
      // factor. Preferimos bloquear de mas antes que abrir con la contrasena.
      setStage('desafio');
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setEmail(data.session?.user?.email ?? null);
      await resolveStage(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      // Supabase desaconseja llamar a su API dentro del callback.
      setTimeout(() => { void resolveStage(session); }, 0);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (stage === 'cargando') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-300">
        Cargando...
      </div>
    );
  }

  if (stage === 'login') return <Login />;

  if (stage === 'desafio') {
    return <MfaChallenge onVerified={() => { void resolveStage(true); }} />;
  }

  if (stage === 'enrolar') {
    return (
      <div className="min-h-screen bg-slate-100 py-10 px-4">
        <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between text-sm">
          <p className="text-slate-600">
            <span className="font-semibold">Activa el segundo factor para continuar.</span>
            {email && <span className="text-slate-400"> &middot; {email}</span>}
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-slate-500 hover:underline"
          >
            Cerrar sesion
          </button>
        </div>
        <MfaSetup onDone={() => { void resolveStage(true); }} />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGate;
