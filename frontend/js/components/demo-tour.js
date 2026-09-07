/**
 * Guided Hackathon Demo Tour ("Judge Demo Mode")
 * Implements the 7-Minute Winning Hackathon Pitch Script (Sections 27 & 28 of Solution Blueprint)
 */
import { store } from '../state.js';
import { showToast } from '../utils.js';

const TOUR_STEPS = [
  {
    step: 1,
    view: 'overview',
    title: 'Minute 0:00-2:00 · Tender Intelligence',
    subtitle: 'From Natural Language to Structured Requirements Graph',
    narrative:
      'We ingest Ministry of Petroleum & Natural Gas tender MoPNG-2026-TND-0428 (₹48.5 Cr for Subsea Valves). The system extracts 47 clauses and builds 29 compliance requirements with threshold rules and validation methods in under 2 minutes.',
    targetAction: 'Notice the structured clauses and threshold rules extracted deterministically.',
  },
  {
    step: 2,
    view: 'bidders',
    bidderId: 'BID-ABC-001',
    title: 'Minute 2:00-3:00 · Multi-Bidder Compliance Matrix',
    subtitle: 'Decomposed 6-Dimension Scorecard (Never an Opaque Single Score)',
    narrative:
      'Three bidder submissions evaluated. Rather than a mysterious "87% compliant" score, VERITAS-GEM decomposes compliance into 6 auditable dimensions: Mandatory Coverage, Evidence Strength, Source Verification, Identity Consistency, Temporal Validity, and Contradiction Risk.',
    targetAction: 'ABC Industries flagged as HIGH RISK with 71.4% confidence and 3 contradictions.',
  },
  {
    step: 3,
    view: 'contradictions',
    bidderId: 'BID-ABC-001',
    title: 'Minute 3:00-4:30 · THE KILLER MOMENT: Contradiction Radar',
    subtitle: 'Cross-Document Factual Inconsistency Invisible to Manual Review',
    narrative:
      'THIS IS THE WINNING INNOVATION: When an officer reads PDFs one by one, they cannot spot inconsistencies across files. Here, Document A (Financial Statement p.17) claims ₹12.40 Cr turnover, but Document B (Vendor Declaration p.3) declares only ₹8.20 Cr — below the ₹10 Cr tender threshold! A ₹4.20 Cr material contradiction!',
    targetAction: 'Red flag raised instantly with both source excerpts side-by-side.',
  },
  {
    step: 4,
    view: 'timemachine',
    bidderId: 'BID-ABC-001',
    title: 'Minute 4:30-5:30 · Compliance Time Machine',
    subtitle: 'Was the Certificate Valid on the Bid Date? Not Just Today!',
    narrative:
      'A bidder submits a certificate that is valid today or shows a post-deadline renewal receipt. But did they meet the requirements when the tender locked on 15-Sep-2026? Dragging our Time Machine slider reveals their mandatory BIS Quality License expired 3 months BEFORE bid submission!',
    targetAction: 'Interactive time slider proves legal non-compliance at the exact submission moment.',
  },
  {
    step: 5,
    view: 'evidence',
    findingId: 'FIND-ABC-01',
    title: 'Minute 5:30-6:30 · Grounded 3-Column Evidence Viewer',
    subtitle: 'No Black Box: Requirement → AI Reasoning → Primary Document Artifacts',
    narrative:
      'Every material finding provides 100% evidence grounding. The officer sees: (1) Clause 4.2 requirement, (2) Grounded AI inference and confidence score, and (3) Primary OCR document pages side-by-side with highlighted bounding boxes.',
    targetAction: 'Inspect the highlighted ₹12.40 Cr and ₹8.20 Cr text regions.',
  },
  {
    step: 6,
    view: 'decision',
    findingId: 'FIND-ABC-01',
    title: 'Minute 6:30-7:00 · The Trust Moment: Human Override',
    subtitle: 'AI Prioritizes; Authoritative Sources Validate; Humans Decide',
    narrative:
      'The AI never disqualifies or awards bids autonomously. In the Decision Center, the officer has absolute authority to Accept, Escalate, or Override with mandatory justification. Overriding requires documented legal rationale, permanently stored in the audit ledger.',
    targetAction: 'Click "Officer Action" to test an override or acceptance.',
  },
  {
    step: 7,
    view: 'audit',
    title: 'Final Moment · Cryptographic Audit Ledger & Dossier',
    subtitle: 'Complete Legal Defense for Public Sector Procurement',
    narrative:
      'Every AI inference, source check, and human decision is signed into an append-only SHA-256 chained audit ledger. If challenged under RTI or parliamentary inquiry, the procurement organization can prove exactly what was known, inferred, and decided.',
    targetAction: 'Export the auditable compliance assessment dossier.',
  },
];

export function startDemoTour() {
  let stepIndex = 0;

  function showStep(idx) {
    if (idx >= TOUR_STEPS.length) {
      removeTourModal();
      showToast('🎉 Demo Tour Completed! Ready for Judge Q&A.', 'success');
      return;
    }

    const stepData = TOUR_STEPS[idx];

    // Switch view in application
    if (stepData.view === 'decision') {
      store.setState({ currentView: 'evidence', selectedFindingId: stepData.findingId, activeModal: 'decision-modal' });
    } else {
      const updates = { currentView: stepData.view };
      if (stepData.bidderId) updates.selectedBidderId = stepData.bidderId;
      if (stepData.findingId) updates.selectedFindingId = stepData.findingId;
      store.setState(updates);
    }

    renderTourOverlay(stepData, idx, () => showStep(idx + 1), () => showStep(idx - 1), removeTourModal);
  }

  showStep(0);
}

function renderTourOverlay(data, idx, nextFn, prevFn, closeFn) {
  let overlay = document.getElementById('demo-tour-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'demo-tour-overlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '2000';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div style="position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%); width: 92%; max-width: 820px; background: rgba(12, 19, 36, 0.96); backdrop-filter: blur(20px); border: 2px solid var(--accent-cyan); border-radius: var(--radius-xl); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 242, 254, 0.3); pointer-events: auto; padding: var(--spacing-lg);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
            <span class="badge badge-real" style="background: var(--gradient-brand); color: #070b14; font-weight: 800;">
              JUDGE DEMO MODE · STEP ${data.step} OF ${TOUR_STEPS.length}
            </span>
            <span class="badge badge-info">${data.title.split('·')[0]}</span>
          </div>
          <h3 style="color: #fff; font-size: 1.25rem;">${data.title.split('·')[1] || data.title}</h3>
          <div style="font-size: 0.85rem; color: var(--accent-cyan); font-weight: 600;">${data.subtitle}</div>
        </div>

        <button id="btn-tour-close" class="btn btn-secondary btn-sm" style="border-radius: 50%; width: 32px; height: 32px; padding: 0;">✕</button>
      </div>

      <p style="font-size: 0.9rem; color: #cbd5e1; line-height: 1.6; margin-bottom: 0.85rem;">
        ${data.narrative}
      </p>

      <div style="background: rgba(0, 242, 254, 0.08); border-left: 3px solid var(--accent-cyan); padding: 0.5rem 0.75rem; border-radius: 4px; font-size: 0.8rem; color: #7dd3fc; margin-bottom: 1rem;">
        🎯 <strong>Judge Focus:</strong> ${data.targetAction}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--surface-border); padding-top: 0.75rem;">
        <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">
          Use [Next] to proceed through 7-minute pitch narrative
        </div>

        <div style="display: flex; gap: 0.5rem;">
          ${idx > 0 ? `<button id="btn-tour-prev" class="btn btn-secondary btn-sm">← Previous</button>` : ''}
          <button id="btn-tour-next" class="btn btn-primary btn-sm">
            ${idx === TOUR_STEPS.length - 1 ? 'Finish Tour ✓' : 'Next Step →'}
          </button>
        </div>
      </div>
    </div>
  `;

  overlay.querySelector('#btn-tour-close')?.addEventListener('click', closeFn);
  overlay.querySelector('#btn-tour-prev')?.addEventListener('click', prevFn);
  overlay.querySelector('#btn-tour-next')?.addEventListener('click', nextFn);

  const copilotBtn = document.getElementById('btn-floating-copilot');
  if (copilotBtn) copilotBtn.style.display = 'none';
}

function removeTourModal() {
  const overlay = document.getElementById('demo-tour-overlay');
  if (overlay) overlay.remove();
  const copilotBtn = document.getElementById('btn-floating-copilot');
  if (copilotBtn) copilotBtn.style.display = 'flex';
}
