"""
Chart generation engine using matplotlib (headless Agg backend).
Renders high-resolution PNG charts in memory for PDF embedding.
"""
import io
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from typing import Dict, Any, List


def create_monthly_activity_chart(series: List[Dict[str, Any]]) -> bytes:
    """Multi-bar chart: Visits, Immunizations, and Critical Flags."""
    months = [s["month"] for s in series]
    visits = [s["visits"] for s in series]
    imms = [s["immunizations"] for s in series]
    flags = [s["criticalFlags"] for s in series]

    x = np.arange(len(months))
    width = 0.25

    fig, ax = plt.subplots(figsize=(7.5, 3.2), dpi=200)
    fig.patch.set_facecolor("#FFFFFF")
    ax.set_facecolor("#F8FAFC")

    # Professional ASHA palette
    color_visits = "#16a34a"  # Green accent
    color_imms = "#0284c7"    # Sky
    color_flags = "#e11d48"   # Rose

    rects1 = ax.bar(x - width, visits, width, label="Visits", color=color_visits, edgecolor="none", zorder=3)
    rects2 = ax.bar(x, imms, width, label="Immunizations", color=color_imms, edgecolor="none", zorder=3)
    rects3 = ax.bar(x + width, flags, width, label="Critical Flags", color=color_flags, edgecolor="none", zorder=3)

    # Show numbers on top or 0 indicator for empty bars
    max_val = max(1, max(visits + imms + flags) if (visits + imms + flags) else 1)
    ax.set_ylim(0, max_val * 1.25 + 1)

    for i in range(len(months)):
        v, im, fl = visits[i], imms[i], flags[i]
        if v > 0:
            ax.text(x[i] - width, v + 0.15, str(v), ha="center", va="bottom", fontsize=7, fontweight="bold", color="#15803d")
        if im > 0:
            ax.text(x[i], im + 0.15, str(im), ha="center", va="bottom", fontsize=7, fontweight="bold", color="#0369a1")
        if fl > 0:
            ax.text(x[i] + width, fl + 0.15, str(fl), ha="center", va="bottom", fontsize=7, fontweight="bold", color="#be123c")
        if v == 0 and im == 0 and fl == 0:
            ax.text(x[i], 0.2, "0", ha="center", va="bottom", fontsize=7.5, color="#94a3b8", fontweight="bold")

    ax.set_ylabel("Records Count", fontsize=9, fontweight="bold", color="#334155")
    ax.set_title("Monthly Clinical Care Activity", fontsize=11, fontweight="bold", color="#0F172A", pad=10)
    ax.set_xticks(x)
    ax.set_xticklabels(months, fontsize=8, color="#475569")
    ax.tick_params(axis="y", labelsize=8, colors="#475569")
    ax.legend(loc="upper left", frameon=True, facecolor="#FFFFFF", edgecolor="#CBD5E1", fontsize=8)
    ax.grid(axis="y", color="#E2E8F0", linestyle="--", linewidth=0.7, zorder=0)

    # Clean borders
    for spine in ["top", "right", "left", "bottom"]:
        ax.spines[spine].set_color("#CBD5E1")

    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight")
    plt.close(fig)
    return buf.getvalue()


def create_village_pie_chart(villages: List[Dict[str, Any]]) -> bytes:
    """Pie chart showing patient distribution across villages."""
    labels = [v["name"] for v in villages if v["patients"] > 0]
    sizes = [v["patients"] for v in villages if v["patients"] > 0]

    if not sizes or sum(sizes) == 0:
        labels = ["No Data"]
        sizes = [1]

    colors = ["#0284C7", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#64748B"]

    fig, ax = plt.subplots(figsize=(4.5, 3.2), dpi=200)
    fig.patch.set_facecolor("#FFFFFF")

    wedges, texts, autotexts = ax.pie(
        sizes,
        labels=labels,
        autopct="%1.0f%%",
        startangle=140,
        colors=colors[:len(sizes)],
        textprops={"fontsize": 8, "color": "#1E293B"},
        wedgeprops={"edgecolor": "white", "linewidth": 2}
    )
    for at in autotexts:
        at.set_fontsize(7.5)
        at.set_fontweight("bold")
        at.set_color("white")

    ax.set_title("Patient Distribution by Village", fontsize=10, fontweight="bold", color="#0F172A", pad=8)
    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight")
    plt.close(fig)
    return buf.getvalue()


def create_trend_line_chart(series: List[Dict[str, Any]]) -> bytes:
    """Line chart showing 6-month clinical trend."""
    months = [s["month"] for s in series]
    visits = [s["visits"] for s in series]
    imms = [s["immunizations"] for s in series]

    fig, ax = plt.subplots(figsize=(7.5, 2.8), dpi=200)
    fig.patch.set_facecolor("#FFFFFF")
    ax.set_facecolor("#F8FAFC")

    ax.plot(months, visits, marker="o", color="#0284C7", linewidth=2.2, label="Visits Trend", zorder=4)
    ax.plot(months, imms, marker="s", color="#10B981", linewidth=2.2, linestyle="--", label="Immunizations Trend", zorder=4)

    ax.set_ylabel("Count", fontsize=8.5, fontweight="bold", color="#334155")
    ax.set_title("6-Month Longitudinal Coverage Trend", fontsize=10, fontweight="bold", color="#0F172A", pad=8)
    ax.tick_params(axis="both", labelsize=8, colors="#475569")
    ax.legend(loc="upper left", frameon=True, facecolor="#FFFFFF", edgecolor="#CBD5E1", fontsize=8)
    ax.grid(color="#E2E8F0", linestyle=":", linewidth=0.8, zorder=1)

    for spine in ["top", "right", "left", "bottom"]:
        ax.spines[spine].set_color("#CBD5E1")

    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight")
    plt.close(fig)
    return buf.getvalue()


def create_scheme_progress_chart(schemes: List[Dict[str, Any]]) -> bytes:
    """Horizontal bar chart comparing enrolled vs eligible beneficiaries."""
    names = [s["name"] for s in schemes]
    enrolled = [s["enrolled"] for s in schemes]
    eligible = [s["eligible"] for s in schemes]

    y = np.arange(len(names))
    height = 0.35

    fig, ax = plt.subplots(figsize=(7.5, 3.0), dpi=200)
    fig.patch.set_facecolor("#FFFFFF")
    ax.set_facecolor("#F8FAFC")

    ax.barh(y - height/2, enrolled, height, label="Enrolled", color="#10B981", zorder=3)
    ax.barh(y + height/2, eligible, height, label="Eligible (Pending)", color="#F59E0B", zorder=3)

    ax.set_yticks(y)
    ax.set_yticklabels(names, fontsize=8, fontweight="bold", color="#1E293B")
    ax.set_xlabel("Number of Beneficiaries", fontsize=8.5, fontweight="bold", color="#334155")
    ax.set_title("Government Scheme Penetration & Pending Coverage", fontsize=10, fontweight="bold", color="#0F172A", pad=8)
    ax.legend(loc="lower right", frameon=True, facecolor="#FFFFFF", edgecolor="#CBD5E1", fontsize=8)
    ax.grid(axis="x", color="#E2E8F0", linestyle="--", linewidth=0.7, zorder=0)

    for spine in ["top", "right", "left", "bottom"]:
        ax.spines[spine].set_color("#CBD5E1")

    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight")
    plt.close(fig)
    return buf.getvalue()
