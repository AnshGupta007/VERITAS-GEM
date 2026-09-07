/**
 * Official Statutory Show-Cause Notice & Ineligibility Memo Modal
 * Renders official Government of India / MoPNG memorandum under Rule 144(xi) GFR 2017
 */
import { store } from '../state.js';
import { api } from '../api.js';
import { showToast } from '../utils.js';
import { renderCureDeskModal } from './cure-desk-modal.js';

export async function renderShowCauseModal(bidderId = 'BID-ABC-001') {
  // Remove existing modal if any
  const existing = document.getElementById('show-cause-modal-root');
  if (existing) existing.remove();

  let noticeData = null;
  try {
    noticeData = await api.getShowCauseNotice(bidderId);
  } catch (err) {
    showToast(`Failed to generate Show-Cause notice: ${err.message}`, 'error');
    return;
  }

  const modalRoot = document.createElement('div');
  modalRoot.id = 'show-cause-modal-root';
  modalRoot.className = 'modal-backdrop active';
  modalRoot.style.display = 'flex';
  modalRoot.style.alignItems = 'center';
  modalRoot.style.justifyContent = 'center';
  modalRoot.style.zIndex = '9999';
  modalRoot.style.opacity = '1';
  modalRoot.style.pointerEvents = 'auto';

  modalRoot.innerHTML = `
    <div class="modal-dialog glass-panel ghost-border" style="max-width: 820px; width: 92%; max-height: 90vh; display: flex; flex-direction: column; border-radius: 8px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); animation: fadeIn 0.25s ease-out;">
      <!-- Modal Header -->
      <div style="background: #111420; padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(212, 175, 55, 0.15); border: 1px solid var(--accent-gold); display: flex; align-items: center; justify-content: center;">
            <span class="material-symbols-outlined" style="color: var(--accent-gold-bright); font-size: 20px;">gavel</span>
          </div>
          <div>
            <h3 style="font-family: 'Geist', var(--font-display); font-size: 1.15rem; color: #fff; font-weight: 700;">
              Statutory Show-Cause Notice & Ineligibility Memo
            </h3>
            <div style="font-family: var(--font-mono); font-size: 0.72rem; color: #94a3b8;">
              Ref: ${noticeData.notice_ref} · Rule 144(xi) GFR 2017 & GeM STC 7.2
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <!-- Bilingual Toggle -->
          <button id="btn-toggle-lang" class="btn btn-secondary btn-sm ghost-border" style="font-family: var(--font-mono); font-size: 0.75rem;">
            🌐 Switch to हिन्दी
          </button>
          <button id="btn-close-notice" class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem;">✕</button>
        </div>
      </div>

      <!-- Printable Official Memorandum Body -->
      <div id="memo-scroll-body" style="padding: 2rem; overflow-y: auto; background: #0c0e15; color: #e2e8f0; font-family: 'Inter', sans-serif; line-height: 1.6;">
        <!-- Official Government Letterhead Header -->
        <div style="text-align: center; border-bottom: 2px solid rgba(212, 175, 55, 0.4); padding-bottom: 1.25rem; margin-bottom: 1.5rem;">
          <div style="font-size: 1.35rem; font-weight: 800; color: var(--accent-gold-bright); letter-spacing: 0.05em; text-transform: uppercase;">
            Government of India / भारत सरकार
          </div>
          <div style="font-size: 1rem; font-weight: 700; color: #fff;">
            Ministry of Petroleum & Natural Gas / पेट्रोलियम एवं प्राकृतिक गैस मंत्रालय
          </div>
          <div style="font-size: 0.8rem; color: #94a3b8; font-family: var(--font-mono); margin-top: 0.25rem;">
            Standing Technical Evaluation Committee · Shastri Bhawan, New Delhi - 110001
          </div>
        </div>

        <!-- Notice Metadata Bar -->
        <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 0.8rem; margin-bottom: 1.5rem; background: rgba(255,255,255,0.03); padding: 0.75rem 1rem; border-radius: 4px;">
          <div>
            <strong>Date / दिनांक:</strong> ${noticeData.date}<br/>
            <strong>Tender No / निविदा संख्या:</strong> ${noticeData.tender_number}
          </div>
          <div style="text-align: right;">
            <strong>Ref / पत्रांक:</strong> ${noticeData.notice_ref}<br/>
            <strong>Cure Period / अवधि:</strong> <span style="color: #ef4444; font-weight: bold;">${noticeData.cure_deadline_hours} Hours</span>
          </div>
        </div>

        <!-- To Addressee -->
        <div style="margin-bottom: 1.5rem; font-size: 0.88rem;">
          <strong>To / सेवा में,</strong><br/>
          <span style="font-weight: 700; color: #fff;">${noticeData.bidder_name}</span><br/>
          <span>CIN: ${noticeData.cin}</span><br/>
          <span>${noticeData.address}</span>
        </div>

        <!-- Subject Header -->
        <div style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 0.85rem 1rem; margin-bottom: 1.5rem;">
          <div id="notice-subject-text" style="font-weight: 700; color: #ffdad6; font-size: 0.92rem;">
            SUBJECT: SHOW-CAUSE NOTICE FOR COMMERCIAL NON-COMPLIANCE & MATERIAL CONTRADICTION UNDER RULE 144 GFR 2017 REGARDING TENDER GEM/2026/B/8849201.
          </div>
        </div>

        <!-- Body Paragraphs -->
        <div id="notice-body-text" style="font-size: 0.85rem; line-height: 1.6; margin-bottom: 1.5rem;">
          <p style="margin-bottom: 0.75rem;">
            WHEREAS, the Technical Evaluation Committee of the Ministry of Petroleum & Natural Gas undertook deterministic verification of documents submitted by your firm for the supply of <em>High-Pressure Subsea Control Valves & Flow Control Skids</em>;
          </p>
          <p style="margin-bottom: 0.75rem;">
            AND WHEREAS, the automated forensic verification engine (VERITAS-GEM) cross-referenced your bid package against statutory returns and authoritative registries, revealing the following <strong>material defects and irreconcilable contradictions</strong>:
          </p>
        </div>

        <!-- Findings Table -->
        <div style="margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
            <thead>
              <tr style="background: #191c28; color: #94a3b8; font-family: var(--font-mono); text-align: left;">
                <th style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">Tender Clause</th>
                <th style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">Discrepancy / Non-Compliance</th>
                <th style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">Primary Evidence</th>
              </tr>
            </thead>
            <tbody>
              ${noticeData.findings.map((f, idx) => `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); background: ${idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'};">
                  <td style="padding: 0.75rem; font-family: var(--font-mono); color: var(--accent-gold-bright); vertical-align: top;">
                    ${f.clause}
                  </td>
                  <td style="padding: 0.75rem; color: #ffb4ab; vertical-align: top;">
                    <strong>${f.violation}</strong><br/>
                    <span style="font-size: 0.72rem; color: #94a3b8;">${f.rule}</span>
                  </td>
                  <td style="padding: 0.75rem; font-family: var(--font-mono); font-size: 0.75rem; vertical-align: top;">
                    <div style="color: #86efac;">[A] ${f.evidence_a}</div>
                    <div style="color: #fca5a5; margin-top: 0.25rem;">[B] ${f.evidence_b}</div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Directives & Deadline -->
        <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 1rem; margin-bottom: 1.5rem; font-size: 0.85rem;">
          <strong style="color: #fff;">DIRECTIVE / निर्देश:</strong><br/>
          You are hereby granted <strong>${noticeData.cure_deadline_hours} hours</strong> (until <strong>${noticeData.cure_deadline_date}</strong>) to upload CA-certified UDIN reconciliation returns and proof of valid BIS certification. Failure to furnish an adequate rebuttal within the stipulated timeframe shall result in summary technical disqualification under Rule 144(xi) GFR 2017 and forfeiture of Earnest Money Deposit (EMD).
        </div>

        <!-- Signature & Cryptographic QR Verification -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1);">
          <!-- QR Code Badge -->
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 56px; height: 56px; background: #fff; padding: 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
              <span class="material-symbols-outlined" style="color: #000; font-size: 48px;">qr_code_2</span>
            </div>
            <div style="font-family: var(--font-mono); font-size: 0.7rem; color: #94a3b8;">
              <div style="color: #6ee7b7; font-weight: bold;">CRYPTOGRAPHICALLY ATTESTED</div>
              <div>Token: ${noticeData.qr_verification_token}</div>
              <div>SHA-256 Ledger Block #88419</div>
            </div>
          </div>

          <!-- Signatory Officer -->
          <div style="text-align: right; font-size: 0.82rem;">
            <div style="font-family: var(--font-mono); color: var(--accent-gold-bright); font-size: 0.75rem; margin-bottom: 0.25rem;">[DIGITALLY SIGNED / ई-हस्ताक्षरित]</div>
            <strong style="color: #fff; font-size: 0.95rem;">${noticeData.signatory.name}</strong><br/>
            <span>${noticeData.signatory.designation}</span><br/>
            <span style="color: #94a3b8; font-size: 0.75rem;">${noticeData.signatory.department}</span>
          </div>
        </div>
      </div>

      <!-- Modal Footer Action Bar -->
      <div style="background: #111420; padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
        <span style="font-family: var(--font-mono); font-size: 0.75rem; color: #94a3b8;">
          Notice status: <strong style="color: #f59e0b;">READY FOR STATUTORY DISPATCH</strong>
        </span>

        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <button id="btn-open-cure-modal" class="btn btn-secondary btn-sm ghost-border" style="font-size: 0.8rem; color: #38bdf8; border-color: rgba(56, 189, 248, 0.4);">
            <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">fact_check</span>
            Open Bidder Cure Desk →
          </button>
          <button id="btn-print-memo" class="btn btn-secondary btn-sm ghost-border" style="font-size: 0.8rem;">
            <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">print</span>
            Print / PDF
          </button>
          <button id="btn-dispatch-notice" class="btn btn-sm glow-red" style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); color: #fff; font-weight: 700; font-size: 0.8rem;">
            <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">send</span>
            Issue Statutory Notice & Record on Ledger
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalRoot);

  // Attach event handlers
  modalRoot.querySelector('#btn-open-cure-modal')?.addEventListener('click', () => {
    modalRoot.remove();
    renderCureDeskModal(bidderId);
  });
  let isHindi = false;
  modalRoot.querySelector('#btn-toggle-lang')?.addEventListener('click', () => {
    isHindi = !isHindi;
    const btn = modalRoot.querySelector('#btn-toggle-lang');
    const subj = modalRoot.querySelector('#notice-subject-text');
    if (isHindi) {
      btn.textContent = '🌐 Switch to English';
      subj.textContent = 'विषय: जीएफआर 2017 के नियम 144 के तहत वाणिज्यिक गैर-अनुपालन एवं महत्वपूर्ण विसंगति हेतु कारण बताओ नोटिस (निविदा: GEM/2026/B/8849201)';
    } else {
      btn.textContent = '🌐 Switch to हिन्दी';
      subj.textContent = 'SUBJECT: SHOW-CAUSE NOTICE FOR COMMERCIAL NON-COMPLIANCE & MATERIAL CONTRADICTION UNDER RULE 144 GFR 2017 REGARDING TENDER GEM/2026/B/8849201.';
    }
  });

  modalRoot.querySelector('#btn-close-notice')?.addEventListener('click', () => {
    modalRoot.remove();
  });

  modalRoot.querySelector('#btn-print-memo')?.addEventListener('click', () => {
    window.print();
  });

  modalRoot.querySelector('#btn-dispatch-notice')?.addEventListener('click', async () => {
    try {
      showToast('Dispatching Show-Cause Notice to bidder...', 'info');
      // Record onto committee / audit ledger
      await api.submitDecision({
        bidder_id: bidderId,
        finding_id: 'FIND-ABC-01',
        action_type: 'ESCALATE',
        rationale: `Statutory Show-Cause Notice ${noticeData.notice_ref} issued with 48h cure deadline under GFR 144.`,
        officer_notes: 'Formal notice transmitted to vendor email & registered post.'
      });
      showToast('Notice successfully issued and permanently anchored in SHA-256 ledger!', 'success');
      setTimeout(() => modalRoot.remove(), 1000);
    } catch (e) {
      showToast(`Dispatch failed: ${e.message}`, 'error');
    }
  });
}
