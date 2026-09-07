/**
 * Dynamic Procurement Policy Sandbox Modal
 * Zero-Code GFR 2017 & GeM STC Policy Configurator
 */
import { store } from '../state.js';
import { api } from '../api.js';
import { showToast } from '../utils.js';

export function renderPolicySandboxModal() {
  document.getElementById('policy-sandbox-modal')?.remove();

  const modalEl = document.createElement('div');
  modalEl.id = 'policy-sandbox-modal';
  modalEl.className = 'modal-backdrop fixed inset-0 flex items-center justify-center p-4';
  modalEl.style.cssText = 'background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); z-index: 10000;';

  modalEl.innerHTML = `
    <div class="glass-panel ghost-border rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl" style="animation: scaleUp 0.2s ease-out; background: #131314; border-color: rgba(255,255,255,0.15);">
      <!-- Header -->
      <div class="p-6 border-b border-white/10 flex justify-between items-center bg-surface-container">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <span class="material-symbols-outlined">tune</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-headline-sm font-bold text-lg text-white">Procurement Policy Sandbox</span>
              <span class="badge badge-real text-xs">GFR 2017 Engine</span>
            </div>
            <p class="font-label-mono text-xs text-on-surface-variant">Interactive Rule Toggles &amp; Real-Time Leaderboard Re-ranking</p>
          </div>
        </div>
        <button id="btn-close-policy" class="text-on-surface-variant hover:text-white p-2 rounded-lg transition-colors cursor-pointer">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Body -->
      <div id="policy-body" class="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
        <div class="text-center py-6">
          <span class="status-dot status-dot-active mr-2"></span> Loading active policy configurations...
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalEl);

  // Close handlers
  modalEl.querySelector('#btn-close-policy')?.addEventListener('click', () => modalEl.remove());
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) modalEl.remove();
  });

  // Fetch active policy
  api
    .getPolicyConfig()
    .then((data) => {
      const body = modalEl.querySelector('#policy-body');
      if (!body) return;

      const p = data.policy;

      body.innerHTML = `
        <!-- Policy 1: Startup India -->
        <div class="bg-surface-container p-4 rounded-lg ghost-border flex items-center justify-between">
          <div class="space-y-1 max-w-md">
            <div class="flex items-center gap-2">
              <span class="font-headline-sm font-semibold text-sm text-white">Startup India Turnover &amp; Experience Waiver</span>
              <span class="badge badge-info text-[10px]">Rule 173(i) GFR</span>
            </div>
            <p class="font-body-sm text-xs text-on-surface-variant">
              Waives prior annual turnover (₹10 Cr) and 5-year past supply experience for DPIIT-recognized startups.
            </p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="chk-startup-exempt" class="sr-only peer" ${p.startup_india_exemption ? 'checked' : ''} />
            <div class="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-container"></div>
          </label>
        </div>

        <!-- Policy 2: Land Border Restrictions -->
        <div class="bg-surface-container p-4 rounded-lg ghost-border flex items-center justify-between">
          <div class="space-y-1 max-w-md">
            <div class="flex items-center gap-2">
              <span class="font-headline-sm font-semibold text-sm text-white">Rule 144(xi) Land Border Security Restrictions</span>
              <span class="badge badge-high text-[10px]">MANDATORY</span>
            </div>
            <p class="font-body-sm text-xs text-on-surface-variant">
              Enforces competent authority registration for bidders sharing land borders with India.
            </p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="chk-land-border" class="sr-only peer" ${p.gfr_144_xi_land_border_enforced ? 'checked' : ''} />
            <div class="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <!-- Policy 3: Class-I Minimum Local Content Threshold Slider -->
        <div class="bg-surface-container p-4 rounded-lg ghost-border space-y-3">
          <div class="flex justify-between items-center">
            <div>
              <span class="font-headline-sm font-semibold text-sm text-white">DPIIT Class-I Local Content Minimum Threshold</span>
              <p class="font-body-sm text-xs text-on-surface-variant">Minimum local manufacturing value-addition required for purchase preference.</p>
            </div>
            <span id="lbl-local-content-val" class="font-label-mono text-sm font-bold text-primary">${p.class_1_local_content_threshold}%</span>
          </div>
          <input type="range" id="slider-local-content" min="20" max="60" step="5" value="${p.class_1_local_content_threshold}" class="w-full accent-primary cursor-pointer" />
          <div class="flex justify-between text-[10px] font-label-mono text-on-surface-variant">
            <span>20% (Relaxed)</span>
            <span>50% (Standard MoPNG Norm)</span>
            <span>60% (Strict)</span>
          </div>
        </div>

        <!-- Real-Time Simulated Impact Preview -->
        <div class="glass-panel ghost-border p-4 rounded-lg">
          <h4 class="font-headline-sm font-semibold text-xs uppercase tracking-wider text-white mb-2 flex items-center gap-2">
            <span class="material-symbols-outlined text-sm text-primary">visibility</span>
            Live Impact on Active Bidder Evaluation
          </h4>
          <div id="policy-impact-preview" class="space-y-2 text-xs">
            ${data.impact.simulated_impacts
              .map(
                (imp) => `
              <div class="bg-black/30 p-2.5 rounded border border-white/5 flex justify-between items-center">
                <div>
                  <span class="font-bold text-white">${imp.bidder_name}</span>
                  <div class="text-on-surface-variant text-[11px]">${imp.effect}</div>
                </div>
                <span class="badge ${imp.resulting_risk.includes('HIGH') ? 'badge-danger' : 'badge-low'} text-[10px] whitespace-nowrap ml-2">
                  ${imp.resulting_risk}
                </span>
              </div>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- Apply Button -->
        <div class="pt-2">
          <button id="btn-apply-policy" class="btn btn-sm w-full glow-gold flex items-center justify-center gap-2 cursor-pointer" style="background: linear-gradient(135deg, #d4af37 0%, #f2ca50 100%); color: #000; font-weight: 800;">
            <span class="material-symbols-outlined text-sm">save</span>
            <span>Apply Policy Amendments to Audit Ledger</span>
          </button>
        </div>
      `;

      // Slider listener
      const slider = body.querySelector('#slider-local-content');
      const sliderLbl = body.querySelector('#lbl-local-content-val');
      slider?.addEventListener('input', (e) => {
        if (sliderLbl) sliderLbl.textContent = `${e.target.value}%`;
      });

      // Apply button handler
      body.querySelector('#btn-apply-policy')?.addEventListener('click', async () => {
        const startupExempt = body.querySelector('#chk-startup-exempt')?.checked;
        const landBorder = body.querySelector('#chk-land-border')?.checked;
        const threshold = parseFloat(body.querySelector('#slider-local-content')?.value || '50');

        try {
          showToast('Recording policy changes to SHA-256 audit ledger...', 'info');
          const res = await api.updatePolicyConfig({
            startup_india_exemption: startupExempt,
            gfr_144_xi_land_border_enforced: landBorder,
            class_1_local_content_threshold: threshold,
          });
          showToast('Procurement policy sandbox successfully applied!', 'success');
          modalEl.remove();

          // Refresh bidders
          const [bidders, audit] = await Promise.all([api.getBidders(), api.getAuditTrail()]);
          store.setState({ bidders, auditTrail: audit });
        } catch (err) {
          showToast(`Policy error: ${err.message}`, 'error');
        }
      });
    })
    .catch((err) => {
      const body = modalEl.querySelector('#policy-body');
      if (body) body.innerHTML = `<div class="text-error text-center py-6">Failed to load policy config: ${err.message}</div>`;
    });
}
