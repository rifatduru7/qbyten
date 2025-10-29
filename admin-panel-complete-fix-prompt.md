# Complete Admin Panel Fix - Make All Functions Work

## CRITICAL ISSUE
The admin panel at https://459c4c02.qbyten.pages.dev/admin/ has NO JavaScript loaded. The HTML file has beautiful UI but ZERO functionality because there are no `<script>` tags at all.

## Current State
- ✅ HTML structure exists with all UI elements
- ✅ Tailwind CSS is loaded and styling works
- ✅ Backend API endpoints exist and work (`/api/health`, `/api/products`, etc.)
- ❌ **NO JavaScript file is loaded**
- ❌ System status shows red circles and never updates
- ❌ Buttons don't do anything when clicked
- ❌ Forms don't submit
- ❌ Token save doesn't work
- ❌ No modals open
- ❌ No data loads from API

## Root Cause
Looking at `admin/index.html`, the file ends with:
```html
</div>
</body></html>
```

**There is NO `<script>` tag to load JavaScript!**

## Required Fix

### Step 1: Create Standalone Admin JavaScript File
Create a new file `admin/admin.js` that contains ALL admin panel functionality without using ES6 modules (since we're loading it directly in HTML).

**File: `admin/admin.js`**

```javascript
// QbYTen Admin Panel - Complete Functionality
// This file must be loaded as a regular script (not module) in admin/index.html

(function() {
  'use strict';

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const state = {
    token: localStorage.getItem('ADMIN_TOKEN') || '',
    products: [],
    services: [],
    settings: [],
    editingItem: null,
    editingType: null
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  function authHeaders() {
    return state.token ? { 'Authorization': `Bearer ${state.token}` } : {};
  }

  function showToast(message, type = 'success') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // ============================================
  // SYSTEM HEALTH STATUS
  // ============================================
  async function updateSystemStatus() {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();

      // Update General Status
      const generalEl = document.querySelector('[data-status="general"]');
      if (generalEl) {
        const icon = generalEl.querySelector('.material-symbols-outlined');
        const text = generalEl.querySelector('.status-text');
        if (data.ok) {
          icon.className = 'material-symbols-outlined text-green-500';
          icon.textContent = 'check_circle';
          text.textContent = 'All Systems Operational';
        } else {
          icon.className = 'material-symbols-outlined text-red-500';
          icon.textContent = 'error';
          text.textContent = 'System Error';
        }
      }

      // Update API Status
      const apiEl = document.querySelector('[data-status="api"]');
      if (apiEl) {
        const icon = apiEl.querySelector('.material-symbols-outlined');
        const text = apiEl.querySelector('.status-text');
        if (data.api === 'running') {
          icon.className = 'material-symbols-outlined text-green-500';
          icon.textContent = 'check_circle';
          text.textContent = 'API Running';
        } else {
          icon.className = 'material-symbols-outlined text-red-500';
          icon.textContent = 'error';
          text.textContent = 'API Error';
        }
      }

      // Update Database Status
      const dbEl = document.querySelector('[data-status="database"]');
      if (dbEl) {
        const icon = dbEl.querySelector('.material-symbols-outlined');
        const text = dbEl.querySelector('.status-text');
        if (data.database && data.database.status === 'available') {
          icon.className = 'material-symbols-outlined text-green-500';
          icon.textContent = 'check_circle';
          text.textContent = 'Database Connected';
        } else {
          icon.className = 'material-symbols-outlined text-red-500';
          icon.textContent = 'error';
          text.textContent = 'Database Error';
        }
      }

      // Update last check time
      const lastCheckEl = document.querySelector('[data-last-check]');
      if (lastCheckEl) {
        lastCheckEl.textContent = new Date(data.ts).toLocaleString();
      }

    } catch (error) {
      console.error('Health check failed:', error);
      // Set all to error state
      document.querySelectorAll('[data-status]').forEach(el => {
        const icon = el.querySelector('.material-symbols-outlined');
        const text = el.querySelector('.status-text');
        if (icon && text) {
          icon.className = 'material-symbols-outlined text-red-500';
          icon.textContent = 'error';
          text.textContent = 'Connection Failed';
        }
      });
    }
  }

  // ============================================
  // TOKEN MANAGEMENT
  // ============================================
  function initTokenManagement() {
    const tokenInput = document.querySelector('#admin-token-input');
    const saveBtn = document.querySelector('#save-token-btn');
    const tokenStatus = document.querySelector('#token-status');

    if (tokenInput) {
      tokenInput.value = state.token;
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        state.token = tokenInput.value.trim();
        localStorage.setItem('ADMIN_TOKEN', state.token);
        if (tokenStatus) {
          tokenStatus.textContent = state.token ? 'Token saved' : 'No token';
          tokenStatus.className = state.token ? 'text-green-600' : 'text-gray-500';
        }
        showToast('Token saved successfully', 'success');
      });
    }
  }

  // ============================================
  // PRODUCTS MANAGEMENT
  // ============================================
  async function loadProducts() {
    try {
      const response = await fetch('/api/products', {
        headers: authHeaders()
      });
      const data = await response.json();
      state.products = data.products || [];
      renderProducts();
    } catch (error) {
      console.error('Failed to load products:', error);
      showToast('Failed to load products', 'error');
    }
  }

  function renderProducts() {
    const container = document.querySelector('#products-list');
    if (!container) return;

    if (state.products.length === 0) {
      container.innerHTML = '<p class="text-gray-500">No other products found.</p>';
      return;
    }

    container.innerHTML = state.products.map(product => `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-info">
          <div class="product-code">${product.slug || product.code || 'PRD-001'}</div>
          <div class="product-title">${product.title}</div>
          <div class="product-description">${product.description || 'Brief description...'}</div>
        </div>
        <div class="product-actions">
          <button class="icon-btn" data-action="edit-product" data-id="${product.id}">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button class="icon-btn delete" data-action="delete-product" data-id="${product.id}">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
    `).join('');
  }

  async function addProduct(formData) {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showToast('Product added successfully', 'success');
        await loadProducts();
        closeModal('add-product-modal');
      } else {
        showToast('Failed to add product', 'error');
      }
    } catch (error) {
      console.error('Failed to add product:', error);
      showToast('Failed to add product', 'error');
    }
  }

  async function updateProduct(id, formData) {
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify({ id, ...formData })
      });

      if (response.ok) {
        showToast('Product updated successfully', 'success');
        await loadProducts();
        closeModal('edit-product-modal');
      } else {
        showToast('Failed to update product', 'error');
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      showToast('Failed to update product', 'error');
    }
  }

  async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });

      if (response.ok) {
        showToast('Product deleted successfully', 'success');
        await loadProducts();
      } else {
        showToast('Failed to delete product', 'error');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      showToast('Failed to delete product', 'error');
    }
  }

  // ============================================
  // SERVICES MANAGEMENT
  // ============================================
  async function loadServices() {
    try {
      const response = await fetch('/api/services', {
        headers: authHeaders()
      });
      const data = await response.json();
      state.services = data.services || [];
      renderServices();
    } catch (error) {
      console.error('Failed to load services:', error);
      showToast('Failed to load services', 'error');
    }
  }

  function renderServices() {
    const container = document.querySelector('#services-list');
    if (!container) return;

    if (state.services.length === 0) {
      container.innerHTML = '<p class="text-gray-500">No other services found.</p>';
      return;
    }

    container.innerHTML = state.services.map(service => `
      <div class="service-card" data-service-id="${service.id}">
        <div class="service-info">
          <div class="service-code">${service.slug || service.code || 'SVC-001'}</div>
          <div class="service-title">${service.title}</div>
          <div class="service-description">${service.description || 'Brief description...'}</div>
        </div>
        <div class="service-actions">
          <button class="icon-btn" data-action="edit-service" data-id="${service.id}">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button class="icon-btn delete" data-action="delete-service" data-id="${service.id}">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
    `).join('');
  }

  async function addService(formData) {
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showToast('Service added successfully', 'success');
        await loadServices();
        closeModal('add-service-modal');
      } else {
        showToast('Failed to add service', 'error');
      }
    } catch (error) {
      console.error('Failed to add service:', error);
      showToast('Failed to add service', 'error');
    }
  }

  async function updateService(id, formData) {
    try {
      const response = await fetch('/api/services', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify({ id, ...formData })
      });

      if (response.ok) {
        showToast('Service updated successfully', 'success');
        await loadServices();
        closeModal('edit-service-modal');
      } else {
        showToast('Failed to update service', 'error');
      }
    } catch (error) {
      console.error('Failed to update service:', error);
      showToast('Failed to update service', 'error');
    }
  }

  async function deleteService(id) {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const response = await fetch(`/api/services?id=${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });

      if (response.ok) {
        showToast('Service deleted successfully', 'success');
        await loadServices();
      } else {
        showToast('Failed to delete service', 'error');
      }
    } catch (error) {
      console.error('Failed to delete service:', error);
      showToast('Failed to delete service', 'error');
    }
  }

  // ============================================
  // MODAL MANAGEMENT
  // ============================================
  function openModal(modalId) {
    const modal = document.querySelector(`#${modalId}`);
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  function closeModal(modalId) {
    const modal = document.querySelector(`#${modalId}`);
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  // ============================================
  // SETTINGS MANAGEMENT
  // ============================================
  async function loadSettings() {
    try {
      const response = await fetch('/api/settings', {
        headers: authHeaders()
      });
      const data = await response.json();
      state.settings = Array.isArray(data) ? data : [];
      renderSettings();
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  function renderSettings() {
    const container = document.querySelector('#settings-content');
    if (!container) return;

    if (state.settings.length === 0) {
      container.textContent = 'Settings content goes here.';
      return;
    }

    container.innerHTML = state.settings.map(setting => `
      <div class="setting-item">
        <strong>${setting.key}:</strong> ${setting.value}
      </div>
    `).join('');
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================
  function initEventListeners() {
    // Global click handler for all buttons
    document.addEventListener('click', async (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;

      const action = target.dataset.action;
      const id = target.dataset.id;

      switch(action) {
        case 'open-add-product':
          openModal('add-product-modal');
          break;
        case 'open-add-service':
          openModal('add-service-modal');
          break;
        case 'edit-product':
          // Load product data and open edit modal
          const product = state.products.find(p => p.id == id);
          if (product) {
            fillEditProductForm(product);
            openModal('edit-product-modal');
          }
          break;
        case 'edit-service':
          // Load service data and open edit modal
          const service = state.services.find(s => s.id == id);
          if (service) {
            fillEditServiceForm(service);
            openModal('edit-service-modal');
          }
          break;
        case 'delete-product':
          await deleteProduct(id);
          break;
        case 'delete-service':
          await deleteService(id);
          break;
      }
    });

    // Close modals
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if (modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
      });
    });

    // Form submissions
    const addProductForm = document.querySelector('#add-product-form');
    if (addProductForm) {
      addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        await addProduct(Object.fromEntries(formData));
      });
    }

    const editProductForm = document.querySelector('#edit-product-form');
    if (editProductForm) {
      editProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const id = document.querySelector('#edit-product-id').value;
        await updateProduct(id, Object.fromEntries(formData));
      });
    }

    const addServiceForm = document.querySelector('#add-service-form');
    if (addServiceForm) {
      addServiceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        await addService(Object.fromEntries(formData));
      });
    }

    const editServiceForm = document.querySelector('#edit-service-form');
    if (editServiceForm) {
      editServiceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const id = document.querySelector('#edit-service-id').value;
        await updateService(id, Object.fromEntries(formData));
      });
    }

    // Collapsible sections
    document.querySelectorAll('[data-collapse-trigger]').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const target = trigger.dataset.collapseTarget;
        const content = document.querySelector(`#${target}`);
        const icon = trigger.querySelector('.material-symbols-outlined:last-child');

        if (content) {
          content.classList.toggle('hidden');
          if (icon) {
            icon.textContent = content.classList.contains('hidden') ? 'expand_more' : 'expand_less';
          }
        }
      });
    });
  }

  function fillEditProductForm(product) {
    document.querySelector('#edit-product-id').value = product.id;
    document.querySelector('#edit-product-code').value = product.slug || product.code || '';
    document.querySelector('#edit-product-title').value = product.title || '';
    document.querySelector('#edit-product-description').value = product.description || '';
  }

  function fillEditServiceForm(service) {
    document.querySelector('#edit-service-id').value = service.id;
    document.querySelector('#edit-service-code').value = service.slug || service.code || '';
    document.querySelector('#edit-service-title').value = service.title || '';
    document.querySelector('#edit-service-description').value = service.description || '';
    if (service.icon) {
      document.querySelector('#edit-service-icon').value = service.icon;
    }
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  function init() {
    console.log('QbYTen Admin Panel initialized');

    // Initialize all components
    initTokenManagement();
    initEventListeners();

    // Load initial data
    updateSystemStatus();
    loadProducts();
    loadServices();
    loadSettings();

    // Auto-refresh system status every 30 seconds
    setInterval(updateSystemStatus, 30000);
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
```

### Step 2: Add Script Tag to Admin HTML

At the end of `admin/index.html`, before `</body>`, add:

```html
  <!-- Admin Panel JavaScript -->
  <script src="admin.js"></script>
</body>
</html>
```

### Step 3: Update HTML Data Attributes

Make sure the HTML elements have the correct data attributes that the JavaScript expects:

**System Status Section:**
```html
<div class="status-item" data-status="general">
  <span class="material-symbols-outlined text-red-500">error</span>
  <span class="status-text">General</span>
</div>

<div class="status-item" data-status="api">
  <span class="material-symbols-outlined text-red-500">error</span>
  <span class="status-text">API</span>
</div>

<div class="status-item" data-status="database">
  <span class="material-symbols-outlined text-red-500">error</span>
  <span class="status-text">Database</span>
</div>

<span data-last-check>-</span>
```

**Quick Add Buttons:**
```html
<button class="quick-add-btn" data-action="open-add-product">
  Quick Add Product
</button>

<button class="quick-add-btn" data-action="open-add-service">
  Quick Add Service
</button>
```

**Token Save Button:**
```html
<input type="text" id="admin-token-input" placeholder="Enter admin token">
<button id="save-token-btn">Save Token</button>
<span id="token-status"></span>
```

### Step 4: Add Container Elements

Make sure these containers exist in HTML:

```html
<!-- Products list container -->
<div id="products-list"></div>

<!-- Services list container -->
<div id="services-list"></div>

<!-- Settings container -->
<div id="settings-content"></div>
```

### Step 5: Add Hidden Input to Edit Forms

Both edit product and edit service modals need a hidden ID input:

```html
<form id="edit-product-form">
  <input type="hidden" id="edit-product-id">
  <input type="text" id="edit-product-code" name="code">
  <input type="text" id="edit-product-title" name="title">
  <textarea id="edit-product-description" name="description"></textarea>
</form>

<form id="edit-service-form">
  <input type="hidden" id="edit-service-id">
  <input type="text" id="edit-service-code" name="code">
  <input type="text" id="edit-service-title" name="title">
  <textarea id="edit-service-description" name="description"></textarea>
  <select id="edit-service-icon" name="icon">...</select>
</form>
```

## Testing Checklist

After implementing the fix:

1. ✅ Open admin panel in browser
2. ✅ Check browser console for errors
3. ✅ Verify system status shows green circles
4. ✅ Test token save functionality
5. ✅ Click "Quick Add Product" - modal should open
6. ✅ Fill product form and submit - product should be added
7. ✅ Click edit icon on product - edit modal should open
8. ✅ Update product and save - product should be updated
9. ✅ Click delete icon - product should be deleted
10. ✅ Repeat tests for services
11. ✅ Verify all collapsible sections work

## Success Criteria

- System status indicators are green
- Products and services load from API
- Adding new items works
- Editing items works
- Deleting items works
- Token management works
- All buttons are clickable and functional
- Modals open and close properly
- Forms submit successfully
- Toast notifications appear
- No JavaScript errors in console

## Deployment

After fixing:

```bash
# Build and deploy
npm run build
cp -r admin dist/
cp -r functions dist/
npx wrangler pages deploy dist --project-name=qbyten --commit-dirty=true
```

## Important Notes

1. **Don't use ES6 modules** - The JavaScript file is loaded as a regular script, not a module
2. **Use IIFE** - Wrap everything in an immediately invoked function expression to avoid global namespace pollution
3. **Use data attributes** - Makes it easy to bind events and find elements
4. **Test locally first** - Use `npx wrangler pages dev dist` to test before deploying
5. **Check browser console** - Any errors will show up there

This fix will make the admin panel fully functional!
