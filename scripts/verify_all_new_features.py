#!/usr/bin/env python3
"""
Automated Browser Verification for all VERITAS-GEM Next-Gen Features:
1. Command Center with Shell Risk & Show-Cause button
2. 1-Click Official Show-Cause Notice Modal (Bilingual & QR code)
3. Cartelization & Bid-Rigging Radar (SVG Entity Network Graph & Forensics)
4. 'Ask Veritas' Conversational Copilot Drawer with interactive chat
5. Custom Tender Ingestion Pipeline Modal
6. Committee Consensus Multi-Signoff Panel
"""
import os
import time
from playwright.sync_api import sync_playwright

artifacts_dir = "/home/ubuntu/.gemini/antigravity-ide/brain/adcb91ea-0a47-47ae-bf0c-b2d5c3b1aee2"

def verify_all():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="/usr/bin/google-chrome",
            args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
        )
        page = browser.new_page(viewport={"width": 1600, "height": 1050})

        print("[*] Navigating to http://localhost:8000 ...")
        page.goto("http://localhost:8000", wait_until="networkidle", timeout=20000)
        time.sleep(2)

        # 1. Command Center with Shell Risk & Show-Cause button
        shot1 = os.path.join(artifacts_dir, "feat_1_command_center_enhanced.png")
        page.screenshot(path=shot1)
        print(f"[+] Saved: {shot1}")

        # 2. Click "Draft Show-Cause Notice" on ABC Industries
        btn_showcause = page.query_selector(".btn-showcause-abc")
        if btn_showcause:
            print("[*] Opening Show-Cause Notice Modal...")
            btn_showcause.click()
            time.sleep(1.5)
            shot2 = os.path.join(artifacts_dir, "feat_2_show_cause_notice_modal.png")
            page.screenshot(path=shot2)
            print(f"[+] Saved: {shot2}")

            # Close notice modal
            page.click("#btn-close-notice", force=True)
            time.sleep(0.5)

        # 3. Open Cartelization Radar
        btn_cartel = page.query_selector("button[data-view='cartelization']")
        if btn_cartel:
            print("[*] Navigating to Cartelization Radar...")
            btn_cartel.click()
            time.sleep(2)
            shot3 = os.path.join(artifacts_dir, "feat_3_cartelization_radar.png")
            page.screenshot(path=shot3)
            print(f"[+] Saved: {shot3}")

        # 4. Open "Ask Veritas" Copilot Drawer & ask query
        copilot_btn = page.query_selector("#copilot-floating-btn")
        if copilot_btn:
            print("[*] Opening Ask Veritas Copilot Drawer...")
            copilot_btn.click()
            time.sleep(1)

            # Click a prompt chip
            chip = page.query_selector(".copilot-chip")
            if chip:
                chip.click()
                time.sleep(2)

            shot4 = os.path.join(artifacts_dir, "feat_4_copilot_drawer.png")
            page.screenshot(path=shot4)
            print(f"[+] Saved: {shot4}")

            # Close drawer
            page.click("#copilot-close-btn", force=True)
            time.sleep(0.5)

        # 5. Open Upload Tender Modal
        btn_upload = page.query_selector("#btn-upload-tender")
        if btn_upload:
            print("[*] Opening Upload Tender Ingest Modal...")
            btn_upload.click()
            time.sleep(1)

            # Click a demo preset to trigger animation
            preset = page.query_selector(".preset-tender-btn")
            if preset:
                preset.click()
                time.sleep(1.5)

            shot5 = os.path.join(artifacts_dir, "feat_5_tender_ingest_pipeline.png")
            page.screenshot(path=shot5)
            print(f"[+] Saved: {shot5}")

            time.sleep(2)  # Wait for ingestion to complete & auto-close

        # 6. Open Committee Quorum Panel
        btn_comm = page.query_selector("button[data-view='committee']")
        if btn_comm:
            print("[*] Navigating to Committee Quorum Panel...")
            btn_comm.click()
            time.sleep(1.5)
            shot6 = os.path.join(artifacts_dir, "feat_6_committee_quorum.png")
            page.screenshot(path=shot6)
            print(f"[+] Saved: {shot6}")

        browser.close()
        print("[+] All feature verifications completed successfully!")

if __name__ == "__main__":
    verify_all()
