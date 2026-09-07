/**
 * Tender Intelligence & Clause Requirements Matrix (Screen 1 & 2)
 */
import { store } from '../state.js';
import { formatINR, formatDate, getRiskBadgeClass } from '../utils.js';

let activeCategoryFilter = 'ALL';
let searchQuery = '';

export function renderTenderIntelligence(container) {
  const state = store.getState();
  const tender = state.tender;

  if (!tender) {
    container.innerHTML = `<div class="card">Loading tender intelligence...</div>`;
    return;
  }

  // Filter clauses
  let filteredClauses = tender.clauses;
  if (activeCategoryFilter !== 'ALL') {
    if (activeCategoryFilter === 'MANDATORY') {
      filteredClauses = filteredClauses.filter((c) => c.criticality === 'MANDATORY');
    } else {
      filteredClauses = filteredClauses.filter((c) => c.category.toLowerCase().includes(activeCategoryFilter.toLowerCase()));
    }
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredClauses = filteredClauses.filter(
      (c) =>
        c.clause_no.toLowerCase().includes(q) ||
        c.heading.toLowerCase().includes(q) ||
        c.raw_text.toLowerCase().includes(q)
    );
  }

  container.innerHTML = `
    <!-- Executive Overview Banner -->
    <div class="card card-elevated" style="margin-bottom: var(--spacing-xl);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--spacing-md);">
        <div style="max-width: 900px;">
          <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
            <span class="badge badge-info">${tender.organization}</span>
            <span class="badge badge-real">AUTHORITATIVE GeM TENDER</span>
            <span class="badge badge-mandatory">${tender.mandatory_clauses_count} Mandatory Gates</span>
          </div>
          <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: #fff;">${tender.title}</h2>
          <p style="font-size: 0.9rem;">
            Tender Reference: <strong style="color: #fff; font-family: var(--font-mono);">${tender.tender_number}</strong> · 
            Published: <strong>${formatDate(tender.published_date)}</strong> · 
            Anchor Submission Deadline: <strong style="color: #fca5a5; font-family: var(--font-mono);">${formatDate(tender.submission_deadline)} (15:00 IST)</strong>
          </p>
        </div>

        <div style="text-align: right; background: rgba(0,0,0,0.3); padding: var(--spacing-md) var(--spacing-lg); border-radius: var(--radius-md); border: 1px solid var(--surface-border);">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Estimated Contract Value</div>
          <div style="font-size: 1.9rem; font-weight: 800; color: var(--accent-cyan); font-family: var(--font-mono);">${formatINR(tender.estimated_value_inr)}</div>
          <div style="font-size: 0.75rem; color: var(--color-low-risk);">Class-I Local Supplier Preference Applicable</div>
        </div>
      </div>
    </div>

    <!-- Clause Matrix Controls & Search -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md); flex-wrap: wrap; gap: var(--spacing-md);">
      <div class="tabs-container">
        <button class="tab-btn ${activeCategoryFilter === 'ALL' ? 'active' : ''}" data-cat="ALL">All Clauses (${tender.clauses.length})</button>
        <button class="tab-btn ${activeCategoryFilter === 'MANDATORY' ? 'active' : ''}" data-cat="MANDATORY">Mandatory Only</button>
        <button class="tab-btn ${activeCategoryFilter === 'Financial' ? 'active' : ''}" data-cat="Financial">Financial Standing</button>
        <button class="tab-btn ${activeCategoryFilter === 'Technical' ? 'active' : ''}" data-cat="Technical">Technical & Experience</button>
        <button class="tab-btn ${activeCategoryFilter === 'Certification' ? 'active' : ''}" data-cat="Certification">BIS & Quality Standards</button>
        <button class="tab-btn ${activeCategoryFilter === 'Statutory' ? 'active' : ''}" data-cat="Statutory">Statutory & GST</button>
        <button class="tab-btn ${activeCategoryFilter === 'Local Content' ? 'active' : ''}" data-cat="Local Content">Make in India (MII)</button>
      </div>

      <div style="position: relative; width: 280px;">
        <input 
          id="input-clause-search" 
          type="text" 
          class="form-input" 
          placeholder="Search clauses or criteria..." 
          value="${searchQuery}"
          style="padding-left: 2rem; font-size: 0.85rem;"
        />
        <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);">🔍</span>
      </div>
    </div>

    <!-- Clauses List -->
    <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
      ${
        filteredClauses.length === 0
          ? `<div class="card" style="text-align: center; color: var(--text-muted);">No clauses found matching filter.</div>`
          : filteredClauses
              .map(
                (clause) => `
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
            <div>
              <span class="badge ${clause.criticality === 'MANDATORY' ? 'badge-mandatory' : 'badge-med'}" style="margin-right: 0.5rem;">
                ${clause.criticality}
              </span>
              <span class="badge badge-info" style="margin-right: 0.5rem;">${clause.category}</span>
              <strong style="color: #fff; font-family: var(--font-mono); font-size: 0.95rem;">${clause.clause_no}</strong>
              <h3 style="font-size: 1.15rem; margin-top: 0.35rem;">${clause.heading}</h3>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono);">
              ${clause.requirements.length} Parsed Requirement${clause.requirements.length > 1 ? 's' : ''}
            </div>
          </div>

          <!-- Raw Tender Excerpt -->
          <div style="background: rgba(0,0,0,0.3); border-left: 3px solid var(--accent-cyan); padding: 0.75rem 1rem; border-radius: var(--radius-xs); margin-bottom: 1rem; font-size: 0.88rem; color: #cbd5e1; line-height: 1.6;">
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-family: var(--font-mono); margin-bottom: 0.25rem;">
              Original Tender Specification Text
            </div>
            "${clause.raw_text}"
          </div>

          <!-- Extracted Requirements Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: var(--spacing-md);">
            ${clause.requirements
              .map(
                (req) => `
              <div style="background: rgba(13, 21, 39, 0.7); border: 1px solid var(--surface-border); border-radius: var(--radius-sm); padding: 0.85rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
                  <span style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-cyan); font-size: 0.8rem;">${req.id}</span>
                  <span class="badge ${req.criticality === 'MANDATORY' ? 'badge-high' : 'badge-med'}" style="font-size: 0.65rem;">${req.criticality}</span>
                </div>
                <div style="font-weight: 600; color: #fff; font-size: 0.88rem; margin-bottom: 0.35rem;">${req.title}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.6rem;">${req.description}</div>
                
                <div style="border-top: 1px solid var(--surface-border-subtle); padding-top: 0.5rem; font-size: 0.75rem;">
                  <div style="margin-bottom: 0.2rem;"><strong style="color: var(--text-muted);">Required Evidence:</strong> <span style="color: #cbd5e1;">${req.required_evidence_type}</span></div>
                  <div style="margin-bottom: 0.2rem;"><strong style="color: var(--text-muted);">Validation Method:</strong> <span style="color: var(--accent-blue); font-family: var(--font-mono);">${req.validation_method}</span></div>
                  <div><strong style="color: var(--text-muted);">Threshold Rule:</strong> <code style="color: #fcd34d;">${req.threshold || 'N/A'}</code></div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
              )
              .join('')
      }
    </div>
  `;

  // Filter tabs click handlers
  container.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      activeCategoryFilter = e.currentTarget.getAttribute('data-cat');
      renderTenderIntelligence(container);
    });
  });

  // Search input handler
  const searchInput = container.querySelector('#input-clause-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderTenderIntelligence(container);
      // restore focus
      const updatedInput = container.querySelector('#input-clause-search');
      if (updatedInput) {
        updatedInput.focus();
        updatedInput.setSelectionRange(searchQuery.length, searchQuery.length);
      }
    });
  }
}
