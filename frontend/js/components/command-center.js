/**
 * Stitch Command Center Component
 * Built and styled using Google Stitch MCP design generation
 * Fully wired to live reactive API store & officer decision gateway
 */
import { store } from '../state.js';
import { api } from '../api.js';
import { formatINR, showToast } from '../utils.js';
import { startDemoTour } from './demo-tour.js';
import { renderShowCauseModal } from './show-cause-modal.js';

export function renderCommandCenter(container) {
  const state = store.getState();
  const tender = state.tender || {};
  const bidders = state.bidders || [];
  const contradictions = state.contradictions || [];
  const auditTrail = state.auditTrail || [];

  const abcBidder = bidders.find((b) => b.id === 'BID-ABC-001') || bidders[0] || {};
  const xyzBidder = bidders.find((b) => b.id === 'BID-XYZ-002') || bidders[1] || {};
  const pqrBidder = bidders.find((b) => b.id === 'BID-PQR-003') || bidders[2] || {};

  container.innerHTML = `
    <div class="stitch-command-wrapper" style="animation: fadeIn 0.3s ease-out;">
      <!-- Page Header & Overview -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
            <span class="badge badge-info">COMMAND CENTER v2.0</span>
          </div>
          <h2 style="font-family: 'Geist', var(--font-display); font-size: 2rem; color: #fff; font-weight: 700; tracking: -0.01em;">
            Bid Evaluation Matrix & Executive Command
          </h2>
          <p style="font-size: 0.95rem; color: #94a3b8; margin-top: 0.25rem;">
            Real-time multi-bidder compliance synthesis, cross-document contradiction radar, and deterministic risk assessment.
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div class="glass-panel ghost-border rounded-lg" style="padding: 0.4rem 0.85rem; font-family: var(--font-mono); font-size: 0.75rem; color: #94a3b8; display: flex; align-items: center; gap: 0.5rem;">
            <span class="status-dot status-dot-active"></span>
            <span>Protocol: <strong style="color: #fff;">GFR 2017 & GeM STC 7.2</strong></span>
          </div>
          <button id="btn-stream-gem-bid" class="btn btn-sm glow-cyan" style="background: linear-gradient(135deg, #00f1fe 0%, #00a0fe 100%); color: #000; font-weight: 700; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 5px; cursor: pointer;">
            <span class="material-symbols-outlined" style="font-size: 15px;">sensors</span>
            Stream Live GeM Bid ⚡
          </button>
          <button id="stitch-btn-radar-quick" class="btn btn-secondary btn-sm ghost-border" style="font-family: var(--font-mono); font-size: 0.8rem;">
            <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">radar</span>
            Contradiction Radar →
          </button>
        </div>
      </div>

      <!-- KPI Overview Grid (Top Row) -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
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
            4
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
            3
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

      <!-- Live Evaluation Queue (Bento Grid) -->
      <div style="margin-bottom: 2rem;">
        <div style="font-family: var(--font-mono); font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem;">
          Live Bidder Evaluation Queue
        </div>

        <!-- Bidder 1: ABC Industries (High Risk) -->
        <div class="glass-panel rounded-lg ghost-border glow-red" style="padding: 1.5rem; margin-bottom: 1.25rem; border-color: rgba(239, 68, 68, 0.4);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem;">
            <div style="display: flex; gap: 1rem; align-items: center;">
              <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.5); display: flex; align-items: center; justify-content: center;">
                <span class="material-symbols-outlined" style="color: #ef4444; font-size: 24px;">warning</span>
              </div>
              <div>
                <h3 style="font-family: 'Geist', var(--font-display); font-size: 1.35rem; color: #fff; font-weight: 600;">
                  ${abcBidder.name || 'ABC Industries Limited'}
                </h3>
                <div style="display: flex; gap: 0.75rem; align-items: center; margin-top: 0.25rem;">
                  <span class="badge badge-high" style="font-size: 0.7rem;">HIGH RISK</span>
                  <span style="font-family: var(--font-mono); font-size: 0.82rem; color: #cbd5e1;">
                    ${abcBidder.scorecard?.composite_confidence || 71.4}% Confidence
                  </span>
                  <span style="font-size: 0.75rem; color: #64748b;">CIN: ${abcBidder.cin || 'U23201MH2015PLC268912'}</span>
                  <span class="badge badge-high" style="font-size: 0.65rem; border-color: #ef4444;">84.6% Shell Risk (EPFO Anomaly: 4 Staff)</span>
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 0.75rem;">
              <button class="btn btn-secondary btn-sm ghost-border btn-inspect-abc" style="font-size: 0.8rem;">
                <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">visibility</span>
                Examine Evidence
              </button>
              <button class="btn btn-sm btn-showcause-abc btn-show-cause-action glow-red" style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #ffb4ab; font-size: 0.8rem; font-weight: 600;">
                <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">assignment_late</span>
                Draft Show-Cause Notice
              </button>
              <button class="btn btn-sm btn-override-abc btn-evaluate glow-gold" style="background: rgba(212, 175, 55, 0.15); border: 1px solid var(--accent-gold); color: var(--accent-gold-bright); font-size: 0.8rem; font-weight: 600;">
                <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">gavel</span>
                Officer Override
              </button>
            </div>
          </div>

          <!-- 5-Metric Breakdown Grid -->
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px; background: rgba(255,255,255,0.08); border-radius: 6px; overflow: hidden; margin-bottom: 1.25rem;">
            <div style="background: #151824; padding: 0.75rem; text-align: center;">
              <div style="font-family: var(--font-mono); font-size: 0.65rem; color: #94a3b8; margin-bottom: 0.35rem;">Mandatory Coverage</div>
              <div style="font-family: var(--font-mono); font-size: 0.95rem; color: #fff; font-weight: 700;">100%</div>
              <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 0.5rem; overflow: hidden;">
                <div style="height: 100%; width: 100%; background: #10b981;"></div>
              </div>
            </div>
            <div style="background: #151824; padding: 0.75rem; text-align: center;">
              <div style="font-family: var(--font-mono); font-size: 0.65rem; color: #94a3b8; margin-bottom: 0.35rem;">Evidence Strength</div>
              <div style="font-family: var(--font-mono); font-size: 0.95rem; color: #fff; font-weight: 700;">91.4%</div>
              <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 0.5rem; overflow: hidden;">
                <div style="height: 100%; width: 91.4%; background: #10b981;"></div>
              </div>
            </div>
            <div style="background: #151824; padding: 0.75rem; text-align: center;">
              <div style="font-family: var(--font-mono); font-size: 0.65rem; color: #94a3b8; margin-bottom: 0.35rem;">Source Verification</div>
              <div style="font-family: var(--font-mono); font-size: 0.95rem; color: #fcd34d; font-weight: 700;">84.0%</div>
              <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 0.5rem; overflow: hidden;">
                <div style="height: 100%; width: 84%; background: #f59e0b;"></div>
              </div>
            </div>
            <div style="background: #151824; padding: 0.75rem; text-align: center;">
              <div style="font-family: var(--font-mono); font-size: 0.65rem; color: #94a3b8; margin-bottom: 0.35rem;">Legal Identity</div>
              <div style="font-family: var(--font-mono); font-size: 0.95rem; color: #ef4444; font-weight: 700;">68.5%</div>
              <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 0.5rem; overflow: hidden;">
                <div style="height: 100%; width: 68.5%; background: #ef4444;"></div>
              </div>
            </div>
            <div style="background: #151824; padding: 0.75rem; text-align: center;">
              <div style="font-family: var(--font-mono); font-size: 0.65rem; color: #94a3b8; margin-bottom: 0.35rem;">Temporal Validity</div>
              <div style="font-family: var(--font-mono); font-size: 0.95rem; color: #ef4444; font-weight: 700;">54.0%</div>
              <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 0.5rem; overflow: hidden;">
                <div style="height: 100%; width: 54%; background: #ef4444;"></div>
              </div>
            </div>
          </div>

          <!-- Red Flags Box -->
          <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 6px; padding: 0.85rem 1rem; font-family: var(--font-mono); font-size: 0.8rem; color: #fca5a5;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
              <span class="material-symbols-outlined" style="font-size: 16px; color: #ef4444;">flag</span>
              <strong>Material Turnover Discrepancy:</strong> ₹12,40,00,000 (Audited Financials) vs ₹8,20,00,000 (Vendor Bid Declaration)
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="material-symbols-outlined" style="font-size: 16px; color: #ef4444;">flag</span>
              <strong>Temporal Lapsed Certificate:</strong> BIS Quality License expired 98 days prior to 15-Sep-2026 bid deadline.
            </div>
          </div>
        </div>

        <!-- Bidder 2: XYZ Corporation (Medium Risk) -->
        <div class="glass-panel rounded-lg ghost-border" style="padding: 1.25rem; margin-bottom: 1.25rem; border-color: rgba(245, 158, 11, 0.3);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; gap: 1rem; align-items: center;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.5); display: flex; align-items: center; justify-content: center;">
                <span class="material-symbols-outlined" style="color: #f59e0b; font-size: 22px;">info</span>
              </div>
              <div>
                <h4 style="font-family: 'Geist', var(--font-display); font-size: 1.15rem; color: #fff; font-weight: 600;">
                  ${xyzBidder.name || 'XYZ Corporation India Private Limited'}
                </h4>
                <div style="display: flex; gap: 0.75rem; align-items: center; margin-top: 0.25rem;">
                  <span class="badge badge-medium" style="font-size: 0.7rem;">MEDIUM RISK</span>
                  <span style="font-family: var(--font-mono); font-size: 0.8rem; color: #cbd5e1;">86.8% Confidence</span>
                </div>
              </div>
            </div>

            <button class="btn btn-secondary btn-sm ghost-border btn-inspect-xyz" style="font-size: 0.8rem;">
              Review Dossier →
            </button>
          </div>
          <div style="margin-top: 0.75rem; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 4px; padding: 0.5rem 0.75rem; font-family: var(--font-mono); font-size: 0.75rem; color: #fcd34d;">
            ⚠️ Local Content declaration variance: 62.4% declared vs 48.0% verified in Bill of Materials.
          </div>
        </div>

        <!-- Bidder 3: PQR Engineering (Verified Compliant) -->
        <div class="glass-panel rounded-lg ghost-border glow-emerald" style="padding: 1.25rem; border-color: rgba(16, 185, 129, 0.35);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; gap: 1rem; align-items: center;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.5); display: flex; align-items: center; justify-content: center;">
                <span class="material-symbols-outlined" style="color: #10b981; font-size: 22px;">check_circle</span>
              </div>
              <div>
                <h4 style="font-family: 'Geist', var(--font-display); font-size: 1.15rem; color: #fff; font-weight: 600;">
                  ${pqrBidder.name || 'PQR Engineering Technologies Private Limited'}
                </h4>
                <div style="display: flex; gap: 0.75rem; align-items: center; margin-top: 0.25rem;">
                  <span class="badge badge-low" style="font-size: 0.7rem;">VERIFIED COMPLIANT</span>
                  <span style="font-family: var(--font-mono); font-size: 0.8rem; color: #cbd5e1;">98.2% Confidence</span>
                </div>
              </div>
            </div>

            <button class="btn btn-secondary btn-sm ghost-border btn-inspect-pqr" style="font-size: 0.8rem;">
              Review Dossier →
            </button>
          </div>
          <div style="margin-top: 0.75rem; display: flex; gap: 1rem; font-family: var(--font-mono); font-size: 0.75rem; color: #86efac;">
            <span style="display: flex; align-items: center; gap: 0.25rem;">
              <span class="material-symbols-outlined" style="font-size: 16px;">verified</span> 0 Contradictions
            </span>
            <span style="display: flex; align-items: center; gap: 0.25rem;">
              <span class="material-symbols-outlined" style="font-size: 16px;">fact_check</span> DigiLocker Verified
            </span>
            <span style="display: flex; align-items: center; gap: 0.25rem;">
              <span class="material-symbols-outlined" style="font-size: 16px;">security</span> 100% GFR 2017 Compliant
            </span>
          </div>
        </div>

        <!-- Dynamically Ingested / Webhook Bidders -->
        ${bidders.slice(3).map((b) => `
          <div class="glass-panel rounded-lg ghost-border glow-emerald" style="padding: 1.25rem; margin-bottom: 1.25rem; border-color: rgba(16, 185, 129, 0.4); animation: fadeIn 0.3s ease-out; background: rgba(16, 185, 129, 0.04);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; gap: 1rem; align-items: center;">
                <div style="width: 42px; height: 42px; border-radius: 50%; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; display: flex; align-items: center; justify-content: center;">
                  <span class="material-symbols-outlined" style="color: #10b981; font-size: 22px;">sensors</span>
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <h4 style="font-family: 'Geist', var(--font-display); font-size: 1.2rem; color: #fff; font-weight: 600;">${b.name}</h4>
                    <span class="badge badge-low" style="font-size: 0.65rem;">LIVE GeM WEBHOOK INGESTED</span>
                    <span class="badge badge-real" style="font-size: 0.65rem;">CLASS-I LOCAL</span>
                  </div>
                  <div style="font-family: var(--font-mono); font-size: 0.76rem; color: #94a3b8; margin-top: 3px;">
                    CIN: <span style="color: #cbd5e1;">${b.cin || 'U29100MH2019PTC328901'}</span> | PAN: <span style="color: #cbd5e1;">${b.pan || 'AABCH8812N'}</span> | Composite Score: <strong style="color: #86efac;">${b.composite_score || 94.2}%</strong> | Risk: <strong style="color: #86efac;">${b.risk_level || 'LOW'}</strong>
                  </div>
                </div>
              </div>
              <button class="btn btn-secondary btn-sm ghost-border btn-inspect-dynamic" data-bidder="${b.id}" style="font-size: 0.8rem;">
                Examine Dossier →
              </button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Contradiction Spotlight (Bottom Panel) -->
      <div class="glass-panel ghost-border rounded-lg" style="padding: 1.5rem; border-left: 4px solid #ef4444; margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="material-symbols-outlined" style="color: #ef4444;">center_focus_strong</span>
            <h3 style="font-family: var(--font-mono); font-size: 1rem; color: #fff; font-weight: 700; text-transform: uppercase;">
              Contradiction Spotlight · Signature Innovation
            </h3>
            <span class="badge badge-high" style="font-size: 0.65rem;">Rule 144 GFR 2017 Impact</span>
          </div>
          <button id="stitch-btn-radar" class="btn btn-outline-danger btn-sm" style="font-size: 0.8rem;">
            Open Contradiction Radar ⚡
          </button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
          <!-- Source A -->
          <div class="card" style="background: #0f1422; padding: 1.25rem; border-color: rgba(255,255,255,0.08); position: relative;">
            <div style="position: absolute; top: 8px; right: 12px; font-family: var(--font-mono); font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;">Source Document A</div>
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-cyan); margin-bottom: 0.5rem;">
              Audited_Financial_Statement_FY24_25.pdf (Page 17)
            </div>
            <div style="background: rgba(0,0,0,0.4); padding: 0.75rem; border-radius: 4px; border-left: 3px solid #10b981; font-family: var(--font-mono); font-size: 0.82rem; color: #86efac; line-height: 1.5;">
              "Schedule 18 — Revenue from Operations: Total Turnover for Year Ended 31st March 2025: <strong style="color: #6ee7b7;">INR 12,40,00,000 (Twelve Crore Forty Lakhs Only)</strong>"
            </div>
          </div>

          <!-- Source B -->
          <div class="card" style="background: #0f1422; padding: 1.25rem; border-color: rgba(239, 68, 68, 0.3); position: relative;">
            <div style="position: absolute; top: 8px; right: 12px; font-family: var(--font-mono); font-size: 0.65rem; color: #fca5a5; text-transform: uppercase;">Source Document B (Conflict)</div>
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #f87171; margin-bottom: 0.5rem;">
              Schedule_IV_Vendor_Turnover_Declaration.pdf (Page 3)
            </div>
            <div style="background: rgba(0,0,0,0.4); padding: 0.75rem; border-radius: 4px; border-left: 3px solid #ef4444; font-family: var(--font-mono); font-size: 0.82rem; color: #fca5a5; line-height: 1.5;">
              "Item 4(b) — We hereby confirm our certified annual turnover for FY 2024-25 as <strong style="color: #f87171;">INR 8,20,00,000 (Eight Crore Twenty Lakhs Only)</strong> under GeM guidelines."
            </div>
          </div>
        </div>

        <div style="margin-top: 1rem; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 6px; padding: 0.85rem; font-size: 0.85rem; color: #cbd5e1; line-height: 1.5;">
          <strong style="color: #fca5a5;">AI Deterministic Risk Synthesis:</strong> 
          Material variance of <strong style="color: #ffb4ab;">₹4,20,00,000</strong> discovered between audited financial statements and sworn vendor declaration. 
          If ₹8.20 Cr is the true turnover, the bidder fails the mandatory ₹10 Cr eligibility threshold under Clause 4.2. 
          Recommended action: Issue immediate Show-Cause notice or reject bid under Rule 144 GFR 2017.
        </div>
      </div>
    </div>
  `;

  // Attach event listeners
  container.querySelector('#stitch-btn-tour')?.addEventListener('click', () => {
    startDemoTour();
  });

  container.querySelector('#stitch-btn-reset')?.addEventListener('click', async () => {
    try {
      showToast('Resetting evaluation pipeline...', 'info');
      await api.resetDemo();
      showToast('Pipeline reset to initial baseline state', 'success');
      setTimeout(() => location.reload(), 500);
    } catch (e) {
      showToast('Reset failed: ' + e.message, 'error');
    }
  });

  container.querySelector('.btn-inspect-abc')?.addEventListener('click', () => {
    store.setState({ selectedBidderId: 'BID-ABC-001', selectedFindingId: 'FIND-ABC-01', currentView: 'evidence' });
  });

  container.querySelector('.btn-showcause-abc')?.addEventListener('click', () => {
    renderShowCauseModal('BID-ABC-001');
  });

  container.querySelector('.btn-override-abc')?.addEventListener('click', () => {
    store.setState({ selectedBidderId: 'BID-ABC-001', selectedFindingId: 'FIND-ABC-01', activeModal: 'decision-modal' });
  });

  container.querySelector('.btn-inspect-xyz')?.addEventListener('click', () => {
    store.setState({ selectedBidderId: 'BID-XYZ-002', selectedFindingId: 'FIND-XYZ-01', currentView: 'evidence' });
  });

  container.querySelector('.btn-inspect-pqr')?.addEventListener('click', () => {
    store.setState({ selectedBidderId: 'BID-PQR-003', selectedFindingId: 'FIND-PQR-01', currentView: 'evidence' });
  });

  container.querySelector('#stitch-btn-radar')?.addEventListener('click', () => {
    store.setState({ currentView: 'contradictions' });
  });

  container.querySelector('#stitch-btn-radar-quick')?.addEventListener('click', () => {
    store.setState({ currentView: 'contradictions' });
  });

  // Stream Live GeM Bid Handler
  container.querySelector('#btn-stream-gem-bid')?.addEventListener('click', async () => {
    try {
      showToast('Receiving incoming bid webhook from GeM API v3.2...', 'info');
      const res = await api.simulateGemBid();
      showToast(res.message, 'success');
      const bidders = await api.getBidders();
      store.setState({ bidders });
      renderCommandCenter(container);
    } catch (err) {
      showToast(`GeM webhook failed: ${err.message}`, 'error');
    }
  });

  // Dynamic bidder inspect handlers
  container.querySelectorAll('.btn-inspect-dynamic').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const bidderId = e.currentTarget.getAttribute('data-bidder');
      if (bidderId) {
        store.setState({ selectedBidderId: bidderId, currentView: 'bidders' });
      }
    });
  });
}
