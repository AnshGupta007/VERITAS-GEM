/**
 * Commercial / Financial Bid Evaluation & L1 Purchase Preference Component
 * Implements DPIIT PPO-MII Class-I 20% Margin & MSE 15% Price Band Preference
 */
import { store } from '../state.js';
import { api } from '../api.js';
import { formatINR, showToast } from '../utils.js';

export function renderCommercialCenter(container) {
  container.innerHTML = `
    <div style="animation: fadeIn 0.3s ease-out;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
            <span class="badge badge-real" style="background: linear-gradient(135deg, #00f1fe 0%, #00a0fe 100%); color: #000; font-weight: 800;">
              STAGE 2: FINANCIAL ENVELOPE (FQ)
            </span>
            <span class="badge badge-info">DPIIT PPO-MII &amp; GFR RULE 153</span>
          </div>
          <h2 style="font-family: 'Geist', var(--font-display); font-size: 1.85rem; color: #fff; font-weight: 700;">
            Commercial Bid Opening &amp; Statutory L1 Preference Discovery
          </h2>
          <p style="font-size: 0.95rem; color: #94a3b8; margin-top: 0.25rem;">
            Automated BoQ arithmetic audit, raw L1 price discovery, and mandatory Class-I Make-in-India &amp; MSE purchase preference invocation.
          </p>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <button id="btn-refresh-commercial" class="btn btn-secondary btn-sm ghost-border">
            <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">refresh</span>
            Refresh Rates
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div id="commercial-loading" class="card" style="text-align: center; padding: 3rem;">
        <span class="status-dot status-dot-active" style="margin-right: 8px;"></span> Auditing commercial envelopes and BoQ pricing matrices...
      </div>

      <!-- Content Container -->
      <div id="commercial-content" style="display: none;"></div>
    </div>
  `;

  // Bind refresh
  container.querySelector('#btn-refresh-commercial')?.addEventListener('click', () => {
    loadCommercialData(container);
  });

  loadCommercialData(container);
}

function loadCommercialData(container) {
  const loader = container.querySelector('#commercial-loading');
  const content = container.querySelector('#commercial-content');

  api
    .getCommercialEvaluation()
    .then((data) => {
      if (loader) loader.style.display = 'none';
      if (!content) return;
      content.style.display = 'block';

      content.innerHTML = `
        <!-- Top Statutory Metrics -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
          <!-- Metric 1: Raw L1 -->
          <div class="glass-panel ghost-border rounded-lg hover-spring stagger-1 glow-cyan glow-breathe-cyan" style="padding: 1.25rem; border-color: rgba(0, 241, 254, 0.3);">
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.25rem;">
              Raw Lowest Price (L1)
            </div>
            <div style="font-family: 'Geist', var(--font-display); font-size: 1.75rem; font-weight: 700; color: #fff;">
              ₹${data.raw_l1_price_cr.toFixed(3)} Cr
            </div>
            <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--accent-cyan); margin-top: 0.25rem;">
              ${data.raw_l1_bidder} (Class-II)
            </div>
          </div>

          <!-- Metric 2: PPO-MII Ceiling -->
          <div class="glass-panel ghost-border rounded-lg hover-spring stagger-2" style="padding: 1.25rem;">
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.25rem;">
              PPO-MII 20% Preference Ceiling
            </div>
            <div style="font-family: 'Geist', var(--font-display); font-size: 1.75rem; font-weight: 700; color: #fde68a;">
              ₹${data.ppo_mii_margin_ceiling_cr.toFixed(3)} Cr
            </div>
            <div style="font-family: var(--font-mono); font-size: 0.72rem; color: #94a3b8; margin-top: 0.25rem;">
              Class-I Supplier Margin Band
            </div>
          </div>

          <!-- Metric 3: Price Variance -->
          <div class="glass-panel ghost-border rounded-lg hover-spring stagger-3 glow-emerald glow-breathe-emerald" style="padding: 1.25rem;">
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.25rem;">
              Qualified Class-I Gap
            </div>
            <div style="font-family: 'Geist', var(--font-display); font-size: 1.75rem; font-weight: 700; color: #86efac;">
              +${data.price_gap_percentage}%
            </div>
            <div style="font-family: var(--font-mono); font-size: 0.72rem; color: #86efac; margin-top: 0.25rem;">
              Within Statutory 20% Window
            </div>
          </div>

          <!-- Metric 4: Award Recommendation -->
          <div class="glass-panel ghost-border rounded-lg hover-spring stagger-4 ${data.price_matched ? 'glow-emerald' : 'glow-gold'}" style="padding: 1.25rem;">
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: ${data.price_matched ? '#86efac' : '#fde68a'}; margin-bottom: 0.25rem;">
              Statutory Award Status
            </div>
            <div style="font-family: 'Geist', var(--font-display); font-size: 1.2rem; font-weight: 700; color: #fff;">
              ${data.price_matched ? 'PQR Engineering (Awarded)' : 'Price Match Eligible'}
            </div>
            <div style="font-family: var(--font-mono); font-size: 0.72rem; color: #94a3b8; margin-top: 0.25rem;">
              ${data.price_matched ? '100% Contract Allocated at L1 Price' : 'DPIIT Clause 3(b) Action Pending'}
            </div>
          </div>
        </div>

        <!-- Statutory Ruling Callout -->
        <div class="glass-panel ghost-border rounded-lg hover-spring ${data.price_matched ? 'glow-emerald glow-breathe-emerald' : 'glow-gold glow-breathe-gold'}" style="padding: 1.25rem; margin-bottom: 1.5rem; background: ${data.price_matched ? 'rgba(16, 185, 129, 0.08)' : 'rgba(212, 175, 55, 0.08)'};">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span class="material-symbols-outlined" style="font-size: 24px; color: ${data.price_matched ? '#10b981' : '#f59e0b'};">
                ${data.price_matched ? 'verified' : 'gavel'}
              </span>
              <div>
                <strong style="color: #fff; font-size: 0.95rem;">Statutory Procurement Ruling:</strong>
                <p style="font-size: 0.85rem; color: #cbd5e1; margin-top: 0.15rem;">
                  ${data.statutory_ruling}
                </p>
              </div>
            </div>

            ${
              !data.price_matched
                ? `
              <button id="btn-invoke-price-match" class="btn btn-sm glow-cyan" style="background: linear-gradient(135deg, #00f1fe 0%, #00a0fe 100%); color: #000; font-weight: 800; white-space: nowrap;">
                <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">handshake</span>
                Invoke PPO-MII Price Match (L1)
              </button>
            `
                : `
              <span class="badge badge-low" style="font-size: 0.8rem; padding: 0.5rem 0.85rem;">
                PRICE MATCH COMPLETED · LoA READY
              </span>
            `
            }
          </div>
        </div>

        <!-- Commercial Bids Comparative Statement Table -->
        <div class="card" style="margin-bottom: 1.5rem;">
          <h3 style="font-family: 'Geist', var(--font-display); font-size: 1.15rem; color: #fff; margin-bottom: 1rem;">
            Commercial Comparative Statement (CS) · Landed BoQ Pricing
          </h3>

          <div style="overflow-x: auto;">
            <table class="table" style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); text-align: left; font-family: var(--font-mono); font-size: 0.75rem; color: #94a3b8;">
                  <th style="padding: 0.75rem;">Bidder Entity</th>
                  <th style="padding: 0.75rem;">Technical Clearance</th>
                  <th style="padding: 0.75rem;">Supplier Category</th>
                  <th style="padding: 0.75rem;">Base BoQ Total</th>
                  <th style="padding: 0.75rem;">GST (18%)</th>
                  <th style="padding: 0.75rem;">Total Landed Cost</th>
                  <th style="padding: 0.75rem;">Commercial Ranking</th>
                </tr>
              </thead>
              <tbody>
                ${data.bidders_commercial_table
                  .map(
                    (b) => `
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.85rem;">
                    <td style="padding: 0.85rem;">
                      <div style="font-weight: 600; color: #fff;">${b.bidder_name}</div>
                      <div style="font-family: var(--font-mono); font-size: 0.72rem; color: #94a3b8;">${b.bidder_id}</div>
                    </td>
                    <td style="padding: 0.85rem;">
                      <span class="badge ${b.technical_status === 'FULLY_COMPLIANT_VERIFIED' ? 'badge-low' : b.technical_status.includes('QUALIFIED') ? 'badge-med' : 'badge-danger'}" style="font-size: 0.7rem;">
                        ${b.technical_status}
                      </span>
                    </td>
                    <td style="padding: 0.85rem;">
                      <div style="color: #cbd5e1;">${b.supplier_class}</div>
                      <div style="font-family: var(--font-mono); font-size: 0.72rem; color: ${b.local_content_percent >= 50 ? '#86efac' : '#fca5a5'};">
                        Local Content: ${b.local_content_percent}%
                      </div>
                      <button class="btn-inspect-hsn btn btn-secondary btn-xs ghost-border" data-bidder="${b.bidder_id}" style="font-size: 0.68rem; margin-top: 4px; padding: 2px 6px; color: #38bdf8; display: inline-flex; align-items: center; gap: 4px;">
                        <span class="material-symbols-outlined" style="font-size: 13px;">view_in_ar</span>
                        Inspect HSN &amp; Customs BoM
                      </button>
                    </td>
                    <td style="padding: 0.85rem; font-family: var(--font-mono);">
                      ${b.subtotal_base_cr > 0 ? `₹${b.subtotal_base_cr.toFixed(2)} Cr` : '<span style="color: #64748b;">UNOPENED</span>'}
                    </td>
                    <td style="padding: 0.85rem; font-family: var(--font-mono);">
                      ${b.gst_amount_cr > 0 ? `₹${b.gst_amount_cr.toFixed(3)} Cr` : '<span style="color: #64748b;">UNOPENED</span>'}
                    </td>
                    <td style="padding: 0.85rem; font-family: var(--font-mono); font-weight: 700; color: ${b.total_landed_cost_cr > 0 ? '#fff' : '#64748b'};">
                      ${b.total_landed_cost_cr > 0 ? `₹${b.total_landed_cost_cr.toFixed(3)} Cr` : 'DISQUALIFIED'}
                    </td>
                    <td style="padding: 0.85rem;">
                      ${
                        b.bidder_id === 'BID-XYZ-002'
                          ? `<span class="badge badge-info">RAW L1</span>`
                          : b.bidder_id === 'BID-PQR-003'
                          ? `<span class="badge badge-real" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff;">AWARDED (L1 MATCH)</span>`
                          : `<span class="badge badge-danger">ENVELOPE RETURNED</span>`
                      }
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Bill of Quantities (BoQ) Technical Spec Grid -->
        <div class="card">
          <h3 style="font-family: 'Geist', var(--font-display); font-size: 1.15rem; color: #fff; margin-bottom: 0.75rem;">
            Scheduled Bill of Quantities (BoQ) · Schedule of Rates
          </h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
            ${data.boq_items
              .map(
                (item) => `
              <div class="glass-panel ghost-border rounded-lg" style="padding: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                  <span class="badge badge-info" style="font-family: var(--font-mono); font-size: 0.7rem;">Item ${item.item_no}</span>
                  <span style="font-family: var(--font-mono); font-size: 0.75rem; color: #86efac; font-weight: 600;">Qty: ${item.quantity} ${item.uom}</span>
                </div>
                <div style="font-size: 0.85rem; color: #fff; font-weight: 500;">
                  ${item.description}
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;

      // Price match click handler
      content.querySelector('#btn-invoke-price-match')?.addEventListener('click', async () => {
        try {
          showToast('Invoking DPIIT PPO-MII Class-I Price Matching...', 'info');
          const res = await api.matchCommercialPrice('BID-PQR-003');
          showToast(res.message, 'success');
          loadCommercialData(container);
        } catch (err) {
          showToast(`Price match failed: ${err.message}`, 'error');
        }
      });

      // Inspect HSN & Customs BoM click handlers
      content.querySelectorAll('.btn-inspect-hsn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const bidderId = e.currentTarget.getAttribute('data-bidder');
          if (bidderId) renderHsnDeconstructionModal(bidderId);
        });
      });
    })
    .catch((err) => {
      if (loader) loader.innerHTML = `<div style="color: #fca5a5;">Failed to load commercial evaluation: ${err.message}</div>`;
    });
}

/**
 * Renders DPIIT PPO-MII HSN & ICEGATE Customs Deconstruction Modal
 */
export async function renderHsnDeconstructionModal(bidderId = 'BID-XYZ-002') {
  const existing = document.getElementById('hsn-modal-root');
  if (existing) existing.remove();

  let data = null;
  try {
    showToast('Cross-checking ICEGATE customs ledgers...', 'info');
    data = await api.getHsnDeconstruction(bidderId);
  } catch (err) {
    showToast(`Failed to load HSN deconstruction: ${err.message}`, 'error');
    return;
  }

  const modalRoot = document.createElement('div');
  modalRoot.id = 'hsn-modal-root';
  modalRoot.className = 'modal-backdrop active';
  modalRoot.style.display = 'flex';
  modalRoot.style.alignItems = 'center';
  modalRoot.style.justifyContent = 'center';
  modalRoot.style.zIndex = '9999';

  modalRoot.innerHTML = `
    <div class="modal-dialog glass-panel ghost-border" style="max-width: 860px; width: 94%; max-height: 90vh; display: flex; flex-direction: column; border-radius: 8px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8); animation: fadeIn 0.2s ease-out;">
      <!-- Header -->
      <div style="background: #111420; padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; display: flex; align-items: center; justify-content: center;">
            <span class="material-symbols-outlined" style="color: #38bdf8; font-size: 20px;">view_in_ar</span>
          </div>
          <div>
            <h3 style="font-family: 'Geist', var(--font-display); font-size: 1.15rem; color: #fff; font-weight: 700;">
              DPIIT PPO-MII Local Content &amp; Customs BoM Deconstruction
            </h3>
            <div style="font-family: var(--font-mono); font-size: 0.72rem; color: #94a3b8;">
              Order P-45021/2/2017-PP (BE-II) · ICEGATE / DGFT Indian Customs Reconciliation
            </div>
          </div>
        </div>
        <button id="btn-close-hsn-modal" class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem;">✕</button>
      </div>

      <!-- Body -->
      <div style="padding: 1.5rem; overflow-y: auto; background: #0c0e15; color: #e2e8f0; font-family: 'Inter', sans-serif;">
        <!-- Entity Summary -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.25rem;">
          <div class="glass-panel ghost-border rounded-lg" style="padding: 1rem;">
            <div style="font-family: var(--font-mono); font-size: 0.7rem; color: #94a3b8;">Target Bidder</div>
            <div style="font-weight: 700; color: #fff; font-size: 0.95rem; margin-top: 0.2rem;">${data.bidder_name}</div>
            <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--accent-gold-bright);">${data.bidder_id}</div>
          </div>

          <div class="glass-panel ghost-border rounded-lg" style="padding: 1rem;">
            <div style="font-family: var(--font-mono); font-size: 0.7rem; color: #94a3b8;">Declared Local Content</div>
            <div style="font-size: 1.2rem; font-weight: 700; color: #cbd5e1; margin-top: 0.2rem;">
              ${data.declared_local_content_percent}%
            </div>
            <div style="font-size: 0.72rem; color: #94a3b8;">${data.declared_supplier_class}</div>
          </div>

          <div class="glass-panel ghost-border rounded-lg ${data.purchase_preference_eligible ? 'glow-emerald' : 'glow-red'}" style="padding: 1rem; background: ${data.purchase_preference_eligible ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)'};">
            <div style="font-family: var(--font-mono); font-size: 0.7rem; color: ${data.purchase_preference_eligible ? '#86efac' : '#fca5a5'};">Verified Domestic Value Addition</div>
            <div style="font-size: 1.2rem; font-weight: 700; color: ${data.purchase_preference_eligible ? '#86efac' : '#ef4444'}; margin-top: 0.2rem;">
              ${data.verified_local_content_percent}%
            </div>
            <div style="font-size: 0.72rem; font-weight: 600; color: #fff;">${data.verified_supplier_class}</div>
          </div>
        </div>

        <!-- Audit Finding Callout -->
        <div style="background: rgba(0,0,0,0.4); border-left: 3px solid ${data.purchase_preference_eligible ? '#10b981' : '#ef4444'}; padding: 0.85rem 1rem; border-radius: 4px; margin-bottom: 1.25rem;">
          <div style="font-family: var(--font-mono); font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">
            Customs Forensics Determination
          </div>
          <div style="font-size: 0.85rem; color: #fff; margin-top: 0.25rem; line-height: 1.5;">
            ${data.audit_finding}
          </div>
        </div>

        <!-- Bill of Materials Table -->
        <h4 style="font-family: 'Geist', var(--font-display); font-size: 0.95rem; color: #fff; margin-bottom: 0.75rem;">
          Itemized Sub-Assembly Deconstruction &amp; Customs Reconciliation
        </h4>
        <div style="border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; overflow: hidden; margin-bottom: 1.25rem;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.78rem;">
            <thead>
              <tr style="background: #191c28; color: #94a3b8; font-family: var(--font-mono); text-align: left;">
                <th style="padding: 0.6rem 0.75rem;">Sub-Assembly</th>
                <th style="padding: 0.6rem 0.75rem;">HSN Code</th>
                <th style="padding: 0.6rem 0.75rem;">Claimed Origin</th>
                <th style="padding: 0.6rem 0.75rem;">Imported (CIF)</th>
                <th style="padding: 0.6rem 0.75rem;">Domestic VA</th>
                <th style="padding: 0.6rem 0.75rem;">Customs Status</th>
              </tr>
            </thead>
            <tbody>
              ${(data.bom_deconstruction || [])
                .map(
                  (item, idx) => `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); background: ${idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'};">
                  <td style="padding: 0.65rem 0.75rem; color: #fff; font-weight: 500;">
                    ${item.sub_assembly}
                    <div style="font-family: var(--font-mono); font-size: 0.68rem; color: #94a3b8; margin-top: 2px;">
                      ${item.customs_evidence}
                    </div>
                  </td>
                  <td style="padding: 0.65rem 0.75rem; font-family: var(--font-mono); color: var(--accent-gold-bright);">
                    ${item.hsn_code}
                  </td>
                  <td style="padding: 0.65rem 0.75rem; color: #cbd5e1;">
                    ${item.claimed_origin}
                  </td>
                  <td style="padding: 0.65rem 0.75rem; font-family: var(--font-mono); color: ${item.verified_imported_cif_cr > 0 ? '#fca5a5' : '#86efac'};">
                    ₹${item.verified_imported_cif_cr.toFixed(2)} Cr
                  </td>
                  <td style="padding: 0.65rem 0.75rem; font-family: var(--font-mono); color: #86efac; font-weight: 600;">
                    ₹${item.verified_domestic_va_cr.toFixed(2)} Cr
                  </td>
                  <td style="padding: 0.65rem 0.75rem;">
                    <span class="badge ${item.customs_verification_status === 'VERIFIED_DOMESTIC' ? 'badge-low' : item.customs_verification_status.includes('PARTIAL') ? 'badge-med' : 'badge-danger'}" style="font-size: 0.65rem;">
                      ${item.customs_verification_status}
                    </span>
                  </td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <!-- Totals & Statutory Margin -->
        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 0.75rem 1rem; border-radius: 6px; font-family: var(--font-mono); font-size: 0.8rem;">
          <div>
            Total Base Quoted: <strong>₹${data.total_quoted_cost_cr.toFixed(2)} Cr</strong> | 
            Net Imported CIF: <span style="color: #fca5a5;">₹${data.total_imported_cif_cr.toFixed(2)} Cr</span> | 
            Net Domestic VA: <span style="color: #86efac;">₹${data.total_domestic_va_cr.toFixed(2)} Cr</span>
          </div>
          <span class="badge ${data.purchase_preference_eligible ? 'badge-low' : 'badge-danger'}">
            ${data.dpiit_ruling}
          </span>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #111420; padding: 0.85rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: flex-end;">
        <button id="btn-close-hsn-modal-ft" class="btn btn-secondary btn-sm">Close Inspector</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalRoot);

  const closeModal = () => modalRoot.remove();
  modalRoot.querySelector('#btn-close-hsn-modal')?.addEventListener('click', closeModal);
  modalRoot.querySelector('#btn-close-hsn-modal-ft')?.addEventListener('click', closeModal);
}

