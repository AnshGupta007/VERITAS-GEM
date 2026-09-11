/**
 * 'Ask Veritas' Conversational Forensic Procurement Copilot
 * Floating launcher + interactive sliding drawer with Groq LPU LLM & deterministic fallback
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
    <!-- Floating Trigger Button (Hidden: using persistent button #btn-floating-copilot) -->
    <button id="copilot-floating-btn" style="display: none;"></button>

    <!-- Slide-Out Chat Drawer -->
    <div id="copilot-drawer" class="glass-panel ghost-border" style="position: fixed; top: 0; right: -480px; width: 460px; height: 100vh; z-index: 1000; display: flex; flex-direction: column; background: rgba(13, 16, 24, 0.96); backdrop-filter: blur(28px); border-left: 1px solid rgba(0, 241, 254, 0.25); box-shadow: -20px 0 45px rgba(0,0,0,0.8); transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
      <!-- Drawer Header -->
      <div style="padding: 1.1rem 1.4rem; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.45);">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <div style="width: 34px; height: 34px; border-radius: 8px; background: rgba(0, 241, 254, 0.15); border: 1px solid var(--accent-cyan); display: flex; align-items: center; justify-content: center;">
            <span class="material-symbols-outlined" style="color: var(--accent-cyan); font-size: 20px;">neurology</span>
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <h3 style="font-family: 'Geist', var(--font-display); font-size: 1.05rem; color: #fff; font-weight: 700; margin: 0;">
                Ask Veritas Copilot
              </h3>
              <span id="copilot-engine-chip" class="badge badge-real" style="font-size: 0.62rem; padding: 2px 6px;">
                ⚡ GROQ LPU AI
              </span>
            </div>
            <div style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--accent-cyan); margin-top: 2px;">
              Grounded on MoPNG Clauses, GFR 2017 & DPIIT Rules
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.4rem;">
          <button id="copilot-clear-chat-btn" title="Clear Chat Thread & Reset Memory" class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);">
            <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">refresh</span>
          </button>
          <button id="copilot-settings-toggle" title="Configure Groq API Key & Model" class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);">
            <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">settings</span>
          </button>
          <button id="copilot-close-btn" class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">✕</button>
        </div>
      </div>

      <!-- Optional Inline Settings Panel (Hidden by default) -->
      <div id="copilot-settings-panel" style="display: none; padding: 0.85rem 1.25rem; background: rgba(0, 241, 254, 0.04); border-bottom: 1px solid rgba(0, 241, 254, 0.2); font-size: 0.78rem;">
        <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--accent-cyan); font-weight: 700; margin-bottom: 0.4rem;">
          ⚡ GROQ LPU ACCELERATION SETTINGS
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.4rem;">
          <input id="copilot-groq-key-input" type="password" placeholder="Groq API Key (gsk_...)" style="background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; padding: 0.4rem 0.6rem; color: #fff; font-family: monospace; font-size: 0.75rem;" />
          <div style="display: flex; gap: 0.5rem; justify-content: space-between; align-items: center;">
            <select id="copilot-model-select" style="flex: 1; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; padding: 0.35rem; color: #cbd5e1; font-size: 0.72rem;">
              <option value="qwen/qwen3.8-27b">Qwen 3.8 27B (Ultra-Fast 380 T/s)</option>
              <option value="groq/compound">Groq Compound Reasoning</option>
              <option value="openai/gpt-oss-120b">GPT-OSS 120B Reasoning</option>
              <option value="openai/gpt-oss-20b">GPT-OSS 20B Fast</option>
            </select>
            <button id="copilot-save-key-btn" class="btn btn-primary btn-sm" style="font-size: 0.72rem; padding: 0.35rem 0.75rem;">Save Key</button>
          </div>
        </div>
      </div>

      <!-- Quick Prompt Suggestion Chips -->
      <div style="padding: 0.65rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; gap: 0.45rem; overflow-x: auto; white-space: nowrap; scrollbar-width: none;">
        <button class="copilot-chip" data-q="Draft a 48-hour statutory Show-Cause Notice to ABC Industries for their turnover contradiction and expired BIS license.">Draft Show-Cause Notice</button>
        <button class="copilot-chip" data-q="What is the active tender and its estimated value?">Active Tender Dossier</button>
        <button class="copilot-chip" data-q="Which bidder has the highest risk of disqualification?">Disqualification Risk</button>
        <button class="copilot-chip" data-q="What is the turnover discrepancy for ABC Industries?">Turnover Conflict?</button>
        <button class="copilot-chip" data-q="Is there any cartelization or bid rigging detected?">Cartelization Radar?</button>
        <button class="copilot-chip" data-q="Compare Local Content for all bidders under DPIIT rules">Make in India %?</button>
      </div>

      <!-- Chat Stream Body -->
      <div id="copilot-chat-messages" style="flex: 1; padding: 1.25rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem;">
        <!-- Welcome Message -->
        <div class="copilot-msg-bot" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1rem; font-size: 0.82rem; line-height: 1.5; color: #cbd5e1;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="badge badge-info" style="font-size: 0.65rem;">VERITAS AI</span>
              <span id="welcome-engine-tag" style="font-family: var(--font-mono); font-size: 0.7rem; color: #94a3b8;">⚡ Groq LPU Enabled</span>
            </div>
            <span style="font-family: var(--font-mono); font-size: 0.65rem; color: #64748b;">SIH26100</span>
          </div>
          Greetings, Committee Chairperson. I am equipped with real-time access to the active tender dossier, audited balance sheets, forensic contradiction reports, and the SHA-256 audit ledger. You may ask arbitrary questions, request formal disqualification drafts, or demand clause-level cross-examinations.
        </div>
      </div>

      <!-- Chat Input Bar -->
      <div style="padding: 1rem; border-top: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.55);">
        <form id="copilot-form" style="display: flex; gap: 0.5rem;">
          <input id="copilot-input" type="text" placeholder="Ask any question or request a formal legal draft..." style="flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 0.65rem 0.85rem; color: #fff; font-size: 0.82rem; font-family: 'Inter', sans-serif; outline: none;" />
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
  const settingsToggle = root.querySelector('#copilot-settings-toggle');
  const settingsPanel = root.querySelector('#copilot-settings-panel');
  const groqKeyInput = root.querySelector('#copilot-groq-key-input');
  const modelSelect = root.querySelector('#copilot-model-select');
  const saveKeyBtn = root.querySelector('#copilot-save-key-btn');
  const engineChip = root.querySelector('#copilot-engine-chip');
  const welcomeEngineTag = root.querySelector('#welcome-engine-tag');
  const chatMessages = root.querySelector('#copilot-chat-messages');
  const form = root.querySelector('#copilot-form');
  const input = root.querySelector('#copilot-input');

  // Load saved client settings if any
  const savedKey = localStorage.getItem('veritas_groq_api_key') || '';
  const savedModel = localStorage.getItem('veritas_groq_model') || 'qwen/qwen3.8-27b';
  if (savedKey) groqKeyInput.value = savedKey;
  if (savedModel) modelSelect.value = savedModel;

  // Check server Copilot status
  async function syncEngineStatus() {
    try {
      const status = await api.getCopilotStatus();
      if (status && (status.groq_configured || savedKey)) {
        engineChip.className = 'badge badge-real';
        engineChip.textContent = '⚡ GROQ LPU ACTIVE';
        if (welcomeEngineTag) welcomeEngineTag.textContent = `⚡ Groq LPU (${status.default_model || savedModel})`;
      } else {
        engineChip.className = 'badge badge-info';
        engineChip.textContent = 'DETERMINISTIC ENGINE';
        if (welcomeEngineTag) welcomeEngineTag.textContent = 'Local Deterministic Engine';
      }
    } catch {
      // Fallback
    }
  }
  syncEngineStatus();

  // Settings toggle & save
  settingsToggle?.addEventListener('click', () => {
    settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
  });

  saveKeyBtn?.addEventListener('click', () => {
    const val = groqKeyInput.value.trim();
    const mdl = modelSelect.value;
    if (val) {
      localStorage.setItem('veritas_groq_api_key', val);
      localStorage.setItem('veritas_groq_model', mdl);
      showToast('Groq API Key and Model saved successfully', 'success');
      syncEngineStatus();
    } else {
      localStorage.removeItem('veritas_groq_api_key');
      showToast('Client Groq API Key cleared; using server defaults', 'info');
      syncEngineStatus();
    }
    settingsPanel.style.display = 'none';
  });

  let isOpen = false;
  const openDrawer = () => {
    isOpen = true;
    drawer.style.right = '0px';
    setTimeout(() => input.focus(), 100);
  };
  const closeDrawer = () => {
    isOpen = false;
    drawer.style.right = '-480px';
  };
  const toggleDrawer = () => {
    if (isOpen) closeDrawer();
    else openDrawer();
  };

  const clearBtn = root.querySelector('#copilot-clear-chat-btn');
  let conversationHistory = [];

  clearBtn?.addEventListener('click', () => {
    conversationHistory = [];
    chatMessages.innerHTML = `
      <div class="copilot-msg-bot" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1rem; font-size: 0.82rem; line-height: 1.5; color: #cbd5e1;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="badge badge-info" style="font-size: 0.65rem;">VERITAS AI</span>
            <span style="font-family: var(--font-mono); font-size: 0.7rem; color: #94a3b8;">⚡ Thread Reset</span>
          </div>
          <span style="font-family: var(--font-mono); font-size: 0.65rem; color: #64748b;">SIH26100</span>
        </div>
        Greetings, Committee Chairperson. Conversation history has been reset. What would you like to examine next?
      </div>
    `;
    showToast('Copilot conversation reset.', 'info');
  });

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
    botMsg.innerHTML = `<span class="status-dot status-dot-active" style="margin-right: 6px;"></span> Consulting live tender context & Groq reasoning core...`;
    chatMessages.appendChild(botMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      const clientKey = localStorage.getItem('veritas_groq_api_key') || null;
      const clientModel = localStorage.getItem('veritas_groq_model') || null;
      const res = await api.askCopilot(question, clientKey, clientModel, conversationHistory);
      if (res && res.answer) {
        conversationHistory.push({ role: 'user', content: question });
        conversationHistory.push({ role: 'assistant', content: res.answer });
        if (conversationHistory.length > 8) {
          conversationHistory = conversationHistory.slice(-8);
        }
      }

      // Escape HTML to prevent XSS before parsing markdown
      const escapeHTML = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const escaped = escapeHTML(res.answer || 'Analysis complete.');
      let formatted = escaped
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #fff;">$1</strong>')
        .replace(/\n\n/g, '<br/><br/>')
        .replace(/\n- /g, '<br/>• ')
        .replace(/\n([0-9]+)\. /g, '<br/><strong>$1.</strong> ');

      let citationsHtml = '';
      if (res.citations && res.citations.length > 0) {
        citationsHtml = `
          <div style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.08); font-family: var(--font-mono); font-size: 0.72rem;">
            <div style="color: var(--accent-cyan); font-weight: 600; margin-bottom: 0.25rem;">Grounded Document Citations:</div>
            ${res.citations.map((c) => `
              <div class="copilot-citation-link" data-finding="${escapeHTML(c.finding_id || 'FIND-ABC-01')}" style="color: #86efac; cursor: pointer; text-decoration: underline; margin-bottom: 0.2rem;">
                📄 ${escapeHTML(c.doc)} ${c.page ? `(Page ${escapeHTML(c.page)})` : ''} — ${escapeHTML(c.clause || 'Statutory Requirement')}
              </div>
            `).join('')}
          </div>
        `;
      }

      let actionHtml = '';
      if (res.recommended_action) {
        actionHtml = `
          <div style="margin-top: 0.6rem; padding: 0.4rem 0.6rem; background: rgba(0, 241, 254, 0.08); border-left: 3px solid var(--accent-cyan); border-radius: 3px; font-size: 0.75rem; color: #e2e8f0;">
            <strong style="color: var(--accent-cyan);">Recommended Action:</strong> ${escapeHTML(res.recommended_action)}
          </div>
        `;
      }

      const isGroq = res.engine === 'groq';
      botMsg.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.4rem;">
            <span class="badge ${res.severity === 'CRITICAL' ? 'badge-high' : 'badge-info'}" style="font-size: 0.65rem;">
              ${res.severity || 'VERIFIED'}
            </span>
            <span class="badge ${isGroq ? 'badge-real' : 'badge-curated'}" style="font-size: 0.62rem; padding: 1px 5px;">
              ${isGroq ? '⚡ GROQ LPU AI' : 'DETERMINISTIC'}
            </span>
          </div>
          <span style="font-family: var(--font-mono); font-size: 0.68rem; color: #94a3b8;">GFR 2017 Grounded</span>
        </div>
        <div>${formatted}</div>
        ${actionHtml}
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
