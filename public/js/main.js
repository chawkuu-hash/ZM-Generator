// Global State & Settings Cache
let siteSettings = {};

// Toast notification helper
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-emerald-600' : (type === 'error' ? 'bg-rose-600' : 'bg-amber-600');
  const icon = isSuccess ? '✓' : (type === 'error' ? '✕' : 'ℹ');

  toast.className = `${bgColor} text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium transition-all duration-300 transform translate-y-4 opacity-0`;
  toast.innerHTML = `
    <span class="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center font-bold text-xs shrink-0">${icon}</span>
    <span class="flex-1">${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Format Lakhs (သိန်း) and MMK
function formatPrice(lakhs) {
  if (lakhs === null || lakhs === undefined) return 'ဈေးနှုန်း ညှိနှိုင်း';
  const num = Number(lakhs);
  if (num >= 1000) {
    return `${(num / 100).toFixed(1)} ဘီလီယံ (${num.toLocaleString()} သိန်း)`;
  }
  return `${num.toLocaleString()} သိန်း`;
}

function formatMmk(mmk) {
  if (!mmk) return '0 ကျပ်';
  return `${Number(mmk).toLocaleString()} ကျပ်`;
}

// Fetch Global Settings
async function loadSiteSettings() {
  try {
    const res = await fetch('/api/settings');
    const json = await res.json();
    if (json.success && json.data) {
      siteSettings = json.data;

      // Update phone elements
      document.querySelectorAll('.site-phone-primary').forEach(el => {
        el.textContent = siteSettings.phone_primary || '09 777 888 999';
        if (el.tagName === 'A') el.href = `tel:${siteSettings.phone_primary?.replace(/\s+/g, '')}`;
      });

      document.querySelectorAll('.site-phone-secondary').forEach(el => {
        el.textContent = siteSettings.phone_secondary || '09 250 123 456';
        if (el.tagName === 'A') el.href = `tel:${siteSettings.phone_secondary?.replace(/\s+/g, '')}`;
      });

      document.querySelectorAll('.site-viber-link').forEach(el => {
        const viberNum = siteSettings.viber_phone || siteSettings.phone_primary;
        el.href = `viber://chat?number=${encodeURIComponent(viberNum || '')}`;
      });

      document.querySelectorAll('.site-telegram-link').forEach(el => {
        if (siteSettings.telegram_username) {
          el.href = `https://t.me/${siteSettings.telegram_username.replace('@', '')}`;
        }
      });

      document.querySelectorAll('.site-address').forEach(el => {
        el.textContent = siteSettings.address || 'ရန်ကုန်မြို့';
      });

      document.querySelectorAll('.site-hours').forEach(el => {
        el.textContent = siteSettings.operating_hours || '၂၄ နာရီ ဝန်ဆောင်မှု';
      });
    }
  } catch (err) {
    console.warn('Could not load site settings:', err);
  }
}

// Mobile navigation toggle
function setupMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (toggleBtn && menu) {
    toggleBtn.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  loadSiteSettings();
  setupMobileMenu();
});
