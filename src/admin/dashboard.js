const state = {
  token: '',
  edit: { type: null, item: null }, // type: 'product' | 'service'
};

function authHeaders() {
  return state.token ? { 'authorization': `Bearer ${state.token}` } : {};
}

function updateHealthStatus(elementId, isHealthy, message, dbInfo = null) {
  const el = document.querySelector(elementId);
  if (!el) return;

  const statusIndicator = el.querySelector('.health-indicator');
  const statusText = el.querySelector('.health-status');

  if (isHealthy) {
    statusIndicator.className = 'health-indicator w-2 h-2 rounded-full bg-green-500';
    statusText.className = 'health-status text-sm text-green-600 dark:text-green-400';
    statusText.textContent = message;
  } else {
    statusIndicator.className = 'health-indicator w-2 h-2 rounded-full bg-red-500';
    statusText.className = 'health-status text-sm text-red-600 dark:text-red-400';
    statusText.textContent = message;
  }

  // Update database info if provided
  if (dbInfo && elementId === '#health-db') {
    const dbInfoEl = el.querySelector('.db-info');
    if (dbInfoEl) {
      dbInfoEl.textContent = dbInfo;
    }
  }
}

async function ping() {
  try {
    // Check API health
    const res = await fetch('/api/health');
    const data = await res.json();

    // Update individual statuses based on detailed health data
    if (data.ok) {
      // Check API status
      const apiHealthy = data.api === 'running';
      updateHealthStatus('#health-api', apiHealthy, apiHealthy ? 'Çalışıyor' : 'Sorun var');

      // Check database status
      const dbHealthy = data.database?.status === 'available';
      if (dbHealthy) {
        // Format database info with record counts
        const records = data.database.records || {};
        const totalRecords = (records.products || 0) + (records.services || 0) + (records.settings || 0);
        const dbInfo = `${data.database.name || 'qbyten'} • ${totalRecords} kayıt`;

        updateHealthStatus('#health-db', true, 'Bağlantı başarılı', dbInfo);
      } else if (data.database?.status === 'error') {
        updateHealthStatus('#health-db', false, `Hata: ${data.database.error || 'Bilinmeyen hata'}`, 'qbyten');
      } else {
        updateHealthStatus('#health-db', false, 'Veritabanı bulunamadı', 'qbyten');
      }

      // Update overall status
      const allHealthy = apiHealthy && dbHealthy;
      updateHealthStatus('#health-overall', allHealthy,
        allHealthy ? 'Tüm sistemler çalışıyor' : 'Bazı servislerde sorun var');
    } else {
      updateHealthStatus('#health-api', false, 'API hatası');
      updateHealthStatus('#health-db', false, 'Kontrol edilemiyor', 'qbyten');
      updateHealthStatus('#health-overall', false, 'Sorun tespit edildi');
    }

    // Update timestamp
    const timestamp = document.querySelector('#health-timestamp');
    if (timestamp) {
      timestamp.textContent = new Date(data.ts).toLocaleString('tr-TR');
    }
  } catch (e) {
    updateHealthStatus('#health-api', false, 'Bağlantı başarısız');
    updateHealthStatus('#health-db', false, 'Kontrol edilemiyor', 'qbyten');
    updateHealthStatus('#health-overall', false, 'Sistem erişilemiyor');

    const timestamp = document.querySelector('#health-timestamp');
    if (timestamp) {
      timestamp.textContent = new Date().toLocaleString('tr-TR');
    }
  }
}

async function loadSettings() {
  const out = document.querySelector('#settings-out');
  try {
    const res = await fetch('/api/settings');
    out.textContent = JSON.stringify(await res.json(), null, 2);
  } catch (e) {
    out.textContent = 'hata: ' + e;
  }
}

async function saveSetting(e) {
  e.preventDefault();
  const key = document.querySelector('#set-key').value.trim();
  const value = document.querySelector('#set-value').value;
  if (!key) return;
  const btn = document.querySelector('#btn-save');
  btn.disabled = true;
  try {
    await fetch('/api/settings', { method: 'POST', headers: { 'content-type': 'application/json', ...authHeaders() }, body: JSON.stringify({ key, value }) });
    await loadSettings();
  } finally {
    btn.disabled = false;
  }
}

function renderProductsTable(items) {
  const container = document.querySelector('#products-list');
  container.innerHTML = '';
  items.forEach((it) => {
    const div = document.createElement('div');
    div.className = 'flex items-center bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg border border-gray-200 dark:border-slate-700';
    div.innerHTML = `
      <div class="w-16 h-16 rounded bg-primary/10 flex items-center justify-center mr-4">
        <span class="material-symbols-outlined text-primary text-2xl">inventory_2</span>
      </div>
      <div class="flex-grow">
        <h5 class="font-semibold text-gray-900 dark:text-white">${it.title}</h5>
        <p class="text-sm text-gray-500 dark:text-gray-400">${it.description || 'Açıklama yok'}</p>
        <span class="text-xs text-gray-400">Slug: ${it.slug}</span>
      </div>
      <div class="flex space-x-2">
        <button class="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-slate-700 text-primary transition-colors" data-edit-product="${it.id}">
          <span class="material-symbols-outlined">edit</span>
        </button>
        <button class="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 transition-colors" data-del-product="${it.id}">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>`;
    container.appendChild(div);
  });
}

function renderServicesTable(items) {
  const container = document.querySelector('#services-list');
  container.innerHTML = '';
  items.forEach((it) => {
    const div = document.createElement('div');
    div.className = 'flex items-center bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg border border-gray-200 dark:border-slate-700';
    div.innerHTML = `
      <div class="w-16 h-16 rounded bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-4 p-2">
        <span class="material-symbols-outlined text-primary text-2xl">design_services</span>
      </div>
      <div class="flex-grow">
        <h5 class="font-semibold text-gray-900 dark:text-white">${it.title}</h5>
        <p class="text-sm text-gray-500 dark:text-gray-400">${it.description || 'Açıklama yok'}</p>
        <span class="text-xs text-gray-400">Slug: ${it.slug}</span>
      </div>
      <div class="flex space-x-2">
        <button class="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-slate-700 text-primary transition-colors" data-edit-service="${it.id}">
          <span class="material-symbols-outlined">edit</span>
        </button>
        <button class="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 transition-colors" data-del-service="${it.id}">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>`;
    container.appendChild(div);
  });
}

async function loadProducts() {
  const res = await fetch('/api/products');
  const data = await res.json();
  renderProductsTable(data.products || []);
}

async function loadServices() {
  const res = await fetch('/api/services');
  const data = await res.json();
  renderServicesTable(data.services || []);
}

async function addProduct(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const payload = {
    slug: form.querySelector('#p-slug').value.trim(),
    title: form.querySelector('#p-title').value,
    description: form.querySelector('#p-desc').value,
    color: form.querySelector('#p-color').value,
  };
  await fetch('/api/products', { method: 'POST', headers: { 'content-type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload) });
  await loadProducts();
  form.reset();
}

async function addService(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const payload = {
    slug: form.querySelector('#s-slug').value.trim(),
    title: form.querySelector('#s-title').value,
    description: form.querySelector('#s-desc').value,
  };
  await fetch('/api/services', { method: 'POST', headers: { 'content-type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload) });
  await loadServices();
  form.reset();
}

async function handleTableClick(e) {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  // Products: delete
  const delP = target.getAttribute('data-del-product');
  if (delP) {
    if (!confirm('Silmek istiyor musunuz?')) return;
    await fetch(`/api/products?id=${encodeURIComponent(delP)}`, { method: 'DELETE', headers: { ...authHeaders() } });
    await loadProducts();
    return;
  }
  // Products: edit
  const editP = target.getAttribute('data-edit-product');
  if (editP) {
    const res = await fetch(`/api/products?id=${encodeURIComponent(editP)}`);
    const data = await res.json();
    openEditModal('product', data.product);
    return;
  }
  // Services: delete
  const delS = target.getAttribute('data-del-service');
  if (delS) {
    if (!confirm('Silmek istiyor musunuz?')) return;
    await fetch(`/api/services?id=${encodeURIComponent(delS)}`, { method: 'DELETE', headers: { ...authHeaders() } });
    await loadServices();
    return;
  }
  // Services: edit
  const editS = target.getAttribute('data-edit-service');
  if (editS) {
    const res = await fetch(`/api/services?id=${encodeURIComponent(editS)}`);
    const data = await res.json();
    openEditModal('service', data.service);
    return;
  }
}

function bindTokenUI() {
  state.token = localStorage.getItem('ADMIN_TOKEN') || '';
  const tokenEl = document.querySelector('#token');
  const status = document.querySelector('#token-status');
  tokenEl.value = state.token;
  status.textContent = state.token ? 'Token kayıtlı' : 'Token kaydedilmedi';
  document.querySelector('#btn-save-token').addEventListener('click', () => {
    state.token = tokenEl.value.trim();
    localStorage.setItem('ADMIN_TOKEN', state.token);
    status.textContent = state.token ? 'Token kayıtlı' : 'Token kaydedilmedi';
  });
  document.querySelector('#btn-clear-token').addEventListener('click', () => {
    state.token = '';
    localStorage.removeItem('ADMIN_TOKEN');
    tokenEl.value = '';
    status.textContent = 'Token kaydedilmedi';
  });
}

window.addEventListener('DOMContentLoaded', () => {
  bindTokenUI();
  ping();
  loadSettings();
  loadProducts();
  loadServices();
  document.querySelector('#form-setting').addEventListener('submit', saveSetting);
  document.querySelector('#form-product').addEventListener('submit', addProduct);
  document.querySelector('#form-service').addEventListener('submit', addService);
  document.addEventListener('click', handleTableClick);

  // Auto-refresh health status every 30 seconds
  setInterval(() => {
    ping();
  }, 30000);
});

// --- Modal & Toast helpers ---
function showToast(msg, ok = true) {
  const el = document.querySelector('#toast');
  el.textContent = msg;
  el.className = ok
    ? 'fixed bottom-4 right-4 bg-primary text-white px-6 py-3 rounded-lg shadow-lg z-50'
    : 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
  setTimeout(() => el.classList.add('hidden'), 2000);
}

function openEditModal(type, item) {
  state.edit.type = type;
  state.edit.item = item;
  const overlay = document.querySelector('#edit-modal');
  const title = document.querySelector('#edit-modal-title');
  const id = document.querySelector('#edit-id');
  const slug = document.querySelector('#edit-slug');
  const t = document.querySelector('#edit-title');
  const d = document.querySelector('#edit-desc');
  const colorWrap = document.querySelector('#edit-color-wrap');
  const color = document.querySelector('#edit-color');

  title.innerHTML = `<span class="material-symbols-outlined mr-2 text-primary">edit_note</span>${type === 'product' ? 'Ürün Düzenle' : 'Servis Düzenle'}`;
  id.value = item?.id ?? '';
  slug.value = item?.slug ?? '';
  t.value = item?.title ?? '';
  d.value = item?.description ?? '';
  if (type === 'product') {
    colorWrap.style.display = '';
    color.value = item?.color ?? '';
  } else {
    colorWrap.style.display = 'none';
    color.value = '';
  }
  overlay.classList.remove('hidden');
}

function closeEditModal() {
  document.querySelector('#edit-modal').classList.add('hidden');
}

async function onEditSave() {
  const id = document.querySelector('#edit-id').value;
  const title = document.querySelector('#edit-title').value.trim();
  const description = document.querySelector('#edit-desc').value;
  const color = document.querySelector('#edit-color').value;
  const type = state.edit.type;
  try {
    if (type === 'product') {
      await fetch('/api/products', { method: 'PUT', headers: { 'content-type': 'application/json', ...authHeaders() }, body: JSON.stringify({ id, title, description, color }) });
      await loadProducts();
    } else if (type === 'service') {
      await fetch('/api/services', { method: 'PUT', headers: { 'content-type': 'application/json', ...authHeaders() }, body: JSON.stringify({ id, title, description }) });
      await loadServices();
    }
    showToast('Kaydedildi');
    closeEditModal();
  } catch (e) {
    showToast('Hata: ' + e, false);
  }
}

// Modal wiring
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#edit-modal-close').addEventListener('click', closeEditModal);
  document.querySelector('#edit-cancel').addEventListener('click', closeEditModal);
  document.querySelector('#edit-save').addEventListener('click', (e) => { e.preventDefault(); onEditSave(); });
});
