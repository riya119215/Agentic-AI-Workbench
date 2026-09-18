from typing import Dict, Any, List, Optional, Union
from datetime import datetime, date

class VerificationEngine:
    """
    Deterministic Verification Layer.
    Evaluates claims, measurements, and telemetry strictly against explicit rules and SOP bounds.
    Requires ZERO LLM inference.
    """

    def verify_numeric_rule(
        self,
        parameter_name: str,
        measured_value: Union[int, float],
        threshold_value: Union[int, float],
        operator: str, # '<=', '<', '>=', '>', '==', '!='
        unit: str = "",
        rule_severity: Optional[str] = None
    ) -> Dict[str, Any]:
        try:
            m_val = float(measured_value)
            t_val = float(threshold_value)
        except (ValueError, TypeError):
            return {
                "parameter": parameter_name,
                "status": "UNVERIFIED",
                "reason": f"Non-numeric values provided: measured={measured_value}, threshold={threshold_value}"
            }

        is_compliant = False
        if operator == "<=":
            is_compliant = m_val <= t_val
        elif operator == "<":
            is_compliant = m_val < t_val
        elif operator == ">=":
            is_compliant = m_val >= t_val
        elif operator == ">":
            is_compliant = m_val > t_val
        elif operator == "==":
            is_compliant = m_val == t_val
        elif operator == "!=":
            is_compliant = m_val != t_val
        else:
            return {
                "parameter": parameter_name,
                "status": "UNVERIFIED",
                "reason": f"Unknown operator: {operator}"
            }

        status = "COMPLIANT" if is_compliant else "NON_COMPLIANT"
        result = {
            "parameter": parameter_name,
            "measured_value": m_val,
            "threshold_limit": t_val,
            "operator": operator,
            "unit": unit,
            "status": status,
            "is_compliant": is_compliant,
            "timestamp": datetime.now().isoformat()
        }

        if rule_severity and not is_compliant:
            result["severity"] = rule_severity

        return result

    def verify_range_rule(
        self,
        parameter_name: str,
        measured_value: Union[int, float],
        min_value: Union[int, float],
        max_value: Union[int, float],
        unit: str = ""
    ) -> Dict[str, Any]:
        try:
            m_val = float(measured_value)
            min_v = float(min_value)
            max_v = float(max_value)
        except (ValueError, TypeError):
            return {
                "parameter": parameter_name,
                "status": "UNVERIFIED",
                "reason": "Non-numeric values provided for range check."
            }

        is_compliant = min_v <= m_val <= max_v
        return {
            "parameter": parameter_name,
            "measured_value": m_val,
            "expected_range": f"[{min_v}, {max_v}]",
            "unit": unit,
            "status": "COMPLIANT" if is_compliant else "NON_COMPLIANT",
            "is_compliant": is_compliant,
            "timestamp": datetime.now().isoformat()
        }

    def verify_batch_findings(self, findings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        results = []
        for f in findings:
            p_name = f.get("parameter_name") or f.get("parameter") or "Unknown"
            measured = f.get("measured_value") if f.get("measured_value") is not None else f.get("measured")
            limit = f.get("threshold_value") if f.get("threshold_value") is not None else (f.get("limit") or f.get("threshold"))
            op = f.get("operator", "<=")
            unit = f.get("unit", "")
            sev = f.get("rule_severity") or f.get("severity")

            if measured is not None and limit is not None:
                res = self.verify_numeric_rule(p_name, measured, limit, op, unit, sev)
                res["parameter_name"] = p_name
                results.append(res)
            else:
                results.append({
                    "parameter": p_name,
                    "parameter_name": p_name,
                    "status": "UNVERIFIED",
                    "reason": "Missing measured value or threshold limit."
                })
        return results


verification_engine = VerificationEngine()
