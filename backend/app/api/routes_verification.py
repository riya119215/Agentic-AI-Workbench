from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Union
from app.core.verification import verification_engine

router = APIRouter(prefix="/api/verification", tags=["Deterministic Verification"])

class RuleVerificationRequest(BaseModel):
    parameter_name: str
    measured_value: Union[int, float]
    threshold_value: Union[int, float]
    operator: str
    unit: Optional[str] = ""
    rule_severity: Optional[str] = None

class BatchVerificationRequest(BaseModel):
    findings: List[Dict[str, Any]]

@router.post("/verify")
async def verify_rule(req: RuleVerificationRequest):
    return verification_engine.verify_numeric_rule(
        parameter_name=req.parameter_name,
        measured_value=req.measured_value,
        threshold_value=req.threshold_value,
        operator=req.operator,
        unit=req.unit or "",
        rule_severity=req.rule_severity
    )

@router.post("/verify-batch")
async def verify_batch(req: BatchVerificationRequest):
    return verification_engine.verify_batch_findings(req.findings)
