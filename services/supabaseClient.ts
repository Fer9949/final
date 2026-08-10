import { createClient } from '@supabase/supabase-js';

/**
 * Cliente de Supabase para GRC.
 *
 * Apunta al MISMO proyecto que SCLDP a proposito: asi una persona usa una
 * sola cuenta, con un solo enrolamiento de segundo factor, para entrar a
 * ambas plataformas desde ciberlex.cl. Si cada app tuviera su propio
 * proyecto habria que registrarse y enrolar el 2FA dos veces.
 *
 * La URL y la clave publicable son seguras en el navegador: son publicas por
 * diseno y el acceso a los datos lo restringe Row Level Security.
 *
 * Se sobreescriben con VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
 */
const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://mehgbhvkrknllyzwjbud.supabase.co';
const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_VflxqNn-qcfZNW229W_7XQ_YN8TdKhq';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
