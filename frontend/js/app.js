/**
 * VERITAS-GEM Main Application Controller (Stitch AI Architecture)
 */
import { store } from './state.js';
import { api } from './api.js';
import { renderCommandCenter } from './components/command-center.js';
import { renderCartelizationRadar } from './components/cartelization-radar.js';
import { renderCommitteePanel } from './components/committee-panel.js';
import { initCopilotDrawer } from './components/copilot-drawer.js';
import { renderTenderIntelligence } from './components/tender-intelligence.js';
import { renderBidderMatrix } from './components/bidder-matrix.js';
import { renderEvidenceViewer } from './components/evidence-viewer.js';
import { renderContradictionRadar } from './components/contradiction-radar.js';
import { renderTimeMachine } from './components/time-machine.js';
import { renderDecisionModal } from './components/decision-center.js';
import { renderAuditLedger } from './components/audit-ledger.js';
import { renderAdapters } from './components/adapter-status.js';
import { renderTenderIngestModal } from './components/tender-ingest-modal.js';
import { renderCommercialCenter } from './components/commercial-center.js';
import { renderPolicySandboxModal } from './components/policy-sandbox-modal.js';
import { renderCureDeskModal } from './components/cure-desk-modal.js';
import { startDemoTour } from './components/demo-tour.js';
import { formatINR, showToast } from './utils.js';

let navListenersAttached = false;

async function initApp() {
  const viewContainer = document.getElementById('view-content-mount');

  try {
    // 1. Initial parallel data load
    const [status, tender, bidders, adapters, auditTrail] = await Promise.all([
      api.getSystemStatus(),
      api.getTender(),
      api.getBidders(),
      api.getAdapters(),
      api.getAuditTrail(),
    ]);

    const defaultBidderId = bidders[0]?.id || 'BID-ABC-001';
    const findings = await api.getBidderFindings(defaultBidderId);

    store.setState({
      systemStatus: status,
      tender,
      bidders,
      selectedBidderId: defaultBidderId,
      findings,
      selectedFindingId: findings[0]?.id || 'FIND-ABC-01',
      adapters,
      auditTrail,
    });

    // 2. Update Stitch Header Information
    const tenderEl = document.getElementById('stitch-header-tender');
    if (tenderEl && tender) {
      tenderEl.textContent = `${tender.tender_number} | Value: ${formatINR(tender.estimated_value_inr)}`;
    }

    // 3. Attach Global Stitch Header Action Handlers
    attachHeaderActions();

    // 4. Bind Stitch Side Navigation
    setupSidebarNavigation();

    // 5. Render Active View
    renderCurrentView(viewContainer);

    // 6. Initialize 'Ask Veritas' Conversational Copilot Drawer
    initCopilotDrawer();

    // 7. Subscribe to State Changes
    store.subscribe((state) => {
      updateSidebarNav(state);
      renderCurrentView(viewContainer);

      // Handle active modal
      if (state.activeModal === 'decision-modal') {
        renderDecisionModal();
      } else if (state.activeModal === 'cure-desk-modal') {
        renderCureDeskModal(state.activeModalBidderId);
      } else if (state.activeModal === 'policy-sandbox-modal') {
        renderPolicySandboxModal();
      }
    });

    console.log('✅ VERITAS-GEM Stitch Frontend successfully initialized.');
  } catch (err) {
    console.error('Initialization error:', err);
    if (viewContainer) {
      viewContainer.innerHTML = `
        <div class="glass-panel ghost-border rounded-lg" style="border-color: #ef4444; text-align: center; padding: 3rem;">
          <h2 style="color: #ffb4ab; font-size: 1.5rem; margin-bottom: 0.5rem; font-family: 'Geist', sans-serif;">Failed to initialize platform</h2>
          <p style="color: var(--text-secondary); font-family: var(--font-mono); font-size: 0.9rem;">${err.message}</p>
          <button onclick="location.reload()" class="btn btn-outline-cyan btn-sm" style="margin-top: 1rem;">Retry Connection</button>
        </div>
      `;
    }
  }
}

function attachHeaderActions() {
  // Judge Demo Mode Tour
  document.getElementById('btn-pitch-tour')?.addEventListener('click', () => {
    startDemoTour();
  });

  // Policy Sandbox Configurator
  document.getElementById('btn-header-policy')?.addEventListener('click', () => {
    renderPolicySandboxModal();
  });

  // Upload Custom Tender Modal
  document.getElementById('btn-header-upload')?.addEventListener('click', () => {
    renderTenderIngestModal();
  });

  // Reset Demo Pipeline
  document.getElementById('btn-reset-demo')?.addEventListener('click', async () => {
    try {
      showToast('Resetting platform pipeline...', 'info');
      await api.resetDemo();
      showToast('Demo state successfully reset to initial baseline', 'success');
      
      const [bidders, findings, audit] = await Promise.all([
        api.getBidders(),
        api.getBidderFindings(store.getState().selectedBidderId),
        api.getAuditTrail(),
      ]);
      store.setState({ bidders, findings, auditTrail: audit });
    } catch (err) {
      showToast(`Reset error: ${err.message}`, 'error');
    }
  });

  // Sidebar quick audit button
  document.getElementById('btn-sidebar-audit-quick')?.addEventListener('click', () => {
    store.setState({ currentView: 'audit' });
  });
}

function setupSidebarNavigation() {
  const navItems = document.querySelectorAll('.stitch-nav-item');

  if (!navListenersAttached) {
    navItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        const targetView = e.currentTarget.getAttribute('data-view');
        if (targetView) {
          store.setState({ currentView: targetView });
        }
      });
    });
    navListenersAttached = true;
  }

  updateSidebarNav(store.getState());
}

function updateSidebarNav(state) {
  const currentView = state.currentView;
  const navItems = document.querySelectorAll('.stitch-nav-item');

  navItems.forEach((item) => {
    const view = item.getAttribute('data-view');
    const icon = item.querySelector('.material-symbols-outlined');

    if (view === currentView) {
      item.className = 'stitch-nav-item flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg font-label-mono text-xs font-bold translate-x-1 transition-transform shadow-md bg-primary-container text-on-primary-container cursor-pointer';
      if (icon) icon.style.fontVariationSettings = "'FILL' 1";
    } else {
      item.className = 'stitch-nav-item flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg font-label-mono text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all duration-200 cursor-pointer';
      if (icon) icon.style.fontVariationSettings = "'FILL' 0";
    }
  });
}

function renderCurrentView(container) {
  const currentView = store.getState().currentView;

  switch (currentView) {
    case 'command-center':
      renderCommandCenter(container);
      break;
    case 'cartelization':
      renderCartelizationRadar(container);
      break;
    case 'committee':
      renderCommitteePanel(container);
      break;
    case 'overview':
      renderTenderIntelligence(container);
      break;
    case 'bidders':
      renderBidderMatrix(container);
      break;
    case 'evidence':
      renderEvidenceViewer(container);
      break;
    case 'contradictions':
      renderContradictionRadar(container);
      break;
    case 'timemachine':
      renderTimeMachine(container);
      break;
    case 'audit':
      renderAuditLedger(container);
      break;
    case 'adapters':
      renderAdapters(container);
      break;
    case 'commercial':
      renderCommercialCenter(container);
      break;
    default:
      renderCommandCenter(container);
  }
}

// Bootstrap on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
