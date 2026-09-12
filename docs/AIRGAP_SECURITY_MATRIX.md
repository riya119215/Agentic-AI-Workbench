# 🔒 Air-Gap Security & Zero-Egress Compliance Matrix

## 1. Compliance Standard Alignment
The Sovereign AI Workbench is aligned with the following cybersecurity and defense frameworks:
- **CERT-In Guidelines for Critical Information Infrastructure**
- **ISO/IEC 27001:2022 (Information Security Management)**
- **NIST SP 800-53 (Security & Privacy Controls for Information Systems)**
- **Defence Cyber Agency (DCA) Air-Gap Operational Directives**

---

## 2. Air-Gap Threat Vectors & Mitigations

| Threat Vector | Risk Description | Sovereign Workbench Mitigation | Verification Method |
| :--- | :--- | :--- | :--- |
| **Cloud Telemetry Exfiltration** | AI frameworks phoning home to external metrics servers. | All telemetry telemetry endpoints stripped. Zero external egress watchdog drops non-localhost packets. | `sovereign-cli egress` & live socket radar |
| **Model Inversion / Data Leaks** | Prompt and confidential docs leaked to public APIs. | 100% on-premise local open-weight inference (Ollama / vLLM). No OpenAI/Anthropic cloud dependencies. | Process inspector & netstat socket scan |
| **Sandbox Jailbreak** | AI-generated Python code establishing reverse shells. | Sockets blocked (`socket.socket = None`), subprocess calls stripped, restricted execution scope. | `backend/tests/test_sandbox.py` |
| **Audit Log Tampering** | Malicious actor modifying compliance or clearance records. | Cryptographic SHA-256 hash chaining (blockchain-style parent hash linkage). | `sovereign-cli audit verify` |
| **Privilege Escalation** | Unauthorized user querying TOP SECRET intelligence documents. | Strict Role-Based Access Control (RBAC): `Admin`, `Officer`, `Analyst`, `Viewer`. | `backend/tests/test_rbac.py` |

---

## 3. Zero-Egress Mathematical Guarantee
The backend enforces a dual-layer network egress barrier:
1. **Application Layer**: Python process watchdog actively audits listening and outbound connections.
2. **Infrastructure Layer**: Kubernetes `egress-lockdown-networkpolicy.yaml` explicitly rejects all traffic to `0.0.0.0/0` except intra-pod DNS and internal GPU nodes.

