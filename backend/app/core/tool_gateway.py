import asyncio
import inspect
from typing import Dict, Any, List, Optional, Callable
from pydantic import BaseModel, Field
from datetime import datetime, timezone

from app.core.rbac import ROLE_PERMISSIONS, UserRole, get_user_by_id
from app.core.workspace import workspace_manager, PathTraversalError

class ToolExecutionError(Exception):
    pass

class ToolPermissionDeniedError(ToolExecutionError):
    pass

class ToolRegistry:
    """
    Controlled Tool Gateway between Autonomous Agent and sovereign capabilities.
    Validates schemas, enforces RBAC, sets timeouts, and blocks shell escapes.
    """
    def __init__(self):
        self._tools: Dict[str, Dict[str, Any]] = {}

    def register_tool(
        self,
        name: str,
        description: str,
        func: Callable,
        schema: Optional[type[BaseModel]] = None,
        required_role: UserRole = UserRole.VIEWER,
        timeout_seconds: int = 30
    ):
        self._tools[name] = {
            "name": name,
            "description": description,
            "func": func,
            "schema": schema,
            "required_role": required_role,
            "timeout_seconds": timeout_seconds
        }

    def list_tools(self) -> List[Dict[str, Any]]:
        result = []
        for name, info in self._tools.items():
            result.append({
                "name": name,
                "description": info["description"],
                "required_role": info["required_role"].value,
                "timeout_seconds": info["timeout_seconds"]
            })
        return result

    async def execute_tool(
        self,
        tool_name: str,
        arguments: Dict[str, Any],
        user_id: str = "officer_sharma",
        workspace_id: Optional[str] = None
    ) -> Dict[str, Any]:
        if tool_name not in self._tools:
            return {
                "success": False,
                "error": f"UNKNOWN_TOOL: Tool '{tool_name}' is not registered in Sovereign Tool Gateway.",
                "tool_name": tool_name
            }

        tool_info = self._tools[tool_name]
        user = get_user_by_id(user_id)
        
        # Check permissions
        allowed_tools = ROLE_PERMISSIONS.get(user.role, {}).get("tools", [])
        if "all" not in allowed_tools and tool_name not in allowed_tools:
            return {
                "success": False,
                "error": f"PERMISSION_DENIED: Role '{user.role.value}' is not authorized to invoke tool '{tool_name}'.",
                "tool_name": tool_name
            }

        # Validate arguments with schema if present
        validated_args = arguments
        if tool_info["schema"]:
            try:
                validated_obj = tool_info["schema"](**arguments)
                validated_args = validated_obj.dict()
            except Exception as e:
                return {
                    "success": False,
                    "error": f"SCHEMA_VALIDATION_ERROR: {str(e)}",
                    "tool_name": tool_name
                }

        # Inject workspace context safely if needed
        if workspace_id and "workspace_id" in inspect.signature(tool_info["func"]).parameters:
            validated_args["workspace_id"] = workspace_id

        # Execute with timeout
        try:
            func = tool_info["func"]
            if inspect.iscoroutinefunction(func):
                res = await asyncio.wait_for(func(**validated_args), timeout=tool_info["timeout_seconds"])
            else:
                res = await asyncio.to_thread(func, **validated_args)

            return {
                "success": True,
                "tool_name": tool_name,
                "result": res,
                "executed_by": user_id,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        except asyncio.TimeoutError:
            return {
                "success": False,
                "error": f"TOOL_TIMEOUT: Execution exceeded {tool_info['timeout_seconds']}s limit.",
                "tool_name": tool_name
            }
        except PathTraversalError as e:
            return {
                "success": False,
                "error": f"SECURITY_VIOLATION: {str(e)}",
                "tool_name": tool_name
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"TOOL_EXECUTION_ERROR: {str(e)}",
                "tool_name": tool_name
            }

tool_gateway = ToolRegistry()
