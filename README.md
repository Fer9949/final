<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# GRC Ciberseguridad y Protección de Datos

Plataforma de evaluación GRC alineada a CIS Controls IG1, Ley 21.719 (Chile), ISO 22301 y gestión de riesgo de terceros y personas. Genera planes de acción accionables con IA vía NVIDIA.

## Arquitectura

- **Frontend**: Vite 6 + React 19 + TypeScript + Tailwind CSS (compilado en el build)
- **IA**: Nemotron 3 Super 120B vía la API de NVIDIA (endpoint compatible con OpenAI), llamado a través de una función serverless de Vercel para proteger la API key
- **Persistencia**: localStorage (sin backend, evaluaciones por dispositivo)
- **Export**: PDF nativo con jsPDF (sin html2canvas)

## Desarrollo local

**Prerrequisitos**: Node.js 20+

### Opción A: Frontend solo (sin función de IA)

```bash
npm install
npm run dev
```

La app corre en `http://localhost:3000`. Todo funciona excepto el botón "Sintetizar Reporte" (la función `/api/analyze` solo existe en Vercel).

### Opción B: Stack completo (con IA local)

```bash
npm install
npx vercel dev    # emula Vercel localmente, incluye api/
```

Requiere `NVIDIA_API_KEY` en `.env.local`:

```
NVIDIA_API_KEY=nvapi-...
```

Opcionalmente `NVIDIA_MODEL` para usar otro modelo del catálogo sin tocar el código.

## Deploy a Vercel

1. Conecta el repo en https://vercel.com/new
2. Framework preset: **Vite** (autodetectado)
3. Environment Variables → agregar `NVIDIA_API_KEY` con tu key de https://build.nvidia.com
4. Deploy. La función `/api/analyze` se publica automáticamente desde `api/analyze.ts`.

### Conectar dominio de Hostinger

1. En Hostinger DNS, crear registro `CNAME`:
   - **Tipo**: CNAME
   - **Nombre**: `grc` (o el subdominio que quieras)
   - **Valor**: `cname.vercel-dns.com`
2. En Vercel: Settings → Domains → agregar `grc.tu-dominio.com`
3. Vercel emite el certificado SSL automáticamente en ~1 minuto.

## Seguridad

La API key de NVIDIA **nunca** se inyecta en el bundle del navegador. Solo vive en las variables de entorno del servidor (Vercel) y la consume la Edge Function `api/analyze.ts`. Por eso el nombre no lleva el prefijo `VITE_`: Vite solo expone al cliente las variables con ese prefijo.
