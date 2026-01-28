
import { Answer, ModuleData, ModuleId, Question } from '../types';

export const calculateModuleScore = (moduleId: ModuleId, answers: Record<string, Answer>, modules: ModuleData[]) => {
  const module = modules.find(m => m.id === moduleId);
  if (!module) return 0;

  const relevantAnswers = Object.values(answers).filter(a => a.moduleId === moduleId);
  if (relevantAnswers.length === 0) return 0;

  const validAnswers = relevantAnswers.filter(ans => ans.value !== -1);
  
  const weightedScore = validAnswers.reduce((acc, ans) => {
    const q = module.questions.find(q => q.id === ans.questionId);
    const weight = q?.peso || 1;
    return acc + (ans.value * weight);
  }, 0);

  const totalWeight = module.questions.reduce((acc, q) => {
    const answer = answers[`${moduleId}_${q.id}`];
    if (answer && answer.value === -1) {
      return acc;
    }
    return acc + (q.peso || 1);
  }, 0);
  
  if (totalWeight === 0) return 0;

  return (weightedScore / totalWeight) * 100;
};

export interface GapFinding {
  questionId: number;
  text: string;
  category?: string;
  value: number;
  label: string;
}

export const getTopModuleGaps = (moduleId: ModuleId, answers: Record<string, Answer>, modules: ModuleData[], limit = 5): GapFinding[] => {
  const module = modules.find(m => m.id === moduleId);
  if (!module) return [];

  const gaps: GapFinding[] = module.questions
    .map(q => {
      const ans = answers[`${moduleId}_${q.id}`];
      return {
        questionId: q.id,
        text: q.pregunta,
        category: q.categoria,
        value: ans ? ans.value : 0, // Si no se ha respondido, se asume 0 para resaltar la brecha
        label: ans ? ans.label : 'Sin responder'
      };
    })
    .filter(gap => gap.value !== -1) // Ignorar N/A
    .sort((a, b) => a.value - b.value) // Menor valor primero (más crítico)
    .slice(0, limit);

  return gaps;
};

export const getRiskLevel = (score: number) => {
  if (score >= 90) return { label: 'Insignificante', color: 'bg-green-100 text-green-800' };
  if (score >= 70) return { label: 'Bajo', color: 'bg-blue-100 text-blue-800' };
  if (score >= 50) return { label: 'Moderado', color: 'bg-yellow-100 text-yellow-800' };
  if (score >= 30) return { label: 'Alto', color: 'bg-orange-100 text-orange-800' };
  return { label: 'Crítico', color: 'bg-red-100 text-red-800' };
};

export const getScoreLevel1000 = (score1000: number) => {
  if (score1000 >= 850) return { label: 'Excelencia / Avanzado', color: 'text-emerald-900', bg: 'bg-emerald-100', hex: '#166534' };
  if (score1000 >= 700) return { label: 'Cumplimiento Adecuado', color: 'text-lime-900', bg: 'bg-lime-100', hex: '#84cc16' };
  if (score1000 >= 500) return { label: 'Riesgo Medio', color: 'text-yellow-900', bg: 'bg-yellow-100', hex: '#eab308' };
  if (score1000 >= 300) return { label: 'Riesgo Alto', color: 'text-orange-900', bg: 'bg-orange-100', hex: '#f97316' };
  return { label: 'Riesgo Crítico', color: 'text-red-900', bg: 'bg-red-100', hex: '#ef4444' };
};
