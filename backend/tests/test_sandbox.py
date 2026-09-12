import unittest
from app.tools.sandbox import execute_python_sandbox

class TestSandbox(unittest.TestCase):
    def test_safe_computation(self):
        code = "a = 25\nb = 75\nprint(f'Sum is {a + b}')"
        res = execute_python_sandbox(code)
        self.assertTrue(res["success"])
        self.assertIn("Sum is 100", res["stdout"])

    def test_network_socket_blocking(self):
        code = """
import socket
try:
    if socket.socket is None:
        print('SOCKET_DISABLED_BY_SANDBOX')
    else:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect(('8.8.8.8', 53))
        print('LEAKED')
except Exception as e:
    print(f'SOCKET_BLOCKED: {e}')
"""
        res = execute_python_sandbox(code)
        self.assertTrue(res["success"])
        self.assertNotIn("LEAKED", res.get("stdout", ""))

if __name__ == "__main__":
    unittest.main()

