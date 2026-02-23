
import React, { useState, useMemo, useCallback } from 'react';
import jsPDF from 'jspdf';
import { GRCState, Answer, ModuleId, EvaluationMetadata } from './types';
import { MODULES, ICONS, PROCESS_TYPES } from './constants';
import { calculateModuleScore, getTopModuleGaps, getScoreLevel1000 } from './utils/scoring';
import DashboardView from './components/DashboardView';
import ModuleView from './components/ModuleView';
import HomeView from './components/HomeView';

const App: React.FC = () => {
  const [state, setState] = useState<GRCState>({
    answers: {},
    activeModule: 'HOME',
    metadata: {
      processType: PROCESS_TYPES[0],
      processName: '',
      processOwner: '',
      evaluatorName: '',
      evaluatorRole: '',
      date: new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })
    }
  });

  const moduleColors: Record<ModuleId, string> = {
    ADN: '#6366f1',    // Indigo
    CIBER: '#10b981',  // Emerald
    LEGAL: '#f43f5e',  // Rose
    INFRA: '#f59e0b',  // Amber
    VENDOR: '#0ea5e9', // Sky
    PEOPLE: '#d946ef'  // Fuchsia
  };

  const handleSetAnswer = (answer: Answer) => {
    setState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [`${answer.moduleId}_${answer.questionId}`]: answer
      }
    }));
  };

  const updateMetadata = (key: keyof EvaluationMetadata, value: string) => {
    setState(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [key]: value
      }
    }));
  };

  // ── LÓGICA EXPORTAR PDF (jsPDF puro, sin html2canvas) ──
  const handleExportPDF = useCallback(() => {
    const M = 15;          // margen 15mm = 1.5cm
    const PW = 215.9;      // ancho hoja carta mm
    const PH = 279.4;      // alto hoja carta mm
    const CW = PW - M * 2; // ancho útil = 185.9mm
    const LH = 6;          // line height normal

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

    // Colores
    const DARK   = [15, 23, 42]   as [number,number,number];
    const INDIGO = [99, 102, 241] as [number,number,number];
    const SLATE  = [148, 163, 184] as [number,number,number];
    const WHITE  = [255, 255, 255] as [number,number,number];
    const LIGHT  = [248, 250, 252] as [number,number,number];
    const RED    = [239, 68, 68]   as [number,number,number];
    const ORANGE = [249, 115, 22]  as [number,number,number];
    const YELLOW = [234, 179, 8]   as [number,number,number];
    const GREEN  = [132, 204, 22]  as [number,number,number];
    const EMERALD= [22, 101, 52]   as [number,number,number];

    const moduleColorMap: Record<string, [number,number,number]> = {
      ADN:    [99, 102, 241],
      CIBER:  [16, 185, 129],
      LEGAL:  [244, 63, 94],
      INFRA:  [245, 158, 11],
      VENDOR: [14, 165, 233],
      PEOPLE: [217, 70, 239],
    };

    // Calcular scores
    const scores = MODULES.map(module => ({
      id: module.id,
      name: module.name,
      score: calculateModuleScore(module.id as ModuleId, state.answers, MODULES),
      total: module.questions.length,
      answered: Object.keys(state.answers).filter(k => k.startsWith(module.id)).length,
      color: moduleColorMap[module.id] || INDIGO,
      gaps: getTopModuleGaps(module.id as ModuleId, state.answers, MODULES, 5)
    }));

    const totalPossible = scores.length * 100;
    const currentTotal = scores.reduce((a: number, b: {score: number}) => a + b.score, 0);
    const globalCompliance = totalPossible > 0 ? (currentTotal / totalPossible) * 100 : 0;
    const score1000 = Math.round((globalCompliance / 100) * 1000);
    const scoreInfo = getScoreLevel1000(score1000);

    let y = M; // cursor vertical
    let page = 1;

    // Helpers
    const newPage = () => {
      pdf.addPage('letter', 'portrait');
      page++;
      y = M;
      // Footer en nueva página
      drawFooter();
    };

    const checkY = (needed: number) => {
      if (y + needed > PH - M - 8) newPage();
    };

    const drawFooter = () => {
      const savedY = y;
      pdf.setFillColor(...LIGHT);
      pdf.rect(0, PH - 10, PW, 10, 'F');
      pdf.setFontSize(7);
      pdf.setTextColor(...SLATE);
      pdf.setFont('helvetica', 'normal');
      pdf.text('SISTEMA DE CUMPLIMIENTO DE CIBERSEGURIDAD Y PROTECCIÓN DE DATOS', M, PH - 4);
      pdf.text(`Página ${page}`, PW - M, PH - 4, { align: 'right' });
      y = savedY;
    };

    // ---- PÁGINA 1: PORTADA ----
    // Header oscuro
    pdf.setFillColor(...DARK);
    pdf.roundedRect(M, y, CW, 38, 4, 4, 'F');
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...WHITE);
    pdf.text('PANEL DE CONTROL GLOBAL', M + 8, y + 13);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...SLATE);
    pdf.text('SISTEMA DE CUMPLIMIENTO DE CIBERSEGURIDAD Y PROTECCIÓN DE DATOS', M + 8, y + 21);
    pdf.text(`Proceso: ${state.metadata.processType} • ${state.metadata.processName || '-'}`, M + 8, y + 28);
    pdf.text(`Evaluador: ${state.metadata.evaluatorName || '-'} • Fecha: ${state.metadata.date}`, M + 8, y + 34);
    // Score badge
    const scoreColor = score1000 >= 850 ? EMERALD : score1000 >= 700 ? GREEN : score1000 >= 500 ? YELLOW : score1000 >= 300 ? ORANGE : RED;
    pdf.setFillColor(...scoreColor);
    pdf.roundedRect(PW - M - 38, y + 8, 30, 22, 3, 3, 'F');
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...WHITE);
    pdf.text(String(score1000), PW - M - 23, y + 22, { align: 'center' });
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text('/ 1000', PW - M - 23, y + 28, { align: 'center' });
    y += 44;

    // ---- SECCIÓN: SCORE EJECUTIVO ----
    checkY(20);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...DARK);
    pdf.text('SCORE EJECUTIVO GRC', M, y + 5);
    pdf.setDrawColor(...INDIGO);
    pdf.setLineWidth(0.5);
    pdf.line(M, y + 7, M + CW, y + 7);
    y += 12;

    // Barra de score global
    checkY(18);
    pdf.setFillColor(...LIGHT);
    pdf.roundedRect(M, y, CW, 14, 2, 2, 'F');
    pdf.setFillColor(...scoreColor);
    const barW = (score1000 / 1000) * (CW - 4);
    pdf.roundedRect(M + 2, y + 2, Math.max(barW, 2), 10, 2, 2, 'F');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...WHITE);
    if (barW > 20) pdf.text(`${score1000} pts`, M + 5, y + 9);
    pdf.setTextColor(...DARK);
    pdf.text(scoreInfo.label.toUpperCase(), M + CW - 2, y + 9, { align: 'right' });
    y += 18;

    // Escala de referencia
    checkY(14);
    const ranges = [
      { range: '0-299', label: 'CRÍTICO', color: RED },
      { range: '300-499', label: 'ALTO', color: ORANGE },
      { range: '500-699', label: 'MEDIO', color: YELLOW },
      { range: '700-849', label: 'ADECUADO', color: GREEN },
      { range: '850-1000', label: 'AVANZADO', color: EMERALD },
    ];
    const rW = CW / ranges.length - 2;
    ranges.forEach((r, i) => {
      const rx = M + i * (rW + 2);
      pdf.setFillColor(...r.color);
      pdf.roundedRect(rx, y, rW, 8, 1, 1, 'F');
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...WHITE);
      pdf.text(r.label, rx + rW / 2, y + 5, { align: 'center' });
    });
    y += 12;

    // ---- SECCIÓN: RESULTADOS POR DIMENSIÓN ----
    checkY(14);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...DARK);
    pdf.text('RESULTADOS POR DIMENSIÓN', M, y + 5);
    pdf.setDrawColor(...INDIGO);
    pdf.setLineWidth(0.5);
    pdf.line(M, y + 7, M + CW, y + 7);
    y += 12;

    scores.forEach((s) => {
      checkY(20);
      const pct = Math.round(s.score);
      const col = s.color;
      // Fila de módulo
      pdf.setFillColor(...LIGHT);
      pdf.roundedRect(M, y, CW, 14, 2, 2, 'F');
      // Indicador color
      pdf.setFillColor(...col);
      pdf.roundedRect(M + 2, y + 2, 4, 10, 1, 1, 'F');
      // Nombre
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...DARK);
      const shortName = s.name.length > 45 ? s.name.substring(0, 42) + '...' : s.name;
      pdf.text(shortName, M + 9, y + 9);
      // Controles
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...SLATE);
      pdf.text(`${s.answered}/${s.total} controles`, PW - M - 50, y + 9);
      // Porcentaje
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...col);
      pdf.text(`${pct}%`, PW - M - 2, y + 9, { align: 'right' });
      // Barra de progreso
      pdf.setFillColor(226, 232, 240);
      pdf.roundedRect(M + 9, y + 10.5, CW - 60, 2, 0.5, 0.5, 'F');
      if (pct > 0) {
        pdf.setFillColor(...col);
        pdf.roundedRect(M + 9, y + 10.5, (CW - 60) * pct / 100, 2, 0.5, 0.5, 'F');
      }
      y += 16;
    });

    // ---- SECCIÓN: MAPA DE BRECHAS ----
    checkY(14);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...DARK);
    pdf.text('MAPA DE BRECHAS DE RESILIENCIA', M, y + 5);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...SLATE);
    pdf.text('Top 5 hallazgos críticos por dimensión', M, y + 11);
    pdf.setDrawColor(...INDIGO);
    pdf.setLineWidth(0.5);
    pdf.line(M, y + 13, M + CW, y + 13);
    y += 18;

    scores.forEach((s) => {
      if (s.gaps.length === 0) return;
      checkY(14);
      // Título del módulo
      pdf.setFillColor(...s.color);
      pdf.roundedRect(M, y, CW, 8, 1, 1, 'F');
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...WHITE);
      pdf.text(s.name.toUpperCase(), M + 4, y + 5.5);
      y += 10;

      s.gaps.forEach((gap: {questionId: number; text: string; value: number}, idx: number) => {
        const riskPct = Math.round((1 - gap.value) * 100);
        const riskLabel = riskPct === 100 ? 'CRÍTICO' : riskPct >= 60 ? 'ALTO' : 'MEDIO';
        const riskColor = riskPct === 100 ? RED : riskPct >= 60 ? ORANGE : YELLOW;

        // Calcular altura necesaria para este finding
        // El texto ocupa el ancho central dejando espacio al badge izq y finding derecho
        const textMaxW = CW - 22 - 28; // 22 para badge izq, 28 para finding derecho
        const lines = pdf.splitTextToSize(`${gap.text}`, textMaxW);
        const neededH = 6 + lines.length * 4.5 + 6;
        checkY(neededH);

        // Fondo alternado
        pdf.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
        pdf.roundedRect(M, y, CW, neededH - 2, 1, 1, 'F');
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.2);
        pdf.roundedRect(M, y, CW, neededH - 2, 1, 1, 'S');

        // Badge de riesgo (izquierda)
        pdf.setFillColor(...riskColor);
        pdf.roundedRect(M + 2, y + 1.5, 16, 5, 1, 1, 'F');
        pdf.setFontSize(5.5);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...WHITE);
        pdf.text(riskLabel, M + 10, y + 5, { align: 'center' });

        // Número de finding (derecha, alineado con el badge)
        pdf.setFontSize(6);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...SLATE);
        pdf.text(`FINDING-${gap.questionId}`, M + CW - 2, y + 5, { align: 'right' });

        // Texto de la pregunta (en columna central, no llega hasta el finding)
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...DARK);
        pdf.text(lines, M + 20, y + 5.5);

        // Barra de riesgo
        const barY = y + 4.5 + lines.length * 4.5;
        pdf.setFillColor(226, 232, 240);
        pdf.roundedRect(M + 2, barY, CW - 30, 2, 0.5, 0.5, 'F');
        pdf.setFillColor(...riskColor);
        pdf.roundedRect(M + 2, barY, (CW - 30) * riskPct / 100, 2, 0.5, 0.5, 'F');
        pdf.setFontSize(6);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...riskColor);
        pdf.text(`${riskPct}% Riesgo`, M + CW - 2, barY + 1.5, { align: 'right' });

        y += neededH;
      });
      y += 4;
    });

    // Footer en página 1 y todas las páginas
    const totalPages = (pdf as any).internal.pages.length - 1;
    for (let p = 1; p <= totalPages; p++) {
      pdf.setPage(p);
      pdf.setFillColor(...LIGHT);
      pdf.rect(0, PH - 10, PW, 10, 'F');
      pdf.setFontSize(7);
      pdf.setTextColor(...SLATE);
      pdf.setFont('helvetica', 'normal');
      pdf.text('SISTEMA DE CUMPLIMIENTO DE CIBERSEGURIDAD Y PROTECCIÓN DE DATOS', M, PH - 4);
      pdf.text(`Página ${p} de ${totalPages}`, PW - M, PH - 4, { align: 'right' });
    }

    const processName = state.metadata.processName || 'GRC';
    pdf.save(`Panel-Control-GRC-${processName}.pdf`);
  }, [state.answers, state.activeModule, state.metadata]);

  const currentModule = useMemo(() => {
    if (state.activeModule === 'HOME' || state.activeModule === 'DASHBOARD') return null;
    return MODULES.find(m => m.id === state.activeModule);
  }, [state.activeModule]);

  if (state.activeModule === 'HOME') {
    return (
      <HomeView 
        metadata={state.metadata} 
        onChange={updateMetadata} 
        onStart={() => setState(s => ({ ...s, activeModule: 'DASHBOARD' }))} 
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] font-inter">
      {/* Sidebar - Rediseñado a Blanco/Luz */}
      <aside className="w-80 bg-white flex flex-col shadow-[1px_0_10px_rgba(0,0,0,0.05)] z-20 border-r border-slate-100">
        <div className="p-8 flex items-center space-x-4 border-b border-slate-50">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 p-2.5 rounded-2xl shadow-lg shadow-indigo-100 flex items-center justify-center rotate-3">
            <img src="https://i.ibb.co/LhyM66Q/ciberlex-logo.png" className="h-full w-auto brightness-0 invert" alt="Logo" />
          </div>
          <div>
            <h1 className="font-black text-xl leading-none tracking-tight text-slate-800">GRC MASTER</h1>
            <p className="text-indigo-600 text-[10px] mt-1.5 tracking-[0.2em] font-black uppercase">Enterprise v2.0</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar">
          <button
            onClick={() => setState(s => ({ ...s, activeModule: 'DASHBOARD' }))}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
              state.activeModule === 'DASHBOARD' 
              ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 font-bold scale-[1.02]' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
            }`}
          >
            <div className={`${state.activeModule === 'DASHBOARD' ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'}`}>
              {ICONS.Layout}
            </div>
            <span className="text-sm">Panel de Control Global</span>
          </button>

          <div className="pt-10 pb-3 px-5 uppercase tracking-[0.3em] text-[9px] font-black text-slate-400 flex items-center gap-3">
            <span>Dimensiones Auditables</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>

          {MODULES.map(module => {
            const isActive = state.activeModule === module.id;
            const color = moduleColors[module.id];
            const isCompleted = Object.keys(state.answers).filter(k => k.startsWith(module.id)).length === module.questions.length;

            return (
              <button
                key={module.id}
                onClick={() => setState(s => ({ ...s, activeModule: module.id }))}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group border ${
                  isActive 
                  ? 'bg-white shadow-lg shadow-slate-200/50 border-slate-200' 
                  : 'text-slate-500 hover:bg-slate-50 border-transparent'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span 
                    className={`transition-all duration-300 p-1.5 rounded-xl ${isActive ? 'bg-opacity-10' : 'bg-transparent group-hover:bg-opacity-5'}`}
                    style={{ 
                      color: isActive ? color : '#94a3b8', 
                      backgroundColor: isActive ? `${color}20` : 'transparent' 
                    }}
                  >
                    {ICONS[module.icon]}
                  </span>
                  <span className={`text-sm tracking-tight transition-colors ${isActive ? 'font-black text-slate-900' : 'font-medium group-hover:text-slate-700'}`}>
                    {module.name}
                  </span>
                </div>
                {isCompleted && (
                  <div className="text-emerald-500 animate-in zoom-in">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-6 bg-slate-50/50 border-t border-slate-100">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-6">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Avance del Proyecto</span>
                <span className="text-xs font-black text-indigo-600">
                  {Math.round((Object.keys(state.answers).length / MODULES.reduce((a, b) => a + b.questions.length, 0)) * 100)}%
                </span>
             </div>
             <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-1000 ease-out" 
                  style={{ width: `${(Object.keys(state.answers).length / MODULES.reduce((a, b) => a + b.questions.length, 0)) * 100}%` }}
                ></div>
             </div>
          </div>
          
          <button
            onClick={() => setState(s => ({ ...s, activeModule: 'HOME' }))}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl transition-all text-slate-400 hover:text-red-500 hover:bg-red-50 font-bold text-xs uppercase tracking-widest"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span>Salir del Sistema</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        <header className="sticky top-0 bg-white/90 backdrop-blur-xl z-10 px-10 py-6 border-b border-slate-100 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-6">
            <div className="md:hidden p-2.5 bg-indigo-600 rounded-xl">
              <img src="https://i.ibb.co/LhyM66Q/ciberlex-logo.png" className="h-6 w-auto brightness-0 invert" alt="Logo" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                {state.activeModule === 'DASHBOARD' ? 'Análisis de Riesgo Ejecutivo' : currentModule?.name}
              </h2>
              <div className="flex items-center gap-3 text-slate-400 text-[10px] mt-2 font-black uppercase tracking-[0.2em]">
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{state.metadata.processType}</span>
                <span className="text-slate-200">•</span>
                <span className="truncate max-w-[200px]">{state.metadata.processName}</span>
                <span className="text-slate-200">•</span>
                <span className="text-indigo-500 font-black">ID-AUD-{state.metadata.date.replace(/ /g, '')}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
             <button 
              onClick={() => setState(s => ({ ...s, activeModule: 'HOME' }))}
              className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black hover:bg-slate-50 transition-all shadow-sm text-slate-700 flex items-center gap-3 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              INICIO
            </button>
            <button
              onClick={handleExportPDF}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-3 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              EXPORTAR PDF
            </button>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto w-full">
          {state.activeModule === 'DASHBOARD' ? (
            <div id="dashboard-print-area">
              <DashboardView state={state} onSwitchModule={(id) => setState(s => ({...s, activeModule: id}))} onGoHome={() => setState(s => ({...s, activeModule: 'HOME'}))} />
            </div>
          ) : (
            currentModule && (
              <ModuleView 
                module={currentModule} 
                answers={state.answers} 
                onAnswer={handleSetAnswer}
                onBack={() => setState(s => ({ ...s, activeModule: 'DASHBOARD' }))}
                onGoHome={() => setState(s => ({...s, activeModule: 'HOME'}))}
              />
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
