#!/usr/bin/env python3
"""
Import Stitch generated screens into VERITAS-GEM
"""
import urllib.request
import json
import os
import sys

STITCH_URL = os.environ.get("STITCH_URL", "https://stitch.googleapis.com/mcp")
API_KEY = os.environ.get("STITCH_API_KEY", "")

def call_mcp_tool(tool_name, arguments):
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
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
    with urllib.request.urlopen(req, timeout=120) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        result_content = res.get("result", {}).get("content", [])
        if result_content and "text" in result_content[0]:
            try:
                return json.loads(result_content[0]["text"])
            except Exception:
                return result_content[0]["text"]
        return res.get("result", {})

def import_project(project_id="5549183315873612099", out_dir="frontend/stitch_export"):
    os.makedirs(out_dir, exist_ok=True)
    artifacts_dir = "/home/ubuntu/.gemini/antigravity-ide/brain/adcb91ea-0a47-47ae-bf0c-b2d5c3b1aee2"
    
    screens_data = call_mcp_tool("list_screens", {"projectId": project_id})
    screens = screens_data.get("screens", []) if isinstance(screens_data, dict) else []
    print(f"Found {len(screens)} screens in project {project_id}")
    
    saved_screens = []
    for idx, s in enumerate(screens):
        s_title = s.get("title", f"screen_{idx}")
        s_name = s.get("name", "")
        s_id = s_name.split("/")[-1] if s_name else f"scr_{idx}"
        
        print(f"\nProcessing Screen [{idx+1}/{len(screens)}]: {s_title} ({s_id})")
        
        # Download HTML
        html_url = s.get("htmlCode", {}).get("downloadUrl")
        html_path = os.path.join(out_dir, f"{s_id}.html")
        if html_url:
            print(f"Downloading HTML from {html_url[:60]}...")
            req = urllib.request.Request(html_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req) as resp:
                html_code = resp.read().decode("utf-8", errors="ignore")
                with open(html_path, "w", encoding="utf-8") as f:
                    f.write(html_code)
                print(f"Saved HTML to {html_path} ({len(html_code)} bytes)")
        
        # Download Screenshot
        img_url = s.get("screenshot", {}).get("downloadUrl")
        img_path = os.path.join(artifacts_dir, f"stitch_{s_id}.png")
        if img_url:
            print(f"Downloading Screenshot from {img_url[:60]}...")
            req = urllib.request.Request(img_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req) as resp:
                img_data = resp.read()
                with open(img_path, "wb") as f:
                    f.write(img_data)
                print(f"Saved Screenshot to {img_path} ({len(img_data)} bytes)")
                
        saved_screens.append({
            "id": s_id,
            "title": s_title,
            "html_path": html_path,
            "img_path": img_path
        })
    
    return saved_screens

if __name__ == "__main__":
    pid = sys.argv[1] if len(sys.argv) > 1 else "5549183315873612099"
    import_project(pid)
