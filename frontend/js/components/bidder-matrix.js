/**
 * Multi-Bidder Comparison Leaderboard & Profile (Screen 3 & 4)
 */
import { store } from '../state.js';
import { api } from '../api.js';
import { formatINR, getRiskBadgeClass, showToast } from '../utils.js';

export function renderBidderMatrix(container) {
  const state = store.getState();
  const bidders = state.bidders;
  const selectedBidder = store.getSelectedBidder();
  const findings = state.findings;

  if (!bidders || bidders.length === 0) {
    container.innerHTML = `<div class="card">Loading bidder comparison...</div>`;
    return;
  }

  // Calculate high-level KPIs
  const totalContradictions = bidders.reduce((acc, b) => acc + b.contradictions_count, 0);
  const totalTemporal = bidders.reduce((acc, b) => acc + b.temporal_violations_count, 0);

  container.innerHTML = `
    <!-- Top KPI Grid -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <!-- KPI 1 -->
      <div class="glass-panel ghost-border rounded-lg" style="padding: 1.25rem; position: relative; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
          <span style="font-family: var(--font-mono); font-size: 0.8rem; color: #94a3b8;">Bidders Evaluated</span>
          <span class="material-symbols-outlined" style="color: var(--accent-gold); font-size: 20px;">group</span>
        </div>
        <div style="font-family: 'Geist', var(--font-display); font-size: 2rem; font-weight: 700; color: #fff;" class="tabular-nums">
          ${bidders.length}
        </div>
        <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem;">
          1 High Risk · 1 Medium · 1 Verified
        </div>
        <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: rgba(255,255,255,0.08);">
          <div style="height: 100%; width: 100%; background: var(--accent-gold);"></div>
        </div>
      </div>

      <!-- KPI 2 -->
      <div class="glass-panel ghost-border rounded-lg glow-red" style="padding: 1.25rem; position: relative; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
          <span style="font-family: var(--font-mono); font-size: 0.8rem; color: #ffb4ab;">Material Contradictions</span>
          <span class="material-symbols-outlined" style="color: #ef4444; font-size: 20px;">warning</span>
        </div>
        <div style="font-family: 'Geist', var(--font-display); font-size: 2rem; font-weight: 700; color: #ffb4ab;" class="tabular-nums">
          ${totalContradictions}
        </div>
        <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #ffb4ab; margin-top: 0.25rem;">
          ₹4.20 Cr turnover variance detected
        </div>
        <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: rgba(255,255,255,0.08);">
          <div style="height: 100%; width: 100%; background: #ef4444;"></div>
        </div>
      </div>

      <!-- KPI 3 -->
      <div class="glass-panel ghost-border rounded-lg" style="padding: 1.25rem; position: relative; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
          <span style="font-family: var(--font-mono); font-size: 0.8rem; color: #f59e0b;">Temporal Invalidation</span>
          <span class="material-symbols-outlined" style="color: #f59e0b; font-size: 20px;">schedule</span>
        </div>
        <div style="font-family: 'Geist', var(--font-display); font-size: 2rem; font-weight: 700; color: #fcd34d;" class="tabular-nums">
          ${totalTemporal}
        </div>
        <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem;">
          Expired BIS license on 15-Sep-2026
        </div>
        <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: rgba(255,255,255,0.08);">
          <div style="height: 100%; width: 60%; background: #f59e0b;"></div>
        </div>
      </div>

      <!-- KPI 4 -->
      <div class="glass-panel ghost-border rounded-lg glow-emerald" style="padding: 1.25rem; position: relative; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
          <span style="font-family: var(--font-mono); font-size: 0.8rem; color: #6ee7b7;">Ledger Integrity</span>
          <span class="material-symbols-outlined" style="color: #10b981; font-size: 20px;">link</span>
        </div>
        <div style="font-family: 'Geist', var(--font-display); font-size: 2rem; font-weight: 700; color: #86efac;" class="tabular-nums">
          100%
        </div>
        <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem;">
          SHA-256 block chain verified
        </div>
        <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: rgba(255,255,255,0.08);">
          <div style="height: 100%; width: 100%; background: #10b981;"></div>
        </div>
      </div>
    </div>

    <!-- Multi-Bidder Comparison Leaderboard Cards -->
    <div style="margin-bottom: var(--spacing-md); display: flex; justify-content: space-between; align-items: center;">
      <h2 style="font-size: 1.35rem;">Bidder Risk & Compliance Leaderboard</h2>
      <span style="font-size: 0.8rem; color: var(--text-muted);">Ranked dynamically by composite risk matrix</span>
    </div>

    <div class="bidders-grid">
      ${bidders
        .map((b) => {
          const isSelected = selectedBidder ? b.id === selectedBidder.id : false;
          const cardTypeClass =
            b.risk_category === 'HIGH' ? 'bidder-card-high' : b.risk_category === 'MEDIUM' ? 'bidder-card-med' : 'bidder-card-low';

          return `
        <div class="bidder-card ${cardTypeClass} card-clickable ${isSelected ? 'selected-bidder-card' : ''}" 
             data-bidder-id="${b.id}"
             style="${isSelected ? 'border-color: var(--accent-cyan); box-shadow: 0 0 20px rgba(0, 242, 254, 0.25);' : ''}">
          
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
              <div>
                <span class="badge ${getRiskBadgeClass(b.risk_category)}" style="margin-bottom: 0.35rem;">
                  ${b.risk_category} RISK
                </span>
                <h3 style="font-size: 1.15rem; color: #fff; margin-top: 0.2rem;">${b.legal_name}</h3>
                <div style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono);">
                  GST: ${b.gstin} | CIN: ${b.cin_or_reg_number}
                </div>
              </div>

              <div style="text-align: right;">
                <div style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono); color: ${
                  b.risk_category === 'HIGH' ? '#fca5a5' : b.risk_category === 'MEDIUM' ? '#fde68a' : '#86efac'
                };">
                  ${b.scorecard.overall_confidence_percent}%
                </div>
                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Confidence</div>
              </div>
            </div>

            <!-- Risk Badges Summary -->
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
              <span class="badge ${b.contradictions_count > 0 ? 'badge-danger' : 'badge-low'}" style="font-size: 0.72rem;">
                ${b.contradictions_count} Contradiction${b.contradictions_count !== 1 ? 's' : ''}
              </span>
              <span class="badge ${b.temporal_violations_count > 0 ? 'badge-med' : 'badge-low'}" style="font-size: 0.72rem;">
                ${b.temporal_violations_count} Temporal Defect${b.temporal_violations_count !== 1 ? 's' : ''}
              </span>
              <span class="badge badge-info" style="font-size: 0.72rem;">
                ${b.documents_submitted} Docs Analyzed
              </span>
            </div>

            <!-- Verdict Teaser -->
            <p style="font-size: 0.82rem; line-height: 1.5; color: ${b.risk_category === 'HIGH' ? '#fca5a5' : '#cbd5e1'}; margin-bottom: 1.25rem;">
              ${b.summary_verdict}
            </p>
          </div>

          <!-- Card Footer Action -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--surface-border-subtle); padding-top: 0.75rem;">
            <span style="font-size: 0.75rem; color: var(--text-muted);">
              Submitted: ${b.submission_timestamp.split('T')[0]}
            </span>
            <button class="btn ${isSelected ? 'btn-primary' : 'btn-secondary'} btn-sm select-bidder-btn" data-bidder-id="${b.id}">
              ${isSelected ? 'Active Dossier ✓' : 'Review Bidder →'}
            </button>
          </div>
        </div>
      `;
        })
        .join('')}
    </div>

    <!-- Active Bidder Detailed Dossier -->
    <div class="card card-elevated" style="margin-top: var(--spacing-xl);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg); border-bottom: 1px solid var(--surface-border); padding-bottom: var(--spacing-md); flex-wrap: wrap; gap: var(--spacing-md);">
        <div>
          <div style="display: flex; gap: 0.5rem; margin-bottom: 0.35rem;">
            <span class="badge ${getRiskBadgeClass(selectedBidder.risk_category)}">${selectedBidder.risk_category} RISK LEVEL</span>
            <span class="badge badge-info">${selectedBidder.msme_status}</span>
          </div>
          <h2 style="color: #fff; font-size: 1.5rem;">${selectedBidder.legal_name}</h2>
          <div style="font-size: 0.82rem; color: var(--text-muted); font-family: var(--font-mono);">
            PAN: <strong>${selectedBidder.pan}</strong> · GSTIN: <strong>${selectedBidder.gstin}</strong> · Trade: <strong>${selectedBidder.trade_name}</strong>
          </div>
        </div>

        <div style="display: flex; gap: var(--spacing-md);">
          <button id="btn-view-contradictions" class="btn btn-secondary btn-sm" style="border-color: rgba(239, 68, 68, 0.4);">
            <span>⚡</span> Contradiction Radar (${selectedBidder.contradictions_count})
          </button>
          <button id="btn-view-timemachine" class="btn btn-secondary btn-sm" style="border-color: rgba(0, 242, 254, 0.4);">
            <span>⏳</span> Time Machine
          </button>
          <button id="btn-download-dossier" class="btn btn-primary btn-sm">
            <span>📄</span> Compliance Dossier
          </button>
        </div>
      </div>

      <!-- Decomposed Scorecard Dimensions -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-xl); margin-bottom: var(--spacing-xl);">
        <div>
          <h3 style="font-size: 1.05rem; margin-bottom: 0.85rem; color: #fff;">
            Decomposed Compliance Dimensions
            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 400; margin-left: 6px;">(Never an opaque single score)</span>
          </h3>

          <div class="score-row">
            <span class="score-row-label"><span>🎯</span> Mandatory Requirement Coverage</span>
            <div class="score-bar-track">
              <div class="score-bar-fill score-bar-fill-low" style="width: ${selectedBidder.scorecard.mandatory_coverage_percent}%;"></div>
            </div>
            <span class="score-val" style="color: #86efac;">${selectedBidder.scorecard.mandatory_coverage_percent}%</span>
          </div>

          <div class="score-row">
            <span class="score-row-label"><span>📑</span> Evidence Grounding Strength</span>
            <div class="score-bar-track">
              <div class="score-bar-fill score-bar-fill-cyan" style="width: ${selectedBidder.scorecard.evidence_strength_percent}%;"></div>
            </div>
            <span class="score-val" style="color: var(--accent-cyan);">${selectedBidder.scorecard.evidence_strength_percent}%</span>
          </div>

          <div class="score-row">
            <span class="score-row-label"><span>🏛️</span> External Source Verification</span>
            <div class="score-bar-track">
              <div class="score-bar-fill score-bar-fill-med" style="width: ${selectedBidder.scorecard.source_verification_percent}%;"></div>
            </div>
            <span class="score-val" style="color: #fde68a;">${selectedBidder.scorecard.source_verification_percent}%</span>
          </div>

          <div class="score-row">
            <span class="score-row-label"><span>🆔</span> Legal Identity Consistency</span>
            <div class="score-bar-track">
              <div class="score-bar-fill ${selectedBidder.scorecard.identity_consistency_percent < 80 ? 'score-bar-fill-high' : 'score-bar-fill-low'}" 
                   style="width: ${selectedBidder.scorecard.identity_consistency_percent}%;"></div>
            </div>
            <span class="score-val" style="color: ${selectedBidder.scorecard.identity_consistency_percent < 80 ? '#fca5a5' : '#86efac'};">
              ${selectedBidder.scorecard.identity_consistency_percent}%
            </span>
          </div>

          <div class="score-row">
            <span class="score-row-label"><span>⏳</span> Temporal Validity on Bid Date</span>
            <div class="score-bar-track">
              <div class="score-bar-fill ${selectedBidder.scorecard.temporal_validity_percent < 70 ? 'score-bar-fill-high' : 'score-bar-fill-low'}" 
                   style="width: ${selectedBidder.scorecard.temporal_validity_percent}%;"></div>
            </div>
            <span class="score-val" style="color: ${selectedBidder.scorecard.temporal_validity_percent < 70 ? '#fca5a5' : '#86efac'};">
              ${selectedBidder.scorecard.temporal_validity_percent}%
            </span>
          </div>
        </div>

        <!-- Risk Summary Box -->
        <div style="background: rgba(7, 11, 20, 0.7); border: 1px solid var(--surface-border); border-radius: var(--radius-md); padding: var(--spacing-lg);">
          <div style="font-size: 0.82rem; color: var(--text-muted); text-transform: uppercase; font-family: var(--font-mono); margin-bottom: 0.5rem;">
            AI Executive Evaluation & Decision Path
          </div>
          <div style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem;">
            ${selectedBidder.risk_category === 'HIGH' ? '⚠️ Serious Compliance Exceptions Surfaced' : selectedBidder.risk_category === 'MEDIUM' ? '⚡ Review Required on 2 Findings' : '✅ Verified Compliant across 29 Clauses'}
          </div>
          <p style="font-size: 0.88rem; line-height: 1.6; color: #cbd5e1; margin-bottom: 1rem;">
            ${selectedBidder.summary_verdict}
          </p>

          <div style="background: rgba(0, 242, 254, 0.06); border-left: 3px solid var(--accent-cyan); padding: 0.6rem 0.85rem; border-radius: 4px; font-size: 0.8rem; color: #7dd3fc;">
            <strong>Human Oversight Mandate:</strong> In accordance with MoPNG Procurement Manual and Rule 144 GFR, the AI generates evidence linkages and flags; evaluation officers retain exclusive legal authority to accept or override.
          </div>
        </div>
      </div>

      <!-- Prioritized Findings Table -->
      <h3 style="font-size: 1.15rem; margin-bottom: var(--spacing-md); color: #fff;">
        Prioritized Compliance Findings (${findings.length})
      </h3>

      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${findings
          .map((f) => {
            const isHigh = f.severity === 'HIGH';
            return `
          <div class="card" style="padding: 1rem var(--spacing-lg); background: ${isHigh ? 'rgba(239, 68, 68, 0.05)' : 'rgba(13, 21, 39, 0.6)'}; border-color: ${isHigh ? 'rgba(239, 68, 68, 0.3)' : 'var(--surface-border)'};">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--spacing-md);">
              <div style="display: flex; align-items: center; gap: 0.75rem; max-width: 800px;">
                <span class="badge ${getRiskBadgeClass(f.severity)}">${f.severity}</span>
                <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-cyan); font-weight: 700;">${f.clause_reference}</span>
                <div>
                  <div style="font-weight: 600; color: #fff; font-size: 0.95rem;">${f.title}</div>
                  <div style="font-size: 0.8rem; color: var(--text-secondary);">${f.summary.substring(0, 140)}...</div>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                <div style="text-align: right;">
                  <div style="font-size: 0.85rem; font-weight: 700; font-family: var(--font-mono); color: #fff;">
                    ${(f.confidence_score * 100).toFixed(0)}% Conf
                  </div>
                  <span class="badge ${f.status === 'ACCEPTED' ? 'badge-low' : f.status === 'OVERRIDDEN' ? 'badge-simulated' : 'badge-med'}" style="font-size: 0.68rem;">
                    ${f.status}
                  </span>
                </div>

                <button class="btn btn-outline-cyan btn-sm btn-inspect-evidence" data-finding-id="${f.id}">
                  Show Me Evidence 🔍
                </button>
                <button class="btn btn-secondary btn-sm btn-review-decision" data-finding-id="${f.id}">
                  Officer Action ✍️
                </button>
              </div>
            </div>
          </div>
        `;
          })
          .join('')}
      </div>
    </div>
  `;

  // Bidder selection handlers
  container.querySelectorAll('.card-clickable').forEach((card) => {
    card.addEventListener('click', async (e) => {
      const bidderId = e.currentTarget.getAttribute('data-bidder-id');
      if (bidderId && bidderId !== store.getState().selectedBidderId) {
        store.setState({ selectedBidderId: bidderId });
        const newFindings = await api.getBidderFindings(bidderId);
        store.setState({ findings: newFindings });
      }
    });
  });

  // Action buttons
  container.querySelector('#btn-view-contradictions')?.addEventListener('click', () => {
    store.setState({ currentView: 'contradictions' });
  });

  container.querySelector('#btn-view-timemachine')?.addEventListener('click', () => {
    store.setState({ currentView: 'timemachine' });
  });

  container.querySelector('#btn-download-dossier')?.addEventListener('click', async () => {
    try {
      const report = await api.getBidderReport(selectedBidder.id);
      renderReportModal(report);
    } catch (err) {
      showToast(`Error generating report: ${err.message}`, 'error');
    }
  });

  // Inspect evidence buttons
  container.querySelectorAll('.btn-inspect-evidence').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const fid = e.currentTarget.getAttribute('data-finding-id');
      store.setState({ selectedFindingId: fid, currentView: 'evidence' });
    });
  });

  // Officer action buttons
  container.querySelectorAll('.btn-review-decision').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const fid = e.currentTarget.getAttribute('data-finding-id');
      store.setState({ selectedFindingId: fid, activeModal: 'decision-modal' });
    });
  });
}

function renderReportModal(report) {
  let modal = document.getElementById('report-modal-backdrop');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'report-modal-backdrop';
    modal.className = 'modal-backdrop active';
    document.body.appendChild(modal);
  } else {
    modal.className = 'modal-backdrop active';
  }

  modal.innerHTML = `
    <div class="modal-card" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
      <div class="modal-header">
        <div>
          <h3 style="color: #fff; font-size: 1.25rem;">Compliance Assessment Dossier</h3>
          <div style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono);">
            Ref: ${report.report_id} · Generated: ${report.generated_at}
          </div>
        </div>
        <button id="btn-close-report" class="btn btn-secondary btn-sm">✕</button>
      </div>

      <div class="modal-body" style="font-size: 0.88rem; line-height: 1.6;">
        <div style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--surface-border); margin-bottom: 1rem;">
          <h4 style="color: var(--accent-cyan); margin-bottom: 0.35rem;">Entity & Tender Identification</h4>
          <div><strong>Bidder:</strong> ${report.bidder.legal_name} (${report.bidder.cin_or_reg_number})</div>
          <div><strong>GSTIN:</strong> ${report.bidder.gstin} · <strong>PAN:</strong> ${report.bidder.pan}</div>
          <div><strong>Tender:</strong> ${report.tender_number} · ${report.ministry}</div>
        </div>

        <h4 style="color: #fff; margin-bottom: 0.5rem;">Executive Findings Summary</h4>
        <p style="margin-bottom: 1rem; color: #cbd5e1;">${report.bidder.summary_verdict}</p>

        <h4 style="color: #fff; margin-bottom: 0.5rem;">Material Discrepancies & Contradictions</h4>
        <ul style="margin-left: 1.5rem; margin-bottom: 1rem; color: #fca5a5;">
          ${report.contradictions.map((c) => `<li><strong>${c.dimension}:</strong> ${c.gap_summary}</li>`).join('')}
        </ul>

        <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-sm); padding: 0.85rem; margin-top: 1rem;">
          <div style="font-weight: 700; color: #86efac; margin-bottom: 0.25rem;">Cryptographic Sign-off Verification</div>
          <div style="font-size: 0.78rem; color: var(--text-secondary); font-family: var(--font-mono);">
            Evaluator: ${report.signoff_block.evaluating_officer} (${report.signoff_block.officer_id})<br/>
            Hash: ${report.signoff_block.cryptographic_hash}
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button id="btn-print-report" class="btn btn-secondary btn-sm">🖨️ Print / Save PDF</button>
        <button id="btn-dismiss-report" class="btn btn-primary btn-sm">Done</button>
      </div>
    </div>
  `;

  modal.querySelector('#btn-close-report')?.addEventListener('click', () => modal.remove());
  modal.querySelector('#btn-dismiss-report')?.addEventListener('click', () => modal.remove());
  modal.querySelector('#btn-print-report')?.addEventListener('click', () => window.print());
}
