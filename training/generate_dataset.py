"""Generate deterministic synthetic A3 datasets. Synthetic data is not real customer data."""
from __future__ import annotations
import argparse, json, random, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ONTOLOGY = json.loads((ROOT / "ontology/categories.json").read_text())
PRODUCTS = list(json.loads((ROOT / "data/products/product_knowledge.json").read_text()))
EMOTIONS = json.loads((ROOT / "ontology/emotions.json").read_text())
STYLE_PREFIXES = ["", "Honestly, ", "Please help - ", "Why does this thing ", "Not happy: ", "", "Mate, "]
STYLE_SUFFIXES = ["", ".", " pls fix", " after the last update", " - very disappointed", " (seriously?)"]
CATEGORY_DATA = {
    "battery_charging": ("battery", "battery drains quickly", "cell capacity degradation or power-management firmware", "measure capacity, charging current, thermal telemetry, and power logs", "replace the affected cell or correct charging control and add thermal regression tests"),
    "bluetooth_connectivity": ("Bluetooth radio", "keeps disconnecting", "pairing cache, firmware compatibility, or radio interference", "capture connection logs across devices and reproduce during calls and music", "fix reconnection and pairing state handling, then test supported devices"),
    "wifi_connectivity": ("Wi-Fi radio", "drops the network", "driver regression, router compatibility, or weak signal", "test channels, distances, routers, and firmware versions", "fix driver behavior and add router compatibility tests"),
    "gps_location": ("GPS", "shows the wrong location", "multipath, permissions, or stale location cache", "compare open-sky and urban tests with permissions and firmware logs", "improve reacquisition and location filtering"),
    "camera": ("camera sensor", "takes blurry photos", "autofocus motor, lens obstruction, or image processing", "test focus targets across lighting and camera modes", "repair focus handling and add image-quality regression tests"),
    "microphone": ("microphone", "cannot be heard on calls", "permission, microphone path, or noise-processing fault", "compare recordings and calls across apps and environments", "fix capture path and add call audio tests"),
    "speaker_audio": ("speaker", "audio sounds distorted", "speaker damage, codec regression, or excessive gain", "test tones across volume levels and source applications", "isolate audio path and correct gain or codec behavior"),
    "display": ("display panel", "screen flickers", "display driver, panel connection, or refresh configuration", "reproduce across brightness, refresh rates, and firmware versions", "correct driver or panel handling and add display regression tests"),
    "touchscreen": ("touch controller", "touches are not registered", "touch controller, screen protector, or firmware regression", "test touch grid with and without accessories", "fix controller calibration and add touch coverage"),
    "software_crash": ("application software", "the app crashes", "software regression, corrupt local state, or OS incompatibility", "capture logs on supported OS versions and clean profiles", "fix the regression and add startup and migration tests"),
    "firmware": ("firmware", "failed after the update", "firmware regression or interrupted installation", "compare versions, update paths, and recovery logs", "add rollback protection and regression coverage"),
    "performance": ("processor and memory", "is painfully slow", "resource exhaustion, background processes, or thermal throttling", "profile startup, memory, temperature, and background tasks", "remove the bottleneck and add performance budgets"),
    "payments": ("payment gateway", "charged me twice", "retry race, timeout, or duplicate submission", "trace idempotency keys and gateway retry timing", "enforce idempotent payment requests and reconcile duplicates"),
    "shipping": ("shipping workflow", "tracking has not updated", "carrier event delay or warehouse handoff", "compare carrier scans and fulfillment timestamps", "improve event reconciliation and customer status updates"),
    "delivery": ("delivery process", "the item never arrived", "carrier exception, address error, or fulfillment loss", "audit order, address, scan, and proof-of-delivery records", "escalate carrier investigation and improve delivery confirmation"),
    "account": ("account service", "cannot update my profile", "validation, authorization, or account-service failure", "reproduce with valid and invalid profile fields", "fix validation and add account update tests"),
    "authentication": ("authentication service", "cannot log in", "credentials, expired session, or verification failure", "check auth logs, token expiry, and verification delivery", "improve error handling and recovery without exposing secrets"),
    "build_quality": ("mechanical assembly", "a part became loose", "assembly tolerance, fastener failure, or impact damage", "inspect samples and compare production batches", "correct assembly tolerance and add end-of-line inspection"),
    "compatibility": ("compatibility layer", "does not work with my device", "missing driver, OS API difference, or hardware capability gap", "test the supported device matrix and version combinations", "add compatibility detection and supported-version tests"),
    "safety": ("power and thermal system", "smells like burning", "short circuit, thermal runaway, or power fault", "quarantine unit and inspect electrical and thermal evidence", "escalate safety incident, stop use, and investigate affected batch"),
}

def pick_category(rng: random.Random): return rng.choice(list(CATEGORY_DATA))
def make_review(rng, i):
    category = pick_category(rng); component, symptom, cause, investigation, solution = CATEGORY_DATA[category]
    product = rng.choice(PRODUCTS); rating = rng.choice([1, 1, 2, 2, 3, 4, 5])
    emotion = rng.choice(EMOTIONS); safety = category == "safety" or (category == "battery_charging" and rng.random() < .15)
    review = f"{rng.choice(STYLE_PREFIXES)}{product.replace('_', ' ')} {symptom}{rng.choice(STYLE_SUFFIXES)}"
    return {"id": f"sentinel-{i:07d}", "scenario_id": f"{category}-{product}-{i % 37}", "template_family": category, "review": review, "rating": rating, "sentiment": "negative" if rating <= 2 else "neutral" if rating == 3 else "positive", "emotion": emotion, "severity": "critical" if safety else "high" if rating <= 2 else "medium" if rating == 3 else "low", "safety_concern": safety, "product_domain": product, "product_type": product, "component": component, "category": category, "symptoms": [rng.choice(ONTOLOGY.get(category, [category]))], "probable_causes": [cause], "customer_problem": review, "confidence": round(rng.uniform(.68, .94), 2), "engineering_hint": solution, "investigation_hint": investigation}

def make_resolution(rng, i):
    item = make_review(rng, i); symptom = item["symptoms"][0]; question = f"When does the {symptom.replace('_', ' ')} happen, and can you reproduce it on another supported device or setup?"
    candidates = [{"question": question, "information_gain": .92}, {"question": "What color is the product?", "information_gain": .01}, {"question": "Was the packaging attractive?", "information_gain": .02}]
    return {"case_id": f"case-{i:07d}", "scenario_id": item["scenario_id"], "initial_complaint": item["review"], "known_facts": [], "candidate_questions": candidates, "best_question": question, "reason": "It separates environment, compatibility, and hardware hypotheses."}

def make_architect(rng, i):
    item = make_review(rng, i); return {"case_id": f"case-{i:07d}", "scenario_id": item["scenario_id"], "product": item["product_type"], "customer_evidence": {"review": item["review"], "symptoms": item["symptoms"]}, "sentinel_analysis": {k: item[k] for k in ["category", "severity", "safety_concern", "probable_causes"]}, "conversation_summary": {"known_facts": [item["review"]], "remaining_unknowns": ["reproduction environment"]}, "final_diagnosis": "probable cause; confirmation requires engineering investigation", "engineering_issue": {"title": f"Investigate {item['category']} in {item['product_type']}", "severity": item["severity"], "component": item["component"], "root_cause": item["probable_causes"][0], "customer_impact": item["customer_problem"], "evidence": [item["review"]], "reproduction_steps": ["Use the customer-reported setup", "Repeat the symptom", "Capture logs and measurements"], "investigation_steps": item["investigation_hint"].split(" and "), "proposed_solution": [item["engineering_hint"]], "acceptance_criteria": ["Issue is reproducible", "Fix passes regression tests", "No safety regression"]}}

def write_jsonl(path, rows):
    path.parent.mkdir(parents=True, exist_ok=True); path.write_text("\n".join(json.dumps(row, ensure_ascii=True) for row in rows) + "\n")

def main():
    parser = argparse.ArgumentParser(); parser.add_argument("--agent", choices=["sentinel", "resolution", "architect"]); parser.add_argument("--all", action="store_true"); parser.add_argument("--samples", type=int, default=10); parser.add_argument("--seed", type=int, default=42); args = parser.parse_args(); rng = random.Random(args.seed)
    jobs = (["sentinel", "resolution", "architect"] if args.all else [args.agent])
    for agent in jobs:
        n = args.samples if not args.all else ({"sentinel": args.samples, "resolution": max(1, args.samples // 2), "architect": max(1, args.samples // 5)}[agent])
        rows = [{"sentinel": make_review, "resolution": make_resolution, "architect": make_architect}[agent](rng, i) for i in range(n)]
        if agent == "sentinel":
            write_jsonl(ROOT / "data/sentinel/train.jsonl", rows[: int(n*.8)]); write_jsonl(ROOT / "data/sentinel/validation.jsonl", rows[int(n*.8):int(n*.9)]); write_jsonl(ROOT / "data/sentinel/test.jsonl", rows[int(n*.9):])
        elif agent == "resolution":
            write_jsonl(ROOT / "data/resolution/diagnostic_questions.jsonl", rows); write_jsonl(ROOT / "data/resolution/case_trajectories.jsonl", rows); write_jsonl(ROOT / "data/resolution/resolution_outcomes.jsonl", rows)
        else: write_jsonl(ROOT / "data/architect/engineering_cases.jsonl", rows)
if __name__ == "__main__": main()
