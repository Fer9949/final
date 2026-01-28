
import React from 'react';
import { ModuleData, Answer, FileEvidence } from '../types';
import { ICONS } from '../constants';

interface ModuleViewProps {
  module: ModuleData;
  answers: Record<string, Answer>;
  onAnswer: (a: Answer) => void;
  onBack: () => void;
  onGoHome: () => void;
}

const ModuleView: React.FC<ModuleViewProps> = ({ module, answers, onAnswer, onBack, onGoHome }) => {
  const completedCount = Object.keys(answers).filter(k => k.startsWith(module.id)).length;
  const progressPercent = (completedCount / module.questions.length) * 100;

  const handleSelection = (qId: number, value: number, label: string) => {
    const currentAnswer = answers[`${module.id}_${qId}`];
    onAnswer({
      moduleId: module.id,
      questionId: qId,
      value,
      label,
      evidence: currentAnswer?.evidence || []
    });
  };

  const handleFileUpload = async (qId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentAnswer = answers[`${module.id}_${qId}`];
    if (!currentAnswer) {
      alert("Por favor, seleccione una respuesta antes de cargar evidencia.");
      return;
    }

    const newEvidences: FileEvidence[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64 = await fileToBase64(file);
      newEvidences.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        data: base64
      });
    }

    onAnswer({
      ...currentAnswer,
      evidence: [...(currentAnswer.evidence || []), ...newEvidences]
    });
    e.target.value = '';
  };

  const removeEvidence = (qId: number, evidenceId: string) => {
    const currentAnswer = answers[`${module.id}_${qId}`];
    if (!currentAnswer || !currentAnswer.evidence) return;
    onAnswer({
      ...currentAnswer,
      evidence: currentAnswer.evidence.filter(e => e.id !== evidenceId)
    });
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <span className="text-red-500 font-bold text-[8px]">PDF</span>;
    if (type.includes('word') || type.includes('officedocument.word')) return <span className="text-blue-600 font-bold text-[8px]">DOC</span>;
    if (type.includes('excel') || type.includes('officedocument.spread')) return <span className="text-emerald-600 font-bold text-[8px]">XLS</span>;
    if (type.includes('image')) return <span className="text-purple-500 font-bold text-[8px]">IMG</span>;
    return <span className="text-slate-400 font-bold text-[8px]">FILE</span>;
  };

  // Helper to get color scale class based on compliance value
  const getColorClass = (value: number, isSelected: boolean) => {
    if (value === -1) return isSelected ? 'bg-slate-600 text-white border-slate-700' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100';
    if (value >= 1.0) return isSelected ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-200' : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100';
    if (value >= 0.75) return isSelected ? 'bg-blue-600 text-white border-blue-700 shadow-blue-200' : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100';
    if (value >= 0.5) return isSelected ? 'bg-amber-500 text-white border-amber-600 shadow-amber-200' : 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100';
    if (value >= 0.25) return isSelected ? 'bg-orange-500 text-white border-orange-600 shadow-orange-200' : 'bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100';
    return isSelected ? 'bg-red-600 text-white border-red-700 shadow-red-200' : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100';
  };

  const auditLevels = [
    { label: '0%: No Cumple', value: 0.0 },
    { label: '25%: En Desarrollo', value: 0.25 },
    { label: '50%: Parcialmente', value: 0.5 },
    { label: '75%: Adecuado', value: 0.75 },
    { label: '100%: Total', value: 1.0 },
    { label: 'N/A', value: -1 }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
           <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
             <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
           </button>
           <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Instrumento de Auditoría GRC</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-slate-500 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-100">
            Controles Respondidos: <span className="text-indigo-600 font-black">{completedCount} / {module.questions.length}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {module.questions.map((q, idx) => {
          const currentAnswer = answers[`${module.id}_${q.id}`];
          const hasCustomOptions = q.opciones && q.opciones.length > 0;

          return (
            <div key={q.id} className={`bg-white rounded-3xl p-8 shadow-sm border transition-all duration-300 ${currentAnswer ? 'border-slate-200' : 'border-slate-100 hover:border-indigo-100'}`}>
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-colors ${currentAnswer ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-400'}`}>
                    {idx + 1}
                  </div>
                  {q.peso && (
                    <div className="mt-3 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                      Peso: {q.peso}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-6">
                  <div>
                    {q.categoria && <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase mb-2 tracking-wider">{q.categoria}</span>}
                    <h4 className="text-slate-800 text-lg font-semibold leading-relaxed tracking-tight">{q.pregunta}</h4>
                  </div>

                  <div className="space-y-4">
                    {hasCustomOptions ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.opciones?.map((opt, i) => {
                          const label = typeof opt === 'string' ? opt : opt.texto;
                          const value = typeof opt === 'string' 
                            ? 1 - (i / ((q.opciones?.length || 1) - 1)) 
                            : opt.valor;
                          const isSelected = currentAnswer?.label === label;
                          const colorClass = getColorClass(value, isSelected);

                          return (
                            <button
                              key={i}
                              onClick={() => handleSelection(q.id, value, label)}
                              className={`text-left px-5 py-4 rounded-2xl border transition-all duration-200 text-sm ${colorClass} ${isSelected ? 'scale-[1.02] shadow-xl z-10 font-bold' : 'hover:translate-x-1'}`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span>{label}</span>
                                {isSelected && (
                                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="w-full">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                          {auditLevels.map((level, i) => {
                            const isSelected = currentAnswer?.value === level.value;
                            const colorClass = getColorClass(level.value, isSelected);
                            return (
                              <button
                                key={i}
                                onClick={() => handleSelection(q.id, level.value, level.label)}
                                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all h-20 ${colorClass} ${isSelected ? 'scale-110 shadow-xl z-10 font-bold ring-4 ring-offset-4 ring-white' : 'opacity-80 hover:opacity-100'}`}
                              >
                                <span className="text-[10px] font-black uppercase tracking-tighter text-center leading-none mb-1">
                                  {level.label.split(':')[0]}
                                </span>
                                <span className="text-[9px] font-medium leading-tight text-center truncate w-full">
                                  {level.label.split(':')[1] || level.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Evidence Section */}
                  <div className={`pt-6 border-t border-slate-50 transition-all ${!currentAnswer ? 'opacity-30 grayscale pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.415a6 6 0 108.486 8.486L20.5 13" /></svg>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Respaldos de Evidencia</span>
                      </div>
                      <label className="cursor-pointer group flex items-center gap-2 text-indigo-600 font-black text-[10px] bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                        <input 
                          type="file" 
                          multiple 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(q.id, e)}
                        />
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        ADJUNTAR EVIDENCIA
                      </label>
                    </div>

                    {currentAnswer?.evidence && currentAnswer.evidence.length > 0 ? (
                      <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-left-2">
                        {currentAnswer.evidence.map((ev) => (
                          <div key={ev.id} className="flex items-center space-x-3 bg-white border border-slate-100 rounded-xl px-3 py-2 group hover:border-indigo-200 hover:shadow-md transition-all">
                            <div className="p-1 bg-slate-50 rounded-md">
                              {getFileIcon(ev.type)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-700 max-w-[140px] truncate font-bold">{ev.name}</span>
                              <span className="text-[8px] text-slate-400 uppercase">{(ev.size / 1024).toFixed(1)} KB</span>
                            </div>
                            <button onClick={() => removeEvidence(q.id, ev.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-2 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                        <p className="text-[10px] text-slate-400 italic font-medium">No se han detectado archivos vinculados a este control preventivo.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Bar - Ahora no es fijo, se muestra al final de la evaluación */}
      <div className="mt-12 w-full max-w-5xl mx-auto px-2">
        <div className="bg-slate-900 text-white rounded-[40px] p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between border border-white/10 gap-6">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 border border-white/20">
              {ICONS[module.icon]}
            </div>
            <div>
              <div className="text-lg font-black tracking-tight">{module.name}</div>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-24 bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-400 h-full" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Madurez: {Math.round(progressPercent)}%</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onBack}
            className="w-full sm:w-auto px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-indigo-600/30 active:scale-95 flex items-center justify-center gap-3"
          >
            Finalizar Evaluación
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleView;
