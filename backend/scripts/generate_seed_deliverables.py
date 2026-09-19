import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.config import DELIVERABLES_DIR
from app.tools.docx_generator import create_approval_note
import shutil

def generate_seed_deliverables():
    print(f"[SEED] Generating seed deliverables into {DELIVERABLES_DIR}...")
    DELIVERABLES_DIR.mkdir(parents=True, exist_ok=True)

    # 1. INSPECTION_APPROVAL_NOTE_TURBINE_UNIT_7.docx
    note1 = create_approval_note(
        memo_no="MEMO/TURB/UNIT-07/2026/01",
        subject="Urgent Overhaul Directive & Statutory Sanction — Turbine Unit 7",
        reference_doc="INSPECTION_REPORT_TURBINE_UNIT_7.txt",
        inspection_summary={
            "Source": "Vibration Metrology & Acoustic Sensor Array",
            "Analysis": "Autonomous SOP Compliance Verification (SOP-TURB-IND-2026-V4)",
            "evaluation": "Drive-End Bearing vibration levels (4.85 mm/s RMS) and inner race temperature (94.2 °C) have severely breached Category IV operational limits under SOP-TURB-IND-2026-V4. Continued operation presents imminent catastrophic failure risk."
        },
        findings_table=[
            {"parameter": "Drive-End Bearing Vibration (RMS)", "measured": "4.85 mm/s", "limit": "<= 3.50 mm/s", "status": "NON_COMPLIANT"},
            {"parameter": "Drive-End Bearing Temperature", "measured": "94.2 °C", "limit": "<= 90.0 °C", "status": "NON_COMPLIANT"},
            {"parameter": "Lube Oil Delivery Pressure", "measured": "1.85 Bar", "limit": ">= 1.20 Bar", "status": "COMPLIANT"},
            {"parameter": "Shaft Axial Displacement", "measured": "0.18 mm", "limit": "<= 0.25 mm", "status": "COMPLIANT"}
        ],
        recommendation="Immediate shutdown of Unit 7 Turbine within 4 hours. Mobilize specialized maintenance wing for drive-end bearing replacement and dynamic rotor balance re-certification.",
        signatory_title="Chief Inspection Officer (QA & Safety)",
        signatory_dept="Directorate of Industrial Safety & Engineering",
        source_sha256="4d89a7f1b8209210c85e34891b2c45e89d1234a56b78c9012d34e56f789012ab"
    )

    # Copy to the exact requested filenames
    src_path = DELIVERABLES_DIR / note1
    target1 = DELIVERABLES_DIR / "INSPECTION_APPROVAL_NOTE_TURBINE_UNIT_7.docx"
    target2 = DELIVERABLES_DIR / "Inspection_Approval_Note_Turbine_Unit_7.docx"
    shutil.copy2(src_path, target1)
    shutil.copy2(src_path, target2)
    print(f"[SEED] Created {target1.name} and {target2.name}")

    # 2. TURBINE_UNIT_7_METROLOGY_COMPLIANCE_REPORT.docx
    note2 = create_approval_note(
        memo_no="COMPLIANCE/METROLOGY/UNIT-07/2026",
        subject="Metrology & Vibration Compliance Verification Report — Turbine Unit 7",
        reference_doc="SOP-TURB-IND-2026-V4 & Metrology Log #449",
        inspection_summary={
            "Source": "Unit 7 SCADA Telemetry & Accelerometer Array",
            "Analysis": "Parametric Boundary Audit",
            "evaluation": "Comprehensive sensor telemetry audit demonstrates localized hydrodynamic degradation at the drive-end bearing journal, with 38.5% excess velocity amplitude."
        },
        findings_table=[
            {"parameter": "Journal Bearing Peak Velocity", "measured": "5.12 mm/s", "limit": "<= 3.50 mm/s", "status": "NON_COMPLIANT"},
            {"parameter": "Bearing Housing Peak-to-Peak", "measured": "62 µm", "limit": "<= 45 µm", "status": "NON_COMPLIANT"},
            {"parameter": "Cooling Oil Delta Temp", "measured": "14.2 °C", "limit": "<= 18.0 °C", "status": "COMPLIANT"}
        ],
        recommendation="Replace journal sleeve bearings and inspect shaft collar for micro-pitting before return to service.",
        signatory_title="Senior Metrology Auditor",
        signatory_dept="Metrology & Standards Wing",
        source_sha256="8b209210c85e34891b2c45e89d1234a56b78c9012d34e56f789012ab4d89a7f1"
    )
    target_comp = DELIVERABLES_DIR / "TURBINE_UNIT_7_METROLOGY_COMPLIANCE_REPORT.docx"
    shutil.copy2(DELIVERABLES_DIR / note2, target_comp)
    print(f"[SEED] Created {target_comp.name}")

    # 3. BEARING_CAVITATION_DEFECT_ANALYSIS.docx
    note3 = create_approval_note(
        memo_no="DEFECT/BEARING-CAV/2026/09",
        subject="Bearing Cavitation & Wear Defect Analysis Sheet",
        reference_doc="NDE Ultrasonic & Endoscopic Inspection #210",
        inspection_summary={
            "Source": "Boroscopic & Ultrasonic Flaw Detector",
            "Analysis": "Surface Cavitation & Metallurgy Assessment",
            "evaluation": "Sub-surface cavitation pits detected along the lower bearing quadrant with depth exceeding 0.45 mm. High shear stress induced by fluid turbulence."
        },
        findings_table=[
            {"parameter": "Cavitation Pit Max Depth", "measured": "0.48 mm", "limit": "<= 0.15 mm", "status": "NON_COMPLIANT"},
            {"parameter": "Babbitt Alloy Hardness (HB)", "measured": "22 HB", "limit": ">= 25 HB", "status": "NON_COMPLIANT"},
            {"parameter": "Shaft Runout", "measured": "0.02 mm", "limit": "<= 0.03 mm", "status": "COMPLIANT"}
        ],
        recommendation="Order replacement babbitt bearing liner conforming to IS-25:1979 grade 90. Sanction emergency procurement.",
        signatory_title="Principal Metallurgical Specialist",
        signatory_dept="Directorate of Naval & Heavy Industrial Machinery",
        source_sha256="1b2c45e89d1234a56b78c9012d34e56f789012ab4d89a7f1b8209210c85e3489"
    )
    target_cav = DELIVERABLES_DIR / "BEARING_CAVITATION_DEFECT_ANALYSIS.docx"
    shutil.copy2(DELIVERABLES_DIR / note3, target_cav)
    print(f"[SEED] Created {target_cav.name}")

if __name__ == "__main__":
    generate_seed_deliverables()
