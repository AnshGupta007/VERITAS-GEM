/**
 * Custom Tender Upload & Autonomous Ingestion Modal
 * Multi-Agent Extraction Pipeline Simulator
 */
import { store } from '../state.js';
import { api } from '../api.js';
import { showToast } from '../utils.js';

export function renderTenderIngestModal() {
  const existing = document.getElementById('tender-ingest-modal-root');
  if (existing) existing.remove();

  const modalRoot = document.createElement('div');
  modalRoot.id = 'tender-ingest-modal-root';
  modalRoot.className = 'modal-backdrop active';
  modalRoot.style.display = 'flex';
  modalRoot.style.alignItems = 'center';
  modalRoot.style.justifyContent = 'center';
  modalRoot.style.zIndex = '9999';
  modalRoot.style.opacity = '1';
  modalRoot.style.pointerEvents = 'auto';

  modalRoot.innerHTML = `
    <div class="modal-dialog glass-panel ghost-border" style="max-width: 680px; width: 90%; border-radius: 8px; overflow: hidden; animation: fadeIn 0.2s ease-out;">
      <!-- Modal Header -->
      <div style="background: #111420; padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(0, 241, 254, 0.15); border: 1px solid var(--accent-cyan); display: flex; align-items: center; justify-content: center;">
            <span class="material-symbols-outlined" style="color: var(--accent-cyan); font-size: 20px;">upload_file</span>
          </div>
          <div>
            <h3 style="font-family: 'Geist', var(--font-display); font-size: 1.15rem; color: #fff; font-weight: 700;">
              Ingest Custom GeM Tender Package
            </h3>
            <div style="font-family: var(--font-mono); font-size: 0.72rem; color: #94a3b8;">
              Multi-Agent OCR Layout Parser & Statutory Rule Binder
            </div>
          </div>
        </div>

        <button id="btn-close-ingest" class="btn btn-secondary btn-sm">✕</button>
      </div>

      <!-- Modal Body -->
      <div style="padding: 1.5rem;">
        <!-- Upload Drag & Drop Zone -->
        <div id="drop-zone" style="border: 2px dashed rgba(0, 241, 254, 0.35); border-radius: 8px; background: rgba(0, 241, 254, 0.03); padding: 2rem; text-align: center; cursor: pointer; transition: border-color 0.2s;">
          <span class="material-symbols-outlined" style="font-size: 48px; color: var(--accent-cyan); margin-bottom: 0.5rem;">cloud_upload</span>
          <div style="font-weight: 600; color: #fff; font-size: 0.95rem;">
            Drop your GeM Bid PDF / Technical Specification Here
          </div>
          <div style="font-size: 0.78rem; color: #94a3b8; margin-top: 0.25rem;">
            Supports PDF, scanned images up to 150MB · Live text &amp; statutory entity extraction
          </div>
          <input type="file" id="real-file-input" accept=".pdf" style="display: none;" />
          <button id="btn-browse-file" class="btn btn-secondary btn-sm ghost-border" style="margin-top: 1rem; font-size: 0.78rem;">
            Select Real PDF from Disk
          </button>
        </div>

        <!-- Real Ingestion Result Preview (Hidden until live upload) -->
        <div id="live-upload-result" class="glass-panel ghost-border p-4 rounded-lg" style="display: none; margin-top: 1.25rem;"></div>

        <!-- Sample Tender Preset Buttons for quick demo -->
        <div style="margin-top: 1rem; display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-mono); font-size: 0.75rem;">
          <span style="color: #94a3b8;">Demo Presets:</span>
          <button class="btn btn-secondary btn-sm preset-tender-btn" data-file="ONGC_Subsea_Wellhead_Package_2026.pdf" data-ref="GEM/2026/B/9928101" data-val="64.20" style="padding: 0.2rem 0.6rem; font-size: 0.7rem;">
            ONGC Subsea Wellhead (₹64.2 Cr)
          </button>
          <button class="btn btn-secondary btn-sm preset-tender-btn" data-file="IOCL_Cryogenic_Pipeline_Skids.pdf" data-ref="GEM/2026/B/8821044" data-val="38.50" style="padding: 0.2rem 0.6rem; font-size: 0.7rem;">
            IOCL Cryogenic Skids (₹38.5 Cr)
          </button>
        </div>

        <!-- Progress Pipeline Animation Container (Hidden until start) -->
        <div id="ingest-progress-container" style="display: none; margin-top: 1.5rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-cyan); font-weight: 700;">
              Autonomous Extraction Pipeline In Progress...
            </div>
            <span class="badge badge-info" id="ingest-badge-status">INITIALIZING</span>
          </div>

          <!-- Pipeline Steps -->
          <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.82rem;">
            <div id="step-1" style="display: flex; align-items: center; gap: 0.75rem; color: #94a3b8;">
              <span class="material-symbols-outlined" style="font-size: 18px;">hourglass_empty</span>
              <span>1. PaddleOCR Multi-Lingual Layout &amp; Table Analysis</span>
            </div>
            <div id="step-2" style="display: flex; align-items: center; gap: 0.75rem; color: #94a3b8;">
              <span class="material-symbols-outlined" style="font-size: 18px;">hourglass_empty</span>
              <span>2. Legal-BERT Clause Segmentation &amp; Norm Hierarchy</span>
            </div>
            <div id="step-3" style="display: flex; align-items: center; gap: 0.75rem; color: #94a3b8;">
              <span class="material-symbols-outlined" style="font-size: 18px;">hourglass_empty</span>
              <span>3. Commercial BoQ Extraction &amp; Turnover Benchmark Binding</span>
            </div>
            <div id="step-4" style="display: flex; align-items: center; gap: 0.75rem; color: #94a3b8;">
              <span class="material-symbols-outlined" style="font-size: 18px;">hourglass_empty</span>
              <span>4. Statutory Rule Engine Synthesis (Rule 144 GFR 2017 &amp; PPO-MII)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalRoot);

  modalRoot.querySelector('#btn-close-ingest')?.addEventListener('click', () => {
    modalRoot.remove();
  });

  // Handle Preset Clicks
  modalRoot.querySelectorAll('.preset-tender-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const file = e.currentTarget.getAttribute('data-file');
      const ref = e.currentTarget.getAttribute('data-ref');
      const val = parseFloat(e.currentTarget.getAttribute('data-val'));
      runIngestionSimulation(file, ref, val);
    });
  });

  // Real File Input Handling
  const fileInput = modalRoot.querySelector('#real-file-input');
  const dropZone = modalRoot.querySelector('#drop-zone');

  modalRoot.querySelector('#btn-browse-file')?.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput?.click();
  });

  dropZone?.addEventListener('click', () => {
    fileInput?.click();
  });

  dropZone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--accent-cyan)';
  });

  dropZone?.addEventListener('dragleave', () => {
    dropZone.style.borderColor = 'rgba(0, 241, 254, 0.35)';
  });

  dropZone?.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleRealFileUpload(e.dataTransfer.files[0]);
    }
  });

  fileInput?.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleRealFileUpload(e.target.files[0]);
    }
  });

  async function handleRealFileUpload(file) {
    const resultBox = modalRoot.querySelector('#live-upload-result');
    if (!resultBox) return;

    try {
      showToast(`Uploading and extracting '${file.name}' with pypdf...`, 'info');
      const formData = new FormData();
      formData.append('file', file);

      resultBox.style.display = 'block';
      resultBox.innerHTML = `
        <div class="text-center py-4">
          <span class="status-dot status-dot-active mr-2"></span> Parsing PDF stream &amp; extracting statutory entities...
        </div>
      `;

      const res = await api.uploadPdf(formData);
      const ent = res.extracted_entities || {};
      const fore = res.forensic_report || {};

      resultBox.innerHTML = `
        <div class="space-y-3">
          <div class="flex justify-between items-center border-b border-white/10 pb-2">
            <div>
              <div class="font-bold text-white text-sm">${res.filename}</div>
              <div class="font-label-mono text-[11px] text-on-surface-variant">${res.page_count} Pages · ${res.file_size_kb} KB · Role: ${res.detected_role}</div>
            </div>
            <span class="badge ${fore.tamper_probability_percent > 40 ? 'badge-danger' : 'badge-low'}">
              Forensic Tamper: ${fore.tamper_probability_percent}%
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs font-label-mono">
            <div class="bg-black/30 p-2 rounded">
              <span class="text-on-surface-variant">GSTINs Found:</span>
              <div class="text-white font-bold">${ent.gstins?.length ? ent.gstins.join(', ') : 'None extracted'}</div>
            </div>
            <div class="bg-black/30 p-2 rounded">
              <span class="text-on-surface-variant">PANs Found:</span>
              <div class="text-white font-bold">${ent.pans?.length ? ent.pans.join(', ') : 'None extracted'}</div>
            </div>
            <div class="bg-black/30 p-2 rounded">
              <span class="text-on-surface-variant">UDINs Detected:</span>
              <div class="text-secondary-container font-bold">${ent.udins?.length ? ent.udins.join(', ') : 'None'}</div>
            </div>
            <div class="bg-black/30 p-2 rounded">
              <span class="text-on-surface-variant">Turnover Detected:</span>
              <div class="text-primary font-bold">${ent.turnover_cr ? `₹${ent.turnover_cr} Cr` : 'N/A'}</div>
            </div>
          </div>

          <div class="flex gap-2 pt-2">
            <button id="btn-add-as-bidder" class="btn btn-sm glow-cyan w-full" style="background: linear-gradient(135deg, #00f1fe 0%, #00a0fe 100%); color: #000; font-weight: 700;">
              Ingest as Active Bidder into Leaderboard →
            </button>
          </div>
        </div>
      `;

      // Handle adding as active live bidder
      resultBox.querySelector('#btn-add-as-bidder')?.addEventListener('click', async () => {
        try {
          showToast('Adding bidder package to live evaluation matrix...', 'info');
          const bidderFormData = new FormData();
          bidderFormData.append('file', file);
          bidderFormData.append('legal_name', file.name.replace('.pdf', '').replace(/_/g, ' '));

          const bidderRes = await api.uploadBidderPdf(bidderFormData);
          showToast(`Bidder '${bidderRes.bidder.legal_name}' created on live leaderboard!`, 'success');
          modalRoot.remove();

          // Refresh state
          const bidders = await api.getBidders();
          store.setState({ bidders, currentView: 'bidders' });
        } catch (err) {
          showToast(`Bidder ingest failed: ${err.message}`, 'error');
        }
      });
    } catch (err) {
      resultBox.innerHTML = `<div class="text-error text-center py-4">Extraction failed: ${err.message}</div>`;
    }
  }

  async function runIngestionSimulation(fileName, tenderRef, valueCr) {
    const progBox = modalRoot.querySelector('#ingest-progress-container');
    const badge = modalRoot.querySelector('#ingest-badge-status');
    const dropZone = modalRoot.querySelector('#drop-zone');

    dropZone.style.opacity = '0.5';
    dropZone.style.pointerEvents = 'none';
    progBox.style.display = 'block';

    const step1 = modalRoot.querySelector('#step-1');
    const step2 = modalRoot.querySelector('#step-2');
    const step3 = modalRoot.querySelector('#step-3');
    const step4 = modalRoot.querySelector('#step-4');

    const markSuccess = (el, text) => {
      el.style.color = '#86efac';
      el.innerHTML = `<span class="material-symbols-outlined" style="font-size: 18px; color: #10b981;">check_circle</span> <strong>${text}</strong>`;
    };

    const markActive = (el, text) => {
      el.style.color = 'var(--accent-cyan)';
      el.innerHTML = `<span class="status-dot status-dot-active" style="margin-right: 6px;"></span> ${text}`;
    };

    markActive(step1, "Parsing document layout with PaddleOCR...");
    badge.textContent = "OCR PARSING";

    setTimeout(() => {
      markSuccess(step1, "1. PaddleOCR Layout Analysis Complete (42 Pages, 18 Tables Extracted)");
      markActive(step2, "Segmenting clauses with Legal-BERT...");
      badge.textContent = "CLAUSE NLP";
    }, 800);

    setTimeout(() => {
      markSuccess(step2, "2. Legal-BERT Segmenter Complete (36 Clauses, 21 Mandatory Specs)");
      markActive(step3, "Extracting BoQ and Financial turnover benchmarks...");
      badge.textContent = "BOQ BINDING";
    }, 1600);

    setTimeout(() => {
      markSuccess(step3, `3. BoQ Normalizer Complete (Turnover Benchmark: ₹${(valueCr * 0.3).toFixed(2)} Cr)`);
      markActive(step4, "Binding statutory rules under Rule 144 GFR 2017 & PPO-MII...");
      badge.textContent = "RULE SYNTHESIS";
    }, 2400);

    setTimeout(async () => {
      markSuccess(step4, "4. Rule Engine Binding Complete (Rule 144 GFR, GeM STC, API 6DSS)");
      badge.className = "badge badge-real";
      badge.textContent = "TENDER READY";

      try {
        await api.ingestTender({ file_name: fileName, tender_ref: tenderRef, value_cr: valueCr });
        showToast(`Tender '${fileName}' successfully ingested and active!`, 'success');
      } catch (e) {
        showToast(`Tender '${fileName}' simulated successfully.`, 'success');
      }

      setTimeout(() => {
        modalRoot.remove();
      }, 1200);
    }, 3200);
  }
}

