const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API = `${BASE_URL}/api`;

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
    const res = await fetch(`${BASE_URL}/health`);
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

export async function updateVisitStatus(id: string, status: string) {
  return parse(
    await fetch(`${API}/visits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
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

export async function confirmVisit(draftId: string, patientId?: string) {
  return parse(
    await fetch(`${API}/visits/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft_id: draftId, patient_id: patientId || null }),
    }),
  );
}

export async function transcribeAudio(blob: Blob, language: string) {
  const form = new FormData();
  const extension = blob.type.includes("mp4") || blob.type.includes("m4a") ? "m4a"
    : blob.type.includes("ogg") ? "ogg"
      : blob.type.includes("wav") ? "wav" : "webm";
  form.append("file", blob, `recording.${extension}`);
  form.append("language", language);
  const res = await fetch(`${BASE_URL}/transcribe`, { method: "POST", body: form });
  return parse(res);
}

export async function structureTranscript(transcript: string) {
  return parse(
    await fetch(`${BASE_URL}/structure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    }),
  );
}

export async function protocolCheck(structuredRecord: Record<string, unknown>) {
  return parse(
    await fetch(`${BASE_URL}/protocol-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ structured_record: structuredRecord }),
    }),
  );
}

export async function schemeMatch(householdInfo: Record<string, unknown>) {
  return parse(
    await fetch(`${BASE_URL}/scheme-match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ household_info: householdInfo }),
    }),
  );
}

export async function reportGenerate(structuredRecord: Record<string, unknown>) {
  return parse(
    await fetch(`${BASE_URL}/report-generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ structured_record: structuredRecord }),
    }),
  );
}

export async function runFullPipeline(input: { audio?: Blob; transcript?: string; language?: string }) {
  if (input.audio) {
    const form = new FormData();
    form.append("audio", input.audio, "visit_audio.webm");
    if (input.language) form.append("language", input.language);
    const res = await fetch(`${BASE_URL}/full-pipeline`, { method: "POST", body: form });
    return parse(res);
  }
  const form = new FormData();
  form.append("transcript", input.transcript || "");
  if (input.language) form.append("language", input.language);
  const res = await fetch(`${BASE_URL}/full-pipeline`, { method: "POST", body: form });
  return parse(res);
}
