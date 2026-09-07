/**
 * VERITAS-GEM Backend API Client
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errorData.detail || `HTTP Error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error on [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  getSystemStatus: () => request('/system/status'),
  getTender: () => request('/tenders'),
  getTenderClauses: (tenderId, category = '', criticality = '') => {
    let q = `/tenders/${tenderId}/clauses`;
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (criticality) params.append('criticality', criticality);
    const qs = params.toString();
    return request(qs ? `${q}?${qs}` : q);
  },
  getBidders: () => request('/bidders'),
  getBidder: (id) => request(`/bidders/${id}`),
  getBidderFindings: (id) => request(`/bidders/${id}/findings`),
  getFindingEvidence: (findingId) => request(`/findings/${findingId}/evidence`),
  getContradictions: (bidderId = '') => request(bidderId ? `/contradictions/${bidderId}` : '/contradictions'),
  getTemporal: (bidderId) => request(`/temporal/${bidderId}`),
  simulateTemporal: (dateStr, bidderId = '') => {
    let q = `/temporal/simulate?date=${encodeURIComponent(dateStr)}`;
    if (bidderId) q += `&bidder_id=${encodeURIComponent(bidderId)}`;
    return request(q);
  },
  getAdapters: () => request('/verification/adapters'),
  testAdapter: (adapterId, identifier) =>
    request(`/verification/adapters/test?adapter_id=${encodeURIComponent(adapterId)}&identifier=${encodeURIComponent(identifier)}`, {
      method: 'POST',
    }),
  submitDecision: (payload) =>
    request('/decisions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getAuditTrail: (bidderId = '') => request(bidderId ? `/audit?bidder_id=${bidderId}` : '/audit'),
  verifyAuditIntegrity: () => request('/audit/verify'),
  verifyAuditLedger: () => request('/audit/verify'),
  getBidderReport: (bidderId) => request(`/reports/${bidderId}`),
  resetDemo: () => request('/demo/reset', { method: 'POST' }),

  // Next-Gen Intelligence Suite
  getCollusionAnalysis: () => request('/forensics/collusion'),
  getCollusionNetwork: () => request('/forensics/network'),
  getShellRisk: (bidderId) => request(`/forensics/shell-risk/${bidderId}`),
  getShowCauseNotice: (bidderId) => request(`/legal/show-cause/${bidderId}`),
  queryCopilot: (query) =>
    request('/copilot/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),
  askCopilot: (query) =>
    request('/copilot/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),
  ingestTender: (payload) =>
    request('/tenders/ingest', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getCommitteeStatus: () => request('/committee/status'),
  signCommitteeMember: (payload) =>
    request('/committee/sign', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Advanced Enterprise Additions
  getTamperingAnalysis: (bidderId) => request(`/forensics/tampering/${bidderId}`),
  getRepresentation: (bidderId) => request(`/legal/representation/${bidderId}`),
  submitRepresentation: (payload) =>
    request('/legal/representation/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  decideRepresentation: (payload) =>
    request('/legal/representation/decide', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getCommercialEvaluation: () => request('/commercial/evaluation'),
  matchCommercialPrice: (bidderId = 'BID-PQR-003') =>
    request('/commercial/match-price', {
      method: 'POST',
      body: JSON.stringify({ bidder_id: bidderId }),
    }),
  getHsnDeconstruction: (bidderId) => request(`/commercial/hsn-deconstruction/${bidderId}`),
  simulateGemBid: () => request('/gem/simulate-bid', { method: 'POST' }),
  getPolicyConfig: () => request('/policy/config'),
  updatePolicyConfig: (config, officerId = 'OFF-8821') =>
    request('/policy/config', {
      method: 'POST',
      body: JSON.stringify({ config, officer_id: officerId }),
    }),
  getHistoricalProfile: (bidderId) => request(`/forensics/historical/${bidderId}`),
  uploadPdf: async (formData) => {
    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `Upload failed: HTTP ${res.status}`);
    }
    return await res.json();
  },
  uploadBidderPdf: async (formData) => {
    const res = await fetch('/api/bidders/upload-pdf', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `Upload failed: HTTP ${res.status}`);
    }
    return await res.json();
  },
};

