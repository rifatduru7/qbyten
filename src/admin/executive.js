// Executive Dashboard JavaScript
// This file handles the executive dashboard functionality

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
        generalStatusEl.textContent = 'All Systems Operational';
        generalIndicatorEl.className = 'material-symbols-outlined text-green-500 mb-2';
      }
      
      // Update API status
      const apiStatusEl = document.querySelector('#api-status');
      const apiIndicatorEl = document.querySelector('#api-indicator');
      
      if (apiStatusEl && apiIndicatorEl) {
        apiStatusEl.textContent = 'API Running';
        apiIndicatorEl.className = 'material-symbols-outlined text-green-500 mb-2';
      }
      
      // Update database status
      const dbStatusEl = document.querySelector('#db-status');
      const dbIndicatorEl = document.querySelector('#db-indicator');
      
      if (dbStatusEl && dbIndicatorEl) {
        dbStatusEl.textContent = 'Database Connected';
        dbIndicatorEl.className = 'material-symbols-outlined text-green-500 mb-2';
      }
      
      // Update last check time
      const lastCheck = document.querySelector('#last-check');
      if (lastCheck) {
        lastCheck.textContent = new Date(data.ts).toLocaleString();
      }
    } else {
      // Handle error state
      document.querySelectorAll('.status-text').forEach(el => {
        el.textContent = 'System Error';
        el.className = 'text-sm font-medium text-gray-700 dark:text-gray-300';
      });
      
      document.querySelectorAll('.status-indicator').forEach(el => {
        el.className = 'material-symbols-outlined text-red-500 mb-2';
      });
    }
  } catch (error) {
    console.error('Status check failed:', error);
  }
}

// Token management
function bindTokenUI() {
  const tokenInput = document.querySelector('#token-input');
  const tokenStatus = document.querySelector('#token-status');
  
  if (tokenInput && tokenStatus) {
    tokenInput.value = state.token;
    tokenStatus.textContent = state.token ? 'Token saved' : 'No token';
  }
  
  // Save token button
  const saveBtn = document.querySelector('#save-token');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      state.token = tokenInput.value.trim();
      localStorage.setItem('ADMIN_TOKEN', state.token);
      tokenStatus.textContent = state.token ? 'Token saved' : 'No token';
    });
  }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  bindTokenUI();
  updateSystemStatus();
  
  // Auto-refresh status every 30 seconds
  setInterval(updateSystemStatus, 30000);
});

// Mobile menu toggle
function toggleMobileMenu() {
  const menu = document.querySelector('#mobile-menu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

// Add mobile menu toggle event listener
document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuToggle = document.querySelector('#mobile-menu-toggle');
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
  }
});
