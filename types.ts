
export type ModuleId = 'ADN' | 'CIBER' | 'LEGAL' | 'INFRA' | 'VENDOR' | 'PEOPLE';

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
  observations: Record<string, string>; // key: moduleId_questionId
}
