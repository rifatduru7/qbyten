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

function makeMenuItem(item) {
  const el = document.createElement('li');
  
  // Create the main link
  const link = document.createElement('a');
  link.href = item.url || '#';
  link.textContent = item.title;
  
  // Add target attribute if specified
  if (item.target && item.target !== '_self') {
    link.target = item.target;
  }
  
  // Add icon if specified
  if (item.icon) {
    const icon = document.createElement('span');
    icon.className = 'menu-icon';
    icon.textContent = item.icon;
    link.prepend(icon);
  }
  
  el.appendChild(link);
  
  // Add dropdown arrow and submenu if has children
  if (item.children && item.children.length > 0) {
    const arrow = document.createElement('span');
    arrow.className = 'dropdown-arrow';
    arrow.textContent = ' ▼';
    link.appendChild(arrow);
    
    // Create submenu
    const submenu = document.createElement('ul');
    submenu.className = 'submenu';
    
    item.children.forEach(child => {
      const childItem = makeMenuItem(child);
      submenu.appendChild(childItem);
    });
    
    el.appendChild(submenu);
  }
  
  return el;
}

async function loadNavigationMenus() {
  try {
    const navCenter = document.querySelector('.nav-center');
    if (!navCenter) return;

    const data = await fetchJSON('/api/menus');
    const menus = data?.menus || [];
    
    if (Array.isArray(menus) && menus.length) {
      // Clear existing menu items (keep the structure)
      navCenter.innerHTML = '';
      
      // Add menu items from database
      menus.forEach(menu => {
        const menuItem = makeMenuItem(menu);
        navCenter.appendChild(menuItem);
      });
      
      // Re-attach mobile menu event listeners
      attachMobileMenuListeners();
    }
  } catch (err) {
    console.warn('loadNavigationMenus error:', err);
  }
}

function attachMobileMenuListeners() {
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  const navCenter = document.querySelector('.nav-center');
  
  if (mobileMenuToggle && mobileMenuOverlay && navCenter) {
    // Remove existing listeners to avoid duplicates
    const newToggle = mobileMenuToggle.cloneNode(true);
    mobileMenuToggle.parentNode.replaceChild(newToggle, mobileMenuToggle);
    
    const newOverlay = mobileMenuOverlay.cloneNode(true);
    mobileMenuOverlay.parentNode.replaceChild(newOverlay, mobileMenuOverlay);
    
    // Add listeners
    newToggle.addEventListener('click', () => {
      newToggle.classList.toggle('active');
      navCenter.classList.toggle('active');
      newOverlay.classList.toggle('active');
      
      if (navCenter.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    });
    
    newOverlay.addEventListener('click', () => {
      newToggle.classList.remove('active');
      navCenter.classList.remove('active');
      newOverlay.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
    
    // Close menu when clicking on menu items
    const navLinks = navCenter.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        newToggle.classList.remove('active');
        navCenter.classList.remove('active');
        newOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
      });
    });
  }
}

export async function hydrateContent() {
  try {
    const servicesRoot = document.getElementById('services-grid');
    const productsRoot = document.getElementById('products-grid');
    if (!servicesRoot && !productsRoot) return;

    // Load navigation menus first
    await loadNavigationMenus();

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
