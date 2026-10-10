import json
import matplotlib.pyplot as plt
import os

def generate_plots():
    results_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(results_dir, "week3_eval_results.json")
    
    with open(json_path, "r") as f:
        data = json.load(f)
        
    avg_precision = data["metrics"]["avg_rag_precision"] * 100
    avg_recall = data["metrics"]["avg_rag_recall"] * 100
    
    # RAG Metrics Plot
    fig, ax = plt.subplots(figsize=(6, 4))
    metrics = ['Precision', 'Recall']
    values = [avg_precision, avg_recall]
    
    bars = ax.bar(metrics, values, color=['#3498db', '#2ecc71'])
    ax.set_ylim(0, 100)
    ax.set_ylabel('Percentage (%)')
    ax.set_title('RAG System Evaluation Metrics')
    
    for bar in bars:
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2, yval + 2, f'{yval:.1f}%', ha='center', va='bottom', fontweight='bold')
        
    plots_dir = os.path.join(results_dir, "plots")
    os.makedirs(plots_dir, exist_ok=True)
    
    plot_path = os.path.join(plots_dir, "rag_metrics.png")
    plt.tight_layout()
    plt.savefig(plot_path)
    print(f"Plot saved successfully at {plot_path}")

if __name__ == "__main__":
    generate_plots()
