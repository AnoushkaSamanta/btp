from typing import Any, Dict, Optional

from backend.rules.schemes import match_schemes


def match_household(record: Dict[str, Any], patient: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    matches = match_schemes(record, patient)
    eligible = [m for m in matches if m["status"] in {"eligible", "enrolled"}]
    return {
        "matches": matches,
        "eligible_count": len([m for m in matches if m["status"] == "eligible"]),
        "summary": "; ".join(
            f"{m['name']}: {m['status']}" for m in matches if m["status"] != "not-eligible"
        )
        or "No scheme matches on current profile.",
        "disclaimer": "All eligibility outputs are preliminary — verify with the official scheme office.",
    }
