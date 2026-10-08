import os
import sys
import time

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from evaluation.metrics import evaluate_asr
from evaluation.ablation import compare_results

def run_all_evaluations():
    print("================================================================")
    print(" ASHA CO-PILOT BTP EVALUATION SUITE")
    print("================================================================")
    start_time = time.time()

    # 1. Run ASR Evaluation Metrics (WER & CMI)
    print("\n[Step 1/2] Running ASR Evaluation (WER & CMI)...")
    asr_results = evaluate_asr()

    # 2. Run Multi-Agent vs. Single-Agent Ablation Study
    print("\n[Step 2/2] Running Multi-Agent vs. Single-Agent Ablation Study...")
    ablation_results = compare_results()

    elapsed = round(time.time() - start_time, 2)
    print("\n================================================================")
    print(" EVALUATION SUMMARY REPORT")
    print("================================================================")
    print(f"Time Taken: {elapsed} seconds")
    print(f"ASR Average WER: {asr_results.get('average_wer', 'N/A')}")
    print(f"ASR Average Code-Mixing Index (CMI): {asr_results.get('average_cmi', 'N/A')}%")
    print("----------------------------------------------------------------")
    print("Ablation Comparison Results:")
    multi = ablation_results.get("multi_agent", {})
    single = ablation_results.get("single_agent", {})
    print(f" - Extraction F1 Score  : Multi-Agent = {multi.get('avg_extraction_f1')} | Single-Agent = {single.get('avg_extraction_f1')}")
    print(f" - Scheme Match Accuracy: Multi-Agent = {multi.get('avg_scheme_accuracy')} | Single-Agent = {single.get('avg_scheme_accuracy')}")
    print(f" - RAG Citations / Case : Multi-Agent = {multi.get('avg_citation_count')} | Single-Agent = {single.get('avg_citation_count')}")
    print(f" - Latency (Seconds)    : Multi-Agent = {multi.get('avg_latency_s')}s | Single-Agent = {single.get('avg_latency_s')}s")
    print("================================================================")
    print("Artifacts generated:")
    print(" - evaluation/results/asr_eval.json")
    print(" - evaluation/results/ablation.json")
    print(" - evaluation/results/plots/ablation_plot.png")
    print("================================================================")

if __name__ == "__main__":
    run_all_evaluations()
