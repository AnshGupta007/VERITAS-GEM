/**
 * Human-in-the-Loop Decision Center Modal (Screen 8)
 */
import { store } from '../state.js';
import { api } from '../api.js';
import { showToast } from '../utils.js';

export function renderDecisionModal() {
  const state = store.getState();
  const findingId = state.selectedFindingId;
  const finding = state.findings.find((f) => f.id === findingId) || state.findings[0];

  let modal = document.getElementById('decision-modal-backdrop');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'decision-modal-backdrop';
    modal.className = 'modal-backdrop active';
    document.body.appendChild(modal);
  } else {
    modal.className = 'modal-backdrop active';
  }

  if (!finding) {
    modal.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h3>No Finding Selected</h3>
          <button id="btn-close-dec" class="btn btn-secondary btn-sm">✕</button>
        </div>
      </div>
    `;
    modal.querySelector('#btn-close-dec')?.addEventListener('click', () => modal.remove());
    return;
  }

  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <span class="badge badge-mandatory" style="margin-bottom: 0.25rem;">HUMAN GOVERNANCE GATE</span>
          <h3 style="color: #fff; font-size: 1.25rem;">Procurement Officer Decision Gateway</h3>
        </div>
        <button id="btn-close-dec" class="btn btn-secondary btn-sm">✕</button>
      </div>

      <div class="modal-body">
        <!-- Finding Context Recap -->
        <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--surface-border); border-radius: var(--radius-sm); padding: 1rem; margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
            <span style="font-family: var(--font-mono); color: var(--accent-cyan); font-weight: 700;">${finding.clause_reference}</span>
            <span class="badge badge-danger">${finding.severity} SEVERITY</span>
          </div>
          <h4 style="color: #fff; margin-bottom: 0.5rem; font-size: 1rem;">${finding.title}</h4>
          <div style="font-size: 0.82rem; color: #cbd5e1; margin-bottom: 0.75rem;">${finding.summary}</div>
          <div style="background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; padding: 0.5rem 0.75rem; border-radius: 4px; font-size: 0.78rem; color: #fca5a5;">
            <strong>AI Recommendation:</strong> ${finding.ai_recommendation}
          </div>
        </div>

        <!-- Decision Selector -->
        <div class="form-group">
          <label class="form-label">Select Authoritative Officer Determination:</label>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.65rem;">
            <label style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-sm); padding: 0.75rem; cursor: pointer; display: flex; flex-direction: column; gap: 0.25rem;">
              <input type="radio" name="decision-action" value="ACCEPT_FINDING" checked />
              <strong style="color: #86efac; font-size: 0.85rem;">Accept Finding</strong>
              <span style="font-size: 0.72rem; color: var(--text-secondary);">Concur with AI deduction</span>
            </label>

            <label style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-sm); padding: 0.75rem; cursor: pointer; display: flex; flex-direction: column; gap: 0.25rem;">
              <input type="radio" name="decision-action" value="OVERRIDE_FINDING" />
              <strong style="color: #fde68a; font-size: 0.85rem;">Override Finding</strong>
              <span style="font-size: 0.72rem; color: var(--text-secondary);">Officer takes legal exception</span>
            </label>

            <label style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: var(--radius-sm); padding: 0.75rem; cursor: pointer; display: flex; flex-direction: column; gap: 0.25rem;">
              <input type="radio" name="decision-action" value="ESCALATE_TO_COMMITTEE" />
              <strong style="color: #93c5fd; font-size: 0.85rem;">Escalate to Comm.</strong>
              <span style="font-size: 0.72rem; color: var(--text-secondary);">Refer to full TEC panel</span>
            </label>
          </div>
        </div>

        <!-- Mandatory Override Reason Input -->
        <div class="form-group" id="reason-group">
          <label class="form-label" id="reason-label">
            Documented Officer Justification / Legal Remarks:
            <span id="mandatory-star" style="color: #ef4444; display: none;">* (MANDATORY FOR OVERRIDE)</span>
          </label>
          <textarea 
            id="decision-reason" 
            class="form-textarea" 
            rows="3" 
            placeholder="e.g. Original physical affidavit inspected; Chartered Accountant verified UDIN reconciliation certificate..."
          ></textarea>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem;">
            Recorded permanently into the immutable SHA-256 audit ledger with officer credential watermark.
          </div>
        </div>

        <!-- Officer Signoff Watermark -->
        <div style="background: rgba(255, 255, 255, 0.03); border: 1px dashed var(--surface-border); border-radius: var(--radius-sm); padding: 0.65rem 0.85rem; font-size: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="color: var(--text-muted);">Sign-off Officer:</span>
            <strong style="color: #fff; margin-left: 4px;">Sh. Rajesh Sharma (ID: OFF-8821)</strong>
          </div>
          <span class="badge badge-real">DIGITALLY ATTESTED</span>
        </div>
      </div>

      <div class="modal-footer">
        <button id="btn-cancel-dec" class="btn btn-secondary btn-sm">Cancel</button>
        <button id="btn-submit-dec" class="btn btn-primary btn-sm">
          Execute & Sign Audit Ledger 🔒
        </button>
      </div>
    </div>
  `;

  const radioInputs = modal.querySelectorAll('input[name="decision-action"]');
  const mandatoryStar = modal.querySelector('#mandatory-star');
  const reasonTextarea = modal.querySelector('#decision-reason');

  radioInputs.forEach((input) => {
    input.addEventListener('change', (e) => {
      if (e.target.value === 'OVERRIDE_FINDING') {
        mandatoryStar.style.display = 'inline';
        reasonTextarea.placeholder = 'MANDATORY: Provide clear statutory/physical grounds for overruling the AI deduction...';
        reasonTextarea.focus();
      } else {
        mandatoryStar.style.display = 'none';
      }
    });
  });

  const closeModal = () => {
    store.setState({ activeModal: null });
    modal.remove();
  };

  modal.querySelector('#btn-close-dec')?.addEventListener('click', closeModal);
  modal.querySelector('#btn-cancel-dec')?.addEventListener('click', closeModal);

  modal.querySelector('#btn-submit-dec')?.addEventListener('click', async () => {
    const selectedAction = modal.querySelector('input[name="decision-action"]:checked')?.value || 'ACCEPT_FINDING';
    const reason = reasonTextarea.value.trim();

    if (selectedAction === 'OVERRIDE_FINDING' && reason.length < 8) {
      showToast('A documented justification (minimum 8 characters) is mandatory for overrides.', 'error');
      reasonTextarea.focus();
      return;
    }

    try {
      const payload = {
        finding_id: finding.id,
        action: selectedAction,
        officer_id: 'OFF-8821',
        officer_name: 'Sh. Rajesh Sharma',
        reason: reason || (selectedAction === 'ACCEPT_FINDING' ? 'Finding accepted and confirmed by officer.' : 'Escalated to committee.'),
      };

      const res = await api.submitDecision(payload);
      showToast(`Decision recorded successfully (Audit ID: ${res.audit_event_id})`, 'success');

      // Update state
      const [updatedFindings, updatedBidders, updatedAudit] = await Promise.all([
        api.getBidderFindings(finding.bidder_id),
        api.getBidders(),
        api.getAuditTrail(),
      ]);

      modal.remove();
      store.setState({
        activeModal: null,
        findings: updatedFindings,
        bidders: updatedBidders,
        auditTrail: updatedAudit,
      });
    } catch (err) {
      showToast(`Decision error: ${err.message}`, 'error');
    }
  });
}
