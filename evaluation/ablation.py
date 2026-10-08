import json
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, List

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.agents.supervisor import run_pipeline, run_single_agent



def calculate_f1(pred_dict: Dict[str, Any], target_dict: Dict[str, Any]) -> float:
    """Calculate field-level precision, recall, and F1 score."""
    if not target_dict:
        return 1.0

    relevant_keys = ["patient_name", "age", "pregnancy_status", "blood_pressure", "bp_status", "swelling", "hemoglobin", "bpl_card"]
    correct = 0
    total_target = 0
    total_pred = 0

    for key in relevant_keys:
        t_val = target_dict.get(key)
        p_val = pred_dict.get(key)
        if t_val not in (None, "", []):
            total_target += 1
            if p_val not in (None, "", []):
                total_pred += 1
                if str(t_val).strip().lower() == str(p_val).strip().lower():
                    correct += 1
        elif p_val not in (None, "", []):
            total_pred += 1

    precision = correct / max(1, total_pred)
    recall = correct / max(1, total_target)
    if precision + recall == 0:
        return 0.0
    return round(2 * (precision * recall) / (precision + recall), 4)


field_f1 = calculate_f1



def run_multi_agent_pipeline(transcript: str, language: str = "en") -> Dict[str, Any]:
    t0 = time.perf_counter()
    res = run_pipeline(transcript, language=language)
    latency = time.perf_counter() - t0
    res["latency_s"] = round(latency, 4)
    return res


def run_single_agent_pipeline(transcript: str, language: str = "en") -> Dict[str, Any]:
    t0 = time.perf_counter()
    res = run_single_agent(transcript, language=language)
    latency = time.perf_counter() - t0
    res["latency_s"] = round(latency, 4)
    return res


def compare_results(data_file: str = "evaluation/data/metadata.json", output_file: str = "evaluation/results/ablation.json") -> Dict[str, Any]:
    """Run ablation study comparing Multi-Agent vs Single-Agent architectures."""
    p_data = Path(data_file)
    if not p_data.exists():
        print(f"Metadata dataset file {data_file} not found.")
        return {}

    with open(p_data, "r", encoding="utf-8") as f:
        cases = json.load(f)

    multi_f1s, single_f1s = [], []
    multi_scheme_acc, single_scheme_acc = [], []
    multi_citations, single_citations = [], []
    multi_latencies, single_latencies = [], []

    detailed_comparison = []

    for case in cases:
        cid = case.get("id")
        transcript = case.get("transcript", "")
        truth = case.get("ground_truth", {})

        # 1. Multi-Agent Run
        res_multi = run_multi_agent_pipeline(transcript)
        rec_multi = res_multi.get("record", {})
        sch_multi = res_multi.get("schemes", {}).get("matches", [])
        cit_multi = len(res_multi.get("protocol", {}).get("citations", []))

        f1_multi = calculate_f1(rec_multi, truth)
        multi_f1s.append(f1_multi)
        multi_citations.append(cit_multi)
        multi_latencies.append(res_multi["latency_s"])

        # Check scheme match accuracy
        truth_schemes = truth.get("eligible_schemes", [])
        pred_multi_schemes = [m["name"] for m in sch_multi if m.get("status") in {"eligible", "enrolled"}]
        
        def compute_scheme_overlap(truth_list, pred_list):
            if not truth_list:
                return 1.0
            matched = 0
            for t in truth_list:
                t_lower = t.lower()
                for p in pred_list:
                    p_lower = p.lower()
                    if t_lower in p_lower or p_lower in t_lower or any(k in p_lower for k in t_lower.split()):
                        matched += 1
                        break
            return round(matched / len(truth_list), 4)

        sch_acc_multi = compute_scheme_overlap(truth_schemes, pred_multi_schemes)
        multi_scheme_acc.append(sch_acc_multi)

        # 2. Single-Agent Run
        res_single = run_single_agent_pipeline(transcript)
        rec_single = res_single.get("record", {})
        sch_single = res_single.get("schemes", {}).get("matches", [])
        cit_single = len(res_single.get("protocol", {}).get("citations", []))

        f1_single = calculate_f1(rec_single, truth)
        single_f1s.append(f1_single)
        single_citations.append(cit_single)
        single_latencies.append(res_single["latency_s"])

        pred_single_schemes = [m["name"] for m in sch_single if m.get("status") in {"eligible", "enrolled"}]
        sch_acc_single = compute_scheme_overlap(truth_schemes, pred_single_schemes)

        single_scheme_acc.append(sch_acc_single)

        detailed_comparison.append({
            "id": cid,
            "transcript": transcript,
            "multi_agent": {
                "f1_score": f1_multi,
                "scheme_accuracy": round(sch_acc_multi, 4),
                "citation_count": cit_multi,
                "latency_s": res_multi["latency_s"],
            },
            "single_agent": {
                "f1_score": f1_single,
                "scheme_accuracy": round(sch_acc_single, 4),
                "citation_count": cit_single,
                "latency_s": res_single["latency_s"],
            },
        })

    def avg(lst):
        return round(sum(lst) / max(1, len(lst)), 4)

    ablation_summary = {
        "multi_agent": {
            "avg_extraction_f1": avg(multi_f1s),
            "avg_scheme_accuracy": avg(multi_scheme_acc),
            "avg_citation_count": avg(multi_citations),
            "avg_latency_s": avg(multi_latencies),
        },
        "single_agent": {
            "avg_extraction_f1": avg(single_f1s),
            "avg_scheme_accuracy": avg(single_scheme_acc),
            "avg_citation_count": avg(single_citations),
            "avg_latency_s": avg(single_latencies),
        },
        "delta_improvement": {
            "f1_gain": round(avg(multi_f1s) - avg(single_f1s), 4),
            "scheme_accuracy_gain": round(avg(multi_scheme_acc) - avg(single_scheme_acc), 4),
            "citation_gain": round(avg(multi_citations) - avg(single_citations), 4),
        },
        "detailed_comparison": detailed_comparison,
    }

    out_p = Path(output_file)
    out_p.parent.mkdir(parents=True, exist_ok=True)
    with open(out_p, "w", encoding="utf-8") as f:
        json.dump(ablation_summary, f, indent=2)

    print(f"Ablation Study complete! Multi-Agent F1: {ablation_summary['multi_agent']['avg_extraction_f1']} vs Single-Agent F1: {ablation_summary['single_agent']['avg_extraction_f1']}. Saved to {output_file}")

    # Generate plot artifact if matplotlib is available
    generate_ablation_plot(ablation_summary)

    return ablation_summary


def generate_ablation_plot(summary: Dict[str, Any], plot_file: str = "evaluation/results/plots/ablation_plot.png"):
    """Generate a visual comparison chart for the ablation study."""
    plot_path = Path(plot_file)
    plot_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        import matplotlib.pyplot as plt

        metrics = ["Extraction F1", "Scheme Accuracy", "Citations/Case", "Latency (sec)"]
        m_vals = [
            summary["multi_agent"]["avg_extraction_f1"],
            summary["multi_agent"]["avg_scheme_accuracy"],
            summary["multi_agent"]["avg_citation_count"],
            summary["multi_agent"]["avg_latency_s"],
        ]
        s_vals = [
            summary["single_agent"]["avg_extraction_f1"],
            summary["single_agent"]["avg_scheme_accuracy"],
            summary["single_agent"]["avg_citation_count"],
            summary["single_agent"]["avg_latency_s"],
        ]

        x = range(len(metrics))
        width = 0.35

        fig, ax = plt.subplots(figsize=(9, 5))
        ax.bar([i - width/2 for i in x], m_vals, width, label="Multi-Agent (Proposed)", color="#4f46e5")
        ax.bar([i + width/2 for i in x], s_vals, width, label="Single-Agent (Baseline)", color="#94a3b8")

        ax.set_ylabel("Scores / Metric Value")
        ax.set_title("Multi-Agent vs. Single-Agent Ablation Comparison")
        ax.set_xticks(list(x))
        ax.set_xticklabels(metrics)
        ax.legend()
        plt.tight_layout()
        plt.savefig(plot_path, dpi=300)
        plt.close()
        print(f"Generated ablation plot at {plot_file}")
    except Exception as exc:
        print(f"Matplotlib not installed or plot creation skipped: {exc}")


if __name__ == "__main__":
    compare_results()
