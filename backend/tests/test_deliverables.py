import unittest
from pathlib import Path
from app.tools.docx_generator import create_approval_note
from app.tools.excel_generator import create_analytics_spreadsheet

class TestDeliverables(unittest.TestCase):
    def test_docx_note_sheet_generation(self):
        filename = create_approval_note(
            memo_no="DEF_TEST_QA_01",
            subject="Emergency Turbine Overhaul Sanction - Unit 7",
            reference_doc="INSPECTION_REPORT_TURBINE_UNIT_7.txt",
            inspection_summary={"evaluation": "Critical vibration detected in Unit 7 rotor assembly."},
            findings_table=[
                {"parameter": "Turbine Bearing Vibration", "measured": "4.85 mm/s", "limit": "<= 3.50 mm/s", "status": "CRITICAL_BREACH (+38.5%)"},
                {"parameter": "Babbitt Metal Temperature", "measured": "94.2 deg C", "limit": "<= 90.0 deg C", "status": "CRITICAL_TRIP (+4.2 deg C)"}
            ],
            recommendation="Immediate rotor de-energization and sanction of replacement spares under SOP-TURB-IND-2026-V4."
        )
        self.assertTrue(filename.endswith(".docx"))

    def test_excel_telemetry_generation(self):
        filename = create_analytics_spreadsheet(
            report_title="Railway Axle Sensor Telemetry Log",
            headers=["Timestamp", "Axle ID", "Speed (km/h)", "Bearing Temp (C)", "Anomaly Flag"],
            rows=[
                ["2026-09-12 10:45:00", "AX-101", 114.1, 79.3, 1],
                ["2026-09-12 11:00:00", "AX-101", 108.5, 104.2, 1]
            ],
            summary_metrics={"Max Temp": "104.2 C", "Anomalous Points": 2}
        )
        self.assertTrue(filename.endswith(".xlsx"))

if __name__ == "__main__":
    unittest.main()

