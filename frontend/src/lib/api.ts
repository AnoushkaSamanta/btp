const BASE_URL = String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const API = BASE_URL ? `${BASE_URL}/api` : "/api";

async function parse(res: Response) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const detail = (err as { detail?: string }).detail;
    throw new Error(typeof detail === "string" ? detail : "Request failed");
  }
  return res.json();
}

export async function healthCheck() {
  try {
    const res = await fetch(`${API}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchPatients() {
  return parse(await fetch(`${API}/patients`));
}

export async function fetchPatient(id: string) {
  return parse(await fetch(`${API}/patients/${id}`));
}

export async function createPatient(body: Record<string, unknown>) {
  return parse(
    await fetch(`${API}/patients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

export async function updatePatientApi(id: string, body: Record<string, unknown>) {
  return parse(
    await fetch(`${API}/patients/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

export async function fetchPatientVisits(patientId: string) {
  return parse(await fetch(`${API}/patients/${encodeURIComponent(patientId)}/visits`));
}

export async function fetchPatientDocumentsStatus(patientId: string) {
  return parse(await fetch(`${API}/patients/${encodeURIComponent(patientId)}/documents`));
}

export async function uploadPatientDocItem(patientId: string, formData: FormData) {
  const res = await fetch(`${API}/patients/${encodeURIComponent(patientId)}/documents`, {
    method: "POST",
    body: formData,
  });
  return parse(res);
}

export async function fetchPatientMedications(patientId: string) {
  return parse(await fetch(`${API}/patients/${encodeURIComponent(patientId)}/medications`));
}

export async function addPatientMedicationApi(patientId: string, body: Record<string, unknown>) {
  return parse(
    await fetch(`${API}/patients/${encodeURIComponent(patientId)}/medications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

export async function fetchPatientNotes(patientId: string) {
  return parse(await fetch(`${API}/patients/${encodeURIComponent(patientId)}/notes`));
}

export async function addPatientNoteApi(patientId: string, body: Record<string, unknown>) {
  return parse(
    await fetch(`${API}/patients/${encodeURIComponent(patientId)}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

export async function uploadPatientPhotoApi(patientId: string, photoUrl: string) {
  return parse(
    await fetch(`${API}/patients/${encodeURIComponent(patientId)}/photo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoUrl }),
    }),
  );
}

export async function fetchPatientTrends(patientId: string) {
  return parse(await fetch(`${API}/patients/${encodeURIComponent(patientId)}/trends`));
}

export async function fetchVisits() {
  return parse(await fetch(`${API}/visits`));
}

export async function fetchDashboard() {
  return parse(await fetch(`${API}/dashboard`));
}

export async function fetchNotifications() {
  return parse(await fetch(`${API}/notifications`));
}

export async function markNotificationsRead() {
  return parse(await fetch(`${API}/notifications/read-all`, { method: "POST" }));
}

export async function markNotificationRead(id: string) {
  return parse(await fetch(`${API}/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" }));
}

export async function fetchSchemes() {
  return parse(await fetch(`${API}/schemes`));
}

export async function fetchImmunizations() {
  return parse(await fetch(`${API}/immunizations`));
}

export async function updateImmunizationStatus(id: string, status: string) {
  return parse(
    await fetch(`${API}/immunizations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }),
  );
}

export async function createImmunization(body: {
  patient_id: string;
  vaccine: string;
  dose_number?: number;
  due_date: string;
  status?: string;
  age_group?: string;
  village?: string;
  notes?: string;
}) {
  return parse(
    await fetch(`${API}/immunizations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

export async function markImmunizationGiven(
  id: string,
  payload: {
    given_date?: string;
    batch_no?: string;
    given_by?: string;
    notes?: string;
  },
) {
  return parse(
    await fetch(`${API}/immunizations/${id}/mark-given`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function updateImmunizationRecord(
  id: string,
  updates: Record<string, any>,
) {
  return parse(
    await fetch(`${API}/immunizations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }),
  );
}

export async function deleteImmunizationRecord(id: string) {
  return parse(
    await fetch(`${API}/immunizations/${id}`, {
      method: "DELETE",
    }),
  );
}

export async function downloadImmunizationPdf(): Promise<Blob> {
  const res = await fetch(`${API}/immunizations/export/pdf`);
  if (!res.ok) {
    throw new Error("Failed to download immunization PDF");
  }
  return await res.blob();
}


export async function updateVisitStatus(id: string, status: string) {
  return parse(
    await fetch(`${API}/visits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }),
  );
}

export async function createVisit(body: {
  patient_id: string;
  date: string;
  time?: string;
  type?: string;
  notes?: string;
  village?: string;
}) {
  return parse(
    await fetch(`${API}/visits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

export async function updateVisit(id: string, body: Record<string, any>) {
  return parse(
    await fetch(`${API}/visits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

export async function deleteVisit(id: string, reason?: string) {
  const query = reason ? `?reason=${encodeURIComponent(reason)}` : "";
  return parse(
    await fetch(`${API}/visits/${id}${query}`, {
      method: "DELETE",
    }),
  );
}

export async function completeVisitApi(
  id: string,
  body: {
    notes?: string;
    schedule_next?: boolean;
    next_date?: string;
    next_type?: string;
    next_time?: string;
  },
) {
  return parse(
    await fetch(`${API}/visits/${id}/complete`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

export async function rescheduleVisitApi(
  id: string,
  body: {
    date: string;
    time?: string;
    notes?: string;
  },
) {
  return parse(
    await fetch(`${API}/visits/${id}/reschedule`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

export async function scheduleVisit(body: {
  patient_id: string;
  date: string;
  time?: string;
  type?: string;
  notes?: string;
}) {
  return parse(
    await fetch(`${API}/visits/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

export async function fetchReportsSummary() {
  return parse(await fetch(`${API}/reports/summary`));
}

export async function searchRegistry(q: string) {
  return parse(await fetch(`${API}/search?q=${encodeURIComponent(q)}`));
}

export async function queryCopilot(query: string, language: string) {
  return parse(
    await fetch(`${API}/copilot/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, language }),
    }),
  );
}

export async function processVisit(transcript: string, language: string, patientId?: string) {
  return parse(
    await fetch(`${API}/visits/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, language, patient_id: patientId || null, mode: "visit" }),
    }),
  );
}

export async function runFullPipeline(transcript: string, language = "English", patientRecord?: Record<string, unknown>) {
  return parse(
    await fetch(`${API}/full-pipeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, language, patient_record: patientRecord || null }),
    }),
  );
}

export async function sendChatMessage(message: string, language = "English", patientId?: string) {
  return parse(
    await fetch(`${API}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, language, patient_id: patientId || null }),
    }),
  );
}

export async function confirmVisit(draftId: string, patientId?: string) {
  return parse(
    await fetch(`${API}/visits/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft_id: draftId, patient_id: patientId || null }),
    }),
  );
}

export async function saveVisit(payload: {
  structured_record?: Record<string, unknown>;
  record?: Record<string, unknown>;
  protocol_flags?: Array<unknown>;
  protocol?: Record<string, unknown>;
  scheme_matches?: Array<unknown>;
  schemes?: Record<string, unknown>;
  tasks?: Array<unknown>;
  draft_id?: string;
  transcript?: string;
  report?: string;
}) {
  return parse(
    await fetch(`${API}/save-visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function transcribeAudio(blob: Blob, language: string = "hi") {
  const form = new FormData();
  const extension = blob.type.includes("mp4") || blob.type.includes("m4a") ? "m4a"
    : blob.type.includes("ogg") ? "ogg"
      : blob.type.includes("wav") ? "wav" : "webm";
  form.append("file", blob, `recording.${extension}`);
  form.append("language", language);
  try {
    const res = await fetch(`${API}/asr/transcribe`, { method: "POST", body: form });
    if (res.ok) return parse(res);
  } catch {
    // Fallback to /transcribe
  }
  const fallbackRes = await fetch(`${API}/transcribe`, { method: "POST", body: form });
  return parse(fallbackRes);
}

export async function fetchTrainingModules() {
  return parse(await fetch(`${API}/training/modules`));
}

export async function fetchTrainingModule(id: string) {
  return parse(await fetch(`${API}/training/modules/${id}`));
}

export async function fetchTrainingLessons(id: string) {
  return parse(await fetch(`${API}/training/modules/${id}/lessons`));
}

export async function completeTrainingLesson(moduleId: string, lessonId: number) {
  return parse(
    await fetch(`${API}/training/modules/${moduleId}/lessons/${lessonId}/complete`, {
      method: "POST",
    }),
  );
}

export async function submitModuleQuiz(
  moduleId: string,
  payload: { answers: Record<string, number>; score: number; total: number },
) {
  return parse(
    await fetch(`${API}/training/modules/${moduleId}/quiz/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function fetchCertificate(moduleId: string) {
  return parse(await fetch(`${API}/training/modules/${moduleId}/certificate`));
}

export async function fetchPatientSchemeDocuments(patientId: string, schemeId: string) {
  return parse(await fetch(`${API}/documents/${encodeURIComponent(patientId)}/${encodeURIComponent(schemeId)}`));
}

export async function uploadPatientDocument(formData: FormData) {
  const res = await fetch(`${API}/documents/upload`, {
    method: "POST",
    body: formData,
  });
  return parse(res);
}

export async function deletePatientDocument(documentId: string) {
  return parse(
    await fetch(`${API}/documents/${encodeURIComponent(documentId)}`, {
      method: "DELETE",
    }),
  );
}

export async function updateDocumentStatus(documentId: string, status: string, notes?: string) {
  return parse(
    await fetch(`${API}/documents/${encodeURIComponent(documentId)}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    }),
  );
}

export async function fetchPatientAllSchemesChecklist(patientId: string) {
  return parse(await fetch(`${API}/documents/${encodeURIComponent(patientId)}/checklist`));
}

export async function fetchMissingDocumentAlerts() {
  return parse(await fetch(`${API}/documents/alerts/missing`));
}

export async function fetchReportsData(params?: { fromDate?: string; toDate?: string; month?: string }) {
  const query = new URLSearchParams();
  if (params?.fromDate) query.set("from_date", params.fromDate);
  if (params?.toDate) query.set("to_date", params.toDate);
  if (params?.month) query.set("month", params.month);
  const qStr = query.toString() ? `?${query.toString()}` : "";
  return parse(await fetch(`${API}/reports/data${qStr}`));
}

export async function fetchReportPreviewMeta(
  reportType: 'monthly-summary' | 'patient-registry' | 'immunization-log' | 'village-wise' | 'scheme-report' | 'export',
  params?: { fromDate?: string; toDate?: string; month?: string }
) {
  const query = new URLSearchParams();
  query.set("report_type", reportType);
  if (params?.fromDate) query.set("from_date", params.fromDate);
  if (params?.toDate) query.set("to_date", params.toDate);
  if (params?.month) query.set("month", params.month);
  return parse(await fetch(`${API}/reports/preview?${query.toString()}`));
}

export function getReportDownloadUrl(
  reportType: 'monthly-summary' | 'patient-registry' | 'immunization-log' | 'village-wise' | 'scheme-report' | 'export',
  format: 'pdf' | 'xlsx' = 'pdf',
  params?: { fromDate?: string; toDate?: string; month?: string }
): string {
  const query = new URLSearchParams();
  query.set("format", format);
  if (params?.fromDate) query.set("from_date", params.fromDate);
  if (params?.toDate) query.set("to_date", params.toDate);
  if (params?.month) query.set("month", params.month);
  return `${API}/reports/${reportType}?${query.toString()}`;
}

export async function downloadReportFile(
  reportType: 'monthly-summary' | 'patient-registry' | 'immunization-log' | 'village-wise' | 'scheme-report' | 'export',
  format: 'pdf' | 'xlsx' = 'pdf',
  params?: { fromDate?: string; toDate?: string; month?: string }
): Promise<string> {
  const url = getReportDownloadUrl(reportType, format, params);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Report generation failed (${res.status} ${res.statusText})`);
  }
  
  // Extract filename from header or fallback
  let filename = `${reportType}.${format}`;
  const disposition = res.headers.get("content-disposition");
  if (disposition && disposition.includes("filename=")) {
    const match = disposition.match(/filename="?([^";]+)"?/);
    if (match && match[1]) filename = match[1];
  }

  const blob = await res.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(blobUrl);
  return filename;
}export async function fetchDashboardSummary() {
  return parse(await fetch(`${API}/dashboard/summary`));
}

export async function fetchPipelineStatus() {
  return parse(await fetch(`${API}/dashboard/pipeline-status`));
}

export async function fetchRedFlagAlerts() {
  return parse(await fetch(`${API}/dashboard/red-flags`));
}

export async function fetchVoiceReadBackLog() {
  return parse(await fetch(`${API}/dashboard/voice-log`));
}

export async function fetchRAGStats() {
  return parse(await fetch(`${API}/dashboard/rag-stats`));
}

export async function fetchEvaluationSnapshot() {
  return parse(await fetch(`${API}/dashboard/evaluation`));
}

export async function fetchSystemHealth() {
  return parse(await fetch(`${API}/dashboard/system-health`));
}

export async function fetchFollowUpTasks() {
  return parse(await fetch(`${API}/dashboard/tasks`));
}

export async function fetchCriticalCases() {
  return parse(await fetch(`${API}/dashboard/critical-cases`));
}

export async function fetchVoiceInputs() {
  return parse(await fetch(`${API}/dashboard/voice-inputs`));
}

export async function fetchWeeklyProgress() {
  return parse(await fetch(`${API}/dashboard/weekly-progress`));
}

export async function fetchConfirmationLoop() {
  return parse(await fetch(`${API}/dashboard/confirmations`));
}

export async function loginWorker(username: string, password?: string) {
  return parse(
    await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
  );
}

export async function fetchCurrentWorker() {
  return parse(await fetch(`${API}/auth/me`));
}

export async function runAblationStudyApi() {
  return parse(
    await fetch(`${API}/evaluation/ablation/run`, {
      method: "POST",
    })
  );
}

export async function runFieldEvaluationApi() {
  return parse(
    await fetch(`${API}/evaluation/record-samples/run`, {
      method: "POST",
    })
  );
}

