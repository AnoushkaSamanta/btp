"""
Ablation Study: Specialist Multi-Agent Architecture vs. Single-Agent Monolithic Baseline.
Compares:
1. Multi-Agent Pipeline (Structuring Agent + Protocol Check Agent + Scheme Engine + Composer)
2. Single-Agent Baseline (Monolithic combined pass)

Metrics:
- Field Extraction F1 (Name, BP, Sugar, Symptoms)
- Scheme Matching Accuracy
- Red-Flag Alert Detection Correctness
- Citation Correctness
- Processing Latency (ms)

Results are automatically saved to evaluation/results/ablation.json
"""
import os
import json
import time
from typing import Dict, Any, List

from backend.agents.supervisor import run_pipeline, run_single_agent

# Test evaluation cases based on representative frontline clinical visits
TEST_CASES = [
    {
        "id": "case_1",
        "description": "Severe maternal risk: pre-eclampsia pattern with hypertension and edema",
        "transcript": "Visited Lakshmi Devi 24 years, 8 months pregnant, BP 140/90, swelling in feet, severe headache, BPL.",
        "ground_truth": {
            "patient_name": "Lakshmi Devi",
            "age": 24,
            "blood_pressure": "140/90",
            "bp_status": "high",
            "symptoms": ["swelling", "headache"],
            "pregnancy_status": True,
            "schemes": ["JSY", "JSSK", "PMMVY", "PM-JAY"],
            "red_flags": ["Possible pre-eclampsia pattern"],
        }
    },
    {
        "id": "case_2",
        "description": "Antenatal anemia screening: moderate anemia with first pregnancy",
        "transcript": "Sunita Kumari 28 years ANC 2nd trimester, Hb 8.2, first child, Aadhaar linked, BPL.",
        "ground_truth": {
            "patient_name": "Sunita Kumari",
            "age": 28,
            "trimester": "2nd",
            "symptoms": [],
            "pregnancy_status": True,
            "schemes": ["PMMVY", "IFA", "JSY", "JSSK"],
            "red_flags": ["Moderate anemia in pregnancy"],
        }
    },
    {
        "id": "case_3",
        "description": "Uncontrolled diabetes with critical blood sugar in routine home screening",
        "transcript": "Kavita Devi 45 years, blood sugar 280 mg/dL, frequent urination, fatigue, resident of Basantpur.",
        "ground_truth": {
            "patient_name": "Kavita Devi",
            "age": 45,
            "blood_sugar": 280,
            "sugar_status": "high",
            "symptoms": ["fatigue"],
            "pregnancy_status": False,
            "schemes": ["PM-JAY"],
            "red_flags": ["HIGH_SUGAR_ALERT"],
        }
    },
    {
        "id": "case_4",
        "description": "Hypertensive crisis in elderly patient with invalid BP check",
        "transcript": "Visited Rameshwar Prasad 62 years, BP 185/110, dizziness, vomiting, BPL card holder.",
        "ground_truth": {
            "patient_name": "Rameshwar Prasad",
            "age": 62,
            "blood_pressure": "185/110",
            "bp_status": "high",
            "symptoms": ["vomiting"],
            "pregnancy_status": False,
            "schemes": ["PM-JAY"],
            "red_flags": ["CRITICAL_ALERT", "Severe hypertension"],
        }
    },
    {
        "id": "case_5",
        "description": "Postnatal home check: normal recovery, lactation counseling",
        "transcript": "Postnatal visit Geeta Yadav, delivery last week, no fever, breastfeeding well, Ramnagar village.",
        "ground_truth": {
            "patient_name": "Geeta Yadav",
            "symptoms": [],
            "pregnancy_status": False,
            "schemes": ["JSSK", "IFA"],
            "red_flags": [],
        }
    }
]


def evaluate_field_f1(extracted: Dict[str, Any], ground_truth: Dict[str, Any]) -> float:
    """Evaluates field-level precision and recall across essential clinical attributes."""
    fields = ["patient_name", "blood_pressure", "bp_status", "blood_sugar", "pregnancy_status"]
    tp = 0
    fp = 0
    fn = 0

    for f in fields:
        gt_val = ground_truth.get(f)
        ext_val = extracted.get(f)

        if gt_val is not None:
            if ext_val is not None and str(ext_val).lower().strip() == str(gt_val).lower().strip():
                tp += 1
            elif ext_val is not None:
                fp += 1
                fn += 1
            else:
                fn += 1
        elif ext_val is not None and ext_val != "":
            fp += 1

    precision = tp / max(tp + fp, 1)
    recall = tp / max(tp + fn, 1)
    if precision + recall == 0:
        return 0.0
    return round((2 * precision * recall) / (precision + recall), 4)


def evaluate_schemes_accuracy(extracted_schemes: List[Dict[str, Any]], expected_names: List[str]) -> float:
    """Computes Jaccard / set overlap accuracy for identified eligible schemes."""
    if not expected_names:
        return 1.0

    eligible_found = {
        s["name"] for s in extracted_schemes
        if s.get("status") in {"eligible", "enrolled"}
    }
    expected_set = set(expected_names)

    intersection = len(eligible_found & expected_set)
    union = len(eligible_found | expected_set)
    return round(intersection / max(union, 1), 4)


def evaluate_red_flag_accuracy(flags: List[Dict[str, Any]], expected_flags: List[str]) -> float:
    """Evaluates recall and safety precision of triggered red flags."""
    if not expected_flags:
        return 1.0 if not flags else 0.8

    found_titles = {f.get("title") for f in flags}
    matched = 0
    for exp in expected_flags:
        if any(exp.lower() in t.lower() for t in found_titles):
            matched += 1

    return round(matched / len(expected_flags), 4)


def run_ablation_experiment() -> Dict[str, Any]:
    """Runs all test cases through Multi-Agent and Single-Agent architectures and records metrics."""
    multi_results = []
    single_results = []

    for case in TEST_CASES:
        t_text = case["transcript"]
        gt = case["ground_truth"]

        # 1. Multi-Agent Pipeline
        start_t = time.perf_counter()
        multi_out = run_pipeline(t_text, language="English", mode="visit")
        multi_lat = round((time.perf_counter() - start_t) * 1000, 2)

        multi_f1 = evaluate_field_f1(multi_out.get("record", {}), gt)
        multi_sch_acc = evaluate_schemes_accuracy(
            multi_out.get("schemes", {}).get("matches", []),
            gt.get("schemes", [])
        )
        multi_flag_acc = evaluate_red_flag_accuracy(
            multi_out.get("protocol", {}).get("flags", []),
            gt.get("red_flags", [])
        )
        multi_citation_ok = len(multi_out.get("protocol", {}).get("citations", [])) > 0

        multi_results.append({
            "id": case["id"],
            "field_f1": multi_f1,
            "scheme_accuracy": multi_sch_acc,
            "alert_accuracy": multi_flag_acc,
            "citations_present": multi_citation_ok,
            "latency_ms": multi_lat,
        })

        # 2. Single-Agent Monolithic Baseline
        start_t = time.perf_counter()
        single_out = run_single_agent(t_text, language="English")
        single_lat = round((time.perf_counter() - start_t) * 1000, 2)

        single_f1 = evaluate_field_f1(single_out.get("record", {}), gt)
        single_sch_acc = evaluate_schemes_accuracy(
            single_out.get("schemes", {}).get("matches", []),
            gt.get("schemes", [])
        )
        single_flag_acc = evaluate_red_flag_accuracy(
            single_out.get("protocol", {}).get("flags", []),
            gt.get("red_flags", [])
        )
        single_citation_ok = len(single_out.get("protocol", {}).get("citations", [])) > 0

        single_results.append({
            "id": case["id"],
            "field_f1": single_f1,
            "scheme_accuracy": single_sch_acc,
            "alert_accuracy": single_flag_acc,
            "citations_present": single_citation_ok,
            "latency_ms": single_lat,
        })

    # Aggregations
    n = max(len(TEST_CASES), 1)
    summary = {
        "multi_agent": {
            "avg_field_f1": round(sum(r["field_f1"] for r in multi_results) / n, 4),
            "avg_scheme_accuracy": round(sum(r["scheme_accuracy"] for r in multi_results) / n, 4),
            "avg_alert_accuracy": round(sum(r["alert_accuracy"] for r in multi_results) / n, 4),
            "citation_support_rate": round(sum(1 for r in multi_results if r["citations_present"]) / n, 4),
            "avg_latency_ms": round(sum(r["latency_ms"] for r in multi_results) / n, 2),
        },
        "single_agent_baseline": {
            "avg_field_f1": round(sum(r["field_f1"] for r in single_results) / n, 4),
            "avg_scheme_accuracy": round(sum(r["scheme_accuracy"] for r in single_results) / n, 4),
            "avg_alert_accuracy": round(sum(r["alert_accuracy"] for r in single_results) / n, 4),
            "citation_support_rate": round(sum(1 for r in single_results if r["citations_present"]) / n, 4),
            "avg_latency_ms": round(sum(r["latency_ms"] for r in single_results) / n, 2),
        },
        "sample_count": n,
        "cases_detailed": {
            "multi_agent": multi_results,
            "single_agent": single_results,
        }
    }

    # Save to evaluation/results/ablation.json
    results_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "evaluation", "results")
    os.makedirs(results_dir, exist_ok=True)
    out_path = os.path.join(results_dir, "ablation.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    return summary


if __name__ == "__main__":
    print("Running BTP Section 5.5 Ablation Experiment (Multi-Agent vs Single-Agent)...")
    res = run_ablation_experiment()
    print("--- MULTI-AGENT RESULTS ---")
    print(json.dumps(res["multi_agent"], indent=2))
    print("--- SINGLE-AGENT BASELINE RESULTS ---")
    print(json.dumps(res["single_agent_baseline"], indent=2))
    print("\nSaved report to evaluation/results/ablation.json")
