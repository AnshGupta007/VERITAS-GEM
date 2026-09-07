/**
 * VERITAS-GEM Utility Helpers
 */

export function formatINR(val) {
  if (val === null || val === undefined) return '—';
  const num = Number(val);
  if (isNaN(num)) return val;
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} Lakh`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

export function formatDate(isoStr) {
  if (!isoStr) return '—';
  try {
    if (typeof isoStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(isoStr)) {
      const [year, monthNum, day] = isoStr.split('-');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[parseInt(monthNum, 10) - 1] || monthNum;
      return `${day}-${month}-${year}`;
    }
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return isoStr;
  }
}

export function getRiskBadgeClass(severity) {
  if (!severity) return 'badge-info';
  const s = severity.toUpperCase();
  if (s === 'HIGH' || s === 'CRITICAL') return 'badge-high';
  if (s === 'MEDIUM' || s === 'MODERATE') return 'badge-med';
  if (s === 'LOW' || s === 'VERIFIED') return 'badge-low';
  return 'badge-info';
}

export function getProviderBadgeClass(providerType) {
  if (!providerType) return 'badge-mock';
  const p = providerType.toUpperCase();
  if (p === 'REAL') return 'badge-real';
  if (p === 'SIMULATED') return 'badge-simulated';
  if (p === 'CURATED') return 'badge-curated';
  return 'badge-mock';
}

export function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="status-dot ${type === 'success' ? 'status-dot-active' : type === 'error' ? 'status-dot-danger' : 'status-dot-warning'}"></span>
    <div>
      <div style="font-size: 0.85rem; font-weight: 600;">${type.toUpperCase()}</div>
      <div style="font-size: 0.8rem; color: var(--text-secondary);">${message}</div>
    </div>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
