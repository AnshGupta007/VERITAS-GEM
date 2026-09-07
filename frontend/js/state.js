/**
 * VERITAS-GEM Central Reactive State Store
 */

class StateStore {
  constructor() {
    this.state = {
      currentView: 'command-center', // Flagship view: Stitch AI Command Center HUD
      tender: null,
      bidders: [],
      selectedBidderId: 'BID-ABC-001',
      findings: [],
      selectedFindingId: 'FIND-ABC-01',
      selectedContradictionId: null,
      contradictions: [],
      temporalData: null,
      temporalDate: '2026-09-15',
      adapters: [],
      auditTrail: [],
      auditIntegrity: null,
      systemStatus: null,
      isTourActive: false,
      tourStep: 0,
      activeModal: null, // 'decision-modal' or 'report-modal'
    };
    this.subscribers = new Set();
  }

  getState() {
    return this.state;
  }

  setState(partialState) {
    this.state = { ...this.state, ...partialState };
    this.notify();
  }

  subscribe(listener) {
    this.subscribers.add(listener);
    return () => this.subscribers.delete(listener);
  }

  notify() {
    for (const listener of this.subscribers) {
      try {
        listener(this.state);
      } catch (err) {
        console.error('State subscriber error:', err);
      }
    }
  }

  getSelectedBidder() {
    return this.state.bidders.find((b) => b.id === this.state.selectedBidderId) || this.state.bidders[0];
  }
}

export const store = new StateStore();
