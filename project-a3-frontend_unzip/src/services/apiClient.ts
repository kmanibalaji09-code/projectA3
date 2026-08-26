const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const backendId = (id: string) => {
  const knownIds: Record<string, string> = {
    "prod-1": "PROD-1001",
    "prod-2": "PROD-1002",
    "case-1024": "CASE-1024",
  };
  return knownIds[id] ?? id;
};

export interface BackendProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  image_url: string;
  status: "PUBLISHED" | "DRAFT" | "UNPUBLISHED";
  created_at: string;
}

export function listProductsApi() {
  return request<BackendProduct[]>("/api/products");
}

export function getProductApi(productId: string) {
  return request<BackendProduct>(`/api/products/${backendId(productId)}`);
}

export interface BackendReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  review_text: string;
  created_at: string;
}

export function listReviewsApi(productId?: string) {
  const query = productId ? `?product_id=${encodeURIComponent(backendId(productId))}` : "";
  return request<BackendReview[]>(`/api/reviews${query}`);
}

export function createProductApi(product: {
  title: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
}) {
  return request<BackendProduct>("/api/products", {
    method: "POST",
    body: JSON.stringify(product),
  });
}

export function updateProductApi(productId: string, update: { title?: string; price?: number }) {
  return request<BackendProduct>(`/api/products/${backendId(productId)}`, {
    method: "PATCH",
    body: JSON.stringify(update),
  });
}

export function publishProductApi(productId: string, published: boolean) {
  return request<BackendProduct>(`/api/products/${backendId(productId)}/${published ? "publish" : "unpublish"}`, {
    method: "POST",
  });
}

export async function deleteProductApi(productId: string) {
  await request<void>(`/api/products/${backendId(productId)}`, { method: "DELETE" });
}

export function createReviewApi(productId: string, rating: number, reviewText: string) {
  return request<{ id: string }>("/api/reviews", {
    method: "POST",
    body: JSON.stringify({ product_id: backendId(productId), rating, review_text: reviewText }),
  });
}

export function listCasesApi() {
  return request<BackendCase[]>("/api/cases");
}

export interface BackendCaseDetail extends BackendCase {
  messages: Array<{ id: string; sender: string; text: string; created_at: string }>;
  analysis: SentinelAnalysisResponse["analysis"] | null;
  original_review_text: string;
  original_rating: number;
  engineering_issue: BackendIssue | null;
}

export function getCaseApi(caseId: string) {
  return request<BackendCaseDetail>(`/api/cases/${backendId(caseId)}`);
}

export function updateCaseStatusApi(caseId: string, status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED") {
  return request<BackendCase>(`/api/cases/${backendId(caseId)}/status?status=${status}`, { method: "PATCH" });
}

export interface BackendCase {
  id: string;
  customer_name: string;
  product_name: string;
  product_id: string;
  review_id: string | null;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: string;
  created_at: string;
  updated_at: string;
  known_facts: string[] | null;
  agent_feedback: string | null;
}

export interface BackendIssue {
  id: string;
  case_id: string;
  title: string;
  description_markdown: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: string;
  created_at: string;
}

export function listIssuesApi() {
  return request<BackendIssue[]>("/api/issues");
}

export function getIssueApi(issueId: string) {
  return request<BackendIssue>(`/api/issues/${issueId}`);
}

export function approveIssueApi(issueId: string, decision: "approve" | "reject") {
  return request<{ issue: BackendIssue }>("/api/workflow/approve", {
    method: "POST",
    body: JSON.stringify({ issue_id: issueId, decision, notes: "Developer decision from dashboard" }),
  });
}

export function updateIssueApi(issueId: string, update: { title: string }) {
  return request<BackendIssue>(`/api/issues/${issueId}`, {
    method: "PATCH",
    body: JSON.stringify(update),
  });
}
interface ApiErrorBody {
  detail?: string;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: "DEVELOPER" | "CUSTOMER";
}

interface LoginResponse {
  access_token: string;
  user: ApiUser;
}

export function registerApi(name: string, email: string, password: string, role: "DEVELOPER" | "CUSTOMER") {
  return request<LoginResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role }),
  }).then((result) => {
    localStorage.setItem("a3_access_token", result.access_token);
    return result.user;
  });
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("a3_access_token");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
    throw new Error(body.detail ?? `Request failed (${response.status})`);
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

export async function loginApi(email: string, password: string): Promise<ApiUser> {
  const result = await request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("a3_access_token", result.access_token);
  return result.user;
}

export interface SentinelAnalysisResponse {
  analysis: {
    sentiment: "Positive" | "Neutral" | "Negative";
    emotion: string;
    severity: "Low" | "Medium" | "High" | "Critical";
    category: string;
    rootCause: string;
    customerProblem: string;
    safetyConcern: boolean;
    confidence: number;
    missingInformation: string[];
  };
}

export function analyzeReviewApi(reviewText: string, rating: number, productId: string) {
  return request<SentinelAnalysisResponse>("/api/reviews/analyze", {
    method: "POST",
    body: JSON.stringify({ review_text: reviewText, rating, product_id: backendId(productId) }),
  });
}

interface CaseMessageResponse {
  response: string;
  known_facts: string[];
}

export function sendCaseMessageApi(caseId: string, message: string) {
  return request<CaseMessageResponse>(`/api/cases/${backendId(caseId)}/messages`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}
