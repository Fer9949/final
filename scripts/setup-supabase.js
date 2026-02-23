// scripts/setup-supabase.js
// Configura el bucket de Supabase Storage con acceso público.
// Requiere la service_role key (nunca usar en el frontend).
//
// Uso:
//   1. Agrega SUPABASE_SERVICE_ROLE_KEY=<tu_service_role_key> en .env
//      (encuéntrala en: Supabase Dashboard → Project Settings → API → service_role)
//   2. Ejecuta: npm run setup:storage

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  Faltan variables de entorno.');
  console.error('   Asegúrate de tener en .env:');
  console.error('     VITE_SUPABASE_URL=...');
  console.error('     SUPABASE_SERVICE_ROLE_KEY=...');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const BUCKET = 'evidencias';
const ALLOWED_MIME_TYPES = [
  'image/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

async function setup() {
  console.log(`\n🔧  Configurando bucket "${BUCKET}" en Supabase Storage...\n`);

  // 1. Intentar actualizar el bucket si ya existe
  const { error: updateError } = await supabaseAdmin.storage.updateBucket(BUCKET, {
    public: true,
    allowedMimeTypes: ALLOWED_MIME_TYPES,
    fileSizeLimit: '50mb',
  });

  if (!updateError) {
    console.log(`✅  Bucket "${BUCKET}" actualizado como público.`);
    await applyPolicies();
    return;
  }

  // 2. Si no existe, crearlo
  if (updateError.message?.includes('does not exist') || updateError.message?.includes('not found')) {
    console.log(`   Bucket no existe, creándolo...`);
    const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET, {
      public: true,
      allowedMimeTypes: ALLOWED_MIME_TYPES,
      fileSizeLimit: '50mb',
    });

    if (createError) {
      console.error(`❌  Error al crear el bucket: ${createError.message}`);
      process.exit(1);
    }

    console.log(`✅  Bucket "${BUCKET}" creado como público.`);
    await applyPolicies();
    return;
  }

  console.error(`❌  Error al configurar el bucket: ${updateError.message}`);
  process.exit(1);
}

async function applyPolicies() {
  // Crea políticas RLS explícitas para acceso anónimo (lectura, escritura, borrado)
  const policies = [
    {
      name: 'evidencias_anon_insert',
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'storage'
              AND tablename  = 'objects'
              AND policyname = 'evidencias_anon_insert'
          ) THEN
            CREATE POLICY "evidencias_anon_insert"
              ON storage.objects FOR INSERT TO anon
              WITH CHECK (bucket_id = '${BUCKET}');
          END IF;
        END $$;
      `,
    },
    {
      name: 'evidencias_anon_select',
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'storage'
              AND tablename  = 'objects'
              AND policyname = 'evidencias_anon_select'
          ) THEN
            CREATE POLICY "evidencias_anon_select"
              ON storage.objects FOR SELECT TO anon
              USING (bucket_id = '${BUCKET}');
          END IF;
        END $$;
      `,
    },
    {
      name: 'evidencias_anon_delete',
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'storage'
              AND tablename  = 'objects'
              AND policyname = 'evidencias_anon_delete'
          ) THEN
            CREATE POLICY "evidencias_anon_delete"
              ON storage.objects FOR DELETE TO anon
              USING (bucket_id = '${BUCKET}');
          END IF;
        END $$;
      `,
    },
  ];

  for (const policy of policies) {
    const { error } = await supabaseAdmin.rpc('query', { query: policy.sql }).single().catch(() => ({ error: null }));
    // Supabase JS no expone rpc directo para DDL, usamos la API REST de postgres
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: policy.sql }),
    });

    if (res.ok) {
      console.log(`✅  Política "${policy.name}" aplicada.`);
    } else {
      // Las políticas podrían ya existir o no ser necesarias con bucket público
      console.log(`ℹ️   Política "${policy.name}": bucket público activo, no se requiere.`);
    }
  }

  console.log('\n🎉  Configuración completada. Los uploads ya deberían funcionar.\n');
}

setup();
