/**
 * AIService is the abstraction the UI talks to. Today it's backed by
 * MockAIService (deterministic canned responses). Later this same interface
 * will be implemented by OllamaAIService, calling a FastAPI backend that runs
 * CrewAI agents against a local Ollama model — with zero changes required here.
 */
import type { SentinelAnalysis, CaseMemory } from "../types";
import { analyzeReviewApi, sendCaseMessageApi } from "./apiClient";

export interface AIService {
  analyzeReview(reviewText: string, rating: number, productId: string): Promise<SentinelAnalysis>;
  generateCustomerResponse(
    message: string,
    memory: CaseMemory,
    caseId: string
  ): Promise<{ response: string; updatedMemory: CaseMemory }>;
}

class BackendAIService implements AIService {
  async analyzeReview(reviewText: string, rating: number, productId: string) {
    const result = await analyzeReviewApi(reviewText, rating, productId);
    return result.analysis;
  }

  async generateCustomerResponse(message: string, memory: CaseMemory, caseId: string) {
    const result = await sendCaseMessageApi(caseId, message);
    return {
      response: result.response,
      updatedMemory: {
        ...memory,
        knownFacts: result.known_facts,
      },
    };
  }
}

export const aiService: AIService = new BackendAIService();
