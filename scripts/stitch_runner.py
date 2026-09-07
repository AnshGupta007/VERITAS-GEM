#!/usr/bin/env python3
"""
Stitch MCP Client & Screen Generator for VERITAS-GEM
Connects to Google Stitch MCP server via JSON-RPC 2.0
"""
import os
import urllib.request
import json
import time
import sys

STITCH_URL = os.environ.get("STITCH_URL", "https://stitch.googleapis.com/mcp")
API_KEY = os.environ.get("STITCH_API_KEY", "")

def call_mcp_tool(tool_name, arguments, request_id=1, timeout=180):
    payload = {
        "jsonrpc": "2.0",
        "id": request_id,
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": arguments
        }
    }
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(STITCH_URL, data=data, headers=headers)
    
    start_t = time.time()
    print(f"[*] Calling Stitch MCP tool: {tool_name} with args: {list(arguments.keys())}...")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        elapsed = time.time() - start_t
        print(f"[+] Call completed in {elapsed:.2f}s")
        if "error" in res:
            raise RuntimeError(f"Stitch MCP Error: {res['error']}")
        
        # Extract content text
        result_content = res.get("result", {}).get("content", [])
        if result_content and "text" in result_content[0]:
            try:
                return json.loads(result_content[0]["text"])
            except Exception:
                return result_content[0]["text"]
        return res.get("result", {})

if __name__ == "__main__":
    action = sys.argv[1] if len(sys.argv) > 1 else "list"
    if action == "create_project":
        title = sys.argv[2] if len(sys.argv) > 2 else "VERITAS-GEM Procurement Intelligence"
        res = call_mcp_tool("create_project", {"title": title})
        print(json.dumps(res, indent=2))
    elif action == "list_screens":
        pid = sys.argv[2]
        res = call_mcp_tool("list_screens", {"projectId": pid})
        print(json.dumps(res, indent=2))
    elif action == "get_screen":
        pid = sys.argv[2]
        sid = sys.argv[3]
        res = call_mcp_tool("get_screen", {"projectId": pid, "screenId": sid})
        print(json.dumps(res, indent=2))
