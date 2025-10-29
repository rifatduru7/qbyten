// QbYTen Admin Panel - Widget System
// This file provides widget-based dashboard functionality

(function() {
  'use strict';

  // ============================================
  // WIDGET STATE MANAGEMENT
  // ============================================
  const widgetState = {
    widgets: [],
    draggedWidget: null,
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    gridColumns: 12,
    gridRows: 20,
    cellSize: 40, // pixels
    container: null
  };

  // ============================================
  // WIDGET DEFINITIONS
  // ============================================
  const widgetDefinitions = {
    'system-status': {
      id: 'system-status',
      title: 'System Status',
      icon: 'monitoring',
      width: 6, // grid columns
      height: 3, // grid rows
      minWidth: 4,
      minHeight: 2,
      resizable: true,
      render: renderSystemStatusWidget
    },
    'admin-token': {
      id: 'admin-token',
      title: 'Admin Token',
      icon: 'key',
      width: 6,
      height: 3,
      minWidth: 4,
      minHeight: 2,
      resizable: true,
      render: renderAdminTokenWidget
    },
    'settings': {
      id: 'settings',
      title: 'Settings',
      icon: 'settings',
      width: 6,
      height: 4,
      minWidth: 4,
      minHeight: 3,
      resizable: true,
      render: renderSettingsWidget
    },
    'products': {
      id: 'products',
      title: 'Product Management',
      icon: 'inventory_2',
      width: 6,
      height: 6,
      minWidth: 4,
      minHeight: 4,
      resizable: true,
      render: renderProductsWidget
    },
    'services': {
      id: 'services',
      title: 'Service Management',
      icon: 'build',
      width: 6,
      height: 6,
      minWidth: 4,
      minHeight: 4,
      resizable: true,
      render: renderServicesWidget
    },
    'navigation': {
      id: 'navigation',
      title: 'Navigation Menu Management',
      icon: 'menu',
      width: 8,
      height: 6,
      minWidth: 6,
      minHeight: 4,
      resizable: true,
      render: renderNavigationWidget
    },
    'edit-item': {
      id: 'edit-item',
      title: 'Edit Item',
      icon: 'edit',
      width: 4,
      height: 4,
      minWidth: 3,
      minHeight: 3,
      resizable: true,
      render: renderEditItemWidget
    }
  };

  // ============================================
  // WIDGET RENDER FUNCTIONS
  // ============================================
  function renderSystemStatusWidget(widget) {
    return `
      <div class="widget-content p-4 h-full">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center space-x-3">
            <span class="material-symbols-outlined text-primary">monitoring</span>
            <h3 class="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">System Status</h3>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Last check: <span id="widget-last-check">-</span></p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span id="widget-general-indicator" class="material-symbols-outlined text-red-500 mb-2">error</span>
            <p id="widget-general-status" class="text-sm font-medium text-gray-700 dark:text-gray-300">General</p>
          </div>
          <div class="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span id="widget-api-indicator" class="material-symbols-outlined text-red-500 mb-2">error</span>
            <p id="widget-api-status" class="text-sm font-medium text-gray-700 dark:text-gray-300">API</p>
          </div>
          <div class="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span id="widget-db-indicator" class="material-symbols-outlined text-red-500 mb-2">error</span>
            <p id="widget-db-status" class="text-sm font-medium text-gray-700 dark:text-gray-300">Database</p>
          </div>
        </div>
      </div>
    `;
  }

  function renderAdminTokenWidget(widget) {
    return `
      <div class="widget-content p-4 h-full">
        <div class="flex items-center space-x-3 mb-4">
          <span class="material-symbols-outlined text-primary">key</span>
          <h3 class="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">Admin Token</h3>
        </div>
        <div class="space-y-4">
          <div>
            <input id="widget-admin-token-input" class="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary text-sm text-gray-700 dark:text-gray-300" placeholder="Enter admin token for API requests" type="text"/>
          </div>
          <div>
            <button id="widget-save-token-btn" class="w-full bg-primary text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
              <span class="material-symbols-outlined mr-2">save</span>
              Save Token
            </button>
            <p id="widget-token-status" class="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center"></p>
          </div>
        </div>
      </div>
    `;
  }

  function renderSettingsWidget(widget) {
    return `
      <div class="widget-content p-4 h-full">
        <div class="flex items-center space-x-3 mb-4">
          <span class="material-symbols-outlined text-primary">settings</span>
          <h3 class="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">Settings</h3>
        </div>
        <div id="widget-settings-content" class="overflow-y-auto" style="max-height: calc(100% - 60px);">
          <p class="text-center text-sm text-gray-500 dark:text-gray-400 pt-4">Settings content goes here.</p>
        </div>
      </div>
    `;
  }

  function renderProductsWidget(widget) {
    return `
      <div class="widget-content p-4 h-full flex flex-col">
        <div class="flex items-center space-x-3 mb-4">
          <span class="material-symbols-outlined text-primary">inventory_2</span>
          <h3 class="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">Product Management</h3>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Existing Products</p>
        <div id="widget-products-list" class="space-y-3 mb-4 flex-1 overflow-y-auto min-h-[120px]">
          <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-semibold text-gray-800 dark:text-gray-100">PRD-001 <span class="font-normal text-gray-500 dark:text-gray-400">(e-fatura)</span></p>
                <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">Brief description...</p>
              </div>
              <div class="flex space-x-2">
                <button class="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400" data-action="edit-product" data-id="PRD-001"><span class="material-symbols-outlined text-base">edit</span></button>
                <button class="text-red-500 hover:text-red-700 dark:hover:text-red-400" data-action="delete-product" data-id="PRD-001"><span class="material-symbols-outlined text-base">delete</span></button>
              </div>
            </div>
          </div>
          <p class="text-center text-sm text-gray-500 dark:text-gray-400 pt-4">No other products found.</p>
        </div>
        <button class="w-full bg-primary text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors" data-action="open-add-product">
          <span class="material-symbols-outlined mr-2">add</span>
          Quick Add Product
        </button>
      </div>
    `;
  }

  function renderServicesWidget(widget) {
    return `
      <div class="widget-content p-4 h-full flex flex-col">
        <div class="flex items-center space-x-3 mb-4">
          <span class="material-symbols-outlined text-primary">build</span>
          <h3 class="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">Service Management</h3>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Existing Services</p>
        <div id="widget-services-list" class="space-y-3 mb-4 flex-1 overflow-y-auto min-h-[120px]">
          <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-semibold text-gray-800 dark:text-gray-100">SVC-001 <span class="font-normal text-gray-500 dark:text-gray-400">(e-arsiv)</span></p>
                <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">Brief description...</p>
              </div>
              <div class="flex space-x-2">
                <button class="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400" data-action="edit-service" data-id="SVC-001"><span class="material-symbols-outlined text-base">edit</span></button>
                <button class="text-red-500 hover:text-red-700 dark:hover:text-red-400" data-action="delete-service" data-id="SVC-001"><span class="material-symbols-outlined text-base">delete</span></button>
              </div>
            </div>
          </div>
          <p class="text-center text-sm text-gray-500 dark:text-gray-400 pt-4">No other services found.</p>
        </div>
        <button class="w-full bg-primary text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors" data-action="open-add-service">
          <span class="material-symbols-outlined mr-2">add</span>
          Quick Add Service
        </button>
      </div>
    `;
  }

  function renderNavigationWidget(widget) {
    return `
      <div class="widget-content p-4 h-full flex flex-col">
        <div class="flex items-center space-x-3 mb-4">
          <span class="material-symbols-outlined text-primary">menu</span>
          <h3 class="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">Navigation Menu Management</h3>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Manage website navigation menus and submenus</p>
        
        <div class="mb-4">
          <button id="widget-btn-add-menu" class="w-full bg-primary text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
            <span class="material-symbols-outlined mr-2">add</span>
            Add New Menu
          </button>
        </div>
        
        <h4 class="font-medium text-lg mb-3 text-gray-800 dark:text-gray-100">Current Menus</h4>
        <div id="widget-menus-list" class="space-y-2 mb-4 flex-1 overflow-y-auto min-h-[120px]">
          <p class="text-center text-sm text-gray-500 dark:text-gray-400 pt-4">Loading menus...</p>
        </div>
      </div>
    `;
  }

  function renderEditItemWidget(widget) {
    return `
      <div class="widget-content p-4 h-full">
        <div class="flex items-center space-x-3 mb-4">
          <span class="material-symbols-outlined text-primary">edit</span>
          <h3 class="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">Edit Item</h3>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Select an item from the lists above to edit it here.</p>
        <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-48 flex items-center justify-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">No item selected</p>
        </div>
      </div>
    `;
  }

  // ============================================
  // WIDGET MANAGEMENT FUNCTIONS
  // ============================================
  function initializeWidgetSystem() {
    widgetState.container = document.querySelector('#widget-container');
    if (!widgetState.container) {
      console.error('Widget container not found');
      return;
    }

    // Load saved widget layout
    loadWidgetLayout();

    // Initialize drag and drop
    initializeDragAndDrop();

    // Initialize resize handles
    initializeResizeHandles();

    // Render all widgets
    renderAllWidgets();
  }

  function loadWidgetLayout() {
    const savedLayout = localStorage.getItem('WIDGET_LAYOUT');
    if (savedLayout) {
      try {
        widgetState.widgets = JSON.parse(savedLayout);
      } catch (error) {
        console.error('Failed to load widget layout:', error);
        loadDefaultLayout();
      }
    } else {
      loadDefaultLayout();
    }
  }

  function loadDefaultLayout() {
    if (isMobileDevice()) {
      // Mobile: Stack widgets vertically in single column
      widgetState.widgets = [
        { id: 'system-status', x: 0, y: 0, width: 12, height: 4 },
        { id: 'admin-token', x: 0, y: 4, width: 12, height: 4 },
        { id: 'products', x: 0, y: 8, width: 12, height: 8 },
        { id: 'services', x: 0, y: 16, width: 12, height: 8 },
        { id: 'navigation', x: 0, y: 24, width: 12, height: 8 },
        { id: 'settings', x: 0, y: 32, width: 12, height: 6 },
        { id: 'edit-item', x: 0, y: 38, width: 12, height: 5 }
      ];
    } else {
      // Desktop: Grid layout
      widgetState.widgets = [
        { id: 'system-status', x: 0, y: 0, width: 6, height: 3 },
        { id: 'admin-token', x: 6, y: 0, width: 6, height: 3 },
        { id: 'products', x: 0, y: 3, width: 6, height: 6 },
        { id: 'services', x: 6, y: 3, width: 6, height: 6 },
        { id: 'navigation', x: 0, y: 9, width: 8, height: 6 },
        { id: 'settings', x: 8, y: 9, width: 4, height: 4 },
        { id: 'edit-item', x: 8, y: 13, width: 4, height: 3 }
      ];
    }
  }

  function saveWidgetLayout() {
    localStorage.setItem('WIDGET_LAYOUT', JSON.stringify(widgetState.widgets));
  }

  function renderAllWidgets() {
    if (!widgetState.container) return;

    // Clear container
    widgetState.container.innerHTML = '';

    // Create grid background
    createGridBackground();

    // Render each widget
    widgetState.widgets.forEach(widget => {
      renderWidget(widget);
    });

    // Update widget positions
    updateWidgetPositions();

    // Adjust container size to fit all widgets
    setTimeout(() => {
      shrinkContainerToFitWidgets();
    }, 100);
  }

  function createGridBackground() {
    const gridBackground = document.createElement('div');
    gridBackground.className = 'widget-grid-background';
    gridBackground.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px);
      background-size: ${widgetState.cellSize}px ${widgetState.cellSize}px;
      pointer-events: none;
      z-index: 0;
    `;
    widgetState.container.appendChild(gridBackground);
  }

  function renderWidget(widgetConfig) {
    const definition = widgetDefinitions[widgetConfig.id];
    if (!definition) return;

    const widgetElement = document.createElement('div');
    widgetElement.className = 'widget absolute bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden';
    widgetElement.dataset.widgetId = widgetConfig.id;
    widgetElement.style.cssText = `
      left: ${widgetConfig.x * widgetState.cellSize}px;
      top: ${widgetConfig.y * widgetState.cellSize}px;
      width: ${widgetConfig.width * widgetState.cellSize}px;
      height: ${widgetConfig.height * widgetState.cellSize}px;
      z-index: 10;
    `;

    // Create widget header
    const header = document.createElement('div');
    header.className = 'widget-header flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 cursor-move';
    header.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="material-symbols-outlined text-primary">${definition.icon}</span>
        <h4 class="font-medium text-sm text-gray-900 dark:text-white">${definition.title}</h4>
      </div>
      <div class="flex items-center space-x-1">
        <button class="widget-minimize p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Minimize">
          <span class="material-symbols-outlined text-sm">remove</span>
        </button>
        <button class="widget-maximize p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Maximize">
          <span class="material-symbols-outlined text-sm">fullscreen</span>
        </button>
        <button class="widget-close p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500" title="Close">
          <span class="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    `;

    // Create widget content
    const content = document.createElement('div');
    content.className = 'widget-content-wrapper relative';
    content.innerHTML = definition.render(widgetConfig);

    // Add resize handles if resizable
    if (definition.resizable) {
      content.appendChild(createResizeHandles());
    }

    widgetElement.appendChild(header);
    widgetElement.appendChild(content);
    widgetState.container.appendChild(widgetElement);

    // Add event listeners
    addWidgetEventListeners(widgetElement);
  }

  function createResizeHandles() {
    const handles = document.createElement('div');
    handles.className = 'resize-handles';
    handles.innerHTML = `
      <div class="resize-handle resize-se" data-direction="se"></div>
      <div class="resize-handle resize-e" data-direction="e"></div>
      <div class="resize-handle resize-s" data-direction="s"></div>
    `;
    return handles;
  }

  function addWidgetEventListeners(widgetElement) {
    const header = widgetElement.querySelector('.widget-header');
    
    // Drag functionality - both mouse and touch
    header.addEventListener('mousedown', startDrag);
    header.addEventListener('touchstart', startDrag, { passive: false });

    // Resize functionality - both mouse and touch
    const resizeHandles = widgetElement.querySelectorAll('.resize-handle');
    resizeHandles.forEach(handle => {
      handle.addEventListener('mousedown', startResize);
      handle.addEventListener('touchstart', startResize, { passive: false });
    });

    // Minimize/Maximize/Close buttons
    const minimizeBtn = widgetElement.querySelector('.widget-minimize');
    const maximizeBtn = widgetElement.querySelector('.widget-maximize');
    const closeBtn = widgetElement.querySelector('.widget-close');

    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', () => minimizeWidget(widgetElement));
    }
    if (maximizeBtn) {
      maximizeBtn.addEventListener('click', () => maximizeWidget(widgetElement));
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeWidget(widgetElement));
    }
  }

  // ============================================
  // DRAG AND DROP FUNCTIONALITY
  // ============================================
  function initializeDragAndDrop() {
    // Mouse events
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', endDrag);
    
    // Touch events
    document.addEventListener('touchmove', handleDrag, { passive: false });
    document.addEventListener('touchend', endDrag);
    
    // Prevent default touch behavior on widget container
    widgetState.container.addEventListener('touchstart', (e) => {
      if (e.target.closest('.widget')) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  function startDrag(e) {
    const widgetElement = e.target.closest('.widget');
    if (!widgetElement) return;

    widgetState.draggedWidget = widgetElement;
    widgetState.isDragging = true;

    const rect = widgetElement.getBoundingClientRect();
    
    // Handle both mouse and touch events
    let clientX, clientY;
    if (e.type === 'touchstart') {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Store offset relative to widget's current position
    widgetState.dragOffset = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };

    widgetElement.style.zIndex = '1000';
    widgetElement.style.transform = 'scale(1.02)';
    widgetElement.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
    
    e.preventDefault();
  }

  function handleDrag(e) {
    if (!widgetState.isDragging || !widgetState.draggedWidget) return;

    // Handle both mouse and touch events
    let clientX, clientY;
    if (e.type === 'touchmove') {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault(); // Prevent scrolling on mobile
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Use absolute positioning relative to document, not container
    let x = clientX - widgetState.dragOffset.x;
    let y = clientY - widgetState.dragOffset.y;

    // Snap to grid
    x = Math.round(x / widgetState.cellSize) * widgetState.cellSize;
    y = Math.round(y / widgetState.cellSize) * widgetState.cellSize;

    // Constrain to positive values
    x = Math.max(0, x);
    y = Math.max(0, y);

    widgetState.draggedWidget.style.left = x + 'px';
    widgetState.draggedWidget.style.top = y + 'px';
    
    // Expand container if widget goes beyond current bounds
    expandContainerToFitWidget(widgetState.draggedWidget);
  }

  function endDrag(e) {
    if (!widgetState.isDragging || !widgetState.draggedWidget) return;

    const widgetElement = widgetState.draggedWidget;
    const widgetId = widgetElement.dataset.widgetId;
    
    // Update widget position in state based on actual position
    const widget = widgetState.widgets.find(w => w.id === widgetId);
    if (widget) {
      // Get the actual position from the element
      const currentLeft = parseInt(widgetElement.style.left) || 0;
      const currentTop = parseInt(widgetElement.style.top) || 0;
      
      widget.x = Math.round(currentLeft / widgetState.cellSize);
      widget.y = Math.round(currentTop / widgetState.cellSize);
      saveWidgetLayout();
    }

    // Reset styles
    widgetElement.style.zIndex = '10';
    widgetElement.style.transform = 'scale(1)';
    widgetElement.style.boxShadow = '';

    widgetState.draggedWidget = null;
    widgetState.isDragging = false;
    
    // Shrink container to fit widgets after drag ends
    setTimeout(() => {
      shrinkContainerToFitWidgets();
    }, 100);
  }

  // ============================================
  // RESIZE FUNCTIONALITY
  // ============================================
  function initializeResizeHandles() {
    // Mouse events
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', endResize);
    
    // Touch events
    document.addEventListener('touchmove', handleResize, { passive: false });
    document.addEventListener('touchend', endResize);
  }

  let resizingWidget = null;
  let resizeDirection = null;
  let resizeStart = null;

  function startResize(e) {
    const handle = e.target;
    const widgetElement = handle.closest('.widget');
    if (!widgetElement) return;

    resizingWidget = widgetElement;
    resizeDirection = handle.dataset.direction;
    
    const rect = widgetElement.getBoundingClientRect();
    
    // Handle both mouse and touch events
    let clientX, clientY;
    if (e.type === 'touchstart') {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    resizeStart = {
      x: clientX,
      y: clientY,
      width: rect.width,
      height: rect.height,
      left: rect.left,
      top: rect.top
    };

    // Add mobile-specific visual feedback
    if (isMobileDevice()) {
      widgetElement.classList.add('resizing-mobile');
      
      // Make resize handles more visible on mobile
      const handles = widgetElement.querySelectorAll('.resize-handle');
      handles.forEach(h => {
        h.style.opacity = '1';
        h.style.transform = 'scale(1.2)';
      });
      
      // Add resize indicator
      const indicator = document.createElement('div');
      indicator.className = 'mobile-resize-indicator';
      indicator.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(99, 102, 241, 0.9);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
        z-index: 1001;
        pointer-events: none;
      `;
      indicator.textContent = 'Resizing...';
      widgetElement.appendChild(indicator);
    }

    e.preventDefault();
    e.stopPropagation();
  }

  function handleResize(e) {
    if (!resizingWidget || !resizeDirection) return;

    // Handle both mouse and touch events
    let clientX, clientY;
    if (e.type === 'touchmove') {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault(); // Prevent scrolling on mobile
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const deltaX = clientX - resizeStart.x;
    const deltaY = clientY - resizeStart.y;

    let newWidth = resizeStart.width;
    let newHeight = resizeStart.height;

    if (resizeDirection.includes('e')) {
      newWidth = resizeStart.width + deltaX;
    }
    if (resizeDirection.includes('s')) {
      newHeight = resizeStart.height + deltaY;
    }

    // Snap to grid
    newWidth = Math.round(newWidth / widgetState.cellSize) * widgetState.cellSize;
    newHeight = Math.round(newHeight / widgetState.cellSize) * widgetState.cellSize;

    // Apply minimum sizes
    const widgetId = resizingWidget.dataset.widgetId;
    const definition = widgetDefinitions[widgetId];
    if (definition) {
      const minWidth = definition.minWidth * widgetState.cellSize;
      const minHeight = definition.minHeight * widgetState.cellSize;
      
      newWidth = Math.max(newWidth, minWidth);
      newHeight = Math.max(newHeight, minHeight);
    }

    resizingWidget.style.width = newWidth + 'px';
    resizingWidget.style.height = newHeight + 'px';

    // Expand container to fit resized widget
    expandContainerToFitWidget(resizingWidget);

    // Update mobile resize indicator
    if (isMobileDevice()) {
      const indicator = resizingWidget.querySelector('.mobile-resize-indicator');
      if (indicator) {
        const widthInCells = Math.round(newWidth / widgetState.cellSize);
        const heightInCells = Math.round(newHeight / widgetState.cellSize);
        indicator.textContent = `${widthInCells} × ${heightInCells}`;
      }
    }
  }

  function endResize(e) {
    if (!resizingWidget) return;

    const widgetId = resizingWidget.dataset.widgetId;
    const widget = widgetState.widgets.find(w => w.id === widgetId);
    if (widget) {
      widget.width = Math.round(parseInt(resizingWidget.style.width) / widgetState.cellSize);
      widget.height = Math.round(parseInt(resizingWidget.style.height) / widgetState.cellSize);
      saveWidgetLayout();
    }

    // Remove mobile-specific indicators
    if (isMobileDevice()) {
      resizingWidget.classList.remove('resizing-mobile');
      const resizeIndicator = resizingWidget.querySelector('.mobile-resize-indicator');
      if (resizeIndicator) {
        resizeIndicator.remove();
      }

      // Reset resize handles
      const handles = resizingWidget.querySelectorAll('.resize-handle');
      handles.forEach(h => {
        h.style.opacity = '';
        h.style.transform = '';
      });
    }

    resizingWidget = null;
    resizeDirection = null;
    resizeStart = null;

    // Shrink container to fit widgets after resize ends
    setTimeout(() => {
      shrinkContainerToFitWidgets();
    }, 100);

    // Add haptic feedback for mobile
    if (window.navigator && window.navigator.vibrate && isMobileDevice()) {
      window.navigator.vibrate(100);
    }
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  
  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768 && 'ontouchstart' in window);
  }
  function minimizeWidget(widgetElement) {
    const content = widgetElement.querySelector('.widget-content-wrapper');
    if (content) {
      content.style.display = content.style.display === 'none' ? 'block' : 'none';
    }
  }

  function maximizeWidget(widgetElement) {
    const isMaximized = widgetElement.classList.contains('maximized');
    
    if (isMaximized) {
      // Restore original size and position
      const widgetId = widgetElement.dataset.widgetId;
      const widget = widgetState.widgets.find(w => w.id === widgetId);
      if (widget) {
        widgetElement.style.left = widget.x * widgetState.cellSize + 'px';
        widgetElement.style.top = widget.y * widgetState.cellSize + 'px';
        widgetElement.style.width = widget.width * widgetState.cellSize + 'px';
        widgetElement.style.height = widget.height * widgetState.cellSize + 'px';
      }
      widgetElement.classList.remove('maximized');
    } else {
      // Maximize to full container
      const containerRect = widgetState.container.getBoundingClientRect();
      widgetElement.style.left = '0px';
      widgetElement.style.top = '0px';
      widgetElement.style.width = containerRect.width + 'px';
      widgetElement.style.height = containerRect.height + 'px';
      widgetElement.classList.add('maximized');
    }
  }

  function closeWidget(widgetElement) {
    const widgetId = widgetElement.dataset.widgetId;
    widgetElement.style.transform = 'scale(0.8)';
    widgetElement.style.opacity = '0';
    
    setTimeout(() => {
      widgetElement.remove();
      // Remove from state
      widgetState.widgets = widgetState.widgets.filter(w => w.id !== widgetId);
      saveWidgetLayout();
    }, 200);
  }

  function expandContainerToFitWidget(widgetElement) {
    if (!widgetElement || !widgetState.container) return;

    // Calculate widget's bottom and right edges
    const widgetBottom = parseInt(widgetElement.style.top) + parseInt(widgetElement.style.height);
    const widgetRight = parseInt(widgetElement.style.left) + parseInt(widgetElement.style.width);

    const currentHeight = widgetState.container.offsetHeight;
    const currentWidth = widgetState.container.offsetWidth;

    // Add padding (2 grid cells)
    const padding = widgetState.cellSize * 2;

    // Expand height if needed
    if (widgetBottom + padding > currentHeight) {
      widgetState.container.style.height = (widgetBottom + padding) + 'px';
    }

    // Expand width if needed (only on desktop)
    if (!isMobileDevice() && widgetRight + padding > currentWidth) {
      widgetState.container.style.width = (widgetRight + padding) + 'px';
    }
  }

  function shrinkContainerToFitWidgets() {
    if (!widgetState.container) return;

    let maxBottom = 0;
    let maxRight = 0;

    // Find the maximum bottom and right edges
    const widgets = widgetState.container.querySelectorAll('.widget');
    widgets.forEach(widget => {
      const bottom = parseInt(widget.style.top) + parseInt(widget.style.height);
      const right = parseInt(widget.style.left) + parseInt(widget.style.width);

      maxBottom = Math.max(maxBottom, bottom);
      maxRight = Math.max(maxRight, right);
    });

    const padding = widgetState.cellSize * 2;
    const minHeight = 600; // minimum height

    // Set container height
    const newHeight = Math.max(minHeight, maxBottom + padding);
    widgetState.container.style.height = newHeight + 'px';

    // On desktop, also adjust width if needed
    if (!isMobileDevice()) {
      const minWidth = widgetState.container.parentElement.offsetWidth;
      const newWidth = Math.max(minWidth, maxRight + padding);
      if (maxRight > 0) {
        widgetState.container.style.width = newWidth + 'px';
      }
    }
  }

  function updateWidgetPositions() {
    // This function can be used to update widget positions after container resize
    // Implementation depends on specific requirements
  }

  // ============================================
  // PUBLIC API
  // ============================================
  window.WidgetSystem = {
    initialize: initializeWidgetSystem,
    renderAll: renderAllWidgets,
    saveLayout: saveWidgetLayout,
    loadLayout: loadWidgetLayout,
    addWidget: function(widgetId, x, y, width, height) {
      const definition = widgetDefinitions[widgetId];
      if (!definition) return;

      const newWidget = {
        id: widgetId,
        x: x || 0,
        y: y || 0,
        width: width || definition.width,
        height: height || definition.height
      };

      widgetState.widgets.push(newWidget);
      saveWidgetLayout();
      renderWidget(newWidget);
    },
    removeWidget: function(widgetId) {
      const widgetElement = document.querySelector(`[data-widget-id="${widgetId}"]`);
      if (widgetElement) {
        closeWidget(widgetElement);
      }
    }
  };

})();