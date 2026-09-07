/**
 * Cryptographic Immutable Audit Ledger Component
 */
import { store } from '../state.js';
import { api } from '../api.js';
import { formatDate, showToast } from '../utils.js';

export function renderAuditLedger(container) {
  const state = store.getState();
  const auditTrail = state.auditTrail || [];

  container.innerHTML = `
    <!-- Top Header Card -->
    <div class="card card-elevated" style="margin-bottom: var(--spacing-xl); border-color: rgba(16, 185, 129, 0.4);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--spacing-md);">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
            <span class="status-dot status-dot-active"></span>
            <span class="badge badge-low">CRYPTOGRAPHIC INTEGRITY: 100%</span>
            <span class="badge badge-real">APPEND-ONLY SHA-256 LEDGER</span>
          </div>
          <h2 style="color: #fff; font-size: 1.6rem;">Immutable Procurement Audit Ledger</h2>
          <p style="font-size: 0.9rem; color: #cbd5e1;">
            Reconstructs the complete evidentiary trajectory: 
            <strong style="color: var(--accent-cyan);">What the AI knew → What it inferred → What it presented → What the human officer decided → Why.</strong>
          </p>
        </div>

        <div style="display: flex; gap: var(--spacing-md);">
          <button id="btn-verify-chain" class="btn btn-outline-cyan btn-sm">
            <span>🛡️</span> Verify Hash Chaining
          </button>
          <button id="btn-export-audit" class="btn btn-secondary btn-sm">
            <span>📥</span> Export Audit JSON
          </button>
        </div>
      </div>
    </div>

    <!-- Ledger Table Card -->
    <div class="card" style="padding: 0; overflow-x: auto;">
      <table class="data-table">
        <thead>
          <tr>
            <th>Event ID</th>
            <th>Timestamp</th>
            <th>Event Type</th>
            <th>Officer / Actor</th>
            <th>Finding Reference</th>
            <th>Action & Justification</th>
            <th>Rule / Model</th>
            <th>Integrity Signature</th>
          </tr>
        </thead>
        <tbody id="audit-tbody">
          ${
            auditTrail.length === 0
              ? `<tr><td colspan="8" style="text-align: center; padding: 2rem;">No audit records found.</td></tr>`
              : auditTrail
                  .map(
                    (ev) => `
            <tr>
              <td>
                <span style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-cyan); font-size: 0.8rem;">
                  ${ev.event_id}
                </span>
              </td>
              <td style="font-family: var(--font-mono); font-size: 0.78rem;">
                ${formatDate(ev.timestamp)} ${ev.timestamp.split('T')[1] ? ev.timestamp.split('T')[1].substring(0, 8) : ''}
              </td>
              <td>
                <span class="badge ${
                  ev.event_type.includes('OVERRIDDEN')
                    ? 'badge-simulated'
                    : ev.event_type.includes('ACCEPTED')
                    ? 'badge-low'
                    : 'badge-info'
                }">
                  ${ev.event_type}
                </span>
              </td>
              <td>
                <strong style="color: #fff;">${ev.officer_id}</strong>
              </td>
              <td>
                <span style="font-family: var(--font-mono); color: #cbd5e1;">
                  ${ev.finding_id || '—'}
                </span>
              </td>
              <td style="max-width: 320px;">
                <div style="font-weight: 600; color: #fff; font-size: 0.82rem;">${ev.action_taken}</div>
                <div style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4;">
                  ${ev.reason || '—'}
                </div>
              </td>
              <td>
                <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">
                  ${ev.model_version}<br/>${ev.rule_version}
                </span>
              </td>
              <td>
                <code style="font-size: 0.68rem; color: #86efac; background: rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 3px;" title="SHA-256 Signature">
                  ${ev.integrity_signature ? ev.integrity_signature.substring(0, 20) : 'sha256...'}...
                </code>
              </td>
            </tr>
          `
                  )
                  .join('')
          }
        </tbody>
      </table>
    </div>
  `;

  // Verify chain button
  container.querySelector('#btn-verify-chain')?.addEventListener('click', async () => {
    try {
      const res = await api.verifyAuditLedger();
      showToast(`Chain status: ${res.chain_status} · Verified ${res.total_blocks} blocks (Score: ${res.integrity_score}%)`, 'success');
    } catch (err) {
      showToast(`Verification error: ${err.message}`, 'error');
    }
  });

  // Export audit button
  container.querySelector('#btn-export-audit')?.addEventListener('click', () => {
    const jsonStr = JSON.stringify(auditTrail, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VERITAS-GEM-Audit-Ledger-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Audit trail exported successfully', 'info');
  });
}
