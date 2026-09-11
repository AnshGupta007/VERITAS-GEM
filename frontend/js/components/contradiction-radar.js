/**
 * Contradiction Radar Component (Screen 7 — Signature Killer Feature)
 */
import { store } from '../state.js';
import { api } from '../api.js';
import { getRiskBadgeClass } from '../utils.js';

export function renderContradictionRadar(container) {
  const state = store.getState();
  const selectedBidder = store.getSelectedBidder();
  const targetBidderId = selectedBidder?.id || state.selectedBidderId || 'BID-ABC-001';

  container.innerHTML = `
    <!-- Header Banner -->
    <div class="card card-elevated" style="margin-bottom: var(--spacing-xl); border-color: rgba(239, 68, 68, 0.4); box-shadow: var(--shadow-glow-danger);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--spacing-md);">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
            <span class="status-dot status-dot-danger"></span>
            <span class="badge badge-danger">SIGNATURE INNOVATION</span>
            <span class="badge badge-info">CROSS-DOCUMENT REASONING</span>
          </div>
          <h2 style="color: #fff; font-size: 1.6rem;">Contradiction Radar</h2>
          <p style="font-size: 0.9rem; color: #cbd5e1;">
            Detects conflicting claims across multiple PDFs submitted by the same bidder — 
            <strong style="color: #fca5a5;">an impossibility during manual document-by-document review.</strong>
          </p>
        </div>

        <div style="display: flex; gap: var(--spacing-md); align-items: center; flex-wrap: wrap;">
          <!-- Radar Mode Selector -->
          <div style="display: flex; background: rgba(0,0,0,0.5); padding: 3px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);">
            <button id="tab-mode-tender" class="tab-btn active" style="font-size: 0.75rem; padding: 4px 10px;">Current Tender Claims</button>
            <button id="tab-mode-cross-psu" class="tab-btn" style="font-size: 0.75rem; padding: 4px 10px; color: #38bdf8;">🌐 National Cross-PSU Memory</button>
          </div>

          <div class="tabs-container">
            <button class="tab-btn ${state.selectedBidderId === 'BID-ABC-001' ? 'active' : ''}" data-bidder="BID-ABC-001">ABC Industries (3)</button>
            <button class="tab-btn ${state.selectedBidderId === 'BID-XYZ-002' ? 'active' : ''}" data-bidder="BID-XYZ-002">XYZ Corp (1)</button>
            <button class="tab-btn ${state.selectedBidderId === 'BID-PQR-003' ? 'active' : ''}" data-bidder="BID-PQR-003">PQR Engg (0)</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Forensic Sonar Dish Display (Interactive Killer Visual) -->
    <div class="radar-dish-container hover-spring" style="margin-bottom: var(--spacing-xl); height: 210px; position: relative;">
      <!-- Telemetry Overlay -->
      <div style="position: absolute; top: 12px; left: 16px; z-index: 20; display: flex; align-items: center; gap: 8px;">
        <span class="status-dot status-dot-danger live-beacon"></span>
        <span style="font-family: var(--font-mono); font-size: 0.72rem; color: #ffb4ab; letter-spacing: 0.05em; font-weight: 700;">
          FORENSIC SONAR DISH · REAL-TIME ARTIFACT CROSS-EXAMINATION
        </span>
      </div>
      <div style="position: absolute; top: 12px; right: 16px; z-index: 20; font-family: var(--font-mono); font-size: 0.72rem; color: var(--accent-cyan); display: flex; align-items: center; gap: 6px;">
        <span class="material-symbols-outlined" style="font-size: 14px;">sensors</span>
        <span>SWEEP: 360° · AZIMUTH: ACTIVE · 2.4 GHz</span>
      </div>

      <!-- Sonar Concentric Distance Rings -->
      <div class="radar-sonar-ring" style="width: 60px; height: 60px; border-color: rgba(0, 241, 254, 0.12);"></div>
      <div class="radar-sonar-ring" style="width: 120px; height: 120px; border-color: rgba(0, 241, 254, 0.18);"></div>
      <div class="radar-sonar-ring" style="width: 180px; height: 180px; border-color: rgba(0, 241, 254, 0.25);"></div>
      
      <!-- Axis Crosshairs -->
      <div class="radar-grid-axis" style="top: 50%; left: 0; right: 0; height: 1px;"></div>
      <div class="radar-grid-axis" style="left: 50%; top: 0; bottom: 0; width: 1px;"></div>

      <!-- Rotating Sweep Beam -->
      <div class="${targetBidderId === 'BID-PQR-003' ? 'radar-sweep-beam' : 'radar-sweep-beam-danger'}"></div>

      <!-- Dynamic Blip Markers -->
      <div id="radar-blips-mount" style="position: absolute; inset: 0; pointer-events: auto; z-index: 15;">
        ${targetBidderId === 'BID-ABC-001' ? `
          <!-- Blip 1: Turnover Discrepancy -->
          <div class="radar-blip-node" style="left: 68%; top: 35%; background: #ef4444; box-shadow: 0 0 14px #ef4444; animation: radarBlip 2s infinite;" title="Turnover Conflict: ₹4.20 Cr Discrepancy">
            <span style="position: absolute; top: -20px; left: 14px; font-family: var(--font-mono); font-size: 10px; color: #ffb4ab; white-space: nowrap; font-weight: 700; text-shadow: 0 0 8px rgba(0,0,0,0.9);">
              ₹4.20 Cr Turnover Discrepancy ⚡
            </span>
          </div>
          <!-- Blip 2: Expired BIS License -->
          <div class="radar-blip-node" style="left: 38%; top: 65%; background: #f59e0b; box-shadow: 0 0 14px #f59e0b; animation: radarBlip 2.4s infinite;" title="Temporal Invalidation: Expired BIS License">
            <span style="position: absolute; top: -18px; left: 14px; font-family: var(--font-mono); font-size: 10px; color: #fde68a; white-space: nowrap; font-weight: 700; text-shadow: 0 0 8px rgba(0,0,0,0.9);">
              Expired BIS License (98d) ⚠️
            </span>
          </div>
          <!-- Blip 3: Shell Entity Risk -->
          <div class="radar-blip-node" style="left: 58%; top: 72%; background: #ef4444; box-shadow: 0 0 14px #ef4444; animation: radarBlip 1.8s infinite;" title="EPFO Anomaly: 4 Staff Reported">
            <span style="position: absolute; top: -18px; left: 14px; font-family: var(--font-mono); font-size: 10px; color: #ffb4ab; white-space: nowrap; font-weight: 700; text-shadow: 0 0 8px rgba(0,0,0,0.9);">
              EPFO Headcount Anomaly 🚨
            </span>
          </div>
        ` : targetBidderId === 'BID-XYZ-002' ? `
          <!-- Blip: Local Content Discrepancy -->
          <div class="radar-blip-node" style="left: 64%; top: 40%; background: #f59e0b; box-shadow: 0 0 14px #f59e0b; animation: radarBlip 2.2s infinite;" title="Local Content: 62.4% declared vs 48% verified">
            <span style="position: absolute; top: -18px; left: 14px; font-family: var(--font-mono); font-size: 10px; color: #fde68a; white-space: nowrap; font-weight: 700; text-shadow: 0 0 8px rgba(0,0,0,0.9);">
              Local Content Discrepancy (14.4%) ⚠️
            </span>
          </div>
        ` : `
          <!-- Clean Compliant Scan -->
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; z-index: 15;">
            <span class="badge badge-low glow-emerald glow-breathe-emerald" style="font-size: 0.8rem; padding: 0.4rem 1rem;">
              <span class="material-symbols-outlined" style="font-size: 16px;">verified</span>
              100% CLEAR RADAR · ZERO CONTRADICTIONS
            </span>
          </div>
        `}
      </div>
    </div>

    <!-- Contradictions Container -->
    <div id="contradictions-grid" class="contradiction-list">
      <div class="card" style="text-align: center; padding: 2rem;">Loading contradiction graph...</div>
    </div>
  `;

  let activeMode = 'tender';

  // Mode toggles
  const btnTender = container.querySelector('#tab-mode-tender');
  const btnCrossPsu = container.querySelector('#tab-mode-cross-psu');

  btnTender?.addEventListener('click', () => {
    activeMode = 'tender';
    btnTender.className = 'tab-btn active';
    btnCrossPsu.className = 'tab-btn';
    loadContent();
  });

  btnCrossPsu?.addEventListener('click', () => {
    activeMode = 'cross-psu';
    btnCrossPsu.className = 'tab-btn active';
    btnTender.className = 'tab-btn';
    loadContent();
  });

  // Bidder filter switch
  container.querySelectorAll('.tabs-container .tab-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const bid = e.currentTarget.getAttribute('data-bidder');
      store.setState({ selectedBidderId: bid });
      renderContradictionRadar(container);
    });
  });

  function loadContent() {
    if (activeMode === 'tender') {
      loadTenderContradictions();
    } else {
      loadCrossPsuMemory();
    }
  }

  function loadTenderContradictions() {
    const grid = container.querySelector('#contradictions-grid');
    if (!grid) return;
    grid.innerHTML = `<div class="card" style="text-align: center; padding: 2rem;">Loading current tender contradictions...</div>`;

    api
      .getContradictions(targetBidderId)
      .then((contradictions) => {
        if (contradictions.length === 0) {
          grid.innerHTML = `
            <div class="card hover-spring stagger-1 glow-emerald glow-breathe-emerald" style="text-align: center; padding: 3rem; grid-column: 1 / -1; border-color: rgba(16, 185, 129, 0.3);">
              <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">✅</div>
              <h3 style="color: #86efac; font-size: 1.25rem; margin-bottom: 0.5rem;">Zero Cross-Document Contradictions Detected</h3>
              <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto;">
                All financial, statutory, technical, and regulatory figures submitted by <strong>${selectedBidder?.legal_name || 'the vendor'}</strong> are mathematically and legally consistent across all submitted artifacts.
              </p>
            </div>
          `;
          return;
        }

        grid.innerHTML = contradictions
          .map((c, idx) => `
            <div class="contradiction-card hover-spring stagger-${(idx % 4) + 1} glow-red">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                <div>
                  <span class="badge ${getRiskBadgeClass(c.severity)}" style="margin-bottom: 0.35rem;">
                    ${c.severity} SEVERITY
                  </span>
                  <span class="badge badge-info" style="margin-left: 4px;">${c.dimension}</span>
                  <h3 style="font-size: 1.2rem; color: #fff; margin-top: 0.35rem;">${c.title}</h3>
                </div>
              </div>

              <!-- Visual Comparison Box -->
              <div style="background: rgba(0,0,0,0.4); border: 1px solid var(--surface-border); border-radius: var(--radius-md); padding: var(--spacing-md); margin-bottom: 1rem;">
                <div style="font-size: 0.75rem; color: #f87171; font-weight: 700; text-transform: uppercase; margin-bottom: 0.5rem; font-family: var(--font-mono);">
                  ⚡ Discrepancy Breakdown: ${c.gap_summary}
                </div>

                <!-- Side-by-Side Artifact Conflict -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                  <div style="background: rgba(13, 21, 39, 0.8); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius-sm); padding: 0.75rem;">
                    <div style="font-size: 0.7rem; color: var(--text-muted); display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                      <span>Document A</span>
                      <strong style="color: #fff;">Page ${c.doc_a.page_number}</strong>
                    </div>
                    <div style="font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.4rem;">${c.doc_a.document_name}</div>
                    <div style="background: rgba(16, 185, 129, 0.15); border-left: 2px solid #10b981; padding: 0.4rem 0.6rem; border-radius: 2px; font-size: 0.78rem; color: #86efac; font-family: var(--font-mono);">
                      "${c.doc_a.extracted_text}"
                    </div>
                  </div>

                  <div style="background: rgba(13, 21, 39, 0.8); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-sm); padding: 0.75rem;">
                    <div style="font-size: 0.7rem; color: #fca5a5; display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                      <span>Document B (Conflict)</span>
                      <strong style="color: #fff;">Page ${c.doc_b.page_number}</strong>
                    </div>
                    <div style="font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.4rem;">${c.doc_b.document_name}</div>
                    <div style="background: rgba(239, 68, 68, 0.15); border-left: 2px solid #ef4444; padding: 0.4rem 0.6rem; border-radius: 2px; font-size: 0.78rem; color: #fca5a5; font-family: var(--font-mono);">
                      "${c.doc_b.extracted_text}"
                    </div>
                  </div>
                </div>
              </div>

              <p style="font-size: 0.85rem; line-height: 1.6; color: #cbd5e1; margin-bottom: 0.85rem;">
                ${c.analysis_text}
              </p>

              <div style="background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; padding: 0.5rem 0.75rem; border-radius: 4px; font-size: 0.8rem; color: #fca5a5; margin-bottom: 1.25rem;">
                <strong>Legal / Procurement Consequence:</strong> ${c.impact}
              </div>

              <div style="display: flex; justify-content: flex-end; gap: var(--spacing-md); border-top: 1px solid var(--surface-border-subtle); padding-top: 0.75rem;">
                <button class="btn btn-outline-cyan btn-sm btn-inspect-contra" data-finding-id="${c.finding_id || ''}">
                  View in 3-Column Evidence Inspector 🔍
                </button>
              </div>
            </div>
          `).join('');

        grid.querySelectorAll('.btn-inspect-contra').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            const fid = e.currentTarget.getAttribute('data-finding-id');
            if (fid) store.setState({ selectedFindingId: fid, currentView: 'evidence' });
          });
        });
      })
      .catch((err) => {
        grid.innerHTML = `<div class="card" style="color: #fca5a5;">Failed to load tender contradictions: ${err.message}</div>`;
      });
  }

  function loadCrossPsuMemory() {
    const grid = container.querySelector('#contradictions-grid');
    if (!grid) return;
    grid.innerHTML = `<div class="card" style="text-align: center; padding: 2rem;">Querying National Cross-PSU Intelligence Ledger (ONGC · GAIL · IOCL · BHEL)...</div>`;

    api
      .getHistoricalProfile(targetBidderId)
      .then((profile) => {
        grid.innerHTML = `
          <!-- Inter-Agency Network Banner -->
          <div class="card card-elevated" style="grid-column: 1 / -1; border-color: rgba(56, 189, 248, 0.4); margin-bottom: 1rem; background: #0c101a;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                  <span class="badge badge-info">INTER-PSU INTELLIGENCE MEMORY</span>
                  <span class="badge ${profile.integrity_risk_index > 70 ? 'badge-danger' : 'badge-low'}">
                    INTEGRITY RISK INDEX: ${profile.integrity_risk_index}%
                  </span>
                </div>
                <h3 style="color: #fff; font-size: 1.3rem;">
                  ${profile.bidder_name} · Multi-Portal Intelligence Profile
                </h3>
                <div style="font-family: var(--font-mono); font-size: 0.78rem; color: #94a3b8; margin-top: 0.25rem;">
                  PAN: <span style="color: #fff;">${profile.pan}</span> | CIN: <span style="color: #fff;">${profile.cin}</span> | Lifetime PSU Tenders: <span style="color: var(--accent-gold-bright); font-weight: 700;">${profile.tenders_participated_count}</span>
                </div>
              </div>

              <!-- Connected PSU Badges -->
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <span class="badge badge-low" style="font-size: 0.72rem;">ONGC SAP R/3</span>
                <span class="badge badge-low" style="font-size: 0.72rem;">GAIL Oracle EBS</span>
                <span class="badge badge-low" style="font-size: 0.72rem;">IOCL SAP S/4HANA</span>
                <span class="badge badge-med" style="font-size: 0.72rem;">GeM Incidents Active</span>
              </div>
            </div>
          </div>

          <!-- Cross-Tender Contradiction Alerts -->
          <div style="grid-column: 1 / -1; margin-bottom: 1.5rem;">
            <h4 style="font-family: 'Geist', var(--font-display); font-size: 1.1rem; color: #ffb4ab; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
              <span class="material-symbols-outlined" style="color: #ef4444;">warning</span>
              Cross-Tender Material Contradictions Detected
            </h4>

            <div style="display: flex; flex-direction: column; gap: 1rem;">
              ${(profile.cross_tender_anomalies || []).map((anomaly) => `
                <div class="glass-panel ghost-border glow-red rounded-lg" style="padding: 1.25rem; background: rgba(239, 68, 68, 0.08); border-color: rgba(239, 68, 68, 0.3);">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <span class="badge badge-danger" style="font-size: 0.72rem;">
                      ${anomaly.type} · ${anomaly.severity}
                    </span>
                    <span class="badge badge-info" style="font-size: 0.7rem;">MULTI-PORTAL FRAUD ENGINE</span>
                  </div>
                  <div style="font-size: 0.9rem; color: #ffdad6; font-weight: 600; line-height: 1.5;">
                    ${anomaly.description}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Past Tender Ledger Table -->
          <div class="card" style="grid-column: 1 / -1;">
            <h4 style="font-family: 'Geist', var(--font-display); font-size: 1.1rem; color: #fff; margin-bottom: 0.75rem;">
              Cross-PSU Procurement Participation &amp; Outcome History
            </h4>
            <div style="overflow-x: auto;">
              <table class="table" style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
                <thead>
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); text-align: left; font-family: var(--font-mono); color: #94a3b8;">
                    <th style="padding: 0.6rem;">Tender Ref</th>
                    <th style="padding: 0.6rem;">PSU Organization</th>
                    <th style="padding: 0.6rem;">Bid Date</th>
                    <th style="padding: 0.6rem;">Declared Turnover</th>
                    <th style="padding: 0.6rem;">Local Content</th>
                    <th style="padding: 0.6rem;">Outcome</th>
                    <th style="padding: 0.6rem;">Audit Observation</th>
                  </tr>
                </thead>
                <tbody>
                  ${(profile.past_tender_history || []).map((t, idx) => `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); background: ${idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'};">
                      <td style="padding: 0.75rem; font-family: var(--font-mono); color: var(--accent-gold-bright);">
                        ${t.tender_ref}
                      </td>
                      <td style="padding: 0.75rem; color: #fff; font-weight: 600;">
                        ${t.organization}
                      </td>
                      <td style="padding: 0.75rem; font-family: var(--font-mono); color: #94a3b8;">
                        ${t.bid_date}
                      </td>
                      <td style="padding: 0.75rem; font-family: var(--font-mono); color: ${t.declared_turnover_cr > 15 ? '#ef4444' : '#86efac'}; font-weight: 700;">
                        ₹${t.declared_turnover_cr.toFixed(2)} Cr
                      </td>
                      <td style="padding: 0.75rem; font-family: var(--font-mono); color: #cbd5e1;">
                        ${t.declared_local_content_percent}%
                      </td>
                      <td style="padding: 0.75rem;">
                        <span class="badge ${t.outcome.includes('Disqualified') ? 'badge-danger' : 'badge-low'}" style="font-size: 0.68rem;">
                          ${t.outcome}
                        </span>
                      </td>
                      <td style="padding: 0.75rem; font-size: 0.78rem; color: #cbd5e1; max-width: 320px;">
                        ${t.observation}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      })
      .catch((err) => {
        grid.innerHTML = `<div class="card" style="color: #fca5a5;">Failed to load cross-PSU intelligence: ${err.message}</div>`;
      });
  }

  // Initial load
  loadContent();
}
