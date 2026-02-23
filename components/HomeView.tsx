
import React from 'react';
import { EvaluationMetadata } from '../types';
import { PROCESS_TYPES } from '../constants';

interface HomeViewProps {
  metadata: EvaluationMetadata;
  onChange: (key: keyof EvaluationMetadata, value: string) => void;
  onStart: () => void;
  hasExistingData: boolean;
  onNewEvaluation: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ metadata, onChange, onStart, hasExistingData, onNewEvaluation }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Element (Transparent Logo Placeholder Effect) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
         <img src="/logo.png" alt="Watermark" className="w-[800px] h-auto grayscale" />
      </div>

      <div className="max-w-4xl w-full bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden relative z-10 flex flex-col md:flex-row">
        {/* Left Side: Info */}
        <div className="md:w-1/2 p-10 bg-gradient-to-br from-slate-900 to-indigo-950 text-white flex flex-col">
          <div className="mb-10">
            <img src="/logo.png" alt="Ciberlex Logo" className="h-16 w-auto mb-4 brightness-0 invert" />
            <h1 className="text-2xl font-black tracking-tight leading-tight">Sistema de Evaluación de Cumplimiento de Ciberseguridad y Protección de Datos</h1>
            <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest mt-2">Enterprise Edition v2.0</p>
          </div>

          <div className="space-y-6 flex-1">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
                <span className="text-2xl">🎯</span> Objetivo de la Evaluación
              </h2>
              <div className="space-y-4 text-slate-300 text-sm leading-relaxed text-justify">
                <p>
                  El <strong>CIBERLEX GRC ENGINE v 2.0</strong> tiene como propósito central transformar la auditoría técnica y legal en una herramienta estratégica de decisión gerencial.
                </p>
                <p>
                  Evalúa la resiliencia operacional y el nivel de cumplimiento normativo basándose en tres pilares: 
                  <strong> Cumplimiento Normativo Chileno</strong> (Ley 21.663 y 21.719), 
                  <strong> Excelencia Técnica Internacional</strong> (CIS v8.1 IG1), y 
                  <strong> Detección de Puntos de Falla Críticos</strong>.
                </p>
                <p>
                  El resultado final proporciona un diagnóstico claro sobre el Estado Operacional y la Defendibilidad Jurídica de la organización.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-[10px] text-slate-400 font-mono italic">
            Secure Deployment Logic v2.0.4 - All Rights Reserved © CIBERLEX
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-10 flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            Configuración de Evaluación
            <div className="h-1 flex-1 bg-slate-100 rounded-full"></div>
          </h3>

          <div className="space-y-5 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Proceso</label>
                <select 
                  value={metadata.processType}
                  onChange={(e) => onChange('processType', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                >
                  {PROCESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Automática</label>
                <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-500 font-medium">
                  {metadata.date}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre del Proceso Específico</label>
              <input 
                type="text"
                placeholder="Ej: Facturación y Cobranza"
                value={metadata.processName}
                onChange={(e) => onChange('processName', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Encargado del Proceso (Owner)</label>
              <input 
                type="text"
                placeholder="Nombre del responsable directo"
                value={metadata.processOwner}
                onChange={(e) => onChange('processOwner', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evaluador</label>
                <input 
                  type="text"
                  placeholder="Auditores / CISO"
                  value={metadata.evaluatorName}
                  onChange={(e) => onChange('evaluatorName', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargo</label>
                <input 
                  type="text"
                  placeholder="Rol del evaluador"
                  value={metadata.evaluatorRole}
                  onChange={(e) => onChange('evaluatorRole', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {hasExistingData && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-xs font-black text-amber-700 uppercase tracking-wide mb-1">Sesión guardada</p>
                <p className="text-[11px] text-amber-600">Hay respuestas de una evaluación anterior. Continúa o inicia una nueva.</p>
              </div>
              <button
                onClick={onNewEvaluation}
                className="text-[10px] font-black text-amber-700 hover:text-red-600 uppercase tracking-wide whitespace-nowrap transition-colors"
              >
                Nueva
              </button>
            </div>
          )}

          <button
            onClick={onStart}
            disabled={!metadata.processName || !metadata.evaluatorName}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-3 group"
          >
            {hasExistingData ? 'Continuar Auditoría' : 'Comenzar Auditoría'}
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-slate-400 text-[10px] font-medium tracking-[0.2em] uppercase">Powered by Ciberlex Intelligence Systems</p>
    </div>
  );
};

export default HomeView;
