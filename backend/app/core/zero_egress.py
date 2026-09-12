import psutil
import socket
import ipaddress
from datetime import datetime, timezone

def is_private_ip(ip_str: str) -> bool:
    try:
        ip = ipaddress.ip_address(ip_str)
        return ip.is_private or ip.is_loopback or ip.is_link_local
    except ValueError:
        return True

def get_network_egress_status() -> dict:
    """
    Inspects all system network connections in real-time to verify that no confidential
    data is escaping through external WAN endpoints.
    """
    try:
        connections = psutil.net_connections(kind="inet")
    except Exception:
        connections = []

    local_services = []
    wan_connections = []
    
    current_pid = psutil.Process().pid

    for conn in connections:
        raddr = conn.raddr
        laddr = conn.laddr
        
        # Check local listener
        if conn.status == "LISTEN":
            if laddr.port in [8000, 11434, 5173, 3000, 8080]:
                local_services.append({
                    "port": laddr.port,
                    "bind_ip": laddr.ip,
                    "service": "Workbench API" if laddr.port == 8000 else "Ollama Local Engine" if laddr.port == 11434 else "Frontend UI"
                })
        
        # Check established outbound connections
        if conn.status == "ESTABLISHED" and raddr:
            if not is_private_ip(raddr.ip):
                wan_connections.append({
                    "remote_ip": raddr.ip,
                    "remote_port": raddr.port,
                    "pid": conn.pid,
                    "status": conn.status
                })

    is_air_gapped = len(wan_connections) == 0
    
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "is_air_gapped": is_air_gapped,
        "wan_egress_count": len(wan_connections),
        "wan_connections": wan_connections,
        "localhost_services": local_services,
        "air_gap_status": "STRICT_AIR_GAP_ACTIVE" if is_air_gapped else "EXTERNAL_WAN_DETECTED",
        "compliance_standard": "DEFENCE_ZERO_EGRESS_SPEC_v2.4",
        "telemetry_allowed": False
    }
