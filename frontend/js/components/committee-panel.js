/**
 * Technical Evaluation Committee Consensus Multi-Signoff Panel
 * Multi-Signature digital attestation anchored to the SHA-256 audit ledger
 */
import { store } from '../state.js';
import { api } from '../api.js';
import { showToast } from '../utils.js';

export function renderCommitteePanel(container) {
  container.innerHTML = `
    <div style="animation: fadeIn 0.3s ease-out;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
            <span class="badge badge-info" style="font-family: var(--font-mono); font-size: 0.72rem;">
              GOVERNANCE QUORUM
            </span>
            <span class="badge badge-real">MULTI-MEMBER DIGITAL ATTESTATION</span>
          </div>
          <h2 style="font-family: 'Geist', var(--font-display); font-size: 1.85rem; color: #fff; font-weight: 700;">
            Technical Evaluation Committee Consensus
          </h2>
          <p style="font-size: 0.95rem; color: #94a3b8; margin-top: 0.25rem;">
            Statutory multi-signoff protocol for tender award, disqualifications, and officer overrides under Rule 144 GFR 2017.
          </p>
        </div>

        <div style="font-family: var(--font-mono); font-size: 0.8rem; color: #86efac; display: flex; align-items: center; gap: 0.5rem;">
          <span class="material-symbols-outlined" style="font-size: 18px;">verified_user</span>
          <span>Quorum Reached (2/3 Signed)</span>
        </div>
      </div>

      <!-- Loading State -->
      <div id="committee-loading" class="card" style="text-align: center; padding: 3rem;">
        <span class="status-dot status-dot-active" style="margin-right: 8px;"></span> Loading committee members and cryptographic signatures...
      </div>

      <!-- Content Container -->
      <div id="committee-content" style="display: none;">
        <!-- Committee Members Grid -->
        <div id="committee-members-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 1.5rem;">
          <!-- Dynamically populated -->
        </div>

        <!-- Consensus Resolution Card -->
        <div class="glass-panel ghost-border rounded-lg glow-gold" style="padding: 1.5rem; border-color: rgba(212, 175, 55, 0.4); margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="material-symbols-outlined" style="color: var(--accent-gold); font-size: 24px;">gavel</span>
              <h3 style="font-family: 'Geist', var(--font-display); font-size: 1.25rem; color: #fff; font-weight: 700;">
                Committee Statutory Resolution
              </h3>
            </div>
            <span class="badge badge-high" style="font-size: 0.72rem;">RESOLUTION READY</span>
          </div>

          <div style="background: rgba(0,0,0,0.4); border-radius: 6px; padding: 1rem; border-left: 4px solid var(--accent-gold); font-size: 0.88rem; color: #e2e8f0; line-height: 1.6; margin-bottom: 1rem;">
            <strong>DECISION:</strong> The Technical Evaluation Committee, having reviewed the deterministic findings of VERITAS-GEM, hereby resolves:
            <ul style="margin: 0.5rem 0 0 1.25rem; list-style-type: disc;">
              <li><strong>Reject ABC Industries Limited</strong> from technical qualification under Rule 144(xi) GFR 2017 due to un-rebutted ₹4.20 Cr turnover variance and expired BIS license.</li>
              <li><strong>Classify XYZ Corporation</strong> as Class-II Local Supplier (revoking preferential purchase margin).</li>
              <li><strong>Approve PQR Engineering Technologies</strong> as 100% compliant with 98.2% confidence score for Commercial Financial Bid Opening.</li>
            </ul>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; font-family: var(--font-mono); font-size: 0.78rem; color: #94a3b8;">
            <div>Quorum Requirement: <strong>2 of 3 Members (66.7%)</strong></div>
            <div>Anchored in SHA-256 Ledger Block <strong>#88421</strong></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Fetch committee status
  api.getCommitteeStatus()
    .then((data) => {
      const loader = container.querySelector('#committee-loading');
      const content = container.querySelector('#committee-content');
      if (loader) loader.style.display = 'none';
      if (content) content.style.display = 'block';

      const grid = container.querySelector('#committee-members-grid');
      if (!grid) return;

      grid.innerHTML = data.members.map((m) => `
        <div class="glass-panel ghost-border rounded-lg ${m.status === 'SIGNED' ? 'glow-emerald' : 'glow-gold'}" style="padding: 1.25rem; border-color: ${m.status === 'SIGNED' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(212, 175, 55, 0.35)'}; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div>
              <span class="badge ${m.status === 'SIGNED' ? 'badge-low' : 'badge-med'}" style="font-size: 0.65rem;">
                ${m.status === 'SIGNED' ? 'DIGITALLY ATTESTED' : 'PENDING SIGNATURE'}
              </span>
              <h4 style="font-family: 'Geist', var(--font-display); font-size: 1.15rem; color: #fff; font-weight: 600; margin-top: 0.35rem;">
                ${m.name}
              </h4>
              <div style="font-size: 0.75rem; color: #94a3b8;">${m.designation}</div>
            </div>
            <div style="width: 36px; height: 36px; border-radius: 50%; background: ${m.status === 'SIGNED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(212, 175, 55, 0.15)'}; display: flex; align-items: center; justify-content: center;">
              <span class="material-symbols-outlined" style="color: ${m.status === 'SIGNED' ? '#10b981' : 'var(--accent-gold)'}; font-size: 20px;">
                ${m.status === 'SIGNED' ? 'verified' : 'history_edu'}
              </span>
            </div>
          </div>

          <div style="flex: 1; margin-bottom: 1rem; font-size: 0.8rem; color: #cbd5e1; background: rgba(0,0,0,0.3); padding: 0.75rem; border-radius: 6px; border-left: 3px solid ${m.status === 'SIGNED' ? '#10b981' : 'var(--accent-gold)'}; font-style: italic;">
            "${m.comments || 'Awaiting formal financial advisor concurrence on turnover discrepancy calculations.'}"
          </div>

          <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.75rem; font-family: var(--font-mono); font-size: 0.72rem; color: #94a3b8;">
            ${m.status === 'SIGNED' ? `
              <div style="color: #86efac; font-weight: bold; margin-bottom: 0.2rem;">Sig: ${m.signature_hash}</div>
              <div>Signed: ${m.signed_at}</div>
            ` : `
              <button class="btn btn-sm btn-sign-member glow-gold" data-id="${m.member_id}" style="width: 100%; background: var(--accent-gold); color: #000; font-weight: 700; font-size: 0.78rem;">
                Sign Concurrence Token ✍️
              </button>
            `}
          </div>
        </div>
      `).join('');

      // Attach Sign Button
      container.querySelector('.btn-sign-member')?.addEventListener('click', async (e) => {
        const memberId = e.currentTarget.getAttribute('data-id');
        try {
          showToast('Applying cryptographic signature token and anchoring to SHA-256 ledger...', 'info');
          await api.signCommitteeMember({
            member_id: memberId,
            action: 'CONCUR_WITH_REJECTION',
            comments: 'Financial advisor review confirms turnover discrepancy of ₹4.20 Cr exceeds tolerance limits. Rejection concurred.'
          });
          showToast('Signature recorded on block ledger! Committee quorum complete (3/3).', 'success');
          setTimeout(() => renderCommitteePanel(container), 800);
        } catch (err) {
          showToast(`Signing failed: ${err.message}`, 'error');
        }
      });
    })
    .catch((err) => {
      const loader = container.querySelector('#committee-loading');
      if (loader) loader.innerHTML = `<div style="color: #fca5a5;">Failed to load committee: ${err.message}</div>`;
    });
}
