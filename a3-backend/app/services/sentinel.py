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
import json
import re
from urllib.request import Request, urlopen

from app.config import settings


def _ollama_generate(prompt: str) -> str | None:
    payload = json.dumps({
        "model": settings.ollama_model,
        "prompt": prompt,
        "stream": False,
        "format": "json",
    }).encode()
    try:
        request = Request(
            f"{settings.ollama_url}/api/generate",
            data=payload,
            headers={"Content-Type": "application/json"},
        )
        with urlopen(request, timeout=90) as response:
            return json.loads(response.read().decode()).get("response")
    except (OSError, json.JSONDecodeError, KeyError):
        return None


def _ollama_analysis(review_text: str, rating: int) -> dict | None:
    prompt = f"""Analyze this product review. Return only JSON with these exact keys:
sentiment (Positive, Neutral, or Negative), emotion (string), severity (Low, Medium, High, or Critical),
category (string), rootCause (string), customerProblem (string), safetyConcern (boolean), confidence (number 0 to 1),
missingInformation (array of strings).
Rating: {rating}/5
Review: {review_text}"""
    response = _ollama_generate(prompt)
    if not response:
        return None
    try:
        result = json.loads(response)
        required = {"sentiment", "emotion", "severity", "category", "rootCause", "customerProblem", "safetyConcern", "confidence", "missingInformation"}
        return result if required.issubset(result) else None
    except json.JSONDecodeError:
        return None


def _ollama_customer_response(message: str, known_facts: list[str]) -> dict | None:
    prompt = f"""You are a helpful product support agent. Respond to the customer's latest message in two concise sentences.
Ask one useful diagnostic question. Return JSON with keys response (string) and known_facts (array of strings).
Known facts: {json.dumps(known_facts)}
Latest customer message: {message}"""
    response = _ollama_generate(prompt)
    if not response:
        return None
    try:
        result = json.loads(response)
        if "response" in result and "known_facts" in result:
            return result
    except json.JSONDecodeError:
        pass
    return None


def analyze_review(review_text: str, rating: int) -> dict:
    if settings.ai_provider.lower() == "ollama":
        result = _ollama_analysis(review_text, rating)
        if result is not None:
            return result

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
    if settings.ai_provider.lower() == "ollama":
        result = _ollama_customer_response(message, known_facts)
        if result is not None:
            return result

    updated_facts = [*known_facts, message]
    customer_messages = max(0, len(updated_facts) - 1)
    all_facts = " ".join(updated_facts)
    is_battery_issue = bool(re.search(r"battery|charg|warm|hot|overheat", all_facts, re.IGNORECASE))
    is_connectivity_issue = bool(re.search(r"connect|disconnect|bluetooth|pair|wifi|signal", all_facts, re.IGNORECASE))

    questions = (
        [
            "When did the connection problem begin, and does it happen every time or only in certain places?",
            "Which device are you connecting to, and does the problem affect other phones, laptops, or apps?",
            "Have you tried forgetting and pairing the product again, and are both devices updated?",
            "Does it disconnect during calls, music, or movement, and how far away are you from the device?",
        ] if is_connectivity_issue else [
            "When did you first notice the problem, and how long had you owned the product?",
            "What charger, cable, outlet, or environment are you using when the problem happens?",
            "How long does a full charge take, and what battery percentage do you see when you unplug it?",
            "Is there any physical damage, unusual smell, swelling, or recent firmware/software change?",
        ]
    )
    if customer_messages <= len(questions):
        response = (
            "Thanks, I recorded that detail. "
            + questions[customer_messages - 1]
        )
    elif is_connectivity_issue:
        response = (
            "Thanks, I have enough detail to narrow this down. The pattern points to a possible Bluetooth pairing, firmware, or signal stability problem. "
            "The developer can investigate connection logs, firmware compatibility, and pairing behavior across devices."
        )
    elif is_battery_issue:
        response = (
            "Thanks, I have enough detail to narrow this down. The pattern points to a possible "
            "battery degradation or charging-controller fault, with a potential thermal safety concern. "
            "Please stop using or charging the product if it becomes unusually hot, and the developer can now investigate the charger, battery health, and affected production batch."
        )
    else:
        response = (
            "Thanks, I have enough detail to prepare a useful finding. The issue appears reproducible "
            "under the conditions you described; the developer should compare those conditions with the product's expected behavior and investigate the affected component."
        )
    return {
        "response": response,
        "known_facts": updated_facts,
    }
