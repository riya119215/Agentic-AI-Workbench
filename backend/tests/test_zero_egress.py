import unittest
from app.core.zero_egress import get_network_egress_status

class TestZeroEgress(unittest.TestCase):
    def test_zero_egress_telemetry_schema(self):
        status = get_network_egress_status()
        self.assertIn("air_gap_status", status)
        self.assertIn("compliance_standard", status)
        self.assertIn("localhost_services", status)
        self.assertIsInstance(status["localhost_services"], list)

if __name__ == "__main__":
    unittest.main()

