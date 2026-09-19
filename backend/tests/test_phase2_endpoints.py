import unittest
import asyncio
from app.core.router import ModelRouter
from app.core.model_manager import model_manager
from app.core.zero_egress import get_network_egress_status
from app.core.agent_loop import SovereignAgentLoop
from app.tools.sandbox import execute_python_sandbox


class TestPhase2Backend(unittest.TestCase):
    def setUp(self):
        self.router = ModelRouter()
        self.manager = model_manager

    def test_dynamic_model_routing_logic(self):
        # Code task routing
        code_result = self.router.classify_and_route("Write a Python script to evaluate turbine vibration telemetry and plot pandas dataframe", [])
        self.assertEqual(code_result["task_type"], "Code")
        self.assertIn("qwen2.5-coder", code_result["selected_model"])

        # Vision task routing
        vision_result = self.router.classify_and_route("Analyze bearing drawing and inspection photo for cavitation", ["bearing_photo.png"])
        self.assertEqual(vision_result["task_type"], "Vision")
        self.assertIn("vision", vision_result["task_type"].lower())

        # Reasoning task routing
        reasoning_result = self.router.classify_and_route("Evaluate turbine inspection metrology against maintenance standard SOP-TURB-IND-2026-V4", ["INSPECTION_REPORT.txt"])
        self.assertEqual(reasoning_result["task_type"], "Reasoning")
        self.assertIn("llama3.2", reasoning_result["selected_model"])

    def test_model_registry_crud_without_redeploy(self):
        models_initial = self.manager.list_models()
        self.assertGreaterEqual(len(models_initial), 3)

        new_model_id = "test-judge-custom-model"
        added = self.manager.add_model({
            "id": new_model_id,
            "name": "Judge Demo Custom Engine",
            "task_type": "Reasoning & Report Drafting",
            "category": "reasoning",
            "endpoint": "http://127.0.0.1:11434",
            "size_gb": 4.0,
            "vram_pct": 30
        })
        self.assertEqual(added["id"], new_model_id)

        # Confirm dynamically listed
        models_after = self.manager.list_models()
        model_ids = [m["id"] for m in models_after]
        self.assertIn(new_model_id, model_ids)

        # Cleanup
        self.manager.delete_model(new_model_id)

    def test_network_socket_monitor(self):
        log = get_network_egress_status()
        self.assertIn("is_air_gapped", log)
        self.assertIn("wan_egress_count", log)
        self.assertIn("localhost_services", log)
        self.assertEqual(log["wan_egress_count"], 0)

    def test_sandbox_isolated_execution(self):
        code = "print(sum([10, 20, 30]))"
        res = execute_python_sandbox(code, timeout_seconds=5)
        self.assertEqual(res["exit_code"], 0)
        self.assertIn("60", res["stdout"])
        self.assertEqual(res.get("network_calls_blocked", 0), 0)

    def test_agent_loop_async_execution(self):
        async def run_loop():
            loop = SovereignAgentLoop(
                task_id="test_task_001",
                prompt="Analyze Turbine Unit 7 inspection metrology",
                attachments=["INSPECTION_REPORT_TURBINE_UNIT_7.txt"],
                user_id="officer_sharma",
                clearance="RESTRICTED"
            )
            events = []
            async for ev in loop.run():
                events.append(ev)
            return events

        events = asyncio.run(run_loop())
        event_types = [e.get("type") for e in events]
        self.assertIn("model_selected", event_types)
        self.assertIn("step", event_types)
        self.assertIn("done", event_types)


if __name__ == "__main__":
    unittest.main()
