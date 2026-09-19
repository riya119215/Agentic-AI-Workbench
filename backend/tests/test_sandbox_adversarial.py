import unittest
import sys
import os
from pathlib import Path
from app.tools.sandbox import execute_python_sandbox

class TestSandboxAdversarial(unittest.TestCase):
    """
    Adversarial Security & Air-Gap Sandbox Isolation Test Suite.
    Verifies multi-layered defense-in-depth:
    Layer 1: Python Runtime Socket Class Override (_BlockedSocket)
    Layer 2: Scrubbed Process Environment & Air-Gap Enforcement
    Layer 3: Container Network Isolation (--network none / internal: true)
    """

    def test_layer1_python_socket_override(self):
        """Adversarial attempt 1: Standard Python socket connection."""
        code = """
import socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    s.connect(('1.1.1.1', 80))
    print('BREACH_SUCCESS')
except Exception as e:
    print(f'CAUGHT_BY_LAYER1: {type(e).__name__}: {e}')
"""
        res = execute_python_sandbox(code)
        self.assertTrue(res["success"])
        self.assertIn("CAUGHT_BY_LAYER1: PermissionError: NETWORK_BLOCKED", res["stdout"])
        self.assertNotIn("BREACH_SUCCESS", res["stdout"])

    def test_layer1_urllib_bypass_attempt(self):
        """Adversarial attempt 2: urllib / http.client network request."""
        code = """
import urllib.request
try:
    urllib.request.urlopen('http://1.1.1.1:80', timeout=2)
    print('BREACH_SUCCESS')
except Exception as e:
    print(f'CAUGHT_BY_LAYER1: {type(e).__name__}: {e}')
"""
        res = execute_python_sandbox(code)
        self.assertTrue(res["success"])
        self.assertIn("CAUGHT_BY_LAYER1", res["stdout"])
        self.assertNotIn("BREACH_SUCCESS", res["stdout"])

    def test_layer2_subprocess_curl_bypass_attempt(self):
        """Adversarial attempt 3: Subprocess curl/wget invocation to bypass Python module override."""
        code = """
import subprocess
try:
    # Attempting to spawn external CLI to bypass Python socket monkeypatching
    cmd = ['curl', '-s', '--connect-timeout', '1', 'http://1.1.1.1']
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=3)
    if p.returncode == 0:
        print('BREACH_SUCCESS')
    else:
        print(f'CAUGHT_BY_LAYER2_3: curl returned exit code {p.returncode}')
except FileNotFoundError:
    print('CAUGHT_BY_LAYER2_3: curl executable unavailable in air-gapped environment')
except Exception as e:
    print(f'CAUGHT_BY_LAYER2_3: {type(e).__name__}: {e}')
"""
        res = execute_python_sandbox(code)
        self.assertTrue(res["success"])
        self.assertIn("CAUGHT_BY_LAYER2_3", res["stdout"])
        self.assertNotIn("BREACH_SUCCESS", res["stdout"])

    def test_layer2_environment_secret_scrubbing(self):
        """Verifies API keys, tokens, and credentials are scrubbed from sandbox environment."""
        code = """
import os
leaked = [k for k in os.environ if any(s in k.upper() for s in ['KEY', 'SECRET', 'TOKEN', 'AUTH', 'PASSWORD', 'CREDENTIAL', 'AWS', 'GITHUB'])]
print(f'LEAKED_SECRETS_COUNT: {len(leaked)}')
"""
        res = execute_python_sandbox(code)
        self.assertTrue(res["success"])
        self.assertIn("LEAKED_SECRETS_COUNT: 0", res["stdout"])

if __name__ == "__main__":
    unittest.main()
