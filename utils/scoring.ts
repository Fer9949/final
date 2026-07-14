
import { Answer, BaselineSnapshot, ModuleData, ModuleId, Question } from '../types';

// Umbral bajo el cual una respuesta se considera brecha (hallazgo)
export const GAP_THRESHOLD = 0.7;

export const isGapValue = (value: number) => value !== -1 && value < GAP_THRESHOLD;

export interface GapMovement {
  moduleId: ModuleId;
  moduleName: string;
  questionId: number;
  text: string;
  peso: number;
  infraccion?: string;
  fromLabel: string;
  toLabel: string;
  fromValue: number;
  toValue: number;
}

export interface ModuleGapProgress {
  moduleId: ModuleId;
  moduleName: string;
  baselineGaps: number;
  closed: number;
}

export interface GapProgress {
  baselineDate: string;
  baselineGaps: number;      // brechas detectadas en la línea base
  closed: number;            // cerradas (ahora >= umbral)
  open: number;              // siguen abiertas
  pctWeighted: number;       // avance ponderado por peso de pregunta (0-100)
  regressed: GapMovement[];  // nuevas brechas o que retrocedieron desde la base
  closedList: GapMovement[];
  byModule: ModuleGapProgress[];
  // Exposición sancionatoria (módulo MPI): brechas por clase de infracción
  mpi: { clase: string; abiertas: number; cerradas: number }[];
}

export const getGapProgress = (
  baseline: BaselineSnapshot,
  answers: Record<string, Answer>,
  modules: ModuleData[]
): GapProgress => {
  let baselineGaps = 0, closed = 0, open = 0;
  let weightTotal = 0, weightClosed = 0;
  const closedList: GapMovement[] = [];
  const regressed: GapMovement[] = [];
  const byModule: ModuleGapProgress[] = [];
  const mpiMap = new Map<string, { abiertas: number; cerradas: number }>();

  for (const mod of modules) {
    let modBase = 0, modClosed = 0;
    for (const q of mod.questions) {
      const key = `${mod.id}_${q.id}`;
      const base = baseline.answers[key];
      const cur = answers[key];
      const peso = q.peso || 1;

      const wasGap = !!base && isGapValue(base.value);
      const isNowGap = !!cur && isGapValue(cur.value);
      const isNowOk = !!cur && cur.value !== -1 && cur.value >= GAP_THRESHOLD;

      const movement = (): GapMovement => ({
        moduleId: mod.id, moduleName: mod.name, questionId: q.id,
        text: q.pregunta, peso, infraccion: q.infraccion,
        fromLabel: base ? base.label : 'Sin responder',
        toLabel: cur ? cur.label : 'Sin responder',
        fromValue: base ? base.value : 0,
        toValue: cur ? cur.value : 0
      });

      if (wasGap) {
        baselineGaps++; modBase++; weightTotal += peso;
        if (isNowOk) { closed++; modClosed++; weightClosed += peso; closedList.push(movement()); }
        else { open++; }
      } else if (isNowGap) {
        // brecha nueva o que retrocedió respecto de la línea base
        regressed.push(movement());
      }

      // Exposición sancionatoria del módulo MPI
      if (q.infraccion && isNowGap) {
        const e = mpiMap.get(q.infraccion) || { abiertas: 0, cerradas: 0 };
        e.abiertas++; mpiMap.set(q.infraccion, e);
      }
      if (q.infraccion && wasGap && isNowOk) {
        const e = mpiMap.get(q.infraccion) || { abiertas: 0, cerradas: 0 };
        e.cerradas++; mpiMap.set(q.infraccion, e);
      }
    }
    if (modBase > 0) byModule.push({ moduleId: mod.id, moduleName: mod.name, baselineGaps: modBase, closed: modClosed });
  }

  const orden = ['gravísima', 'grave', 'leve'];
  const mpi = orden.filter(c => mpiMap.has(c)).map(c => ({ clase: c, ...mpiMap.get(c)! }));

  return {
    baselineDate: baseline.date,
    baselineGaps, closed, open,
    pctWeighted: weightTotal > 0 ? (weightClosed / weightTotal) * 100 : 0,
    regressed, closedList, byModule, mpi
  };
};

// Justificaciones pendientes: respuestas que son brecha y no tienen sustento del auditor
export const getPendingJustifications = (
  answers: Record<string, Answer>,
  modules: ModuleData[]
): { moduleName: string; questionId: number }[] => {
  const pending: { moduleName: string; questionId: number }[] = [];
  for (const mod of modules) {
    for (const q of mod.questions) {
      const ans = answers[`${mod.id}_${q.id}`];
      if (ans && isGapValue(ans.value) && !(ans.justificacion || '').trim()) {
        pending.push({ moduleName: mod.name, questionId: q.id });
      }
    }
  }
  return pending;
};

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

export interface CategoryScore {
  category: string;
  score: number;
  totalQuestions: number;
  answeredQuestions: number;
}

export const getCategoryScores = (
  moduleId: ModuleId,
  answers: Record<string, Answer>,
  modules: ModuleData[]
): CategoryScore[] => {
  const module = modules.find(m => m.id === moduleId);
  if (!module) return [];

  const byCategory = new Map<string, Question[]>();
  for (const q of module.questions) {
    const cat = q.categoria || 'Sin categoría';
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(q);
  }

  const result: CategoryScore[] = [];
  byCategory.forEach((questions, category) => {
    let weightedScore = 0;
    let totalWeight = 0;
    let answered = 0;
    for (const q of questions) {
      const ans = answers[`${moduleId}_${q.id}`];
      if (ans && ans.value !== -1) {
        const weight = q.peso || 1;
        weightedScore += ans.value * weight;
        totalWeight += weight;
        answered++;
      }
    }
    result.push({
      category,
      score: totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0,
      totalQuestions: questions.length,
      answeredQuestions: answered,
    });
  });

  return result.sort((a, b) => a.score - b.score);
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
