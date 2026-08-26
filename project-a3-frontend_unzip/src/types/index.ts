export type Role = "DEVELOPER" | "CUSTOMER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarInitials: string;
}

export type ProductStatus = "PUBLISHED" | "DRAFT" | "UNPUBLISHED";

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  features: string[];
  status: ProductStatus;
  createdAt: string;
  rating: number;
  reviewCount: number;
}

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  createdAt: string;
}

export type Sentiment = "Positive" | "Neutral" | "Negative";
export type Severity = "Low" | "Medium" | "High" | "Critical";
export type CaseStatus = "New" | "In Progress" | "Waiting Response" | "Resolved";

export interface SentinelAnalysis {
  sentiment: Sentiment;
  emotion: string;
  severity: Severity;
  category: string;
  rootCause: string;
  customerProblem: string;
  safetyConcern: boolean;
  confidence: number;
  missingInformation: string[];
}

export interface CaseMessage {
  id: string;
  caseId: string;
  sender: "AGENT" | "CUSTOMER";
  text: string;
  createdAt: string;
}

export interface CaseMemory {
  knownFacts: string[];
  openQuestions: string[];
  currentHypothesis: string;
}

export interface CustomerCase {
  id: string;
  reviewId: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  status: CaseStatus;
  severity: Severity;
  createdAt: string;
  updatedAt: string;
  analysis: SentinelAnalysis;
  memory: CaseMemory;
  originalReviewText: string;
  originalRating: number;
  hasEngineeringIssue: boolean;
}

export type IssueStatus = "Pending Approval" | "Approved" | "Rejected" | "Edited";

export interface EngineeringIssue {
  id: string;
  caseId: string;
  title: string;
  severity: Severity;
  component: string;
  rootCause: string;
  customerImpact: string;
  evidence: string[];
  reproductionSteps: string[];
  suggestedInvestigation: string[];
  suggestedFix: string[];
  acceptanceCriteria: string[];
  markdownTicket: string;
  status: IssueStatus;
  createdAt: string;
}

export interface WorkflowStep {
  key: string;
  label: string;
  state: "completed" | "active" | "waiting" | "failed";
  count?: number;
}
