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
  pdfUrl?: string;
  officialSource?: string;
  officialUrl?: string;
  officialPortal?: string;
  linkTooltip?: string;
  updatedDate?: string;
  isNew?: boolean;
  readMinutes?: number;
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

export interface SchemeDocRequirement {
  type: string;
  label: string;
  description: string;
  required: boolean;
}

export interface GovScheme {
  id: string;
  name: string;
  fullName: string;
  description: string;
  category: 'maternal' | 'financial' | 'nutrition' | 'insurance' | string;
  benefit?: string;
  benefitAmount?: number | string;
  officialPdf?: string;
  pdfFallback?: string;
  portalUrl?: string;
  portalFallback?: string;
  formsUrl?: string;
  offlinePdf?: string;
  stateBenefits?: Record<string, string>;
  eligibility?: string[];
  documents?: SchemeDocRequirement[];
  process?: string[];
  whereToApply?: string;
  processingTime?: string;
  contact?: string;
  benefits?: string[];
  eligibilityCriteria?: string[];
  documentsRequired?: string[];
  icon?: string;
  color?: string;
}

export interface SchemeEligibility {
  patientId: string;
  patientName?: string;
  village?: string;
  schemeId: string;
  status: 'eligible' | 'enrolled' | 'pending-docs' | 'not-eligible' | string;
  enrolledDate?: string;
  benefitReceived?: string;
  missingDocs?: string[];
  eligibilityReasons?: string[];
}

export interface PatientUploadedDocument {
  id: string | null;
  type: string;
  label: string;
  description: string;
  required: boolean;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  fileName?: string | null;
  fileSize?: number | null;
  uploadedAt?: string | null;
  verifiedAt?: string | null;
  notes?: string | null;
}

export interface PatientSchemeChecklist {
  patientId: string;
  schemeId: string;
  documents: PatientUploadedDocument[];
  progress: string;
  progressPercent: number;
  complete: boolean;
}

export interface MissingDocumentAlert {
  patientId: string;
  patientName: string;
  village: string;
  schemeId: string;
  schemeName: string;
  missingDoc: string;
  missingCount: number;
  missingList: string[];
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

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface TrainingLesson {
  id: number;
  title: string;
  videoUrl?: string;
  videoId?: string;
  content: string;
  keyPoints?: string[];
  clinicalActions?: string[];
  quiz?: QuizQuestion[];
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
  officialSource?: string;
  completedLessons?: number[];
  quizPassed?: boolean;
  quizScore?: number | null;
}

export interface CertificateRecord {
  id: string;
  workerId: string;
  workerName: string;
  moduleId: string;
  moduleTitle: string;
  score: number;
  issuedDate: string;
  certificateNumber: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'reminder' | 'info' | 'success';
  time: string;
  read: boolean;
}
