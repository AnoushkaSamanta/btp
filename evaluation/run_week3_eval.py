import json
import os
import sys

# Add the project root to the python path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.rag.retriever import retrieve
from backend.agents.structuring_agent import extract_record
from backend.rules.red_flags import evaluate_red_flags

def run_evaluation():
    # __file__ is d:\BTP\btp\evaluation\run_week3_eval.py
    eval_dir = os.path.dirname(os.path.abspath(__file__))
    data_file = os.path.join(eval_dir, "data", "gold_standard.json")
    results_dir = os.path.join(eval_dir, "results")
    os.makedirs(results_dir, exist_ok=True)
    
    with open(data_file, "r") as f:
        cases = json.load(f)
        
    results = []
    
    total_rag_precision = 0
    total_rag_recall = 0
    
    print("Starting Week 3 Evaluation...")
    
    for case in cases:
        print(f"Evaluating case: {case['id']}...")
        
        # 1. RAG Evaluation
        retrieved_chunks = retrieve(case["description"], k=5)
        retrieved_sources = list(set([chunk["source"] for chunk, score in retrieved_chunks]))
        
        expected_guidelines = case["expected_guidelines"]
        
        # Calculate RAG Precision & Recall
        hits = sum(1 for exp in expected_guidelines if any(exp in src for src in retrieved_sources))
        
        recall = hits / len(expected_guidelines) if expected_guidelines else 1.0
        precision = hits / len(retrieved_sources) if retrieved_sources else 0.0
        
        total_rag_recall += recall
        total_rag_precision += precision
        
        # 2. Red Flag Evaluation
        record = extract_record(case["description"])
        flags = evaluate_red_flags(record)
        triggered_flag_titles = [f["title"] for f in flags]
        
        results.append({
            "id": case["id"],
            "description": case["description"],
            "expected_guidelines": expected_guidelines,
            "retrieved_sources": retrieved_sources,
            "rag_recall": recall,
            "rag_precision": precision,
            "expected_red_flags": case["expected_red_flags"],
            "triggered_red_flags": triggered_flag_titles,
            "extracted_record_summary": {
                "symptoms": record.get("symptoms", []),
                "pregnancy_status": record.get("pregnancy_status"),
                "blood_pressure": record.get("blood_pressure")
            }
        })
        
    # Aggregate Metrics
    num_cases = len(cases)
    avg_recall = total_rag_recall / num_cases
    avg_precision = total_rag_precision / num_cases
    
    # Save raw JSON results
    output_json = os.path.join(results_dir, "week3_eval_results.json")
    with open(output_json, "w") as f:
        json.dump({
            "metrics": {
                "avg_rag_precision": avg_precision,
                "avg_rag_recall": avg_recall
            },
            "detailed_results": results
        }, f, indent=2)
        
    # Generate Markdown Report
    report_lines = [
        "# Week 3 RAG & Red-Flag Evaluation Report",
        "",
        "## Overall Metrics",
        f"- **Average RAG Precision:** {avg_precision:.2%}",
        f"- **Average RAG Recall:** {avg_recall:.2%}",
        "",
        "## Detailed Case Analysis",
        ""
    ]
    
    for r in results:
        report_lines.append(f"### Case: {r['id']}")
        report_lines.append(f"**Description:** {r['description']}")
        report_lines.append("")
        
        report_lines.append("**RAG Retrieval:**")
        report_lines.append(f"- Expected: {', '.join(r['expected_guidelines'])}")
        report_lines.append(f"- Retrieved: {', '.join(r['retrieved_sources']) if r['retrieved_sources'] else 'None'}")
        report_lines.append(f"- *Recall: {r['rag_recall']:.0%} | Precision: {r['rag_precision']:.0%}*")
        report_lines.append("")
        
        report_lines.append("**Red-Flag Detection:**")
        report_lines.append(f"- Expected (Human logic): {', '.join(r['expected_red_flags'])}")
        report_lines.append(f"- Triggered (System logic): {', '.join(r['triggered_red_flags']) if r['triggered_red_flags'] else 'None'}")
        report_lines.append(f"- Extracted context: Pregnant: {r['extracted_record_summary']['pregnancy_status']}, BP: {r['extracted_record_summary']['blood_pressure']}, Symptoms: {', '.join(r['extracted_record_summary']['symptoms'])}")
        report_lines.append("")
        report_lines.append("---")
        report_lines.append("")
        
    output_md = os.path.join(results_dir, "week3_evaluation.md")
    with open(output_md, "w") as f:
        f.write("\n".join(report_lines))
        
    print(f"\nEvaluation complete!")
    print(f"Results saved to {output_json} and {output_md}")

if __name__ == "__main__":
    run_evaluation()
