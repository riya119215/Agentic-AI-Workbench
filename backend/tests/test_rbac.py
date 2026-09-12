import unittest
from app.core.rbac import get_user_by_id, UserRole, DEFAULT_USERS

class TestRBAC(unittest.TestCase):
    def test_admin_has_top_secret_access(self):
        admin = get_user_by_id("admin_verma")
        self.assertEqual(admin.role, UserRole.ADMIN)
        self.assertEqual(admin.clearance_level, "TOP_SECRET")
        self.assertIn("all", admin.allowed_tools)

    def test_officer_clearance(self):
        officer = get_user_by_id("officer_sharma")
        self.assertEqual(officer.role, UserRole.OFFICER)
        self.assertEqual(officer.clearance_level, "RESTRICTED_OFFICIAL")
        self.assertIn("doc_generator", officer.allowed_tools)

    def test_analyst_has_sandbox_access(self):
        analyst = get_user_by_id("analyst_patel")
        self.assertEqual(analyst.role, UserRole.ANALYST)
        self.assertIn("code_sandbox", analyst.allowed_tools)

    def test_viewer_restricted(self):
        viewer = get_user_by_id("viewer_guest")
        self.assertEqual(viewer.role, UserRole.VIEWER)
        self.assertEqual(viewer.clearance_level, "UNCLASSIFIED")
        self.assertNotIn("code_sandbox", viewer.allowed_tools)

if __name__ == "__main__":
    unittest.main()

