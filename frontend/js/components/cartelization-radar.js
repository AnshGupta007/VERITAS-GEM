/**
 * Cartelization & Bid-Rigging Forensic Radar Component
 * CVC & Competition Commission of India (CCI) Forensic Intelligence
 */
import { store } from '../state.js';
import { api } from '../api.js';
import { showToast } from '../utils.js';

export function renderCartelizationRadar(container) {
  container.innerHTML = `
    <div style="animation: fadeIn 0.3s ease-out;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
            <span class="badge badge-high" style="font-family: var(--font-mono); font-size: 0.72rem;">
              CVC & CCI COMPLIANCE
            </span>
            <span class="badge badge-info">SECTION 3(3) COMPETITION ACT 2002</span>
          </div>
          <h2 style="font-family: 'Geist', var(--font-display); font-size: 1.85rem; color: #fff; font-weight: 700;">
            Cartelization & Bid-Rigging Forensic Radar
          </h2>
          <p style="font-size: 0.95rem; color: #94a3b8; margin-top: 0.25rem;">
            Autonomous detection of covert bidder collusion, document metadata clustering, verbatim text plagiarism, and shared entity networks.
          </p>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <button id="btn-export-cci-dossier" class="btn btn-outline-danger btn-sm glow-red" style="font-size: 0.8rem;">
            <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">policy</span>
            Export CCI & CVO Forensic Dossier
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div id="cartel-loading" class="card" style="text-align: center; padding: 3rem;">
        <span class="status-dot status-dot-active" style="margin-right: 8px;"></span> Loading deep forensic collusion graphs...
      </div>

      <!-- Main Content -->
      <div id="cartel-content" style="display: none;">
        <!-- Top Metric Bar -->
        <div style="display: grid; grid-template-columns: 1.2fr 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
          <!-- Metric 1 -->
          <div class="glass-panel ghost-border rounded-lg glow-red hover-spring stagger-1 glow-breathe-red" style="padding: 1.25rem; border-color: rgba(239, 68, 68, 0.4);">
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #fca5a5; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between;">
              <span>Composite Collusion Risk Index</span>
              <span class="status-dot status-dot-danger live-beacon"></span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 0.5rem;">
              <span id="cartel-risk-score" style="font-family: 'Geist', var(--font-display); font-size: 2.25rem; font-weight: 800; color: #ffb4ab;" class="tabular-nums">
                81.5%
              </span>
              <span class="badge badge-high" style="font-size: 0.68rem;">HIGH PROBABILITY</span>
            </div>
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #94a3b8; margin-top: 0.5rem;">
              Target Pair: ABC Industries ↔ XYZ Corp
            </div>
            <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.08); border-radius: 2px; margin-top: 0.75rem; overflow: hidden;">
              <div class="meter-smooth" style="height: 100%; width: 81.5%; background: #ef4444;"></div>
            </div>
          </div>

          <!-- Metric 2 -->
          <div class="glass-panel ghost-border rounded-lg hover-spring stagger-2" style="padding: 1.25rem;">
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.5rem;">
              Document Creation Delta
            </div>
            <div style="font-family: 'Geist', var(--font-display); font-size: 1.75rem; font-weight: 700; color: #fcd34d;" class="tabular-nums">
              3m 22s
            </div>
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #f59e0b; margin-top: 0.5rem;">
              Extreme temporal clustering
            </div>
            <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.08); border-radius: 2px; margin-top: 0.75rem; overflow: hidden;">
              <div class="meter-smooth" style="height: 100%; width: 95%; background: #f59e0b;"></div>
            </div>
          </div>

          <!-- Metric 3 -->
          <div class="glass-panel ghost-border rounded-lg hover-spring stagger-3" style="padding: 1.25rem;">
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.5rem;">
              Text Plagiarism Ratio
            </div>
            <div style="font-family: 'Geist', var(--font-display); font-size: 1.75rem; font-weight: 700; color: #ffb4ab;" class="tabular-nums">
              94.2%
            </div>
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #ef4444; margin-top: 0.5rem;">
              1,420 verbatim shared characters
            </div>
            <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.08); border-radius: 2px; margin-top: 0.75rem; overflow: hidden;">
              <div class="meter-smooth" style="height: 100%; width: 94.2%; background: #ef4444;"></div>
            </div>
          </div>

          <!-- Metric 4 -->
          <div class="glass-panel ghost-border rounded-lg hover-spring stagger-4" style="padding: 1.25rem;">
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.5rem;">
              Network IP Origin
            </div>
            <div style="font-family: 'Geist', var(--font-display); font-size: 1.4rem; font-weight: 700; color: #ffb4ab;" class="tabular-nums">
              Identical /24 Subnet
            </div>
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #ef4444; margin-top: 0.5rem;">
              103.21.124.0/24 (Bandra MIDC)
            </div>
            <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.08); border-radius: 2px; margin-top: 0.75rem; overflow: hidden;">
              <div class="meter-smooth" style="height: 100%; width: 100%; background: #ef4444;"></div>
            </div>
          </div>
        </div>

        <!-- Entity Relationship Network Graph (Interactive SVG Canvas) -->
        <div class="glass-panel ghost-border rounded-lg hover-spring" style="padding: 1.5rem; margin-bottom: 1.5rem; position: relative; overflow: hidden;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="material-symbols-outlined" style="color: var(--accent-gold);">hub</span>
              <h3 style="font-family: 'Geist', var(--font-display); font-size: 1.2rem; color: #fff; font-weight: 600;">
                Cross-Entity Forensic Topology Graph
              </h3>
            </div>
            <div style="display: flex; gap: 1rem; font-family: var(--font-mono); font-size: 0.75rem;">
              <span style="display: flex; align-items: center; gap: 0.35rem;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: #ef4444;"></span> Collusion Nodes (ABC/XYZ)
              </span>
              <span style="display: flex; align-items: center; gap: 0.35rem;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: #f59e0b;"></span> Intermediary Entities
              </span>
              <span style="display: flex; align-items: center; gap: 0.35rem;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: #10b981;"></span> Independent Bidder (PQR)
              </span>
            </div>
          </div>

          <!-- SVG Graph Rendering Box -->
          <div style="background: #0a0d17; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); padding: 1rem; position: relative;">
            <svg id="entity-network-svg" width="100%" height="340" viewBox="0 0 900 340" style="overflow: visible;">
              <defs>
                <filter id="glow-red-filter">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="glow-gold-filter">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <!-- Connection Lines with Animated Pulses -->
              <!-- ABC to VK -->
              <line x1="220" y1="90" x2="380" y2="90" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="6,4">
                <animate attributeName="stroke-dashoffset" values="20;0" dur="1.2s" repeatCount="indefinite" />
              </line>
              <!-- XYZ to VK -->
              <line x1="540" y1="90" x2="380" y2="90" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="6,4">
                <animate attributeName="stroke-dashoffset" values="20;0" dur="1.2s" repeatCount="indefinite" />
              </line>
              <!-- ABC to CA -->
              <line x1="220" y1="90" x2="380" y2="180" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5,4">
                <animate attributeName="stroke-dashoffset" values="18;0" dur="1.5s" repeatCount="indefinite" />
              </line>
              <!-- XYZ to CA -->
              <line x1="540" y1="90" x2="380" y2="180" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5,4">
                <animate attributeName="stroke-dashoffset" values="18;0" dur="1.5s" repeatCount="indefinite" />
              </line>
              <!-- ABC to IP Gateway -->
              <line x1="220" y1="90" x2="280" y2="260" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="6,4">
                <animate attributeName="stroke-dashoffset" values="20;0" dur="1.2s" repeatCount="indefinite" />
              </line>
              <!-- XYZ to IP Gateway -->
              <line x1="540" y1="90" x2="280" y2="260" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="6,4">
                <animate attributeName="stroke-dashoffset" values="20;0" dur="1.2s" repeatCount="indefinite" />
              </line>
              <!-- ABC to Shared Premises -->
              <line x1="220" y1="90" x2="480" y2="260" stroke="#ef4444" stroke-width="2" stroke-dasharray="5,3">
                <animate attributeName="stroke-dashoffset" values="16;0" dur="1.4s" repeatCount="indefinite" />
              </line>
              <!-- XYZ to Shared Premises -->
              <line x1="540" y1="90" x2="480" y2="260" stroke="#ef4444" stroke-width="2" stroke-dasharray="5,3">
                <animate attributeName="stroke-dashoffset" values="16;0" dur="1.4s" repeatCount="indefinite" />
              </line>

              <!-- Independent PQR Nodes -->
              <line x1="780" y1="120" x2="780" y2="220" stroke="#10b981" stroke-width="2" />

              <!-- Link Labels -->
              <text x="300" y="80" fill="#fca5a5" font-size="10" font-family="monospace">Former Director</text>
              <text x="440" y="80" fill="#fca5a5" font-size="10" font-family="monospace">Active Exec Dir</text>
              <text x="260" y="145" fill="#fcd34d" font-size="10" font-family="monospace">Common CA UDIN</text>
              <text x="440" y="145" fill="#fcd34d" font-size="10" font-family="monospace">Common CA UDIN</text>
              <text x="210" y="200" fill="#f87171" font-size="10" font-family="monospace">Shared IP 103.21.124.45</text>
              <text x="450" y="200" fill="#f87171" font-size="10" font-family="monospace">Shared IP 103.21.124.48</text>

              <!-- Node: Bidder ABC -->
              <g transform="translate(220, 90)" class="radar-blip-node" style="cursor: pointer;">
                <circle r="34" fill="#1e131d" stroke="#ef4444" stroke-width="3" filter="url(#glow-red-filter)" />
                <text text-anchor="middle" y="4" fill="#fff" font-size="11" font-weight="bold" font-family="sans-serif">ABC Ind</text>
                <text text-anchor="middle" y="18" fill="#fca5a5" font-size="9" font-family="monospace">HIGH RISK</text>
              </g>

              <!-- Node: Bidder XYZ -->
              <g transform="translate(540, 90)" class="radar-blip-node" style="cursor: pointer;">
                <circle r="34" fill="#1e131d" stroke="#ef4444" stroke-width="3" filter="url(#glow-red-filter)" />
                <text text-anchor="middle" y="4" fill="#fff" font-size="11" font-weight="bold" font-family="sans-serif">XYZ Corp</text>
                <text text-anchor="middle" y="18" fill="#fca5a5" font-size="9" font-family="monospace">COVER BID</text>
              </g>

              <!-- Intermediary Node: Common Director Vikramaditya K. -->
              <g transform="translate(380, 90)">
                <circle r="24" fill="#2d1a12" stroke="#f59e0b" stroke-width="2.5" filter="url(#glow-gold-filter)" />
                <text text-anchor="middle" y="-2" fill="#fff" font-size="9" font-weight="bold" font-family="sans-serif">Vikram K.</text>
                <text text-anchor="middle" y="10" fill="#fcd34d" font-size="8" font-family="monospace">Director</text>
              </g>

              <!-- Intermediary Node: Common CA Sharma & Gupta -->
              <g transform="translate(380, 180)">
                <circle r="24" fill="#182030" stroke="#00f1fe" stroke-width="2" />
                <text text-anchor="middle" y="-2" fill="#fff" font-size="9" font-weight="bold" font-family="sans-serif">M/s Sharma</text>
                <text text-anchor="middle" y="10" fill="#74f5ff" font-size="8" font-family="monospace">Statutory CA</text>
              </g>

              <!-- Intermediary Node: Shared IP Gateway -->
              <g transform="translate(280, 260)">
                <rect x="-60" y="-18" width="120" height="36" rx="6" fill="#251214" stroke="#ef4444" stroke-width="2" />
                <text text-anchor="middle" y="4" fill="#fca5a5" font-size="10" font-weight="bold" font-family="monospace">103.21.124.0/24</text>
              </g>

              <!-- Intermediary Node: Shared MIDC Premises -->
              <g transform="translate(480, 260)">
                <rect x="-60" y="-18" width="120" height="36" rx="6" fill="#1b1c24" stroke="#f59e0b" stroke-width="1.5" />
                <text text-anchor="middle" y="4" fill="#fcd34d" font-size="9" font-weight="bold" font-family="sans-serif">Plot 44 MIDC</text>
              </g>

              <!-- Independent Node: Bidder PQR -->
              <g transform="translate(780, 120)">
                <circle r="34" fill="#0d231a" stroke="#10b981" stroke-width="3" />
                <text text-anchor="middle" y="4" fill="#fff" font-size="11" font-weight="bold" font-family="sans-serif">PQR Engg</text>
                <text text-anchor="middle" y="18" fill="#86efac" font-size="9" font-family="monospace">CLEAN / ISOLATED</text>
              </g>
              <g transform="translate(780, 220)">
                <circle r="20" fill="#0d231a" stroke="#10b981" stroke-width="1.5" />
                <text text-anchor="middle" y="3" fill="#86efac" font-size="8" font-family="monospace">Chennai HQ</text>
              </g>
            </svg>
          </div>
          <div style="margin-top: 0.75rem; font-family: var(--font-mono); font-size: 0.78rem; color: #cbd5e1; background: rgba(239, 68, 68, 0.08); padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(239, 68, 68, 0.25);">
            <strong style="color: #ffb4ab;">Forensic Cross-Check Summary:</strong> Four distinct vector collisions detected between ABC Industries and XYZ Corporation (Common Auditor UDIN, Executive Director cross-movement within 45 days, Shared MIDC Physical Premises, and Identical Subnet IP Gateway).
          </div>
        </div>

        <!-- Two Column Deep Forensics (Metadata Table + Boilerplate Analysis) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
          <!-- Left: Metadata Collision Table -->
          <div class="glass-panel ghost-border rounded-lg" style="padding: 1.25rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
              <span class="material-symbols-outlined" style="color: var(--accent-cyan);">terminal</span>
              <h4 style="font-family: 'Geist', var(--font-display); font-size: 1.1rem; color: #fff; font-weight: 600;">
                PDF Metadata & Network Forensics
              </h4>
            </div>

            <div id="metadata-evidence-list">
              <!-- Populated dynamically -->
            </div>
          </div>

          <!-- Right: Text Boilerplate Plagiarism -->
          <div class="glass-panel ghost-border rounded-lg" style="padding: 1.25rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
              <span class="material-symbols-outlined" style="color: #ef4444;">difference</span>
              <h4 style="font-family: 'Geist', var(--font-display); font-size: 1.1rem; color: #fff; font-weight: 600;">
                Proposal Boilerplate Text Plagiarism
              </h4>
            </div>

            <div id="plagiarism-list">
              <!-- Populated dynamically -->
            </div>
          </div>
        </div>

        <!-- Bottom: Pricing Symmetry / Cover Bidding Cushion -->
        <div class="glass-panel ghost-border rounded-lg" style="padding: 1.25rem; border-left: 4px solid #f59e0b;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="material-symbols-outlined" style="color: #f59e0b;">query_stats</span>
              <h4 style="font-family: 'Geist', var(--font-display); font-size: 1.1rem; color: #fff; font-weight: 600;">
                Cover Bidding Price Cushion Analysis
              </h4>
            </div>
            <span class="badge badge-medium">CCI BENCHMARK SPREAD</span>
          </div>

          <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 1rem;">
            Bidder XYZ Corp quoted ₹51.80 Cr (+6.80% above baseline) acting as an engineered cover bid, protecting ABC Industries (₹46.20 Cr, -4.74%) from realistic market competition while creating an illusion of multi-party competitive bidding.
          </p>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
            <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; padding: 0.85rem; text-align: center;">
              <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #fca5a5;">ABC Industries (Designated Prime)</div>
              <div style="font-family: var(--font-mono); font-size: 1.35rem; font-weight: 700; color: #fff; margin: 0.25rem 0;">₹46.20 Cr</div>
              <div style="font-size: 0.75rem; color: #86efac;">-4.74% under benchmark</div>
            </div>
            <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 6px; padding: 0.85rem; text-align: center;">
              <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #fcd34d;">XYZ Corporation (Cover Bidder)</div>
              <div style="font-family: var(--font-mono); font-size: 1.35rem; font-weight: 700; color: #fff; margin: 0.25rem 0;">₹51.80 Cr</div>
              <div style="font-size: 0.75rem; color: #fca5a5;">+6.80% artificial cushion</div>
            </div>
            <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 6px; padding: 0.85rem; text-align: center;">
              <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #6ee7b7;">PQR Engineering (Genuine Independent)</div>
              <div style="font-family: var(--font-mono); font-size: 1.35rem; font-weight: 700; color: #fff; margin: 0.25rem 0;">₹44.90 Cr</div>
              <div style="font-size: 0.75rem; color: #86efac;">-7.42% competitive L1</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Fetch collusion data
  api.getCollusionAnalysis()
    .then((data) => {
      const loader = container.querySelector('#cartel-loading');
      const content = container.querySelector('#cartel-content');
      if (loader) loader.style.display = 'none';
      if (content) content.style.display = 'block';

      // Render Metadata Items
      const metaContainer = container.querySelector('#metadata-evidence-list');
      if (metaContainer && data.metadata_evidence) {
        metaContainer.innerHTML = data.metadata_evidence.map((item) => `
          <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 0.75rem; margin-bottom: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
              <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-cyan); font-weight: 600;">
                ${item.attribute}
              </span>
              <span class="badge ${item.anomaly_score > 0.7 ? 'badge-high' : 'badge-low'}" style="font-size: 0.65rem;">
                ${(item.anomaly_score * 100).toFixed(0)}% ANOMALY
              </span>
            </div>
            <div style="font-family: var(--font-mono); font-size: 0.72rem; color: #94a3b8;">
              <div>ABC: <span style="color: #fff;">${item.val_a}</span></div>
              <div>XYZ: <span style="color: #fff;">${item.val_b}</span></div>
            </div>
            <div style="font-size: 0.75rem; color: #cbd5e1; margin-top: 0.35rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.35rem;">
              ℹ️ ${item.interpretation}
            </div>
          </div>
        `).join('');
      }

      // Render Plagiarism Items
      const plagContainer = container.querySelector('#plagiarism-list');
      if (plagContainer && data.plagiarism_matrix) {
        plagContainer.innerHTML = data.plagiarism_matrix.map((p) => `
          <div style="background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 6px; padding: 0.75rem; margin-bottom: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
              <strong style="font-size: 0.82rem; color: #fff;">${p.section}</strong>
              <span class="badge badge-high" style="font-size: 0.65rem;">${p.similarity_percentage}% SIMILAR</span>
            </div>
            <div style="background: rgba(0,0,0,0.4); border-left: 3px solid #ef4444; padding: 0.5rem; border-radius: 4px; font-family: var(--font-mono); font-size: 0.75rem; color: #fca5a5; line-height: 1.4; margin-top: 0.5rem;">
              "${p.shared_phrase_samples[0]}"
            </div>
          </div>
        `).join('');
      }

      // Export Dossier Button
      container.querySelector('#btn-export-cci-dossier')?.addEventListener('click', () => {
        showToast('Generating official CCI & CVO Cartelization Dossier with cryptographic signatures...', 'info');
        setTimeout(() => {
          showToast('Dossier generated: File MoPNG-EVAL-CCI-2026.pdf ready for transmission.', 'success');
        }, 1200);
      });
    })
    .catch((err) => {
      const loader = container.querySelector('#cartel-loading');
      if (loader) loader.innerHTML = `<div style="color: #fca5a5;">Failed to load collusion data: ${err.message}</div>`;
    });
}
