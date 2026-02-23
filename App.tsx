
import React, { useState, useMemo, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { GRCState, Answer, ModuleId, EvaluationMetadata } from './types';
import { MODULES, ICONS, PROCESS_TYPES } from './constants';
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

  // ── LÓGICA EXPORTAR PDF ──
  const handleExportPDF = useCallback(async () => {
    // Asegurarse de estar en el dashboard
    if (state.activeModule !== 'DASHBOARD') {
      setState(s => ({ ...s, activeModule: 'DASHBOARD' }));
      await new Promise(r => setTimeout(r, 700));
    }

    const element = document.getElementById('dashboard-print-area');
    if (!element) return;

    try {
      // Capturar TODO el contenido del dashboard sin recortar
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f8fafc',
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      // Hoja carta: 215.9 x 279.4 mm
      // Márgenes: 15mm en los 4 lados (1.5 cm)
      const MARGIN_MM = 15;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter',
      });

      const pageW_mm = pdf.internal.pageSize.getWidth();   // 215.9
      const pageH_mm = pdf.internal.pageSize.getHeight();  // 279.4
      const contentW_mm = pageW_mm - MARGIN_MM * 2;        // 185.9
      const contentH_mm = pageH_mm - MARGIN_MM * 2;        // 249.4

      // Resolución: px por mm en el eje X
      const pxPerMm = canvas.width / contentW_mm;
      // Cuántos px del canvas entran en una página (eje Y)
      const pageH_px = contentH_mm * pxPerMm;

      const totalH_px = canvas.height;
      let yPx = 0;
      let pageIndex = 0;

      while (yPx < totalH_px) {
        if (pageIndex > 0) pdf.addPage('letter', 'portrait');

        // Altura real de este slice (puede ser menor en la última página)
        const sliceH_px = Math.min(pageH_px, totalH_px - yPx);
        // Altura en mm proporcional al slice
        const sliceH_mm = sliceH_px / pxPerMm;

        // Crear canvas del slice
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.ceil(sliceH_px);
        const ctx = sliceCanvas.getContext('2d')!;
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(
          canvas,
          0, yPx,                          // origen en el canvas fuente
          canvas.width, sliceH_px,         // tamaño del recorte
          0, 0,                            // destino en el slice
          sliceCanvas.width, sliceH_px     // tamaño en el slice
        );

        const imgData = sliceCanvas.toDataURL('image/png');
        // Posicionar con margen de 15mm en X e Y
        pdf.addImage(imgData, 'PNG', MARGIN_MM, MARGIN_MM, contentW_mm, sliceH_mm);

        yPx += pageH_px;
        pageIndex++;
      }

      const processName = state.metadata.processName || 'GRC';
      pdf.save(`Panel-Control-GRC-${processName}.pdf`);
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Error al generar el PDF. Intenta nuevamente.');
    }
  }, [state.activeModule, state.metadata.processName]);

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
