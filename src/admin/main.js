const state = {
  token: '',
  edit: { type: null, item: null }, // type: 'product' | 'service'
};

function authHeaders() {
  return state.token ? { 'x-admin-token': state.token } : {};
}

async function ping() {
  const el = document.querySelector('#health');
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    el.textContent = `ok: ${data.ok}, ts: ${new Date(data.ts).toLocaleString()}`;
  } catch (e) {
    el.textContent = 'hata: ' + e;
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
  const tbody = document.querySelector('#products-table tbody');
  tbody.innerHTML = '';
  items.forEach((it) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${it.id}</td>
      <td>${it.slug}</td>
      <td>${it.title}</td>
      <td>${it.color || ''}</td>
      <td class="actions">
        <button class="btn-ghost" data-edit-product="${it.id}">Düzenle</button>
        <button class="btn-danger" data-del-product="${it.id}">Sil</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

function renderServicesTable(items) {
  const tbody = document.querySelector('#services-table tbody');
  tbody.innerHTML = '';
  items.forEach((it) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${it.id}</td>
      <td>${it.slug}</td>
      <td>${it.title}</td>
      <td class="actions">
        <button class="btn-ghost" data-edit-service="${it.id}">Düzenle</button>
        <button class="btn-danger" data-del-service="${it.id}">Sil</button>
      </td>`;
    tbody.appendChild(tr);
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
});

// --- Modal & Toast helpers ---
function showToast(msg, ok = true) {
  const el = document.querySelector('#toast');
  el.textContent = msg;
  el.style.background = ok ? '#1e5a7d' : '#ee5a6f';
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2000);
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

  title.textContent = type === 'product' ? 'Ürün Düzenle' : 'Servis Düzenle';
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
  overlay.classList.add('active');
}

function closeEditModal() {
  document.querySelector('#edit-modal').classList.remove('active');
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
