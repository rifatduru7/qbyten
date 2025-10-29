// Admin Panel Main JavaScript
// This file handles the main admin panel functionality

const state = {
  token: localStorage.getItem('ADMIN_TOKEN') || '',
};

function authHeaders() {
  return state.token ? { 'authorization': `Bearer ${state.token}` } : {};
}

// System status monitoring
async function updateSystemStatus() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    
    if (data.ok) {
      // Update general status
      const generalStatusEl = document.querySelector('#general-status');
      const generalIndicatorEl = document.querySelector('#general-indicator');
      
      if (generalStatusEl && generalIndicatorEl) {
        generalStatusEl.textContent = 'Tüm Sistemler Çalışıyor';
        generalIndicatorEl.textContent = 'check_circle';
        generalIndicatorEl.className = 'material-symbols-outlined text-green-500 mb-2';
      }
      
      // Update API status
      const apiStatusEl = document.querySelector('#api-status');
      const apiIndicatorEl = document.querySelector('#api-indicator');
      
      if (apiStatusEl && apiIndicatorEl) {
        apiStatusEl.textContent = 'API Çalışıyor';
        apiIndicatorEl.textContent = 'check_circle';
        apiIndicatorEl.className = 'material-symbols-outlined text-green-500 mb-2';
      }
      
      // Update database status
      const dbStatusEl = document.querySelector('#db-status');
      const dbIndicatorEl = document.querySelector('#db-indicator');
      
      if (dbStatusEl && dbIndicatorEl) {
        if (data.database?.status === 'available') {
          dbStatusEl.textContent = 'Veritabanı Bağlantısı Başarılı';
          dbIndicatorEl.textContent = 'check_circle';
          dbIndicatorEl.className = 'material-symbols-outlined text-green-500 mb-2';
        } else {
          dbStatusEl.textContent = 'Veritabanı Hatası';
          dbIndicatorEl.textContent = 'error';
          dbIndicatorEl.className = 'material-symbols-outlined text-red-500 mb-2';
        }
      }
      
      // Update last check time
      const lastCheck = document.querySelector('#last-check');
      if (lastCheck) {
        lastCheck.textContent = new Date(data.ts).toLocaleString('tr-TR');
      }
    } else {
      // Handle error state
      const statusElements = [
        { statusEl: '#general-status', indicatorEl: '#general-indicator', text: 'Sistem Hatası' },
        { statusEl: '#api-status', indicatorEl: '#api-indicator', text: 'API Hatası' },
        { statusEl: '#db-status', indicatorEl: '#db-indicator', text: 'Veritabanı Hatası' }
      ];
      
      statusElements.forEach(({ statusEl, indicatorEl, text }) => {
        const statusElement = document.querySelector(statusEl);
        const indicatorElement = document.querySelector(indicatorEl);
        
        if (statusElement && indicatorElement) {
          statusElement.textContent = text;
          indicatorElement.textContent = 'error';
          indicatorElement.className = 'material-symbols-outlined text-red-500 mb-2';
        }
      });
    }
  } catch (error) {
    console.error('Status check failed:', error);
    
    // Update all status indicators to show connection error
    const statusElements = [
      { statusEl: '#general-status', indicatorEl: '#general-indicator', text: 'Bağlantı Hatası' },
      { statusEl: '#api-status', indicatorEl: '#api-indicator', text: 'API Erişilemiyor' },
      { statusEl: '#db-status', indicatorEl: '#db-indicator', text: 'Veritabanı Erişilemiyor' }
    ];
    
    statusElements.forEach(({ statusEl, indicatorEl, text }) => {
      const statusElement = document.querySelector(statusEl);
      const indicatorElement = document.querySelector(indicatorEl);
      
      if (statusElement && indicatorElement) {
        statusElement.textContent = text;
        indicatorElement.textContent = 'error';
        indicatorElement.className = 'material-symbols-outlined text-red-500 mb-2';
      }
    });
  }
}

// Token management
function bindTokenUI() {
  const tokenInput = document.querySelector('#token-input');
  const tokenStatus = document.querySelector('#token-status');
  
  if (tokenInput && tokenStatus) {
    tokenInput.value = state.token;
    tokenStatus.textContent = state.token ? 'Token kayıtlı' : 'Token kaydedilmedi';
  }
  
  // Save token button
  const saveBtn = document.querySelector('#save-token');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      state.token = tokenInput.value.trim();
      localStorage.setItem('ADMIN_TOKEN', state.token);
      tokenStatus.textContent = state.token ? 'Token kayıtlı' : 'Token kaydedilmedi';
    });
  }
}

// Mobile menu toggle
function toggleMobileMenu() {
  const sidebar = document.querySelector('aside');
  const overlay = document.querySelector('#mobile-sidebar-overlay');
  
  if (sidebar) {
    const isOpen = !sidebar.classList.contains('translate-x-full');
    
    if (isOpen) {
      // Close sidebar
      sidebar.classList.add('translate-x-full');
      sidebar.classList.remove('translate-x-0');
      document.body.style.overflow = 'auto';
      
      if (overlay) {
        overlay.classList.add('hidden');
      }
    } else {
      // Open sidebar
      sidebar.classList.remove('translate-x-full');
      sidebar.classList.add('translate-x-0');
      document.body.style.overflow = 'hidden';
      
      if (overlay) {
        overlay.classList.remove('hidden');
      }
    }
  }
}

// Close mobile menu
function closeMobileMenu() {
  const sidebar = document.querySelector('aside');
  const overlay = document.querySelector('#mobile-sidebar-overlay');
  
  if (sidebar) {
    sidebar.classList.add('translate-x-full');
    sidebar.classList.remove('translate-x-0');
    document.body.style.overflow = 'auto';
    
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  bindTokenUI();
  updateSystemStatus();
  
  // Auto-refresh status every 30 seconds
  setInterval(updateSystemStatus, 30000);
  
  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector('#mobile-menu-toggle');
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
  }
  
  // Close mobile menu when clicking overlay
  const overlay = document.querySelector('#mobile-sidebar-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeMobileMenu);
  }
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    const sidebar = document.querySelector('aside');
    const toggle = document.querySelector('#mobile-menu-toggle');
    
    if (sidebar && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
      if (window.innerWidth < 1024) {
        closeMobileMenu();
      }
    }
  });
  
  // Close mobile menu on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const sidebar = document.querySelector('aside');
      if (sidebar && !sidebar.classList.contains('translate-x-full')) {
        closeMobileMenu();
      }
    }
  });
  
  // Initialize modal forms
  initModalForms();
  
  // Initialize delete actions
  initDeleteActions();
});

// Initialize modal forms
function initModalForms() {
  // Add Product Form
  const addProductForm = document.querySelector('#add-product-form');
  if (addProductForm) {
    addProductForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleAddProduct(addProductForm);
    });
  }
  
  // Edit Product Form
  const editProductForm = document.querySelector('#edit-product-form');
  if (editProductForm) {
    editProductForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleEditProduct(editProductForm);
    });
  }
  
  // Add Service Form
  const addServiceForm = document.querySelector('#add-service-form');
  if (addServiceForm) {
    addServiceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleAddService(addServiceForm);
    });
  }
  
  // Edit Service Form
  const editServiceForm = document.querySelector('#edit-service-form');
  if (editServiceForm) {
    editServiceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleEditService(editServiceForm);
    });
  }
  
  // File upload handling
  const fileInputs = document.querySelectorAll('input[type="file"]');
  fileInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      handleFileUpload(e);
    });
  });
}

// Initialize delete actions
function initDeleteActions() {
  // Delete Product buttons
  const deleteProductButtons = document.querySelectorAll('[data-action="delete-product"]');
  deleteProductButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const productId = button.getAttribute('data-product-id');
      showConfirmationModal(
        'Bu ürünü silmek istediğinizden emin misiniz?',
        () => handleDeleteProduct(productId),
        null
      );
    });
  });
  
  // Delete Service buttons
  const deleteServiceButtons = document.querySelectorAll('[data-action="delete-service"]');
  deleteServiceButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceId = button.getAttribute('data-service-id');
      showConfirmationModal(
        'Bu hizmeti silmek istediğinizden emin misiniz?',
        () => handleDeleteService(serviceId),
        null
      );
    });
  });
}

// Handle Add Product
async function handleAddProduct(form) {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  // Show loading modal
  const loadingModal = showLoadingModal('Ürün ekleniyor...');
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Close loading modal
    closeModal();
    
    // Show success message
    showAlertModal('Başarılı', 'Ürün başarıyla eklendi.');
    
    // Reset form
    form.reset();
    
    // Close modal
    closeModal();
    
    // Refresh products list (in real app, this would fetch from API)
    console.log('Product added:', data);
    
  } catch (error) {
    // Close loading modal
    closeModal();
    
    // Show error message
    showAlertModal('Hata', 'Ürün eklenirken bir hata oluştu.');
    
    console.error('Add product error:', error);
  }
}

// Handle Edit Product
async function handleEditProduct(form) {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  // Show loading modal
  const loadingModal = showLoadingModal('Ürün güncelleniyor...');
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Close loading modal
    closeModal();
    
    // Show success message
    showAlertModal('Başarılı', 'Ürün başarıyla güncellendi.');
    
    // Close modal
    closeModal();
    
    // Refresh products list (in real app, this would fetch from API)
    console.log('Product updated:', data);
    
  } catch (error) {
    // Close loading modal
    closeModal();
    
    // Show error message
    showAlertModal('Hata', 'Ürün güncellenirken bir hata oluştu.');
    
    console.error('Edit product error:', error);
  }
}

// Handle Add Service
async function handleAddService(form) {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  // Show loading modal
  const loadingModal = showLoadingModal('Hizmet ekleniyor...');
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Close loading modal
    closeModal();
    
    // Show success message
    showAlertModal('Başarılı', 'Hizmet başarıyla eklendi.');
    
    // Reset form
    form.reset();
    
    // Close modal
    closeModal();
    
    // Refresh services list (in real app, this would fetch from API)
    console.log('Service added:', data);
    
  } catch (error) {
    // Close loading modal
    closeModal();
    
    // Show error message
    showAlertModal('Hata', 'Hizmet eklenirken bir hata oluştu.');
    
    console.error('Add service error:', error);
  }
}

// Handle Edit Service
async function handleEditService(form) {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  // Show loading modal
  const loadingModal = showLoadingModal('Hizmet güncelleniyor...');
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Close loading modal
    closeModal();
    
    // Show success message
    showAlertModal('Başarılı', 'Hizmet başarıyla güncellendi.');
    
    // Close modal
    closeModal();
    
    // Refresh services list (in real app, this would fetch from API)
    console.log('Service updated:', data);
    
  } catch (error) {
    // Close loading modal
    closeModal();
    
    // Show error message
    showAlertModal('Hata', 'Hizmet güncellenirken bir hata oluştu.');
    
    console.error('Edit service error:', error);
  }
}

// Handle Delete Product
async function handleDeleteProduct(productId) {
  // Show loading modal
  const loadingModal = showLoadingModal('Ürün siliniyor...');
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Close loading modal
    closeModal();
    
    // Show success message
    showAlertModal('Başarılı', 'Ürün başarıyla silindi.');
    
    // Refresh products list (in real app, this would fetch from API)
    console.log('Product deleted:', productId);
    
  } catch (error) {
    // Close loading modal
    closeModal();
    
    // Show error message
    showAlertModal('Hata', 'Ürün silinirken bir hata oluştu.');
    
    console.error('Delete product error:', error);
  }
}

// Handle Delete Service
async function handleDeleteService(serviceId) {
  // Show loading modal
  const loadingModal = showLoadingModal('Hizmet siliniyor...');
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Close loading modal
    closeModal();
    
    // Show success message
    showAlertModal('Başarılı', 'Hizmet başarıyla silindi.');
    
    // Refresh services list (in real app, this would fetch from API)
    console.log('Service deleted:', serviceId);
    
  } catch (error) {
    // Close loading modal
    closeModal();
    
    // Show error message
    showAlertModal('Hata', 'Hizmet silinirken bir hata oluştu.');
    
    console.error('Delete service error:', error);
  }
}

// Handle file upload
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const uploadText = event.target.parentElement.querySelector('.upload-text p');
    if (uploadText) {
      uploadText.textContent = `Seçilen dosya: ${file.name}`;
    }
  }
}

// Handle edit modal data population
document.addEventListener('click', (e) => {
  if (e.target.hasAttribute('data-modal-trigger')) {
    const modalId = e.target.getAttribute('data-modal-trigger');
    
    // Handle edit modals - populate with data
    if (modalId === 'edit-product-modal') {
      const productId = e.target.getAttribute('data-product-id');
      populateEditProductModal(productId);
    } else if (modalId === 'edit-service-modal') {
      const serviceId = e.target.getAttribute('data-service-id');
      populateEditServiceModal(serviceId);
    }
  }
});

// Populate edit product modal with data
function populateEditProductModal(productId) {
  // In a real app, this would fetch data from API
  // For demo, we'll use mock data
  const mockData = {
    'PRD-001': {
      code: 'PRD-001',
      name: 'e-Fatura Çözümü',
      category: 'e-fatura',
      description: 'Kapsamlı e-fatura yönetim çözümü',
      price: '299.99'
    }
  };
  
  const productData = mockData[productId];
  if (productData) {
    document.getElementById('edit-product-id').value = productId;
    document.getElementById('edit-product-code').value = productData.code;
    document.getElementById('edit-product-name').value = productData.name;
    document.getElementById('edit-product-category').value = productData.category;
    document.getElementById('edit-product-description').value = productData.description;
    document.getElementById('edit-product-price').value = productData.price;
  }
}

// Populate edit service modal with data
function populateEditServiceModal(serviceId) {
  // In a real app, this would fetch data from API
  // For demo, we'll use mock data
  const mockData = {
    'SVC-001': {
      code: 'SVC-001',
      name: 'e-Arşiv Hizmeti',
      type: 'e-arsiv',
      description: 'Profesyonel e-arşiv hizmeti',
      price: '199.99',
      icon: 'description'
    }
  };
  
  const serviceData = mockData[serviceId];
  if (serviceData) {
    document.getElementById('edit-service-id').value = serviceId;
    document.getElementById('edit-service-code').value = serviceData.code;
    document.getElementById('edit-service-name').value = serviceData.name;
    document.getElementById('edit-service-type').value = serviceData.type;
    document.getElementById('edit-service-description').value = serviceData.description;
    document.getElementById('edit-service-price').value = serviceData.price;
    document.getElementById('edit-service-icon').value = serviceData.icon;
  }
}

// Handle window resize
window.addEventListener('resize', () => {
  const sidebar = document.querySelector('aside');
  if (sidebar && window.innerWidth >= 1024) {
    // Reset sidebar to desktop state
    sidebar.classList.remove('translate-x-full', 'translate-x-0', 'fixed', 'inset-0', 'z-50');
    document.body.style.overflow = 'auto';
    
    // Hide overlay if it exists
    const overlay = document.querySelector('#mobile-sidebar-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }
});

// ===================================
// MOBILE-FRIENDLY MODAL FUNCTIONALITY
// ===================================

// Modal state management
const modalState = {
  currentModal: null,
  isOpen: false,
  previousFocus: null,
  trapFocus: null
};

// Initialize modal functionality
function initModals() {
  // Add event listeners to modal triggers
  const modalTriggers = document.querySelectorAll('[data-modal-trigger]');
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = trigger.getAttribute('data-modal-trigger');
      openModal(modalId);
    });
  });

  // Add event listeners to modal close buttons
  const modalCloseButtons = document.querySelectorAll('[data-modal-close]');
  modalCloseButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });
  });

  // Close modal when clicking overlay
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay') && modalState.isOpen) {
      closeModal();
    }
  });

  // Close modal on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalState.isOpen) {
      closeModal();
    }
    
    // Trap focus within modal
    if (modalState.isOpen && e.key === 'Tab') {
      trapFocusInModal(e);
    }
  });

  // Handle window resize for modals
  window.addEventListener('resize', () => {
    if (modalState.isOpen) {
      adjustModalForScreenSize();
    }
  });
}

// Open modal with mobile optimizations
function openModal(modalId) {
  const modal = document.querySelector(`#${modalId}`);
  if (!modal) return;

  // Store current focus element
  modalState.previousFocus = document.activeElement;
  modalState.currentModal = modal;
  modalState.isOpen = true;

  // Show modal with animation
  modal.classList.remove('hidden');
  modal.classList.add('show');
  
  // Prevent body scroll on mobile
  document.body.style.overflow = 'hidden';
  
  // Add mobile-specific classes
  if (window.innerWidth <= 767) {
    modal.classList.add('mobile-modal');
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  }

  // Set focus to first focusable element
  setTimeout(() => {
    const firstFocusable = modal.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }, 100);

  // Adjust modal for current screen size
  adjustModalForScreenSize();
}

// Close modal with cleanup
function closeModal() {
  if (!modalState.currentModal || !modalState.isOpen) return;

  const modal = modalState.currentModal;
  
  // Hide modal with animation
  modal.classList.remove('show');
  modal.classList.add('hide');
  
  // Wait for animation to complete
  setTimeout(() => {
    modal.classList.add('hidden');
    modal.classList.remove('hide', 'mobile-modal');
    
    // Restore body scroll
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    
    // Restore focus
    if (modalState.previousFocus) {
      modalState.previousFocus.focus();
    }
    
    // Reset state
    modalState.currentModal = null;
    modalState.isOpen = false;
    modalState.previousFocus = null;
  }, 300);
}

// Adjust modal based on screen size
function adjustModalForScreenSize() {
  if (!modalState.currentModal) return;

  const modal = modalState.currentModal;
  const screenWidth = window.innerWidth;
  
  // Remove all screen size classes
  modal.classList.remove('modal-mobile', 'modal-tablet', 'modal-desktop');
  
  // Add appropriate class based on screen size
  if (screenWidth <= 767) {
    modal.classList.add('modal-mobile');
    // Ensure modal is properly positioned on mobile
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
      modalContent.style.maxHeight = '85vh';
      modalContent.style.overflowY = 'auto';
    }
  } else if (screenWidth <= 1023) {
    modal.classList.add('modal-tablet');
  } else {
    modal.classList.add('modal-desktop');
  }
}

// Trap focus within modal for accessibility
function trapFocusInModal(e) {
  if (!modalState.currentModal) return;

  const modal = modalState.currentModal;
  const focusableElements = modal.querySelectorAll(
    'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (e.shiftKey) {
    // Shift + Tab
    if (document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    }
  } else {
    // Tab
    if (document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
}

// Create responsive modal dynamically
function createResponsiveModal(options = {}) {
  const {
    id = `modal-${Date.now()}`,
    title = 'Modal',
    subtitle = '',
    content = '',
    buttons = [],
    size = 'medium',
    closeOnOverlay = true,
    showCloseButton = true
  } = options;

  // Create modal HTML
  const modalHTML = `
    <div id="${id}" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="${id}-title">
      <div class="modal-content">
        ${showCloseButton ? `<button class="modal-close" data-modal-close aria-label="Kapat">&times;</button>` : ''}
        
        ${title || subtitle ? `
          <div class="modal-header">
            ${title ? `<h2 id="${id}-title">${title}</h2>` : ''}
            ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}
          </div>
        ` : ''}
        
        <div class="modal-body">
          ${content}
        </div>
        
        ${buttons.length > 0 ? `
          <div class="modal-buttons">
            ${buttons.map(btn => `
              <button class="modal-btn ${btn.class || 'secondary'}"
                      data-action="${btn.action || ''}"
                      ${btn.id ? `id="${btn.id}"` : ''}>
                ${btn.text}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;

  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Initialize modal
  const modal = document.querySelector(`#${id}`);
  
  // Add event listeners to buttons
  buttons.forEach(btn => {
    if (btn.action && btn.handler) {
      const buttonElement = modal.querySelector(`[data-action="${btn.action}"]`);
      if (buttonElement) {
        buttonElement.addEventListener('click', btn.handler);
      }
    }
  });

  // Add close functionality if enabled
  if (closeOnOverlay) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  return modal;
}

// Show confirmation modal (mobile-friendly)
function showConfirmationModal(message, onConfirm, onCancel = null) {
  const modal = createResponsiveModal({
    title: 'Onay',
    content: `<p>${message}</p>`,
    buttons: [
      {
        text: 'İptal',
        class: 'secondary',
        action: 'cancel',
        handler: () => {
          closeModal();
          if (onCancel) onCancel();
        }
      },
      {
        text: 'Onayla',
        class: 'primary',
        action: 'confirm',
        handler: () => {
          closeModal();
          if (onConfirm) onConfirm();
        }
      }
    ]
  });

  openModal(modal.id);
  return modal;
}

// Show alert modal (mobile-friendly)
function showAlertModal(title, message, buttonText = 'Tamam') {
  const modal = createResponsiveModal({
    title: title,
    content: `<p>${message}</p>`,
    buttons: [
      {
        text: buttonText,
        class: 'primary',
        action: 'close',
        handler: () => closeModal()
      }
    ]
  });

  openModal(modal.id);
  return modal;
}

// Show loading modal
function showLoadingModal(message = 'Yükleniyor...') {
  const modal = createResponsiveModal({
    content: `
      <div class="modal-loading">
        <div class="modal-spinner"></div>
        <p>${message}</p>
      </div>
    `,
    showCloseButton: false,
    closeOnOverlay: false
  });

  openModal(modal.id);
  return modal;
}

// Initialize modals when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize existing modal functionality
  initModals();
  
  // Add mobile touch support for modal interactions
  if ('ontouchstart' in window) {
    document.addEventListener('touchstart', function(e) {
      // Handle touch events for modal interactions
      if (modalState.isOpen) {
        const modal = modalState.currentModal;
        if (modal && !modal.contains(e.target) && e.target.classList.contains('modal-overlay')) {
          // Allow closing modal with touch on overlay
          closeModal();
        }
      }
    }, { passive: true });
  }
});

// Export modal functions for global access
window.adminModals = {
  open: openModal,
  close: closeModal,
  create: createResponsiveModal,
  confirm: showConfirmationModal,
  alert: showAlertModal,
  loading: showLoadingModal
};