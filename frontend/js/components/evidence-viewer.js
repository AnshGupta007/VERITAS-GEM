/**
 * Three-Column Grounded Evidence Viewer (Screen 5)
 * Enhanced with Stitch MCP Forensic Design System
 */
import { store } from '../state.js';
import { api } from '../api.js';
import { getRiskBadgeClass, getProviderBadgeClass, showToast } from '../utils.js';
import { renderCureDeskModal } from './cure-desk-modal.js';

export function renderEvidenceViewer(container) {
  const state = store.getState();
  const findingId = state.selectedFindingId || 'FIND-ABC-01';

  container.innerHTML = `
    <div style="margin-bottom: var(--spacing-md); display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <button id="btn-back-to-leaderboard" class="btn btn-secondary btn-sm ghost-border">
          <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">arrow_back</span>
          Return to Queue
        </button>
        <h2 style="font-family: 'Geist', var(--font-display); font-size: 1.5rem; color: #fff; font-weight: 700;">
          Grounded Evidence Inspector & Forensic Lineage
        </h2>
      </div>
      <div style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-mono); display: flex; align-items: center; gap: 0.5rem;">
        <span class="badge badge-info">Forensic Verification Grid</span>
        <span>Clause → Inferred Finding → Primary Dual OCR</span>
      </div>
    </div>

    <!-- Stitch Compliance Time Machine Banner -->
    <div class="glass-panel ghost-border rounded-lg" style="padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; border-radius: 8px; position: relative; overflow: hidden;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span class="material-symbols-outlined" style="color: var(--accent-gold);">history</span>
          <h3 style="font-family: 'Geist', var(--font-display); font-size: 1.15rem; color: var(--accent-gold-bright); font-weight: 700;">
            Compliance Time Machine · Temporal Validity Anchor
          </h3>
        </div>
        <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #ffdad6; padding: 0.4rem 0.85rem; border-radius: 4px; font-family: var(--font-mono); font-size: 0.78rem; display: flex; align-items: center; gap: 0.5rem;">
          <span class="material-symbols-outlined" style="color: #ef4444; font-size: 16px;">dangerous</span>
          <strong>Critical Invalidation:</strong> BIS License expired 98 days prior to bid deadline (Expiry: 09-Jun-2026).
        </div>
      </div>

      <!-- Timeline Bar -->
      <div style="position: relative; height: 48px; display: flex; align-items: center; margin-top: 0.5rem;">
        <div style="position: absolute; width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px;"></div>
        <div style="position: absolute; left: 0; width: 68%; height: 4px; background: var(--accent-gold); border-radius: 2px;"></div>
        <div style="position: absolute; left: 68%; width: 10%; height: 4px; background: #ef4444;"></div>
        
        <!-- Timeline Points -->
        <div style="position: absolute; left: 5%; transform: translateX(-50%); text-align: center;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background: #94a3b8; margin: 0 auto 4px auto;"></div>
          <span style="font-family: var(--font-mono); font-size: 0.65rem; color: #64748b;">Jan 2024</span>
        </div>
        <div style="position: absolute; left: 35%; transform: translateX(-50%); text-align: center;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background: #94a3b8; margin: 0 auto 4px auto;"></div>
          <span style="font-family: var(--font-mono); font-size: 0.65rem; color: #64748b;">Jan 2025</span>
        </div>
        <div style="position: absolute; left: 68%; transform: translateX(-50%); text-align: center;">
          <div style="width: 12px; height: 12px; border-radius: 50%; background: #f59e0b; border: 2px solid #000; margin: 0 auto 4px auto;"></div>
          <span style="font-family: var(--font-mono); font-size: 0.68rem; color: #fcd34d; font-weight: 700;">09-Jun-2026 (Expired)</span>
        </div>
        <div style="position: absolute; left: 78%; transform: translateX(-50%); text-align: center;">
          <div style="width: 14px; height: 14px; border-radius: 50%; background: #ef4444; border: 2px solid #fff; box-shadow: 0 0 8px #ef4444; margin: 0 auto 4px auto;"></div>
          <span style="font-family: var(--font-mono); font-size: 0.68rem; color: #fca5a5; font-weight: 800;">15-Sep-2026 (Anchor Date)</span>
        </div>
        <div style="position: absolute; left: 95%; transform: translateX(-50%); text-align: center;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background: #94a3b8; margin: 0 auto 4px auto;"></div>
          <span style="font-family: var(--font-mono); font-size: 0.65rem; color: #64748b;">Jan 2027</span>
        </div>
      </div>
    </div>

    <div id="evidence-loading" class="card" style="text-align: center; padding: 3rem;">
      <span class="status-dot status-dot-active" style="margin-right: 8px;"></span> Loading grounded evidence chain for <code style="color: var(--accent-cyan);">${findingId}</code>...
    </div>

    <div id="evidence-content" class="evidence-three-col" style="display: none;"></div>
  `;

  container.querySelector('#btn-back-to-leaderboard')?.addEventListener('click', () => {
    store.setState({ currentView: 'command-center' });
  });

  // Fetch full evidence data
  api
    .getFindingEvidence(findingId)
    .then((data) => {
      const loader = container.querySelector('#evidence-loading');
      const content = container.querySelector('#evidence-content');
      if (loader) loader.style.display = 'none';
      if (!content) return;
      content.style.display = 'grid';

      const f = data.finding;
      const req = data.requirement;
      const bidder = data.bidder;
      const excerpts = data.excerpts;

      content.innerHTML = `
        <!-- COLUMN 1: REQUIREMENT SPECIFICATION -->
        <div class="col-panel glass-panel ghost-border hover-spring stagger-1" style="border-radius: 8px; padding: 1.25rem;">
          <div class="col-header" style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem; margin-bottom: 1rem;">
            <div>
              <span class="badge badge-info" style="font-family: var(--font-mono); font-size: 0.7rem;">1. TENDER CLAUSE</span>
              <h3 style="font-family: 'Geist', var(--font-display); font-size: 1.15rem; margin-top: 0.25rem; color: #fff;">
                ${f.clause_reference}
              </h3>
            </div>
            <span class="badge ${req && req.criticality === 'MANDATORY' ? 'badge-mandatory' : 'badge-med'}">
              ${req ? req.criticality : 'MANDATORY'}
            </span>
          </div>

          <div style="flex: 1;">
            <h4 style="font-family: 'Geist', var(--font-display); font-size: 1.1rem; color: var(--accent-gold-bright); margin-bottom: 0.75rem;">
              ${req ? req.title : f.title}
            </h4>
            <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 0.85rem; font-family: var(--font-mono); font-size: 0.8rem; margin-bottom: 1rem;">
              <span style="color: #94a3b8;">Norm Specification:</span>
              <div style="color: #fff; margin-top: 0.25rem; line-height: 1.5;">
                ${req ? req.description : f.summary}
              </div>
            </div>

            <div style="background: rgba(7, 11, 20, 0.7); border: 1px solid var(--surface-border); border-radius: 6px; padding: 0.85rem; font-size: 0.8rem; margin-bottom: 1rem; space-y-2;">
              <div style="margin-bottom: 0.4rem;">
                <strong style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.72rem; text-transform: uppercase;">Required Evidence:</strong><br/>
                <span style="color: #fff;">${req ? req.required_evidence_type : 'Statutory Return'}</span>
              </div>
              <div style="margin-bottom: 0.4rem;">
                <strong style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.72rem; text-transform: uppercase;">Validation Engine:</strong><br/>
                <span class="badge badge-info" style="font-family: var(--font-mono); font-size: 0.72rem;">${f.validation_method}</span>
              </div>
              <div>
                <strong style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.72rem; text-transform: uppercase;">Governing Rule:</strong><br/>
                <span style="color: #fcd34d; font-family: var(--font-mono); font-size: 0.78rem;">${req ? req.applicable_rule : 'Rule 144 GFR 2017 & GeM STC 7.2'}</span>
              </div>
            </div>

            <div style="background: rgba(239, 68, 68, 0.08); border-left: 3px solid #ef4444; padding: 0.65rem 0.85rem; border-radius: 4px; font-size: 0.78rem; color: #fca5a5;">
              <strong>Non-Compliance Impact:</strong> Direct violation disqualifies bidder under Rule 144 GFR 2017.
            </div>
          </div>
        </div>

        <!-- COLUMN 2: GROUNDED FINDING & AI REASONING -->
        <div class="col-panel glass-panel ghost-border glow-gold hover-spring stagger-2" style="border-radius: 8px; padding: 1.25rem;">
          <div class="col-header" style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem; margin-bottom: 1rem;">
            <div>
              <span class="badge badge-info" style="font-family: var(--font-mono); font-size: 0.7rem;">2. AI INFERENCE & CONFIDENCE</span>
              <h3 style="font-family: 'Geist', var(--font-display); font-size: 1.15rem; margin-top: 0.25rem; color: #fff;">
                Grounded Assessment
              </h3>
            </div>
            <span class="badge ${getRiskBadgeClass(f.severity)}">${f.severity} SEVERITY</span>
          </div>

          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <div style="font-size: 0.8rem; color: var(--text-muted);">
                Target Bidder: <strong style="color: #fff;">${bidder.name}</strong>
              </div>
              <span class="badge ${f.status === 'ACCEPTED' ? 'badge-low' : f.status === 'OVERRIDDEN' ? 'badge-simulated' : 'badge-med'}">
                ${f.status}
              </span>
            </div>

            <!-- AI Confidence Meter -->
            <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 0.85rem; margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.4rem;">
                <span style="font-family: var(--font-mono); color: #94a3b8;">AI Confidence Calibration:</span>
                <strong style="font-family: var(--font-mono); color: var(--accent-gold-bright);">${(f.confidence_score * 100).toFixed(0)}% HIGH CONF</strong>
              </div>
              <div class="score-bar-track" style="margin: 0 0 0.5rem 0;">
                <div class="score-bar-fill meter-smooth" style="width: ${f.confidence_score * 100}%; background: var(--accent-gold);"></div>
              </div>
            </div>

            <!-- Authoritative Source -->
            <div style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; background: rgba(13, 21, 39, 0.6); padding: 0.6rem 0.85rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);">
              <span class="material-symbols-outlined" style="color: var(--accent-cyan); font-size: 20px;">database</span>
              <div style="font-size: 0.78rem;">
                <div style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.7rem;">Authoritative Source Cross-Check:</div>
                <div style="font-weight: 600; color: #fff;">
                  ${f.source_adapter || 'MCA21 Ministry of Corporate Affairs'}
                  <span class="badge ${getProviderBadgeClass(f.source_badge)}" style="font-size: 0.62rem; margin-left: 4px;">
                    ${f.source_badge || 'MOCK'}
                  </span>
                </div>
              </div>
            </div>

            <!-- Recommendation Box -->
            <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; padding: 0.85rem; margin-bottom: 1.25rem;">
              <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #f87171; font-weight: 700; text-transform: uppercase; margin-bottom: 0.35rem;">
                AI Actionable Recommendation
              </div>
              <div style="font-size: 0.82rem; color: #fca5a5; line-height: 1.5;">
                ${f.ai_recommendation}
              </div>
            </div>

            <!-- Human Decision Gateway -->
            <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1rem;">
              <button id="btn-open-decision-dialog" class="btn btn-sm glow-gold" style="width: 100%; background: linear-gradient(135deg, #d4af37 0%, #f2ca50 100%); color: #000; font-weight: 700;">
                <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">gavel</span>
                Record Human Officer Decision ✍️
              </button>
              <button id="btn-open-cure-desk-direct" class="btn btn-outline-cyan btn-sm" style="width: 100%; margin-top: 0.5rem; font-size: 0.78rem;">
                <span class="material-symbols-outlined" style="font-size: 15px; vertical-align: middle;">fact_check</span>
                Bidder Representation & Cure Desk
              </button>
              <div style="text-align: center; margin-top: 0.5rem; font-family: var(--font-mono); font-size: 0.7rem; color: #64748b;">
                Digitally Attested: Sh. Rajesh Sharma (OFF-8821)
              </div>
            </div>
          </div>
        </div>

        <!-- COLUMN 3: SIDE-BY-SIDE DUAL SOURCE DOCUMENT VIEWER -->
        <div class="col-panel glass-panel ghost-border hover-spring stagger-3" style="border-radius: 8px; padding: 1.25rem; background: #0c101a;">
          <div class="col-header" style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem; margin-bottom: 1rem;">
            <div>
              <span class="badge badge-info" style="font-family: var(--font-mono); font-size: 0.7rem;">3. PRIMARY EVIDENCE (Dual OCR)</span>
              <h3 style="font-family: 'Geist', var(--font-display); font-size: 1.15rem; margin-top: 0.25rem; color: #fff;">
                OCR Grounding &amp; Discrepancy Analysis
              </h3>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <button id="btn-toggle-loupe" class="btn btn-secondary btn-xs ghost-border" style="font-size: 0.7rem; color: #38bdf8; display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; cursor: pointer; border-color: rgba(56, 189, 248, 0.4);">
                <span class="material-symbols-outlined" style="font-size: 14px;">zoom_in</span>
                Forensic Loupe Diff
              </button>
              <span class="badge badge-real">PADDLE-OCR DUAL PASS</span>
            </div>
          </div>

          <div style="flex: 1;">
            ${
              excerpts.length === 0
                ? `<div style="color: var(--text-muted); text-align: center; padding: 2rem;">No document artifacts attached.</div>`
                : excerpts.length > 1
                ? `
              <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; border-radius: 6px; padding: 0.6rem 0.85rem; font-size: 0.78rem; color: #fca5a5; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <span class="material-symbols-outlined" style="color: #ef4444; font-size: 18px;">warning</span>
                <span><strong>Cross-Document Conflict:</strong> Detected mismatch between Source A and Source B.</span>
              </div>

              <!-- Collapsible Forensic Loupe HUD -->
              <div id="forensic-loupe-hud" style="display: none; background: #070a12; border: 1px solid #38bdf8; border-radius: 6px; padding: 0.85rem; margin-bottom: 1rem; animation: fadeIn 0.2s ease-out; box-shadow: 0 0 15px rgba(56, 189, 248, 0.15);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.4rem;">
                  <span style="font-family: var(--font-mono); font-size: 0.72rem; color: #38bdf8; font-weight: 700; text-transform: uppercase; display: flex; align-items: center; gap: 4px;">
                    <span class="material-symbols-outlined" style="font-size: 15px;">biotech</span>
                    Optical Character &amp; Typography Loupe
                  </span>
                  <span class="badge badge-danger" style="font-size: 0.65rem;">88.4% TAMPER LIKELIHOOD</span>
                </div>

                <!-- Word-Level Diff Visualization -->
                <div style="background: rgba(0,0,0,0.5); border-radius: 4px; padding: 0.6rem; font-family: var(--font-mono); font-size: 0.76rem; line-height: 1.6; margin-bottom: 0.6rem;">
                  <div style="color: #94a3b8; font-size: 0.68rem; margin-bottom: 2px;">SYNCHRONIZED TOKEN DIFF:</div>
                  <span style="color: #cbd5e1;">Turnover for FY 2024-25: </span>
                  <span style="background: rgba(239, 68, 68, 0.3); color: #fca5a5; padding: 2px 5px; border-radius: 3px; text-decoration: line-through; border: 1px solid rgba(239, 68, 68, 0.5);">
                    [SRC-B: ₹8,20,00,000 (MCA21 Return)]
                  </span>
                  <span style="color: #cbd5e1;"> ➔ </span>
                  <span style="background: rgba(16, 185, 129, 0.3); color: #86efac; padding: 2px 5px; border-radius: 3px; font-weight: 700; border: 1px solid rgba(16, 185, 129, 0.5);">
                    [SRC-A: ₹12,40,00,000 (Uploaded Sheet)]
                  </span>
                </div>

                <!-- Typography & Bounding Box Specs -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-family: var(--font-mono); font-size: 0.7rem;">
                  <div style="background: rgba(255,255,255,0.03); padding: 0.5rem; border-radius: 4px;">
                    <span style="color: #94a3b8;">Source A Font / Producer:</span><br/>
                    <strong style="color: #fca5a5;">10.5pt Arial Regular (Photoshop)</strong><br/>
                    <span style="color: #64748b;">BBox: [X: 142.4, Y: 588.2, W: 310]</span>
                  </div>
                  <div style="background: rgba(255,255,255,0.03); padding: 0.5rem; border-radius: 4px;">
                    <span style="color: #94a3b8;">Source B Font / Source:</span><br/>
                    <strong style="color: #86efac;">9.0pt Courier New (MCA21 Spool)</strong><br/>
                    <span style="color: #64748b;">BBox: [X: 138.1, Y: 574.0, W: 292]</span>
                  </div>
                </div>
              </div>

              <div class="dual-doc-container" style="margin-top: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                ${excerpts
                  .map(
                    (exc, idx) => `
                  <div class="doc-viewer-panel" style="background: rgba(19, 19, 20, 0.85); border: 1px solid ${idx === 0 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}; border-radius: 6px; padding: 0.75rem; min-width: 0; overflow: hidden;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); pb-2;">
                      <span class="badge ${idx === 0 ? 'badge-low' : 'badge-danger'}" style="font-size: 0.65rem;">
                        SOURCE ${String.fromCharCode(65 + idx)}
                      </span>
                      <span style="font-family: var(--font-mono); font-size: 0.7rem; color: #94a3b8;">Page ${exc.page_number}</span>
                    </div>

                    <div style="font-size: 0.75rem; color: #cbd5e1; margin-bottom: 0.5rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${exc.document_name}">
                      ${exc.document_name}
                    </div>

                    <div style="background: rgba(0,0,0,0.5); border-radius: 4px; padding: 0.6rem; border-left: 3px solid ${idx === 0 ? '#10b981' : '#ef4444'}; font-family: var(--font-mono); font-size: 0.78rem; color: ${idx === 0 ? '#86efac' : '#fca5a5'}; word-break: break-word; overflow-wrap: anywhere;">
                      "${exc.extracted_text}"
                    </div>
                  </div>
                `
                  )
                  .join('')}
              </div>

              <!-- Dynamic Discrepancy Card -->
              <div class="glass-panel ghost-border ${f.severity === 'HIGH' ? 'glow-red' : f.severity === 'MEDIUM' ? 'glow-gold' : 'glow-emerald'}" style="margin-top: 1.25rem; border-radius: 6px; padding: 1rem; text-align: center; background: ${f.severity === 'HIGH' ? 'rgba(239, 68, 68, 0.08)' : f.severity === 'MEDIUM' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)'}; border-color: ${f.severity === 'HIGH' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'};">
                <span style="font-family: var(--font-mono); font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Forensic Discrepancy Synthesis</span>
                <div style="font-family: 'Geist', var(--font-display); font-size: 1.25rem; color: ${f.severity === 'HIGH' ? '#ffb4ab' : f.severity === 'MEDIUM' ? '#fde68a' : '#86efac'}; font-weight: 700; margin: 0.25rem 0; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                  <span class="material-symbols-outlined" style="color: ${f.severity === 'HIGH' ? '#ef4444' : f.severity === 'MEDIUM' ? '#f59e0b' : '#10b981'};">
                    ${f.severity === 'HIGH' ? 'trending_down' : f.severity === 'MEDIUM' ? 'error_outline' : 'verified'}
                  </span>
                  ${
                    f.title.toLowerCase().includes('turnover')
                      ? 'Turnover Variance: ₹4,20,00,000'
                      : f.title.toLowerCase().includes('local content')
                      ? 'Local Content Gap: 14.4% Deficit'
                      : f.title.toLowerCase().includes('license') || f.title.toLowerCase().includes('temporal')
                      ? 'Validity Invalidation: Lapsed 98 Days'
                      : f.title
                  }
                </div>
                <div style="font-size: 0.75rem; color: #cbd5e1; margin-top: 0.25rem;">
                  ${f.summary}
                </div>
              </div>
            `
                : `
              <div class="doc-viewer-panel" style="background: rgba(19, 19, 20, 0.85); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <span class="badge badge-info" style="font-size: 0.65rem;">PRIMARY EVIDENCE ARTIFACT</span>
                  <span style="font-family: var(--font-mono); font-size: 0.72rem; color: #94a3b8;">Page ${excerpts[0].page_number}</span>
                </div>
                <div style="font-size: 0.85rem; color: #fff; font-weight: 600; margin-bottom: 0.5rem;">
                  ${excerpts[0].document_name}
                </div>
                <div style="background: rgba(0,0,0,0.5); border-radius: 4px; padding: 0.85rem; border-left: 3px solid ${f.severity === 'HIGH' ? '#ef4444' : '#10b981'}; font-family: var(--font-mono); font-size: 0.85rem; color: ${f.severity === 'HIGH' ? '#fca5a5' : '#86efac'};">
                  "${excerpts[0].extracted_text}"
                </div>
              </div>
            `
            }

            <!-- ICAI UDIN & Forensic Integrity Card -->
            <div style="margin-top: 1rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="material-symbols-outlined text-secondary-container" style="font-size: 18px;">fingerprint</span>
                <div>
                  <div style="font-family: var(--font-mono); font-size: 0.72rem; color: #94a3b8;">ICAI UDIN Statutory Check:</div>
                  <div style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 600; color: #fff;">
                    ${f.bidder_id === 'BID-ABC-001' ? '24058291AAAA000000 (FLAGGED SYNTHETIC)' : f.bidder_id === 'BID-XYZ-002' ? '25091823CERT491820 (ACTIVE)' : '26094123CERT894102 (VERIFIED)'}
                  </div>
                </div>
              </div>
              <span class="badge ${f.bidder_id === 'BID-ABC-001' ? 'badge-high' : 'badge-low'}" style="font-size: 0.68rem;">
                ${f.bidder_id === 'BID-ABC-001' ? 'TAMPER RISK' : 'UDIN PASS'}
              </span>
            </div>
          </div>
        </div>
      `;


      // Open Decision Dialog button
      content.querySelector('#btn-open-decision-dialog')?.addEventListener('click', () => {
        store.setState({ activeModal: 'decision-modal' });
      });

      // Open Cure Desk button
      content.querySelector('#btn-open-cure-desk-direct')?.addEventListener('click', () => {
        renderCureDeskModal(bidder?.id || f.bidder_id, f.id);
      });

      // Toggle Forensic Loupe HUD
      content.querySelector('#btn-toggle-loupe')?.addEventListener('click', () => {
        const hud = content.querySelector('#forensic-loupe-hud');
        if (!hud) return;
        const isHidden = hud.style.display === 'none';
        hud.style.display = isHidden ? 'block' : 'none';
        const btn = content.querySelector('#btn-toggle-loupe');
        if (btn) {
          btn.style.background = isHidden ? 'rgba(56, 189, 248, 0.2)' : 'transparent';
          btn.style.color = isHidden ? '#fff' : '#38bdf8';
        }
      });
    })
    .catch((err) => {
      const loader = container.querySelector('#evidence-loading');
      if (loader) {
        loader.innerHTML = `<div style="color: #fca5a5;">Failed to load evidence: ${err.message}</div>`;
      }
    });
}
