// Dynamically bind products and services from D1 via Functions APIs

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return {};
  try { return await res.json(); } catch { return {}; }
}

function makeServiceCard(item) {
  const el = document.createElement('div');
  el.className = 'service-card scroll-fade-in';
  el.innerHTML = `
    <h3>${item.title}</h3>
    <p>${item.description || ''}</p>
  `;
  return el;
}

function makeProductCard(item) {
  const el = document.createElement('div');
  el.className = 'product-card scroll-fade-in';
  el.innerHTML = `
    <div class="product-content">
      <h3>${item.title}</h3>
      <p>${item.description || ''}</p>
    </div>
  `;
  return el;
}

export async function hydrateContent() {
  try {
    const servicesRoot = document.getElementById('services-grid');
    const productsRoot = document.getElementById('products-grid');
    if (!servicesRoot && !productsRoot) return;

    // Services
    if (servicesRoot) {
      const data = await fetchJSON('/api/services');
      const list = data?.services || [];
      if (Array.isArray(list) && list.length) {
        servicesRoot.innerHTML = '';
        list.forEach((s) => servicesRoot.appendChild(makeServiceCard(s)));
      }
    }

    // Products
    if (productsRoot) {
      const data = await fetchJSON('/api/products');
      const list = data?.products || [];
      if (Array.isArray(list) && list.length) {
        productsRoot.innerHTML = '';
        list.forEach((p) => productsRoot.appendChild(makeProductCard(p)));
      }
    }
  } catch (err) {
    // fail silently to preserve static content
    console.warn('hydrateContent error:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  hydrateContent();
});
