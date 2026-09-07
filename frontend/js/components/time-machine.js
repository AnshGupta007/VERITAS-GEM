/**
 * Compliance Time Machine Component (Screen 6 — Signature Killer Feature)
 */
import { store } from '../state.js';
import { api } from '../api.js';
import { formatDate } from '../utils.js';

let currentDateSliderValue = '2026-09-15'; // Anchor Bid Deadline

export function renderTimeMachine(container) {
  const state = store.getState();
  const selectedBidder = store.getSelectedBidder();

  container.innerHTML = `
    <!-- Top Explainer Banner -->
    <div class="card card-elevated" style="margin-bottom: var(--spacing-xl); border-color: rgba(0, 242, 254, 0.4); box-shadow: var(--shadow-glow-cyan);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--spacing-md);">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
            <span class="status-dot status-dot-active"></span>
            <span class="badge badge-real">SIGNATURE INNOVATION</span>
            <span class="badge badge-info">TEMPORAL EVIDENCE RECONSTRUCTION</span>
          </div>
          <h2 style="color: #fff; font-size: 1.6rem;">Compliance Time Machine</h2>
          <p style="font-size: 0.9rem; color: #cbd5e1; max-width: 850px;">
            A certificate valid today may have been expired on the tender deadline. Or a renewed certificate submitted later cannot cure a past defect. 
            <strong style="color: var(--accent-cyan);">Drag the slider to reconstruct the exact legal compliance state on any date.</strong>
          </p>
        </div>

        <div style="display: flex; gap: 0.5rem;">
          <div class="tabs-container">
            <button class="tab-btn ${state.selectedBidderId === 'BID-ABC-001' ? 'active' : ''}" data-bidder="BID-ABC-001">ABC Industries</button>
            <button class="tab-btn ${state.selectedBidderId === 'BID-XYZ-002' ? 'active' : ''}" data-bidder="BID-XYZ-002">XYZ Corp</button>
            <button class="tab-btn ${state.selectedBidderId === 'BID-PQR-003' ? 'active' : ''}" data-bidder="BID-PQR-003">PQR Engg</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Time Slider Controls Card -->
    <div class="time-machine-controls">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Evaluated Simulated Date:</span>
          <span id="evaluated-date-display" style="font-family: var(--font-mono); font-size: 1.5rem; font-weight: 800; color: var(--accent-cyan); margin-left: 8px;">
            ${formatDate(currentDateSliderValue)}
          </span>
          <span id="anchor-badge-container"></span>
        </div>

        <div style="display: flex; gap: 0.5rem;">
          <button id="btn-preset-anchor" class="btn btn-outline-cyan btn-sm">
            🎯 Anchor: Bid Submission (15-Sep-2026)
          </button>
          <button id="btn-preset-2025" class="btn btn-secondary btn-sm">
            📅 Mid-2025 (Historical)
          </button>
          <button id="btn-preset-today" class="btn btn-secondary btn-sm">
            📍 Today
          </button>
        </div>
      </div>

      <!-- Scrubbable Slider -->
      <div class="timeline-slider-track">
        <input 
          type="range" 
          id="time-slider" 
          class="slider-input" 
          min="1" 
          max="1096" 
          value="988" 
          step="1"
        />
      </div>

      <!-- Timeline Landmarks -->
      <div class="timeline-markers">
        <div>2024-01-01</div>
        <div>2025-01-01</div>
        <div>
          <span class="anchor-marker-badge">▲ 15-Sep-2026 (BID DEADLINE)</span>
        </div>
        <div>2027-01-01</div>
      </div>
    </div>

    <!-- Active Temporal State Output -->
    <div id="temporal-results-container">
      <div class="card" style="text-align: center; padding: 2rem;">Reconstructing temporal compliance state...</div>
    </div>
  `;

  // Bidder selection tabs
  container.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const bid = e.currentTarget.getAttribute('data-bidder');
      store.setState({ selectedBidderId: bid });
    });
  });

  const slider = container.querySelector('#time-slider');
  const dateDisplay = container.querySelector('#evaluated-date-display');
  const anchorBadgeContainer = container.querySelector('#anchor-badge-container');

  // Map slider value (1..1096) from 2024-01-01 to 2026-12-31 using local date bounds
  const baseEpoch = new Date(2024, 0, 1).getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  function valueToDate(val) {
    const targetMs = baseEpoch + val * dayMs;
    const d = new Date(targetMs);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function dateToValue(dateStr) {
    const parts = dateStr.split('-');
    const targetMs = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)).getTime();
    return Math.round((targetMs - baseEpoch) / dayMs);
  }

  function updateSimulation(targetDate) {
    currentDateSliderValue = targetDate;
    if (dateDisplay) dateDisplay.textContent = formatDate(targetDate);

    const isAnchor = targetDate === '2026-09-15';
    if (anchorBadgeContainer) {
      anchorBadgeContainer.innerHTML = isAnchor
        ? `<span class="badge badge-mandatory" style="margin-left: 8px;">MANDATORY TENDER ANCHOR DATE</span>`
        : `<span class="badge badge-info" style="margin-left: 8px;">SIMULATED RECONSTRUCTION</span>`;
    }

    api
      .simulateTemporal(targetDate, selectedBidder.id)
      .then((data) => {
        renderGanttResults(container.querySelector('#temporal-results-container'), data, selectedBidder);
      })
      .catch((err) => {
        const res = container.querySelector('#temporal-results-container');
        if (res) res.innerHTML = `<div class="card" style="color: #fca5a5;">Failed to simulate: ${err.message}</div>`;
      });
  }

  slider.addEventListener('input', (e) => {
    const newDate = valueToDate(parseInt(e.target.value));
    updateSimulation(newDate);
  });

  // Preset buttons
  container.querySelector('#btn-preset-anchor')?.addEventListener('click', () => {
    slider.value = dateToValue('2026-09-15');
    updateSimulation('2026-09-15');
  });

  container.querySelector('#btn-preset-2025')?.addEventListener('click', () => {
    slider.value = dateToValue('2025-06-15');
    updateSimulation('2025-06-15');
  });

  container.querySelector('#btn-preset-today')?.addEventListener('click', () => {
    const todayStr = '2026-09-03';
    slider.value = dateToValue(todayStr);
    updateSimulation(todayStr);
  });

  // Initial load
  slider.value = dateToValue(currentDateSliderValue);
  updateSimulation(currentDateSliderValue);
}

function renderGanttResults(container, data, bidder) {
  if (!container) return;

  const hasExpiredOnDate = data.expired_count > 0;

  container.innerHTML = `
    <!-- Top Alert if Violations on Anchor Date -->
    ${
      data.is_anchor_date && hasExpiredOnDate
        ? `
      <div class="card pulse-red-glow" style="background: rgba(239, 68, 68, 0.14); border-color: #ef4444; margin-bottom: var(--spacing-lg);">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div style="font-size: 2rem;">🚨</div>
          <div>
            <h3 style="color: #fca5a5; font-size: 1.15rem; margin-bottom: 0.2rem;">
              Critical Invalidation: ${data.expired_count} Mandatory Certificate${data.expired_count > 1 ? 's' : ''} Expired on Bid Submission Date
            </h3>
            <p style="color: #fecaca; font-size: 0.85rem;">
              The bidder was legally non-compliant at the time the bid envelope was locked on <strong>15-Sep-2026</strong>. Subsequent renewals do not remedy this defect under Section V Clause 5.2.
            </p>
          </div>
        </div>
      </div>
    `
        : ''
    }

    <!-- Summary Metrics -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--spacing-md); margin-bottom: var(--spacing-lg);">
      <div class="card" style="padding: 1rem;">
        <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Evaluated Date</div>
        <div style="font-size: 1.25rem; font-weight: 700; color: #fff; font-family: var(--font-mono);">${formatDate(data.evaluated_date)}</div>
      </div>
      <div class="card" style="padding: 1rem;">
        <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Temporal Compliance</div>
        <div style="font-size: 1.25rem; font-weight: 700; color: ${data.temporal_compliance_percent >= 80 ? '#86efac' : '#fca5a5'}; font-family: var(--font-mono);">
          ${data.temporal_compliance_percent}%
        </div>
      </div>
      <div class="card" style="padding: 1rem;">
        <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Active / Valid</div>
        <div style="font-size: 1.25rem; font-weight: 700; color: #86efac; font-family: var(--font-mono);">${data.valid_count}</div>
      </div>
      <div class="card" style="padding: 1rem;">
        <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Expired on Date</div>
        <div style="font-size: 1.25rem; font-weight: 700; color: #fca5a5; font-family: var(--font-mono);">${data.expired_count}</div>
      </div>
    </div>

    <!-- Certificate Timeline List -->
    <div style="display: flex; flex-direction: column;">
      ${data.certificates
        .map((cert) => {
          const isValid = cert.status_on_evaluated_date === 'VALID';
          const isExpired = cert.status_on_evaluated_date === 'EXPIRED';

          return `
        <div class="gantt-item" style="${isExpired ? 'border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.05);' : ''}">
          <!-- Col 1: Cert Info -->
          <div>
            <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.2rem;">
              <span class="badge ${isValid ? 'badge-low' : 'badge-danger'}" style="font-size: 0.65rem;">
                ${cert.status_on_evaluated_date}
              </span>
            </div>
            <div style="font-weight: 600; color: #fff; font-size: 0.88rem;">${cert.certificate_name}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">Authority: ${cert.issuing_authority}</div>
          </div>

          <!-- Col 2: Window Details & Bar -->
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.35rem; font-family: var(--font-mono);">
              <span>Issued: ${formatDate(cert.issue_date)}</span>
              <span>Expiry: ${formatDate(cert.expiry_date)}</span>
            </div>
            
            <div class="gantt-bar-container">
              <div class="gantt-bar-active ${isValid ? 'score-bar-fill-low' : 'score-bar-fill-high'}" style="width: 100%;"></div>
            </div>

            <div style="font-size: 0.75rem; color: ${isExpired ? '#fca5a5' : '#cbd5e1'}; margin-top: 0.35rem;">
              ${cert.reconstructed_details}
            </div>
          </div>

          <!-- Col 3: Status Badge Action -->
          <div style="text-align: right;">
            <div style="font-size: 0.85rem; font-weight: 700; font-family: var(--font-mono); color: ${isValid ? '#86efac' : '#fca5a5'};">
              ${isValid ? 'ACTIVE ✓' : `${Math.abs(cert.days_difference)}d LAPSED`}
            </div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">
              ${isValid ? 'Good Standing' : 'Defective'}
            </div>
          </div>
        </div>
      `;
        })
        .join('')}
    </div>
  `;
}
