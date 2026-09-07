/**
 * Bidder Clarification & Representation Desk Modal
 * Closes the Show-Cause Notice loop under Rule 144(xi) GFR 2017
 */
import { store } from '../state.js';
import { api } from '../api.js';
import { showToast } from '../utils.js';

export function renderCureDeskModal(bidderId = 'BID-ABC-001') {
  // Remove existing modal if any
  document.getElementById('cure-desk-modal')?.remove();

  const modalEl = document.createElement('div');
  modalEl.id = 'cure-desk-modal';
  modalEl.className = 'modal-backdrop fixed inset-0 flex items-center justify-center p-4';
  modalEl.style.cssText = 'background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); z-index: 10000;';

  modalEl.innerHTML = `
    <div class="glass-panel ghost-border rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl" style="animation: scaleUp 0.2s ease-out; background: #131314; border-color: rgba(255,255,255,0.15);">
      <!-- Modal Header -->
      <div class="p-6 border-b border-white/10 flex justify-between items-center bg-surface-container">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary-container">
            <span class="material-symbols-outlined">assignment_turned_in</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-headline-sm font-bold text-lg text-white">Bidder Clarification &amp; Representation Desk</span>
              <span class="badge badge-info text-xs">Rule 144 GFR</span>
            </div>
            <p class="font-label-mono text-xs text-on-surface-variant">Statutory Review of Submissions Responding to Show-Cause Notice</p>
          </div>
        </div>
        <button id="btn-close-cure" class="text-on-surface-variant hover:text-white p-2 rounded-lg transition-colors cursor-pointer">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Modal Body -->
      <div id="cure-body" class="p-6 max-h-[75vh] overflow-y-auto space-y-6">
        <div class="text-center py-8">
          <span class="status-dot status-dot-active mr-2"></span> Loading representation dossier for <code>${bidderId}</code>...
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalEl);

  // Close handlers
  modalEl.querySelector('#btn-close-cure')?.addEventListener('click', () => modalEl.remove());
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) modalEl.remove();
  });

  // Fetch representation details
  api
    .getRepresentation(bidderId)
    .then((data) => {
      const body = modalEl.querySelector('#cure-body');
      if (!body) return;

      const ai = data.ai_evaluation;
      const isSufficient = ai.status === 'CURE_SUFFICIENT_AND_VERIFIED';

      body.innerHTML = `
        <!-- Notice Reference Banner -->
        <div class="bg-surface-container p-4 rounded-lg ghost-border flex justify-between items-center">
          <div>
            <div class="font-label-mono text-xs text-on-surface-variant">Associated Show-Cause Reference:</div>
            <div class="font-label-mono text-sm font-bold text-primary">${data.notice_ref}</div>
          </div>
          <div class="text-right">
            <div class="font-label-mono text-xs text-on-surface-variant">Submission Deadline Window:</div>
            <span class="badge ${data.submitted_within_deadline ? 'badge-low' : 'badge-danger'} text-xs">
              ${data.submitted_within_deadline ? `RECEIVED ON TIME (${data.hours_to_deadline}h REMAINING)` : 'EXPIRED DEADLINE'}
            </span>
          </div>
        </div>

        <!-- Bidder Rejoinder Statement -->
        <div>
          <h4 class="font-headline-sm font-semibold text-sm text-white mb-2 flex items-center gap-2">
            <span class="material-symbols-outlined text-sm text-primary">feed</span>
            Bidder Formal Representation &amp; Clarification Letter
          </h4>
          <div class="bg-black/40 p-4 rounded-lg border border-white/10 font-body-sm text-sm text-on-surface leading-relaxed">
            "${data.rejoinder_text}"
          </div>
        </div>

        <!-- Attached Curative Evidence -->
        <div>
          <h4 class="font-headline-sm font-semibold text-sm text-white mb-2 flex items-center gap-2">
            <span class="material-symbols-outlined text-sm text-secondary-container">attachment</span>
            Attached Documentary Rectifications
          </h4>
          <div class="space-y-2">
            ${data.attached_documents
              .map(
                (doc) => `
              <div class="bg-surface-container p-3 rounded-lg ghost-border flex justify-between items-center text-xs">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-sm text-primary">description</span>
                  <span class="font-semibold text-white">${doc.file_name}</span>
                </div>
                <div class="flex items-center gap-3 font-label-mono text-on-surface-variant">
                  <span>${doc.doc_type}</span>
                  ${doc.udin ? `<span class="badge badge-info">UDIN: ${doc.udin}</span>` : ''}
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- AI Cure Sufficiency Evaluation -->
        <div class="glass-panel ghost-border p-5 rounded-lg ${isSufficient ? 'glow-emerald' : 'glow-red'}" style="background: ${isSufficient ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)'};">
          <div class="flex justify-between items-center mb-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined ${isSufficient ? 'text-tertiary' : 'text-error'}">
                ${isSufficient ? 'verified_user' : 'gavel'}
              </span>
              <h4 class="font-headline-sm font-bold text-sm text-white">Automated AI Cure Sufficiency Evaluation</h4>
            </div>
            <span class="badge ${isSufficient ? 'badge-low' : 'badge-danger'} text-xs">
              ${ai.status} (${ai.cure_sufficiency_score}% SUFFICIENCY)
            </span>
          </div>

          <div class="space-y-2 text-xs">
            ${
              ai.resolved_defects.length > 0
                ? `
              <div class="text-tertiary">
                <strong>✓ Remediated Discrepancies:</strong>
                <ul class="list-disc list-inside ml-2 mt-1">
                  ${ai.resolved_defects.map((d) => `<li>${d}</li>`).join('')}
                </ul>
              </div>
            `
                : ''
            }

            ${
              ai.unresolved_defects.length > 0
                ? `
              <div class="text-error">
                <strong>✗ Unresolved Fatal Defects:</strong>
                <ul class="list-disc list-inside ml-2 mt-1">
                  ${ai.unresolved_defects.map((d) => `<li>${d}</li>`).join('')}
                </ul>
              </div>
            `
                : ''
            }

            <div class="bg-black/30 p-3 rounded mt-3 border border-white/10 text-on-surface-variant">
              <strong class="text-white">Legal Precedent:</strong> ${ai.legal_basis}
            </div>
          </div>
        </div>

        <!-- Officer Determination Action -->
        <div class="border-t border-white/10 pt-4 space-y-3">
          <label class="block font-label-mono text-xs text-on-surface-variant">Officer Statutory Finding &amp; Decision Justification (Mandatory):</label>
          <textarea id="txt-cure-justification" class="w-full form-textarea p-3 text-xs" rows="2" placeholder="Record mandatory legal reasoning for accepting or rejecting this bidder representation...">${
            isSufficient
              ? 'Cost Auditor UDIN certificate verified on ICAI registry. Reinstating Class-I local content status.'
              : 'Payment challan fails GeM GTC 4.19. Bidder lacked active BIS license on tender submission date. Final disqualification confirmed.'
          }</textarea>

          <div class="flex gap-3 justify-end">
            <button id="btn-reject-cure" class="btn btn-outline-danger btn-sm glow-red flex items-center gap-1 cursor-pointer">
              <span class="material-symbols-outlined text-sm">block</span>
              Confirm Disqualification
            </button>
            <button id="btn-accept-cure" class="btn btn-sm glow-emerald flex items-center gap-1 cursor-pointer" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; font-weight: 700;">
              <span class="material-symbols-outlined text-sm">check_circle</span>
              Accept Cure &amp; Reinstate Bidder
            </button>
          </div>
        </div>
      `;

      // Handle Accept Cure
      body.querySelector('#btn-accept-cure')?.addEventListener('click', async () => {
        const justification = body.querySelector('#txt-cure-justification')?.value || '';
        try {
          showToast('Recording statutory reinstatement on SHA-256 ledger...', 'info');
          const res = await api.decideRepresentation({
            bidder_id: bidderId,
            officer_id: 'OFF-8821',
            action: 'ACCEPT_CURE_QUALIFY',
            justification,
          });
          showToast(res.message, 'success');
          modalEl.remove();
          store.setState({ currentView: 'bidders' });
        } catch (err) {
          showToast(`Error: ${err.message}`, 'error');
        }
      });

      // Handle Reject Cure
      body.querySelector('#btn-reject-cure')?.addEventListener('click', async () => {
        const justification = body.querySelector('#txt-cure-justification')?.value || '';
        try {
          showToast('Recording final disqualification on SHA-256 ledger...', 'info');
          const res = await api.decideRepresentation({
            bidder_id: bidderId,
            officer_id: 'OFF-8821',
            action: 'REJECT_CURE_DISQUALIFY',
            justification,
          });
          showToast(res.message, 'success');
          modalEl.remove();
          store.setState({ currentView: 'bidders' });
        } catch (err) {
          showToast(`Error: ${err.message}`, 'error');
        }
      });
    })
    .catch((err) => {
      const body = modalEl.querySelector('#cure-body');
      if (body) body.innerHTML = `<div class="text-error text-center py-6">No active representation found: ${err.message}</div>`;
    });
}
