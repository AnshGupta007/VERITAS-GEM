/**
 * Source Verification Adapters & Live Testing Console
 */
import { store } from '../state.js';
import { api } from '../api.js';
import { getProviderBadgeClass, showToast } from '../utils.js';

export function renderAdapters(container) {
  const state = store.getState();
  const adapters = state.adapters || [];

  container.innerHTML = `
    <!-- Explainer Banner -->
    <div class="card card-elevated" style="margin-bottom: var(--spacing-xl);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--spacing-md);">
        <div>
          <div style="display: flex; gap: 0.5rem; margin-bottom: 0.35rem;">
            <span class="badge badge-real">ARCHITECTURAL CREDIBILITY</span>
            <span class="badge badge-info">ADAPTER PATTERN</span>
          </div>
          <h2 style="color: #fff; font-size: 1.6rem;">Source Verification Adapters</h2>
          <p style="font-size: 0.9rem; color: #cbd5e1; max-width: 900px;">
            In full adherence to hackathon integrity, VERITAS-GEM explicitly labels every verification result as 
            <strong style="color: #c4b5fd;">MOCK</strong>, <strong style="color: #fcd34d;">SIMULATED</strong>, or <strong style="color: #6ee7b7;">REAL</strong>. 
            The adapter interface abstraction (<code style="color: var(--accent-cyan);">VerificationProvider</code>) allows swapping to authorized government APIs without altering UI or evidence models.
          </p>
        </div>
      </div>
    </div>

    <!-- Adapters Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
      ${adapters
        .map(
          (ad) => `
        <div class="glass-panel ghost-border rounded-lg" style="padding: 1.5rem; border-radius: 8px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
              <div>
                <span class="badge ${getProviderBadgeClass(ad.provider_type)}" style="margin-bottom: 0.35rem;">
                  ${ad.provider_type} ADAPTER
                </span>
                <h3 style="font-size: 1.1rem; color: #fff; margin-top: 0.2rem;">${ad.name}</h3>
                <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">Authority: ${ad.target_authority}</div>
              </div>
              <span class="badge badge-low" style="font-size: 0.65rem;">${ad.status}</span>
            </div>

            <p style="font-size: 0.82rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 1rem;">
              ${ad.description}
            </p>

            <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 0.6rem 0.85rem; font-size: 0.75rem; margin-bottom: 1.25rem;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.2rem;">
                <span style="color: var(--text-muted);">Average Latency:</span>
                <strong style="color: var(--accent-cyan); font-family: var(--font-mono);">${ad.latency_ms} ms</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);">Sample Key:</span>
                <code style="color: #fcd34d;">${ad.sample_identifier}</code>
              </div>
            </div>
          </div>

          <button class="btn btn-outline-cyan btn-sm btn-quick-test" 
                  data-adapter-id="${ad.adapter_id}" 
                  data-identifier="${ad.sample_identifier}"
                  style="width: 100%;">
            Test Query Response ⚡
          </button>
        </div>
      `
        )
        .join('')}
    </div>

    <!-- Live Test Console Output -->
    <div id="adapter-test-console" class="card" style="display: none; background: #070b14; border-color: var(--accent-cyan);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; border-bottom: 1px solid var(--surface-border); padding-bottom: 0.5rem;">
        <h4 style="color: var(--accent-cyan); font-family: var(--font-mono);">Live Verification Output</h4>
        <button id="btn-close-console" class="btn btn-secondary btn-sm">Close Console ✕</button>
      </div>
      <pre id="adapter-json-output" style="font-size: 0.82rem; color: #86efac; overflow-x: auto; max-height: 320px; line-height: 1.5;"></pre>
    </div>
  `;

  // Quick test buttons
  container.querySelectorAll('.btn-quick-test').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const adapterId = e.currentTarget.getAttribute('data-adapter-id');
      const sampleId = e.currentTarget.getAttribute('data-identifier');
      const consoleBox = container.querySelector('#adapter-test-console');
      const outputPre = container.querySelector('#adapter-json-output');

      try {
        showToast(`Sending test ping to ${adapterId}...`, 'info');
        const res = await api.testAdapter(adapterId, sampleId);
        if (consoleBox && outputPre) {
          consoleBox.style.display = 'block';
          outputPre.textContent = JSON.stringify(res, null, 2);
          consoleBox.scrollIntoView({ behavior: 'smooth' });
        }
        showToast('Adapter response received', 'success');
      } catch (err) {
        showToast(`Adapter test error: ${err.message}`, 'error');
      }
    });
  });

  container.querySelector('#btn-close-console')?.addEventListener('click', () => {
    const consoleBox = container.querySelector('#adapter-test-console');
    if (consoleBox) consoleBox.style.display = 'none';
  });
}
