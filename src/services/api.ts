import type { ChatPayload, ChatResponse, UploadPdfResponse } from "@/interfaces";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function uploadPdf(file: File): Promise<UploadPdfResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/api/upload-pdf`, { method: "POST", body: formData });
  if (!res.ok) throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
  const json = await res.json();
  return {
    documentId: json.documentId ?? json.id,
    chunkCount: json.chunkCount ?? json.chunks ?? json.count,
  } as UploadPdfResponse;
}

export async function chat(payload: ChatPayload): Promise<ChatResponse> {
  // Primary endpoint
  let res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  // Fallback to legacy /api/query if 404/405
  if (!res.ok && (res.status === 404 || res.status === 405)) {
    res = await fetch(`${API_URL}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: payload.prompt, documentId: payload.documentId, sessionId: payload.sessionId }),
    });
  }
  if (!res.ok) throw new Error(`Chat failed: ${res.status} ${res.statusText}`);
  const json = await res.json();
  return {
    answer: json.answer ?? json.response ?? json.text,
    sessionId: json.sessionId ?? json.session_id ?? json.session,
    retrievedCount: json.retrievedCount ?? json.retrieved_count ?? json.k ?? json.kCount,
  } as ChatResponse;
}
