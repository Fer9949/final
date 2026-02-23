
import React, { useRef } from 'react';
import { ModuleData, Answer, FileEvidence } from '../types';
import { ICONS } from '../constants';
import { ToastData } from './Toast';

interface ModuleViewProps {
  module: ModuleData;
  answers: Record<string, Answer>;
  observations: Record<string, string>;
  onAnswer: (a: Answer) => void;
  onObservation: (key: string, text: string) => void;
  onSaveDimension: () => void;
  onBack: () => void;
  onGoHome: () => void;
  showToast: (message: string, type?: ToastData['type']) => void;
}

const ModuleView: React.FC<ModuleViewProps> = ({ module, answers, observations, onAnswer, onObservation, onSaveDimension, onBack, onGoHome, showToast }) => {
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
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
      showToast('Seleccione una respuesta antes de adjuntar evidencia.', 'warning');
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

  const getFileCardStyle = (type: string) => {
    if (type.includes('pdf')) return 'bg-red-50 border-red-300 text-red-700';
    if (type.includes('word') || type.includes('officedocument.word')) return 'bg-blue-50 border-blue-300 text-blue-700';
    if (type.includes('excel') || type.includes('officedocument.spread')) return 'bg-emerald-50 border-emerald-300 text-emerald-700';
    if (type.includes('powerpoint') || type.includes('presentation')) return 'bg-orange-50 border-orange-300 text-orange-700';
    return 'bg-slate-50 border-slate-300 text-slate-500';
  };

  const getFileEmoji = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('officedocument.word')) return '📝';
    if (type.includes('excel') || type.includes('officedocument.spread')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📑';
    return '📎';
  };

  const getFileLabel = (type: string) => {
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('word') || type.includes('officedocument.word')) return 'WORD';
    if (type.includes('excel') || type.includes('officedocument.spread')) return 'EXCEL';
    if (type.includes('powerpoint') || type.includes('presentation')) return 'PPT';
    return 'FILE';
  };

  const getColorClass = (value: number, isSelected: boolean) => {
    if (value === -1) {
      return isSelected
        ? 'bg-slate-700 text-white border-slate-800 ring-2 ring-slate-100'
        : 'bg-slate-50 border-slate-400 text-slate-500 hover:bg-slate-100 hover:border-slate-500';
    }
    if (value >= 0.9) {
      return isSelected
        ? 'bg-emerald-600 text-white border-emerald-700 shadow-lg shadow-emerald-100 ring-2 ring-emerald-50'
        : 'bg-emerald-50 text-emerald-700 border-emerald-400 hover:bg-emerald-100 hover:border-emerald-500';
    }
    if (value >= 0.7) {
      return isSelected
        ? 'bg-lime-500 text-white border-lime-600 shadow-lg shadow-lime-100 ring-2 ring-lime-50'
        : 'bg-lime-50 text-lime-700 border-lime-400 hover:bg-lime-100 hover:border-lime-500';
    }
    if (value >= 0.4) {
      return isSelected
        ? 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-100 ring-2 ring-amber-50'
        : 'bg-amber-50 text-amber-700 border-amber-400 hover:bg-amber-100 hover:border-amber-500';
    }
    if (value >= 0.2) {
      return isSelected
        ? 'bg-orange-500 text-white border-orange-600 shadow-lg shadow-orange-100 ring-2 ring-orange-50'
        : 'bg-orange-50 text-orange-700 border-orange-400 hover:bg-orange-100 hover:border-orange-500';
    }
    return isSelected
      ? 'bg-red-600 text-white border-red-700 shadow-lg shadow-red-100 ring-2 ring-red-50'
      : 'bg-red-50 text-red-700 border-red-400 hover:bg-red-100 hover:border-red-500';
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
          <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Instrumento de Auditoría</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-slate-500 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-100">
            Controles Respondidos: <span className="text-indigo-600 font-black">{completedCount} / {module.questions.length}</span>
          </div>
        </div>
      </div>

      {/* Objetivo del Módulo */}
      {module.objetivo && (
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 text-white/5 group-hover:text-white/10 transition-colors pointer-events-none">
            {ICONS[module.icon]}
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner flex-shrink-0">
              <span className="text-3xl">🎯</span>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">Objetivo Estratégico</h4>
              <p className="text-slate-200 text-lg font-medium leading-relaxed max-w-4xl tracking-tight">
                {module.objetivo}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {module.questions.map((q, idx) => {
          const currentAnswer = answers[`${module.id}_${q.id}`];
          const hasCustomOptions = q.opciones && q.opciones.length > 0;
          const obsKey = `${module.id}_${q.id}`;

          return (
            <div key={q.id} className={`bg-white rounded-3xl p-8 shadow-sm border-2 transition-all duration-300 ${currentAnswer ? 'border-indigo-200' : 'border-slate-200 hover:border-indigo-100'}`}>
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

                <div className="flex-1 space-y-5">
                  {/* Pregunta */}
                  <div>
                    {q.categoria && <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase mb-2 tracking-wider">{q.categoria}</span>}
                    <h4 className="text-slate-800 text-lg font-semibold leading-relaxed tracking-tight">{q.pregunta}</h4>
                  </div>

                  {/* Alternativas */}
                  <div>
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
                              className={`text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 text-sm font-medium ${colorClass} ${isSelected ? 'scale-[1.02] shadow-xl z-10 font-bold' : 'hover:translate-x-1'}`}
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
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {auditLevels.map((level, i) => {
                          const isSelected = currentAnswer?.value === level.value;
                          const colorClass = getColorClass(level.value, isSelected);
                          return (
                            <button
                              key={i}
                              onClick={() => handleSelection(q.id, level.value, level.label)}
                              className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all h-20 ${colorClass} ${isSelected ? 'scale-110 shadow-xl z-10 font-bold ring-4 ring-offset-4 ring-white' : 'opacity-90 hover:opacity-100'}`}
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
                    )}
                  </div>

                  {/* Observaciones */}
                  <div className="pt-4 border-t border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Observaciones
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Escriba sus observaciones sobre este control..."
                      value={observations[obsKey] || ''}
                      onChange={(e) => onObservation(obsKey, e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-300 outline-none resize-none transition-all"
                    />
                  </div>

                  {/* Evidencias */}
                  <div className={`pt-4 border-t border-slate-100 transition-all ${!currentAnswer ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.415a6 6 0 108.486 8.486L20.5 13" /></svg>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evidencias Adjuntas</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[q.id]?.click()}
                        className="flex items-center gap-2 text-indigo-700 font-bold text-xs bg-indigo-50 px-5 py-3 rounded-xl border-2 border-indigo-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Adjuntar Evidencia
                      </button>
                      <input
                        ref={(el) => { fileInputRefs.current[q.id] = el; }}
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(q.id, e)}
                      />
                    </div>

                    {currentAnswer?.evidence && currentAnswer.evidence.length > 0 ? (
                      <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-left-2">
                        {currentAnswer.evidence.map((ev) => (
                          <div key={ev.id} className="relative group flex flex-col items-center">
                            {ev.type.startsWith('image/') ? (
                              <div className="relative">
                                <img
                                  src={ev.data}
                                  alt={ev.name}
                                  className="w-20 h-20 object-cover rounded-xl border-2 border-slate-200 shadow-sm group-hover:border-indigo-300 transition-all"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                  <button
                                    onClick={() => removeEvidence(q.id, ev.id)}
                                    className="bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="relative">
                                <div className={`w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center shadow-sm group-hover:shadow-md transition-all ${getFileCardStyle(ev.type)}`}>
                                  <span className="text-2xl mb-0.5">{getFileEmoji(ev.type)}</span>
                                  <span className="text-[9px] font-black">{getFileLabel(ev.type)}</span>
                                  <span className="text-[8px] opacity-60 mt-0.5">{(ev.size / 1024).toFixed(0)}KB</span>
                                </div>
                                <button
                                  onClick={() => removeEvidence(q.id, ev.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </div>
                            )}
                            <span className="mt-1.5 text-[9px] text-slate-500 max-w-[80px] truncate text-center font-medium">{ev.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-3 px-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                        <p className="text-[10px] text-slate-400 italic font-medium">Sin archivos adjuntos. Seleccione una respuesta y luego adjunte la evidencia correspondiente.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Barra de acciones */}
      <div className="mt-12 w-full max-w-5xl mx-auto px-2 space-y-4">

        {/* Guardar Dimensión */}
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-[2rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
            </div>
            <div>
              <p className="text-emerald-800 font-black text-sm">Guardar Progreso de esta Dimensión</p>
              <p className="text-emerald-600 text-[10px] mt-0.5">Guarda respuestas, observaciones y evidencias adjuntas en el sistema.</p>
            </div>
          </div>
          <button
            onClick={onSaveDimension}
            className="w-full sm:w-auto px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-emerald-200 active:scale-95 flex items-center justify-center gap-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            Guardar
          </button>
        </div>

        {/* Finalizar */}
        <div className="bg-slate-900 text-white rounded-[2rem] p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between border border-white/10 gap-6">
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
