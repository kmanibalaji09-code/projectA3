"""
Mirrors the frontend's src/services/aiService.ts contract exactly:

  analyzeReview(text, rating)             -> SentinelAnalysis
  generateCustomerResponse(message, mem)  -> { response, updatedMemory }

Today this is rule-based (AI_PROVIDER=mock), matching MockAIService's logic
1:1 so results stay consistent with what the frontend already demonstrated.

To wire in the real Product Sentinel / Customer Resolution agents later
(CrewAI + Ollama), implement the same two functions in a new module (e.g.
services/ollama_sentinel.py) and swap the import in the routers — no schema
or route changes required.
"""
import re


def analyze_review(review_text: str, rating: int) -> dict:
    is_battery_related = bool(re.search(r"battery|charg|warm|hot|overheat", review_text, re.IGNORECASE))

    sentiment = "Negative" if rating <= 2 else "Neutral" if rating == 3 else "Positive"
    emotion = "Frustrated" if rating <= 2 else "Satisfied"
    severity = "High" if is_battery_related else ("Medium" if rating <= 2 else "Low")
    category = "Battery / Charging" if is_battery_related else "General"
    root_cause = (
        "Possible battery degradation / charging controller issue"
        if is_battery_related
        else "Requires further diagnosis"
    )

    return {
        "sentiment": sentiment,
        "emotion": emotion,
        "severity": severity,
        "category": category,
        "rootCause": root_cause,
        "customerProblem": review_text,
        "safetyConcern": is_battery_related,
        "confidence": 0.82,
        "missingInformation": ["Usage patterns", "Charging habits"],
    }


def generate_customer_response(message: str, known_facts: list[str]) -> dict:
    updated_facts = [*known_facts, message]
    return {
        "response": (
            "Thanks for the extra detail — that helps narrow this down. "
            "Could you also let me know what percentage the battery is at when you unplug it?"
        ),
        "known_facts": updated_facts,
    }
