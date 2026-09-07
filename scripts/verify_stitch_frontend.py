import time
from playwright.sync_api import sync_playwright

def test_stitch_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="/usr/bin/google-chrome",
            args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
        )
        context = browser.new_context(viewport={"width": 1600, "height": 1000})
        page = context.new_page()

        print("[*] Navigating to http://localhost:8000 ...")
        page.goto("http://localhost:8000", wait_until="networkidle")
        time.sleep(2)

        # 1. Capture Flagship Stitch Command Center with Sidebar
        page.screenshot(path="/home/ubuntu/.gemini/antigravity-ide/brain/adcb91ea-0a47-47ae-bf0c-b2d5c3b1aee2/stitch_full_command_center.png")
        print("[+] Captured stitch_full_command_center.png")

        # 2. Click Cartelization Radar on Stitch Sidebar
        print("[*] Clicking Cartelization Radar in Stitch Sidebar...")
        page.click('a[data-view="cartelization"]')
        time.sleep(1.5)
        page.screenshot(path="/home/ubuntu/.gemini/antigravity-ide/brain/adcb91ea-0a47-47ae-bf0c-b2d5c3b1aee2/stitch_full_cartelization.png")
        print("[+] Captured stitch_full_cartelization.png")

        # 3. Click Grounded Evidence on Stitch Sidebar
        print("[*] Clicking Grounded Evidence in Stitch Sidebar...")
        page.click('a[data-view="evidence"]')
        time.sleep(1.5)
        page.screenshot(path="/home/ubuntu/.gemini/antigravity-ide/brain/adcb91ea-0a47-47ae-bf0c-b2d5c3b1aee2/stitch_full_grounded_evidence.png")
        print("[+] Captured stitch_full_grounded_evidence.png")

        # 4. Click Committee Quorum on Stitch Sidebar
        print("[*] Clicking Committee Quorum in Stitch Sidebar...")
        page.click('a[data-view="committee"]')
        time.sleep(1.5)
        page.screenshot(path="/home/ubuntu/.gemini/antigravity-ide/brain/adcb91ea-0a47-47ae-bf0c-b2d5c3b1aee2/stitch_full_committee_quorum.png")
        print("[+] Captured stitch_full_committee_quorum.png")

        # 5. Open Copilot Drawer
        print("[*] Triggering Ask Veritas Copilot drawer...")
        page.click("#copilot-floating-btn")
        time.sleep(1)
        page.screenshot(path="/home/ubuntu/.gemini/antigravity-ide/brain/adcb91ea-0a47-47ae-bf0c-b2d5c3b1aee2/stitch_full_copilot_drawer.png")
        print("[+] Captured stitch_full_copilot_drawer.png")

        browser.close()
        print("[+] All Stitch frontend screenshots successfully captured!")

if __name__ == "__main__":
    test_stitch_frontend()
