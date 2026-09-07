import { store } from '../state.js';
import { api } from '../api.js';
import { formatINR, showToast } from '../utils.js';
import { renderTenderIngestModal } from './tender-ingest-modal.js';

export function renderHeader(container) {
  const state = store.getState();
  const tender = state.tender;

  container.innerHTML = `
    <header class="app-header">
      <div class="header-inner">
        <!-- Brand & Ministry Identity -->
        <div class="brand-section">
          <div class="brand-logo-gem">
            <div class="logo-symbol">V</div>
            <div class="brand-title-wrap">
              <h1>
                VERITAS-GEM
                <span class="badge badge-info" style="font-size: 0.68rem;">SIH26100</span>
              </h1>
              <div class="brand-sub">Ministry of Petroleum & Natural Gas · GeM Co-Pilot</div>
            </div>
          </div>
        </div>

        <!-- Active Tender Pill -->
        <div class="header-center-info">
          <div class="tender-pill-active">
            <span class="status-dot status-dot-active"></span>
            <div>
              <span style="color: var(--text-muted); font-size: 0.75rem;">Active Tender:</span>
              <strong style="color: #fff; margin-left: 4px;">${tender ? tender.tender_number : 'GEM/2026/B/8849201'}</strong>
              <span style="color: var(--accent-cyan); margin-left: 6px; font-family: var(--font-mono); font-weight: 700;">
                ${tender ? formatINR(tender.estimated_value_inr) : '₹48.50 Cr'}
              </span>
            </div>
          </div>
        </div>

        <!-- Actions & Officer Session -->
        <div class="header-actions">
          <button id="btn-upload-tender" class="btn btn-secondary btn-sm ghost-border" title="Upload custom GeM tender PDF">
            <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">upload_file</span>
            <span>Upload Tender</span>
          </button>

          <button id="btn-pitch-tour" class="btn btn-demo-pitch" title="7-Minute Winning Hackathon Demo Tour">
            <span style="font-size: 1rem;">⚡</span>
            <span>Judge Demo Mode</span>
          </button>

          <button id="btn-reset-demo" class="btn btn-secondary btn-sm" title="Reset all decisions to initial state">
            <span>↺</span> Reset Demo
          </button>

          <div class="officer-badge">
            <div class="officer-avatar">RS</div>
            <div style="font-size: 0.8rem;">
              <div style="font-weight: 600; color: #fff;">Sh. Rajesh Sharma</div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">Director (Evaluation)</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  `;

  // Attach event handlers
  document.getElementById('btn-upload-tender')?.addEventListener('click', () => {
    renderTenderIngestModal();
  });

  document.getElementById('btn-reset-demo')?.addEventListener('click', async () => {
    try {
      await api.resetDemo();
      showToast('Demo state successfully reset to initial baseline', 'success');
      // Reload bidders and findings
      const [bidders, findings, audit] = await Promise.all([
        api.getBidders(),
        api.getBidderFindings(store.getState().selectedBidderId),
        api.getAuditTrail(),
      ]);
      store.setState({ bidders, findings, auditTrail: audit });
    } catch (err) {
      showToast(`Reset error: ${err.message}`, 'error');
    }
  });
}
