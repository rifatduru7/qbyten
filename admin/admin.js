// QbYTen Admin Panel - Complete Functionality
// This file must be loaded as a regular script (not module) in admin/index.html

(function() {
  'use strict';

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const state = {
    token: localStorage.getItem('AUTH_TOKEN') || '',
    products: [],
    services: [],
    settings: [],
    menus: [],
    flatMenus: [],
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
      const generalEl = document.querySelector('#general-indicator');
      const generalTextEl = document.querySelector('#general-status');
      if (generalEl && generalTextEl) {
        if (data.ok) {
          generalEl.className = 'material-symbols-outlined text-green-500 mb-2';
          generalEl.textContent = 'check_circle';
          generalTextEl.textContent = 'All Systems Operational';
        } else {
          generalEl.className = 'material-symbols-outlined text-red-500 mb-2';
          generalEl.textContent = 'error';
          generalTextEl.textContent = 'System Error';
        }
      }

      // Update API Status
      const apiEl = document.querySelector('#api-indicator');
      const apiTextEl = document.querySelector('#api-status');
      if (apiEl && apiTextEl) {
        if (data.api === 'running') {
          apiEl.className = 'material-symbols-outlined text-green-500 mb-2';
          apiEl.textContent = 'check_circle';
          apiTextEl.textContent = 'API Running';
        } else {
          apiEl.className = 'material-symbols-outlined text-red-500 mb-2';
          apiEl.textContent = 'error';
          apiTextEl.textContent = 'API Error';
        }
      }

      // Update Database Status
      const dbEl = document.querySelector('#db-indicator');
      const dbTextEl = document.querySelector('#db-status');
      if (dbEl && dbTextEl) {
        if (data.database && data.database.status === 'available') {
          dbEl.className = 'material-symbols-outlined text-green-500 mb-2';
          dbEl.textContent = 'check_circle';
          dbTextEl.textContent = 'Database Connected';
        } else {
          dbEl.className = 'material-symbols-outlined text-red-500 mb-2';
          dbEl.textContent = 'error';
          dbTextEl.textContent = 'Database Error';
        }
      }

      // Update last check time
      const lastCheckEl = document.querySelector('#last-check');
      if (lastCheckEl) {
        lastCheckEl.textContent = new Date(data.ts).toLocaleString();
      }

    } catch (error) {
      console.error('Health check failed:', error);
      // Set all to error state
      const indicators = ['general-indicator', 'api-indicator', 'db-indicator'];
      const statusTexts = ['general-status', 'api-status', 'db-status'];
      
      indicators.forEach((id, index) => {
        const el = document.querySelector(`#${id}`);
        const textEl = document.querySelector(`#${statusTexts[index]}`);
        if (el && textEl) {
          el.className = 'material-symbols-outlined text-red-500 mb-2';
          el.textContent = 'error';
          textEl.textContent = 'Connection Failed';
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
        localStorage.setItem('AUTH_TOKEN', state.token);
        if (tokenStatus) {
          tokenStatus.textContent = state.token ? 'Token saved' : 'No token';
          tokenStatus.className = state.token ? 'text-sm text-green-600 mt-2 text-center' : 'text-sm text-gray-500 dark:text-gray-400 mt-2 text-center';
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
      container.innerHTML = `
        <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-semibold text-gray-800 dark:text-gray-100">PRD-001 <span class="font-normal text-gray-500 dark:text-gray-400">(e-fatura)</span></p>
              <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">Brief description...</p>
            </div>
            <div class="flex space-x-2">
              <button class="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400" data-modal-trigger="edit-product-modal" data-product-id="PRD-001"><span class="material-symbols-outlined text-base">edit</span></button>
              <button class="text-red-500 hover:text-red-700 dark:hover:text-red-400" data-action="delete-product" data-product-id="PRD-001"><span class="material-symbols-outlined text-base">delete</span></button>
            </div>
          </div>
        </div>
        <p class="text-center text-sm text-gray-500 dark:text-gray-400 pt-4">No other products found.</p>
      `;
      return;
    }

    container.innerHTML = state.products.map(product => `
      <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
        <div class="flex justify-between items-start">
          <div>
            <p class="font-semibold text-gray-800 dark:text-gray-100">${product.slug || product.code || 'PRD-001'} <span class="font-normal text-gray-500 dark:text-gray-400">(${product.category || 'e-fatura'})</span></p>
            <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">${product.description || 'Brief description...'}</p>
          </div>
          <div class="flex space-x-2">
            <button class="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400" data-action="edit-product" data-id="${product.id}"><span class="material-symbols-outlined text-base">edit</span></button>
            <button class="text-red-500 hover:text-red-700 dark:hover:text-red-400" data-action="delete-product" data-id="${product.id}"><span class="material-symbols-outlined text-base">delete</span></button>
          </div>
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
      container.innerHTML = `
        <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-semibold text-gray-800 dark:text-gray-100">SVC-001 <span class="font-normal text-gray-500 dark:text-gray-400">(e-arsiv)</span></p>
              <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">Brief description...</p>
            </div>
            <div class="flex space-x-2">
              <button class="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400" data-modal-trigger="edit-service-modal" data-service-id="SVC-001"><span class="material-symbols-outlined text-base">edit</span></button>
              <button class="text-red-500 hover:text-red-700 dark:hover:text-red-400" data-action="delete-service" data-service-id="SVC-001"><span class="material-symbols-outlined text-base">delete</span></button>
            </div>
          </div>
        </div>
        <p class="text-center text-sm text-gray-500 dark:text-gray-400 pt-4">No other services found.</p>
      `;
      return;
    }

    container.innerHTML = state.services.map(service => `
      <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
        <div class="flex justify-between items-start">
          <div>
            <p class="font-semibold text-gray-800 dark:text-gray-100">${service.slug || service.code || 'SVC-001'} <span class="font-normal text-gray-500 dark:text-gray-400">(${service.type || 'e-arsiv'})</span></p>
            <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">${service.description || 'Brief description...'}</p>
          </div>
          <div class="flex space-x-2">
            <button class="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400" data-action="edit-service" data-id="${service.id}"><span class="material-symbols-outlined text-base">edit</span></button>
            <button class="text-red-500 hover:text-red-700 dark:hover:text-red-400" data-action="delete-service" data-id="${service.id}"><span class="material-symbols-outlined text-base">delete</span></button>
          </div>
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
      container.innerHTML = '<p class="text-center text-sm text-gray-500 dark:text-gray-400 pt-4">Settings content goes here.</p>';
      return;
    }

    container.innerHTML = state.settings.map(setting => `
      <div class="setting-item p-2 border-b border-gray-100 dark:border-gray-600">
        <strong class="text-gray-700 dark:text-gray-300">${setting.key}:</strong> 
        <span class="text-gray-600 dark:text-gray-400">${setting.value}</span>
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
        case 'edit-menu':
          // Load menu data and open edit modal
          const menu = state.flatMenus.find(m => m.id == id);
          if (menu) {
            openMenuModal(menu);
          }
          break;
        case 'delete-menu':
          await deleteMenu(id);
          break;
      }
    });

    // Modal triggers
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-modal-trigger]');
      if (!target) return;

      const modalId = target.dataset.modalTrigger;
      openModal(modalId);
    });

    // Close modals
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
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
    document.querySelectorAll('button').forEach(btn => {
      // Check if this is a collapsible section button
      const parentDiv = btn.closest('.bg-white.dark\\:bg-gray-800');
      if (parentDiv && btn.querySelector('.material-symbols-outlined:last-child')) {
        const icon = btn.querySelector('.material-symbols-outlined:last-child');
        if (icon && (icon.textContent === 'expand_more' || icon.textContent === 'expand_less')) {
          btn.addEventListener('click', () => {
            const content = parentDiv.querySelector('.px-4.pb-4');
            if (content) {
              content.classList.toggle('hidden');
              icon.textContent = content.classList.contains('hidden') ? 'expand_more' : 'expand_less';
            }
          });
        }
      }
    });

    // Menu management event listeners
    const btnAddMenu = document.querySelector('#btn-add-menu');
    if (btnAddMenu) {
      btnAddMenu.addEventListener('click', () => openMenuModal());
    }

    const menuModalClose = document.querySelector('#menu-modal-close');
    if (menuModalClose) {
      menuModalClose.addEventListener('click', closeMenuModal);
    }

    const menuCancel = document.querySelector('#menu-cancel');
    if (menuCancel) {
      menuCancel.addEventListener('click', closeMenuModal);
    }

    const menuSave = document.querySelector('#menu-save');
    if (menuSave) {
      menuSave.addEventListener('click', saveMenu);
    }

    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('#mobile-menu-toggle');
    const mobileSidebarOverlay = document.querySelector('#mobile-sidebar-overlay');
    const sidebar = document.querySelector('aside');

    if (mobileMenuToggle && mobileSidebarOverlay && sidebar) {
      mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('translate-x-full');
        mobileSidebarOverlay.classList.toggle('hidden');
      });

      mobileSidebarOverlay.addEventListener('click', () => {
        sidebar.classList.add('translate-x-full');
        mobileSidebarOverlay.classList.add('hidden');
      });
    }
  }

  function fillEditProductForm(product) {
    document.querySelector('#edit-product-id').value = product.id;
    document.querySelector('#edit-product-code').value = product.slug || product.code || '';
    document.querySelector('#edit-product-name').value = product.name || product.title || '';
    document.querySelector('#edit-product-category').value = product.category || '';
    document.querySelector('#edit-product-description').value = product.description || '';
    document.querySelector('#edit-product-price').value = product.price || '';
  }

  function fillEditServiceForm(service) {
    document.querySelector('#edit-service-id').value = service.id;
    document.querySelector('#edit-service-code').value = service.slug || service.code || '';
    document.querySelector('#edit-service-name').value = service.name || service.title || '';
    document.querySelector('#edit-service-type').value = service.type || '';
    document.querySelector('#edit-service-description').value = service.description || '';
    document.querySelector('#edit-service-price').value = service.price || '';
    if (service.icon) {
      document.querySelector('#edit-service-icon').value = service.icon;
    }
  }

  // ============================================
  // NAVIGATION MENU MANAGEMENT
  // ============================================
  async function loadMenus() {
    try {
      const response = await fetch('/api/menus', {
        headers: authHeaders()
      });
      const data = await response.json();
      state.menus = data.menus || [];
      state.flatMenus = data.flat || [];
      renderMenus();
      populateParentSelect();
    } catch (error) {
      console.error('Failed to load menus:', error);
      showToast('Failed to load menus', 'error');
    }
  }

  function renderMenus() {
    const container = document.querySelector('#menus-list');
    if (!container) return;

    if (state.menus.length === 0) {
      container.innerHTML = '<p class="text-center text-sm text-gray-500 dark:text-gray-400 pt-4">No menus found.</p>';
      return;
    }

    container.innerHTML = '';
    state.menus.forEach(menu => {
      renderMenuItem(menu, container, 0);
    });
  }

  function renderMenuItem(menu, container, level) {
    const div = document.createElement('div');
    div.className = 'flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600';
    div.style.marginLeft = `${level * 20}px`;

    const isActive = menu.is_active === 1;
    const hasChildren = menu.children && menu.children.length > 0;

    div.innerHTML = `
      <div class="flex items-center flex-grow">
        ${menu.icon ? `<span class="material-symbols-outlined text-primary mr-2">${menu.icon}</span>` : ''}
        <div>
          <div class="font-semibold text-gray-900 dark:text-white">
            ${menu.title}
            ${!isActive ? '<span class="text-xs text-red-500 ml-2">(Hidden)</span>' : ''}
            ${hasChildren ? `<span class="text-xs text-blue-500 ml-2">(${menu.children.length} submenus)</span>` : ''}
          </div>
          <div class="text-xs text-gray-500">
            ${menu.url || 'No URL'}
            ${menu.parent_id ? '(Submenu)' : '(Main menu)'}
            | Order: ${menu.sort_order}
          </div>
        </div>
      </div>
      <div class="flex space-x-2">
        <button class="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700 text-primary transition-colors" data-action="edit-menu" data-id="${menu.id}">
          <span class="material-symbols-outlined">edit</span>
        </button>
        <button class="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 transition-colors" data-action="delete-menu" data-id="${menu.id}">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    `;

    container.appendChild(div);

    // Render children recursively
    if (hasChildren) {
      menu.children.forEach(child => {
        renderMenuItem(child, container, level + 1);
      });
    }
  }

  function populateParentSelect() {
    const select = document.querySelector('#menu-parent');
    if (!select) return;

    // Keep first option (no parent)
    select.innerHTML = '<option value="">Main Menu (Not a submenu)</option>';

    // Add all top-level menus as options
    state.flatMenus
      .filter(m => m.parent_id === null)
      .forEach(menu => {
        const option = document.createElement('option');
        option.value = menu.id;
        option.textContent = menu.title;
        select.appendChild(option);
      });
  }

  function openMenuModal(menu = null) {
    const modal = document.querySelector('#menu-modal');
    const title = document.querySelector('#menu-modal-title');

    if (menu) {
      // Edit mode
      state.editingItem = menu;
      title.innerHTML = '<span class="material-symbols-outlined mr-2 text-primary">edit</span>Edit Menu';

      document.querySelector('#menu-id').value = menu.id;
      document.querySelector('#menu-title').value = menu.title;
      document.querySelector('#menu-url').value = menu.url || '';
      document.querySelector('#menu-parent').value = menu.parent_id || '';
      document.querySelector('#menu-sort').value = menu.sort_order || 0;
      document.querySelector('#menu-target').value = menu.target || '_self';
      document.querySelector('#menu-icon').value = menu.icon || '';
      document.querySelector('#menu-active').checked = menu.is_active === 1;
    } else {
      // Add mode
      state.editingItem = null;
      title.innerHTML = '<span class="material-symbols-outlined mr-2 text-primary">add</span>Add New Menu';

      document.querySelector('#menu-form').reset();
      document.querySelector('#menu-id').value = '';
      document.querySelector('#menu-active').checked = true;
    }

    modal.classList.remove('hidden');
  }

  function closeMenuModal() {
    document.querySelector('#menu-modal').classList.add('hidden');
    state.editingItem = null;
  }

  async function saveMenu() {
    const id = document.querySelector('#menu-id').value;
    const title = document.querySelector('#menu-title').value.trim();
    const url = document.querySelector('#menu-url').value.trim();
    const parent_id = document.querySelector('#menu-parent').value;
    const sort_order = parseInt(document.querySelector('#menu-sort').value) || 0;
    const target = document.querySelector('#menu-target').value;
    const icon = document.querySelector('#menu-icon').value.trim();
    const is_active = document.querySelector('#menu-active').checked;

    if (!title) {
      showToast('Menu title is required', 'error');
      return;
    }

    const menuData = {
      title,
      url: url || null,
      parent_id: parent_id ? parseInt(parent_id) : null,
      sort_order,
      target,
      icon: icon || null,
      is_active
    };

    try {
      if (id) {
        // Update
        menuData.id = parseInt(id);
        const response = await fetch('/api/menus', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders()
          },
          body: JSON.stringify(menuData)
        });

        if (response.ok) {
          showToast('Menu updated successfully', 'success');
          closeMenuModal();
          await loadMenus();
        } else {
          showToast('Failed to update menu', 'error');
        }
      } else {
        // Create
        const response = await fetch('/api/menus', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders()
          },
          body: JSON.stringify(menuData)
        });

        if (response.ok) {
          showToast('Menu added successfully', 'success');
          closeMenuModal();
          await loadMenus();
        } else {
          showToast('Failed to add menu', 'error');
        }
      }
    } catch (error) {
      console.error('Failed to save menu:', error);
      showToast('An error occurred', 'error');
    }
  }

  async function deleteMenu(id) {
    if (!confirm('Are you sure you want to delete this menu? Submenus will also be deleted.')) {
      return;
    }

    try {
      const response = await fetch(`/api/menus?id=${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });

      if (response.ok) {
        showToast('Menu deleted successfully', 'success');
        await loadMenus();
      } else {
        showToast('Failed to delete menu', 'error');
      }
    } catch (error) {
      console.error('Failed to delete menu:', error);
      showToast('An error occurred', 'error');
    }
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  // ============================================
  // LOGOUT FUNCTIONALITY
  // ============================================
  function initLogout() {
    const logoutBtn = document.querySelector('#logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
          localStorage.removeItem('AUTH_TOKEN');
          localStorage.removeItem('AUTH_USER');
          window.location.href = '/admin/login.html';
        }
      });
    }
  }

  function init() {
    console.log('QbYTen Admin Panel initialized');

    // Initialize all components
    initTokenManagement();
    initEventListeners();
    initLogout();

    // Load initial data
    updateSystemStatus();
    loadProducts();
    loadServices();
    loadSettings();
    loadMenus();

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