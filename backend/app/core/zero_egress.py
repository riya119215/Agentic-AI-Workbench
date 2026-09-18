import psutil
import socket
import ipaddress
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

def is_private_or_local_ip(ip_str: str) -> bool:
    try:
        ip = ipaddress.ip_address(ip_str)
        return ip.is_private or ip.is_loopback or ip.is_link_local
    except ValueError:
        # Hostnames like 'localhost'
        return ip_str.lower() in ["localhost", "127.0.0.1", "::1"]

def get_network_egress_status() -> dict:
    """
    Inspects active system network sockets in real-time.
    Distinguishes LOCAL, PRIVATE_NETWORK, and EXTERNAL_WAN connections.
    Reports STRICT_AIR_GAP_ACTIVE ("No external WAN socket observed during measurement"),
    EXTERNAL_WAN_DETECTED, or MONITORING_UNAVAILABLE.
    """
    try:
        connections = psutil.net_connections(kind="inet")
    except Exception as e:
        logger.warning(f"Socket inspection failed or restricted: {e}")
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "is_air_gapped": False,
            "wan_egress_count": 0,
            "wan_connections": [],
            "localhost_services": [],
            "air_gap_status": "MONITORING_UNAVAILABLE",
            "compliance_standard": "DEFENCE_ZERO_EGRESS_SPEC_v2.4",
            "telemetry_allowed": False,
            "measurement_note": "Runtime network inspection could not be completed."
        }

    local_services = []
    wan_connections = []

    for conn in connections:
        raddr = conn.raddr
        laddr = conn.laddr

        # Check local listeners
        if conn.status == "LISTEN" and laddr:
            if laddr.port in [8000, 11434, 5173, 3000, 8080]:
                service_label = "Workbench API" if laddr.port == 8000 else "Local Inference Engine" if laddr.port == 11434 else "Frontend UI"
                local_services.append({
                    "port": laddr.port,
                    "bind_ip": laddr.ip,
                    "service": service_label
                })

        # Check established outbound connections
        if conn.status == "ESTABLISHED" and raddr:
            if not is_private_or_local_ip(raddr.ip):
                wan_connections.append({
                    "remote_ip": raddr.ip,
                    "remote_port": raddr.port,
                    "pid": conn.pid,
                    "status": conn.status
                })

    is_air_gapped = len(wan_connections) == 0
    air_gap_status = "STRICT_AIR_GAP_ACTIVE" if is_air_gapped else "EXTERNAL_WAN_DETECTED"

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "is_air_gapped": is_air_gapped,
        "wan_egress_count": len(wan_connections),
        "wan_connections": wan_connections,
        "localhost_services": local_services,
        "air_gap_status": air_gap_status,
        "compliance_standard": "DEFENCE_ZERO_EGRESS_SPEC_v2.4",
        "telemetry_allowed": False,
        "measurement_note": "Zero external WAN sockets observed during runtime measurement." if is_air_gapped else f"{len(wan_connections)} external WAN connections active."
    }
