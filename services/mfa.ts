import { supabase } from './supabaseClient';

/**
 * Segundo factor (TOTP) sobre Supabase Auth.
 *
 * Supabase modela el segundo factor con dos conceptos:
 *  - Factor: el autenticador enrolado (una app tipo Google Authenticator).
 *  - AAL (Authenticator Assurance Level): el nivel de la sesion actual.
 *      aal1 = solo contrasena, aal2 = contrasena + TOTP verificado.
 *
 * Un factor recien enrolado queda en estado 'unverified' hasta que se
 * confirma con un codigo; solo entonces pasa a 'verified' y empieza a
 * exigirse en los inicios de sesion posteriores.
 */

export type EnrollResult = {
  factorId: string;
  /** SVG (data URI) del codigo QR que se escanea con la app autenticadora. */
  qrCode: string;
  /** Clave en texto, para quien no pueda escanear el QR. */
  secret: string;
};

export type AalState = {
  /** Nivel de la sesion en curso. */
  current: 'aal1' | 'aal2' | null;
  /** Nivel al que la sesion *deberia* llegar segun los factores enrolados. */
  next: 'aal1' | 'aal2' | null;
};

/**
 * Factores TOTP ya confirmados por el usuario.
 *
 * `data.totp` viene filtrado por el SDK a los factores verificados; los que
 * quedaron a medio enrolar solo aparecen en `data.all`.
 */
export const listVerifiedFactors = async () => {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) throw error;
  return data?.totp ?? [];
};

/** true si el usuario ya tiene el segundo factor activo. */
export const hasMfaEnabled = async () => (await listVerifiedFactors()).length > 0;

/**
 * Inicia el enrolamiento y devuelve el QR real generado por Supabase.
 *
 * Si quedo un factor a medio enrolar de un intento anterior se descarta
 * primero: Supabase rechaza nombres duplicados y el usuario quedaria
 * bloqueado sin poder reintentar.
 */
export const startEnrollment = async (friendlyName = 'Ciberlex'): Promise<EnrollResult> => {
  const { data: existing } = await supabase.auth.mfa.listFactors();
  const stale = (existing?.all ?? []).filter(
    (f) => f.factor_type === 'totp' && f.status !== 'verified',
  );
  for (const f of stale) {
    await supabase.auth.mfa.unenroll({ factorId: f.id });
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName,
  });
  if (error) throw error;
  if (!data) throw new Error('Supabase no devolvio datos de enrolamiento.');

  return {
    factorId: data.id,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
  };
};

/**
 * Confirma un codigo de 6 digitos contra un factor.
 *
 * Lanza si el codigo es incorrecto: la version anterior devolvia `false` en
 * silencio y la pantalla lo interpretaba como exito, dando por activado un
 * 2FA que nunca lo estuvo.
 */
export const confirmCode = async (factorId: string, code: string): Promise<void> => {
  const challenge = await supabase.auth.mfa.challenge({ factorId });
  if (challenge.error) throw challenge.error;
  if (!challenge.data) throw new Error('No se pudo iniciar el desafio de verificacion.');

  const verify = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.data.id,
    code,
  });
  if (verify.error) throw verify.error;
};

/** Quita el segundo factor. Requiere una sesion ya elevada a aal2. */
export const removeFactor = async (factorId: string): Promise<void> => {
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) throw error;
};

/** Nivel de garantia de la sesion actual. */
export const getAal = async (): Promise<AalState> => {
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error) throw error;
  return {
    current: (data?.currentLevel as AalState['current']) ?? null,
    next: (data?.nextLevel as AalState['next']) ?? null,
  };
};

/**
 * true cuando el usuario tiene 2FA enrolado pero la sesion sigue en aal1,
 * es decir: entro con la contrasena y todavia le falta el codigo.
 */
export const needsMfaChallenge = async (): Promise<boolean> => {
  const { current, next } = await getAal();
  return current === 'aal1' && next === 'aal2';
};
