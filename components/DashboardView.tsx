
import React, { useMemo, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { GRCState, ModuleId } from '../types';
import { MODULES, ICONS } from '../constants';
import { calculateModuleScore, getScoreLevel1000, getTopModuleGaps, GapFinding } from '../utils/scoring';
import { GoogleGenAI } from "@google/genai";

interface DashboardViewProps {
  state: GRCState;
  onSwitchModule: (id: ModuleId) => void;
  onGoHome: () => void;
}

// Utility to calculate precise SVG arc paths
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees - 180) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y, 
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
};

const GaugeIndicator: React.FC<{ score: number }> = ({ score }) => {
  const score1000 = Math.round((score / 100) * 1000);
  const info = getScoreLevel1000(score1000);
  
  const cx = 100;
  const cy = 100;
  const r = 80;
  const stroke = 18;

  const needleRotation = (score1000 / 1000) * 180;

  return (
    <div className="relative flex flex-col items-center justify-center p-2 w-full max-w-[320px] mx-auto">
      <svg viewBox="0 0 200 130" className="w-full h-auto filter drop-shadow-xl overflow-visible">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Gray Background Track */}
        <path 
          d={describeArc(cx, cy, r, 0, 180)} 
          fill="none" 
          stroke="#e2e8f0" 
          strokeWidth={stroke} 
          strokeLinecap="round" 
        />
        
        {/* Segments */}
        <path d={describeArc(cx, cy, r, 0, (299/1000)*180)} fill="none" stroke="#ef4444" strokeWidth={stroke} />
        <path d={describeArc(cx, cy, r, (300/1000)*180, (499/1000)*180)} fill="none" stroke="#f97316" strokeWidth={stroke} />
        <path d={describeArc(cx, cy, r, (500/1000)*180, (699/1000)*180)} fill="none" stroke="#facc15" strokeWidth={stroke} />
        <path d={describeArc(cx, cy, r, (700/1000)*180, (849/1000)*180)} fill="none" stroke="#84cc16" strokeWidth={stroke} />
        <path d={describeArc(cx, cy, r, (850/1000)*180, 180)} fill="none" stroke="#166534" strokeWidth={stroke} strokeLinecap="round" />

        {/* Center Pivot */}
        <circle cx={cx} cy={cy} r="12" fill="#0f172a" />
        <circle cx={cx} cy={cy} r="5" fill="#6366f1" />

        {/* Needle */}
        <g transform={`rotate(${needleRotation}, ${cx}, ${cy})`}>
          <path d={`M ${cx} ${cy-3} L ${cx-76} ${cy} L ${cx} ${cy+3} Z`} fill="#0f172a" />
          <line x1={cx} y1={cy} x2={cx-74} y2={cy} stroke="#6366f1" strokeWidth="1" />
        </g>
      </svg>
      
      <div className="text-center -mt-8 z-10">
        <div className="text-6xl font-black text-slate-900 tracking-tighter tabular-nums drop-shadow-md">
          {score1000}
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-4">
          Status Ejecutivo GRC
        </div>
        <div className={`px-8 py-2.5 rounded-full text-[12px] font-black uppercase tracking-wider shadow-xl transform transition-transform hover:scale-105 border-2 ${info.bg} ${info.color} border-current/20`}>
          {info.label}
        </div>
      </div>
    </div>
  );
};

const ScoreLegend: React.FC = () => {
  const ranges = [
    { range: '0 - 299', level: 'CRÍTICO', desc: 'Fallas fatales activas. El proceso no es resiliente ni defendible.', color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', icon: '🔴' },
    { range: '300 - 499', level: 'ALTO', desc: 'Brechas graves en controles base. Alta probabilidad de impacto legal.', color: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50', icon: '🟠' },
    { range: '500 - 699', level: 'MEDIO', desc: 'Controles funcionales pero insuficientes ante ataques dirigidos.', color: 'bg-yellow-400', text: 'text-yellow-700', bg: 'bg-yellow-50', icon: '🟡' },
    { range: '700 - 849', level: 'ADECUADO', desc: 'Postura sólida. Cumplimiento legal y técnico por sobre el estándar.', color: 'bg-lime-500', text: 'text-lime-700', bg: 'bg-lime-50', icon: '🟢' },
    { range: '850 - 1000', level: 'AVANZADO', desc: 'Resiliencia proactiva y máxima defendibilidad jurídica.', color: 'bg-emerald-600', text: 'text-emerald-700', bg: 'bg-emerald-50', icon: '💹' },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 h-full">
      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">Interpretación del Riesgo Operacional</h4>
      <div className="space-y-4">
        {ranges.map((r, i) => (
          <div key={i} className={`flex items-start gap-4 p-4 rounded-2xl border transition-all hover:shadow-md ${r.bg} border-slate-100`}>
            <div className="text-xl flex-shrink-0 mt-0.5">{r.icon}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-slate-800 tracking-tight">{r.range} — <span className={r.text}>{r.level}</span></span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GapBadge: React.FC<{ value: number }> = ({ value }) => {
  if (value === 0) return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-md text-[9px] font-black uppercase">Crítico</span>;
  if (value < 0.4) return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-md text-[9px] font-black uppercase">Alto</span>;
  return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md text-[9px] font-black uppercase">Medio</span>;
};

const DashboardView: React.FC<DashboardViewProps> = ({ state, onSwitchModule, onGoHome }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const moduleColors: Record<ModuleId, string> = {
    ADN: '#6366f1',    // Indigo
    CIBER: '#10b981',  // Emerald
    LEGAL: '#f43f5e',  // Rose
    INFRA: '#f59e0b',  // Amber
    VENDOR: '#0ea5e9', // Sky
    PEOPLE: '#d946ef'  // Fuchsia
  };

  const scores = useMemo(() => {
    return MODULES.map(module => ({
      id: module.id,
      name: module.name,
      score: calculateModuleScore(module.id, state.answers, MODULES),
      total: module.questions.length,
      answered: Object.keys(state.answers).filter(k => k.startsWith(module.id)).length,
      color: moduleColors[module.id],
      gaps: getTopModuleGaps(module.id as ModuleId, state.answers, MODULES, 5)
    }));
  }, [state.answers]);

  const globalCompliance = useMemo(() => {
    const totalPossible = scores.length * 100;
    const currentTotal = scores.reduce((a, b) => a + b.score, 0);
    return totalPossible > 0 ? (currentTotal / totalPossible) * 100 : 0;
  }, [scores]);

  const runAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analiza los siguientes resultados de una evaluación GRC y genera un resumen ejecutivo de 3 párrafos resaltando brechas críticas. Contexto: Proceso ${state.metadata.processName}. Resultados: ${scores.map(s => `${s.name}: ${s.score.toFixed(1)}%`).join(', ')}. Score Ejecutivo: ${Math.round((globalCompliance / 100) * 1000)}/1000.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiAnalysis(response.text || "No se pudo generar el análisis.");
    } catch (error) {
      setAiAnalysis("Error al conectar con la IA.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const radarData = scores.map(s => ({
    subject: s.name.split(':')[0],
    A: s.score,
    fullMark: 100
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-24">
      {/* Dynamic Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-10 text-white shadow-2xl">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-indigo-600/30 blur-[120px] pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-emerald-600/20 blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex items-center space-x-8">
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-indigo-700 rounded-[2rem] flex items-center justify-center p-4 shadow-2xl shadow-indigo-500/40 rotate-3">
               <img src="https://i.ibb.co/LhyM66Q/ciberlex-logo.png" className="w-full h-auto brightness-0 invert" alt="C" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Evaluación de Riesgo Operacional
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <h3 className="text-4xl font-black leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                {state.metadata.processName || 'Dashboard Ejecutivo'}
              </h3>
              <div className="flex items-center gap-6 mt-4 text-slate-400 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  {state.metadata.processOwner}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m4 0h1m-5 10h5m-5 4h5" /></svg>
                  Proceso: {state.metadata.processType}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Audit Score</p>
                <p className="text-3xl font-black text-white tabular-nums">{Math.round((globalCompliance / 100) * 1000)}<span className="text-indigo-500">.</span></p>
             </div>
             <button onClick={onGoHome} className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all border border-white/10 text-white shadow-inner">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
             </button>
          </div>
        </div>
      </div>

      {/* Main Indicators Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Gauge and Interpretation */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="bg-white rounded-[3rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-slate-100 group-hover:text-slate-200 transition-colors">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            </div>
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 text-center">Nivel de Riesgo en Ciberseguridad</h4>
            <GaugeIndicator score={globalCompliance} />
          </div>
          
          <ScoreLegend />
        </div>

        {/* Right Column: Radar Card */}
        <div className="lg:col-span-7 bg-white rounded-[3rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col min-h-full">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Arquitectura de Riesgo por Dimensión</h4>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            </div>
          </div>
          <div className="h-[450px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#f1f5f9" strokeWidth={2} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }} />
                <Radar
                  name="Cumplimiento"
                  dataKey="A"
                  stroke="#6366f1"
                  strokeWidth={4}
                  fill="#6366f1"
                  fillOpacity={0.15}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
             <div className="flex items-center gap-4 mb-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-700">Nota de Continuidad</h5>
             </div>
             <p className="text-xs text-slate-500 leading-relaxed italic">
               El gráfico radial representa el equilibrio entre las 6 dimensiones auditadas. Un polígono irregular sugiere concentraciones de riesgo que podrían comprometer la resiliencia global ante incidentes disruptivos.
             </p>
          </div>
        </div>
      </div>

      {/* Module Cards Grid - Simplified (Gaps removed to avoid duplication) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {scores.map((s, i) => (
          <div 
            key={s.id} 
            onClick={() => onSwitchModule(s.id as ModuleId)}
            className="group relative bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col"
          >
            {/* Background Blob */}
            <div 
              className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 group-hover:scale-150"
              style={{ backgroundColor: s.color }}
            ></div>
            
            <div className="flex items-center justify-between mb-8">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6"
                style={{ backgroundColor: `${s.color}15`, color: s.color }}
              >
                 {ICONS[MODULES.find(m => m.id === s.id)?.icon || 'Layout']}
              </div>
              <div 
                className="text-[10px] font-black px-3 py-1.5 rounded-full border"
                style={{ color: s.color, borderColor: `${s.color}20`, backgroundColor: `${s.color}05` }}
              >
                {s.answered} / {s.total} CONTROLES
              </div>
            </div>
            
            <h5 className="font-black text-slate-800 text-base mb-4 tracking-tight group-hover:text-indigo-600 transition-colors">{s.name}</h5>
            
            <div className="flex items-end justify-between mb-3">
              <span className="text-4xl font-black text-slate-900 tabular-nums">
                {Math.round(s.score)}<span className="text-xs text-slate-300 font-bold">%</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">Ver Detalles</span>
            </div>
            
            <div className="w-full bg-slate-50 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-100 mb-2">
               <div 
                 className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm" 
                 style={{ width: `${s.score}%`, backgroundColor: s.color }}
               ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Hallazgos Críticos Consolidados Section (Mapa de Brechas de Resiliencia) */}
      <div className="bg-white rounded-[3.5rem] p-12 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase">Mapa de Brechas de Resiliencia</h4>
              <p className="text-slate-400 text-sm font-medium tracking-wide italic">Concentración de los 5 principales fallos detectados por cada dimensión auditable.</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex -space-x-3">
                  {scores.map(s => (
                    <div key={s.id} className="w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-white" style={{ backgroundColor: s.color }}>
                      <span className="text-[8px] font-black">{s.id}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {scores.map(s => (
              <div key={s.id} className="space-y-6">
                 <div className="flex items-center gap-4 border-b border-slate-50 pb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: s.color }}>
                       {ICONS[MODULES.find(m => m.id === s.id)?.icon || 'Layout']}
                    </div>
                    <h5 className="text-sm font-black text-slate-800 uppercase tracking-tight">{s.name.split(':')[0]}</h5>
                 </div>
                 <div className="space-y-4">
                    {s.gaps.length > 0 ? (
                      s.gaps.map((gap, idx) => (
                        <div key={idx} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group/gap-item">
                           <div className="flex justify-between items-start mb-2">
                              <GapBadge value={gap.value} />
                              <span className="text-[9px] font-black text-slate-300 group-hover/gap-item:text-indigo-400">FINDING-{gap.questionId}</span>
                           </div>
                           <p className="text-[11px] text-slate-600 font-bold leading-relaxed mb-3">{gap.text}</p>
                           <div className="flex items-center gap-2">
                              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                 <div className="h-full bg-red-500" style={{ width: `${(1 - gap.value) * 100}%` }}></div>
                              </div>
                              <span className="text-[9px] font-black text-slate-400">{Math.round((1 - gap.value) * 100)}% Riesgo</span>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center bg-slate-50/30 rounded-3xl border border-dashed border-slate-100">
                         <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Postura Sólida ✨</p>
                      </div>
                    )}
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* Futuristic AI Analysis Section */}
      <div className="bg-slate-950 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
        {/* Animated Orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] -mr-64 -mt-64 animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/10 blur-[100px] -ml-32 -mb-32 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-16 mb-16">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center animate-bounce shadow-xl shadow-indigo-500/20">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                 </div>
                 <h4 className="text-4xl font-black tracking-tight text-white leading-none">Ciberlex Intelligence Engine</h4>
              </div>
              <p className="text-slate-400 text-lg font-medium leading-relaxed">
                Nuestra arquitectura generativa analiza las capas de cumplimiento de su organización para proyectar escenarios de defendibilidad legal y proponer remediaciones técnicas inmediatas.
              </p>
            </div>
            
            <button 
              onClick={runAiAnalysis}
              disabled={isAnalyzing}
              className={`relative overflow-hidden group/btn px-12 py-6 bg-indigo-600 hover:bg-indigo-500 rounded-3xl font-black text-sm uppercase tracking-[0.3em] flex items-center space-x-4 shadow-[0_20px_60px_rgba(79,70,229,0.3)] transition-all active:scale-95 disabled:opacity-50 ${isAnalyzing ? 'animate-pulse' : ''}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
              {isAnalyzing ? (
                <span>Escaneando Dimensiones...</span>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.047a1 1 0 01.897.95V2.13c1.076.115 2.105.44 3.013.946l.115-.115a1 1 0 011.414 1.414l-.115.115c.505.908.83 1.937.946 3.013h.134a1 1 0 01.95.897V11.3a1 1 0 01-.95.897h-.134c-.115 1.076-.44 2.105-.946 3.013l.115.115a1 1 0 01-1.414 1.414l-.115-.115c-.908.505-1.937.83-3.013.946v.134a1 1 0 01-.897.95H8.7a1 1 0 01-.897-.95v-.134c-1.076-.115-2.105-.44-3.013-.946l-.115.115a1 1 0 01-1.414-1.414l.115-.115c-.505-.908-.83-1.937-.946-3.013H2.13a1 1 0 01-.95-.897V8.7a1 1 0 01.95-.897h.134c.115-1.076.44-2.105.946-3.013l-.115-.115a1 1 0 011.414-1.414l.115.115c.908-.505 1.937-.83 3.013-.946V1.997a1 1 0 01.897-.95H11.3zM10 5a5 5 0 100 10 5 5 0 000-10z" clipRule="evenodd" /></svg>
                  <span>Sintetizar Reporte</span>
                </>
              )}
            </button>
          </div>

          {aiAnalysis ? (
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[2.5rem] p-12 text-slate-200 leading-relaxed font-light whitespace-pre-line animate-in fade-in slide-in-from-bottom-8 duration-1000 shadow-2xl">
               <div className="mb-6 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Análisis Generativo Finalizado</span>
               </div>
               {aiAnalysis}
            </div>
          ) : !isAnalyzing && (
            <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01] group-hover:bg-white/[0.02] transition-colors">
              <div className="w-20 h-20 bg-slate-900 rounded-3xl mx-auto mb-6 flex items-center justify-center text-slate-700">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.477 2.387a2 2 0 00.547 1.022l1.428 1.428a2 2 0 001.022.547l2.387.477a2 2 0 001.96-1.414l.477-2.387a2 2 0 00-.547-1.022l-1.428-1.428z" /></svg>
              </div>
              <p className="text-slate-600 text-xs font-black uppercase tracking-[0.4em]">Protocolo de Análisis Neuronal Desconectado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
