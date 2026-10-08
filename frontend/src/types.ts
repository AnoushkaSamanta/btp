export type ViewId = 'dashboard' | 'voice' | 'patients' | 'schedule' | 'resources' | 'reports' | 'schemes' | 'immunization' | 'training';

export type PatientStatus = 'critical' | 'high-risk' | 'stable' | 'routine';
export type VisitStatus = 'completed' | 'scheduled' | 'missed' | 'pending';
export type Trimester = '1st' | '2nd' | '3rd' | 'Postnatal';

export interface Patient {
  id: string;
  name: string;
  age: number;
  village: string;
  phone: string;
  status: PatientStatus;
  trimester: Trimester;
  lmpDate: string;
  gravida: number;
  para: number;
  riskFactors: string[];
  lastVisit: string;
  nextVisit: string;
  bloodGroup: string;
  weight: number;
  bp: string;
  hemoglobin: number;
  photoUrl?: string;
  aadhaarLinked?: boolean;
  bplCard?: boolean;
  jsyRegistered?: boolean;
  pmjayEligible?: boolean;
}

export interface Visit {
  id: string;
  patientName: string;
  patientId: string;
  village: string;
  time: string;
  date: string;
  status: VisitStatus;
  type: string;
  notes: string;
  trimester: Trimester;
  report?: string;
  tasks?: Array<{ title: string; due: string; priority: string }>;
  protocolFlags?: Array<{ title: string; severity: string }>;
  schemeMatches?: Array<{ name: string; status: string }>;
  confirmed?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: string[];
}

export interface ResourceItem {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  language: string;
  readTime: string;
}

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'flat';
  icon: string;
  color: string;
}

export interface GovScheme {
  id: string;
  name: string;
  fullName: string;
  description: string;
  category: 'maternal' | 'financial' | 'nutrition' | 'insurance';
  benefits: string[];
  eligibilityCriteria: string[];
  documentsRequired: string[];
  benefitAmount: string;
  icon: string;
  color: 'primary' | 'sky' | 'accent' | 'success';
  officialDocUrl?: string;
  officialWebsite?: string;
  applicationSteps?: string[];
}

export interface SchemeEligibility {
  patientId: string;
  schemeId: string;
  status: 'eligible' | 'enrolled' | 'pending-docs' | 'not-eligible';
  enrolledDate?: string;
  benefitReceived?: string;
  missingDocs?: string[];
}

export interface ImmunizationRecord {
  id: string;
  patientName: string;
  patientId: string;
  vaccine: string;
  doseNumber: number;
  dueDate: string;
  status: 'completed' | 'due' | 'overdue' | 'upcoming';
  ageGroup: string;
  village: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  lessons: number;
  progress: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: string;
  color: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'reminder' | 'info' | 'success';
  time: string;
  read: boolean;
}
