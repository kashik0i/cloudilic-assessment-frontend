import {type ChatPayload, type ChatResponse, TIMEOUT_MS, type UploadPdfResponse} from "@/interfaces";

export function getBaseUrl() {
  return import.meta.env.VITE_API_URL || "";
}

export async function fetchWithTimeout(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(input, {...init, signal: controller.signal});
  } finally {
    clearTimeout(id);
  }
}

export async function uploadPdf(file: File): Promise<UploadPdfResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${getBaseUrl()}/upload-pdf`, { method: "POST", body: formData });
  if (!res.ok) throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
  const json = await res.json();
  return {
    documentId: json.documentId ?? json.id,
    chunkCount: json.chunkCount ?? json.chunks ?? json.count,
  } as UploadPdfResponse;
}

export async function chat(payload: ChatPayload): Promise<ChatResponse> {
  // Primary endpoint
  let res = await fetch(`${getBaseUrl()}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Chat failed: ${res.status} ${res.statusText}`);
  const json = await res.json();
  return {
    answer: json.answer ?? json.response ?? json.text,
    sessionId: json.sessionId ?? json.session_id ?? json.session,
    retrievedCount: json.retrievedCount ?? json.retrieved_count ?? json.k ?? json.kCount,
  } as ChatResponse;
}
