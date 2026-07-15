
export type ModuleId = 'CIBER' | 'LEGAL' | 'ANCI' | 'INFRA' | 'VENDOR' | 'PEOPLE';

export interface Option {
  texto: string;
  valor: number;
}

export interface Question {
  id: number;
  categoria?: string;
  pregunta: string;
  opciones?: string[] | Option[];
  peso?: number;
  guia?: string;        // Guía para el auditor: qué evaluar, evidencia a solicitar y por qué importa
  referencia?: string;  // Referencia legal que la pregunta operacionaliza (módulos LEGAL/MPI y ANCI)
  infraccion?: 'leve' | 'grave' | 'gravísima'; // Clase de infracción que gatilla su incumplimiento
  nivel?: 'general' | 'oiv' | 'publico'; // Aplicabilidad Ley 21.663: todo servicio esencial / solo OIV / solo sector público
}

export interface ModuleData {
  id: ModuleId;
  name: string;
  description: string;
  objetivo?: string;
  icon: string;
  questions: Question[];
}

export interface FileEvidence {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
  data: string; // Base64 representation
}

export interface Answer {
  moduleId: ModuleId;
  questionId: number;
  value: number; // 0 to 1
  label: string;
  evidence?: FileEvidence[];
  justificacion?: string; // Observación del auditor que sustenta la respuesta (obligatoria en brechas)
}

// Foto congelada de una evaluación para medir avance en el cierre de brechas
export interface BaselineSnapshot {
  date: string;
  answers: Record<string, { value: number; label: string }>;
}

export interface EvaluationMetadata {
  processType: string;
  processName: string;
  processOwner: string;
  evaluatorName: string;
  evaluatorRole: string;
  date: string;
}

export interface GRCState {
  answers: Record<string, Answer>; // key: moduleId_questionId
  activeModule: ModuleId | 'DASHBOARD' | 'HOME';
  metadata: EvaluationMetadata;
  baseline?: BaselineSnapshot; // línea base para medir avance en cierre de brechas
}
