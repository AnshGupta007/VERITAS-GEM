/**
 * 'Ask Veritas' Conversational Forensic Procurement Copilot
 * Floating launcher + interactive sliding drawer with grounded citations
 */
import { store } from '../state.js';
import { api } from '../api.js';
import { showToast } from '../utils.js';

export function initCopilotDrawer() {
  const existing = document.getElementById('veritas-copilot-root');
  if (existing) existing.remove();

  const root = document.createElement('div');
  root.id = 'veritas-copilot-root';
  root.innerHTML = `
    <!-- Floating Trigger Button (Hidden: using Stitch persistent button #btn-floating-copilot) -->
    <button id="copilot-floating-btn" style="display: none;"></button>

    <!-- Slide-Out Chat Drawer -->
    <div id="copilot-drawer" class="glass-panel ghost-border" style="position: fixed; top: 0; right: -460px; width: 440px; height: 100vh; z-index: 1000; display: flex; flex-direction: column; background: rgba(13, 16, 24, 0.95); backdrop-filter: blur(24px); border-left: 1px solid rgba(0, 241, 254, 0.25); box-shadow: -15px 0 35px rgba(0,0,0,0.7); transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
      <!-- Drawer Header -->
      <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.4);">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(0, 241, 254, 0.15); border: 1px solid var(--accent-cyan); display: flex; align-items: center; justify-content: center;">
            <span class="material-symbols-outlined" style="color: var(--accent-cyan); font-size: 18px;">neurology</span>
          </div>
          <div>
            <h3 style="font-family: 'Geist', var(--font-display); font-size: 1.05rem; color: #fff; font-weight: 700;">
              Ask Veritas Copilot
            </h3>
            <div style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--accent-cyan);">
              Grounded on 47 MoPNG Clauses & GFR 2017
            </div>
          </div>
        </div>

        <button id="copilot-close-btn" class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">✕</button>
      </div>

      <!-- Quick Prompt Suggestion Chips -->
      <div style="padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; gap: 0.5rem; overflow-x: auto; white-space: nowrap; scrollbar-width: none;">
        <button class="copilot-chip" data-q="What is the active tender and its estimated value?">Active Tender Dossier</button>
        <button class="copilot-chip" data-q="Which bidder has the highest risk of disqualification?">Disqualification Risk</button>
        <button class="copilot-chip" data-q="What is the turnover discrepancy for ABC Industries?">Turnover Conflict?</button>
        <button class="copilot-chip" data-q="Is there any cartelization or bid rigging detected?">Cartelization Radar?</button>
        <button class="copilot-chip" data-q="Did ABC's BIS License expire before the bid date?">BIS License Lapsed?</button>
        <button class="copilot-chip" data-q="Compare Local Content for all bidders">Make in India %?</button>
      </div>

      <!-- Chat Stream Body -->
      <div id="copilot-chat-messages" style="flex: 1; padding: 1.25rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem;">
        <!-- Welcome Message -->
        <div class="copilot-msg-bot" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1rem; font-size: 0.82rem; line-height: 1.5; color: #cbd5e1;">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
            <span class="badge badge-info" style="font-size: 0.65rem;">VERITAS AI</span>
            <span style="font-family: var(--font-mono); font-size: 0.7rem; color: #94a3b8;">Deterministic Engine</span>
          </div>
          Greetings, Committee Member. I can analyze subsea clauses, verify financial discrepancies, cross-check BIS validity, or detect cartelization patterns. How may I assist your evaluation today?
        </div>
      </div>

      <!-- Chat Input Bar -->
      <div style="padding: 1rem; border-top: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.5);">
        <form id="copilot-form" style="display: flex; gap: 0.5rem;">
          <input id="copilot-input" type="text" placeholder="Ask about clauses, contradictions, or rules..." style="flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 0.65rem 0.85rem; color: #fff; font-size: 0.82rem; font-family: 'Inter', sans-serif; outline: none;" />
          <button type="submit" class="btn btn-sm glow-cyan" style="background: var(--gradient-brand); color: #070b14; font-weight: 700;">
            <span class="material-symbols-outlined" style="font-size: 18px;">send</span>
          </button>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(root);

  const drawer = root.querySelector('#copilot-drawer');
  const floatBtn = root.querySelector('#copilot-floating-btn');
  const closeBtn = root.querySelector('#copilot-close-btn');
  const chatMessages = root.querySelector('#copilot-chat-messages');
  const form = root.querySelector('#copilot-form');
  const input = root.querySelector('#copilot-input');

  let isOpen = false;
  const openDrawer = () => {
    isOpen = true;
    drawer.style.right = '0px';
    setTimeout(() => input.focus(), 100);
  };
  const closeDrawer = () => {
    isOpen = false;
    drawer.style.right = '-460px';
  };
  const toggleDrawer = () => {
    if (isOpen) closeDrawer();
    else openDrawer();
  };

  floatBtn?.addEventListener('click', toggleDrawer);
  document.getElementById('btn-floating-copilot')?.addEventListener('click', toggleDrawer);
  closeBtn?.addEventListener('click', closeDrawer);

  // Quick Chips
  root.querySelectorAll('.copilot-chip').forEach((chip) => {
    chip.addEventListener('click', (e) => {
      const q = e.currentTarget.getAttribute('data-q');
      handleUserQuery(q);
    });
  });

  // Form Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    handleUserQuery(q);
  });

  async function handleUserQuery(question) {
    // 1. Add User Message
    const userMsg = document.createElement('div');
    userMsg.style.cssText = 'align-self: flex-end; background: rgba(0, 241, 254, 0.15); border: 1px solid rgba(0, 241, 254, 0.35); border-radius: 8px; padding: 0.75rem 1rem; color: #fff; font-size: 0.82rem; max-width: 85%;';
    userMsg.textContent = question;
    chatMessages.appendChild(userMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // 2. Add Thinking Placeholder
    const botMsg = document.createElement('div');
    botMsg.style.cssText = 'background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1rem; font-size: 0.82rem; line-height: 1.5; color: #cbd5e1;';
    botMsg.innerHTML = `<span class="status-dot status-dot-active" style="margin-right: 6px;"></span> Consulting 47 MoPNG clauses and audit ledger...`;
    chatMessages.appendChild(botMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      const res = await api.askCopilot(question);
      // Escape HTML to prevent XSS before parsing markdown
      const escapeHTML = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const escaped = escapeHTML(res.answer || 'Analysis complete.');
      let formatted = escaped
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #fff;">$1</strong>')
        .replace(/\n\n/g, '<br/><br/>')
        .replace(/\n- /g, '<br/>• ');

      let citationsHtml = '';
      if (res.citations && res.citations.length > 0) {
        citationsHtml = `
          <div style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.08); font-family: var(--font-mono); font-size: 0.72rem;">
            <div style="color: var(--accent-cyan); font-weight: 600; margin-bottom: 0.25rem;">Grounded Document Citations:</div>
            ${res.citations.map((c) => `
              <div class="copilot-citation-link" data-finding="${escapeHTML(c.finding_id || 'FIND-ABC-01')}" style="color: #86efac; cursor: pointer; text-decoration: underline; margin-bottom: 0.2rem;">
                📄 ${escapeHTML(c.doc)} (Page ${escapeHTML(c.page)}) — ${escapeHTML(c.clause)}
              </div>
            `).join('')}
          </div>
        `;
      }

      botMsg.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <span class="badge ${res.severity === 'CRITICAL' ? 'badge-high' : 'badge-info'}" style="font-size: 0.65rem;">
            ${res.severity || 'VERIFIED'}
          </span>
          <span style="font-family: var(--font-mono); font-size: 0.68rem; color: #94a3b8;">Rule 144 Grounded</span>
        </div>
        <div>${formatted}</div>
        ${citationsHtml}
      `;

      // Attach citation click handler to jump to evidence
      botMsg.querySelectorAll('.copilot-citation-link').forEach((link) => {
        link.addEventListener('click', (e) => {
          const findingId = e.currentTarget.getAttribute('data-finding');
          store.setState({ selectedFindingId: findingId, currentView: 'evidence' });
          toggleDrawer();
          showToast(`Jumped to Grounded Evidence for ${findingId}`, 'info');
        });
      });

    } catch (e) {
      botMsg.innerHTML = `<span style="color: #ef4444;">Query error: ${e.message}</span>`;
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}
