# Navigation Menu Management System Implementation

## Overview
Add a complete navigation menu management system to the QbYTen admin panel. Admins should be able to create, edit, delete, and organize navigation menus with support for submenus (hierarchical structure).

## Database Schema Already Created

The following table has been added to `schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS navigation_menus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  url TEXT,
  parent_id INTEGER DEFAULT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  target TEXT DEFAULT '_self',
  icon TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES navigation_menus(id) ON DELETE CASCADE
);
```

**Fields Explanation:**
- `id`: Unique identifier
- `title`: Menu item text (e.g., "Home", "Services", "Products")
- `url`: Link URL (e.g., "/", "/services", "#products")
- `parent_id`: NULL for main menu items, or ID of parent menu for submenus
- `sort_order`: Number to control display order (lower numbers appear first)
- `is_active`: 1 = visible, 0 = hidden
- `target`: Link target ("_self" or "_blank")
- `icon`: Optional icon name (Material Symbols)

## API Endpoint Already Created

File: `functions/api/menus.js` - Provides full CRUD operations:

- `GET /api/menus` - Get all menus in hierarchical structure
- `GET /api/menus?id=123` - Get single menu item
- `POST /api/menus` - Create new menu item (requires auth)
- `PUT /api/menus` - Update menu item (requires auth)
- `DELETE /api/menus?id=123` - Delete menu item (requires auth)

## Required: Add Menu Management UI to Admin Panel

### Step 1: Add "Navigation" Link to Sidebar

In `admin/index.html`, add a new navigation link in the sidebar (around line 50-60):

```html
<aside class="w-64 bg-white dark:bg-slate-900 flex-shrink-0 border-r border-gray-200 dark:border-slate-700">
  <!-- ... existing sidebar content ... -->
  <nav class="mt-6">
    <a href="#token" class="flex items-center px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors duration-200">
      <span class="material-symbols-outlined mr-3">vpn_key</span>
      Admin Token
    </a>
    <a href="#status" class="flex items-center px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors duration-200">
      <span class="material-symbols-outlined mr-3">monitor_heart</span>
      Sistem Durumu
    </a>
    <a href="#settings" class="flex items-center px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors duration-200">
      <span class="material-symbols-outlined mr-3">settings</span>
      Ayarlar
    </a>

    <!-- ADD THIS NEW LINK -->
    <a href="#navigation" class="flex items-center px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors duration-200">
      <span class="material-symbols-outlined mr-3">menu</span>
      Navigasyon Menü
    </a>

    <a href="#products" class="flex items-center px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors duration-200">
      <span class="material-symbols-outlined mr-3">inventory_2</span>
      Ürünler
    </a>
    <a href="#services" class="flex items-center px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors duration-200">
      <span class="material-symbols-outlined mr-3">design_services</span>
      Servisler
    </a>
  </nav>
</aside>
```

### Step 2: Add Navigation Management Section

Add this section after the Services section (around line 184):

```html
<!-- Navigation Menu Management -->
<section id="navigation" class="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
  <h3 class="flex items-center text-xl font-semibold mb-4 text-gray-900 dark:text-white">
    <span class="material-symbols-outlined mr-2 text-primary">menu</span>
    Navigasyon Menü Yönetimi
  </h3>

  <!-- Add Menu Button -->
  <div class="mb-6">
    <button id="btn-add-menu" class="flex items-center bg-primary text-white px-4 py-2 rounded font-medium hover:bg-primary-light transition-colors">
      <span class="material-symbols-outlined mr-2 text-sm">add</span>
      Yeni Menü Ekle
    </button>
  </div>

  <!-- Menus List -->
  <h4 class="font-medium text-lg mb-3 text-gray-800 dark:text-gray-100">Mevcut Menüler</h4>
  <div id="menus-list" class="space-y-2">
    <!-- Menus will be dynamically loaded here -->
    <p class="text-gray-500">Yükleniyor...</p>
  </div>
</section>
```

### Step 3: Add Menu Add/Edit Modal

Add this modal before the closing `</body>` tag:

```html
<!-- Add/Edit Menu Modal -->
<div id="menu-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  <div class="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
    <div class="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
      <h3 id="menu-modal-title" class="flex items-center text-xl font-semibold text-gray-900 dark:text-white">
        <span class="material-symbols-outlined mr-2 text-primary">add</span>
        Yeni Menü Ekle
      </h3>
      <button id="menu-modal-close" class="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>

    <form id="menu-form" class="p-6 space-y-4">
      <input type="hidden" id="menu-id">

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Menü Başlığı *</label>
        <input type="text" id="menu-title" class="w-full bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 rounded focus:ring-primary focus:border-primary" placeholder="Örn: Ana Sayfa" required>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
        <input type="text" id="menu-url" class="w-full bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 rounded focus:ring-primary focus:border-primary" placeholder="Örn: / veya #section">
        <p class="text-xs text-gray-500 mt-1">URL veya anchor (#section) girebilirsiniz. Boş bırakırsanız tıklanamaz başlık olur.</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Üst Menü</label>
        <select id="menu-parent" class="w-full bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 rounded focus:ring-primary focus:border-primary">
          <option value="">Ana Menü (Alt menü değil)</option>
          <!-- Will be populated dynamically -->
        </select>
        <p class="text-xs text-gray-500 mt-1">Bir üst menü seçerseniz bu menü onun alt menüsü olur.</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sıralama</label>
          <input type="number" id="menu-sort" class="w-full bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 rounded focus:ring-primary focus:border-primary" value="0" min="0">
          <p class="text-xs text-gray-500 mt-1">Küçük sayı önce görünür</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hedef</label>
          <select id="menu-target" class="w-full bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 rounded focus:ring-primary focus:border-primary">
            <option value="_self">Aynı Pencere</option>
            <option value="_blank">Yeni Sekme</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">İkon (Opsiyonel)</label>
        <input type="text" id="menu-icon" class="w-full bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 rounded focus:ring-primary focus:border-primary" placeholder="Örn: home">
        <p class="text-xs text-gray-500 mt-1">Material Symbols ikon adı</p>
      </div>

      <div class="flex items-center">
        <input type="checkbox" id="menu-active" class="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary" checked>
        <label for="menu-active" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Aktif (Görünür)</label>
      </div>
    </form>

    <div class="flex justify-end space-x-4 p-6 border-t border-gray-200 dark:border-slate-700">
      <button id="menu-cancel" class="bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded font-medium hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">İptal</button>
      <button id="menu-save" class="bg-primary text-white px-4 py-2 rounded font-medium hover:bg-primary-light transition-colors">Kaydet</button>
    </div>
  </div>
</div>
```

### Step 4: Add JavaScript Functions

Add these functions to `src/admin/main.js` (or the admin JavaScript file):

```javascript
// ============================================
// NAVIGATION MENU MANAGEMENT
// ============================================
let menusState = {
  menus: [],
  flatMenus: [],
  editingMenu: null
};

async function loadMenus() {
  try {
    const res = await fetch('/api/menus');
    const data = await res.json();
    menusState.menus = data.menus || [];
    menusState.flatMenus = data.flat || [];
    renderMenus();
    populateParentSelect();
  } catch (e) {
    console.error('Failed to load menus:', e);
    showToast('Menüler yüklenemedi', false);
  }
}

function renderMenus() {
  const container = document.querySelector('#menus-list');
  if (!container) return;

  if (menusState.menus.length === 0) {
    container.innerHTML = '<p class="text-gray-500">Henüz menü eklenmemiş.</p>';
    return;
  }

  container.innerHTML = '';
  menusState.menus.forEach(menu => {
    renderMenuItem(menu, container, 0);
  });
}

function renderMenuItem(menu, container, level) {
  const div = document.createElement('div');
  div.className = 'flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700';
  div.style.marginLeft = `${level * 20}px`;

  const isActive = menu.is_active === 1;
  const hasChildren = menu.children && menu.children.length > 0;

  div.innerHTML = `
    <div class="flex items-center flex-grow">
      ${menu.icon ? `<span class="material-symbols-outlined text-primary mr-2">${menu.icon}</span>` : ''}
      <div>
        <div class="font-semibold text-gray-900 dark:text-white">
          ${menu.title}
          ${!isActive ? '<span class="text-xs text-red-500 ml-2">(Gizli)</span>' : ''}
          ${hasChildren ? `<span class="text-xs text-blue-500 ml-2">(${menu.children.length} alt menü)</span>` : ''}
        </div>
        <div class="text-xs text-gray-500">
          ${menu.url || 'URL yok'}
          ${menu.parent_id ? '(Alt menü)' : '(Ana menü)'}
          | Sıra: ${menu.sort_order}
        </div>
      </div>
    </div>
    <div class="flex space-x-2">
      <button class="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-slate-700 text-primary transition-colors" onclick="editMenu(${menu.id})">
        <span class="material-symbols-outlined">edit</span>
      </button>
      <button class="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 transition-colors" onclick="deleteMenu(${menu.id})">
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

  // Keep the first option (no parent)
  select.innerHTML = '<option value="">Ana Menü (Alt menü değil)</option>';

  // Add all top-level menus as options
  menusState.flatMenus
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
    menusState.editingMenu = menu;
    title.innerHTML = '<span class="material-symbols-outlined mr-2 text-primary">edit</span>Menüyü Düzenle';

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
    menusState.editingMenu = null;
    title.innerHTML = '<span class="material-symbols-outlined mr-2 text-primary">add</span>Yeni Menü Ekle';

    document.querySelector('#menu-form').reset();
    document.querySelector('#menu-id').value = '';
    document.querySelector('#menu-active').checked = true;
  }

  modal.classList.remove('hidden');
}

function closeMenuModal() {
  document.querySelector('#menu-modal').classList.add('hidden');
  menusState.editingMenu = null;
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
    showToast('Menü başlığı gerekli', false);
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
      const res = await fetch('/api/menus', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify(menuData)
      });

      if (res.ok) {
        showToast('Menü güncellendi', true);
        closeMenuModal();
        await loadMenus();
      } else {
        showToast('Menü güncellenemedi', false);
      }
    } else {
      // Create
      const res = await fetch('/api/menus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify(menuData)
      });

      if (res.ok) {
        showToast('Menü eklendi', true);
        closeMenuModal();
        await loadMenus();
      } else {
        showToast('Menü eklenemedi', false);
      }
    }
  } catch (e) {
    console.error('Failed to save menu:', e);
    showToast('Bir hata oluştu', false);
  }
}

async function editMenu(id) {
  const menu = menusState.flatMenus.find(m => m.id === id);
  if (menu) {
    openMenuModal(menu);
  }
}

async function deleteMenu(id) {
  if (!confirm('Bu menüyü silmek istediğinize emin misiniz? Alt menüler de silinecek.')) {
    return;
  }

  try {
    const res = await fetch(`/api/menus?id=${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });

    if (res.ok) {
      showToast('Menü silindi', true);
      await loadMenus();
    } else {
      showToast('Menü silinemedi', false);
    }
  } catch (e) {
    console.error('Failed to delete menu:', e);
    showToast('Bir hata oluştu', false);
  }
}

// Make functions global so they can be called from onclick
window.editMenu = editMenu;
window.deleteMenu = deleteMenu;

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // ... existing code ...

  // Menu management
  loadMenus();

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
});
```

## Step 5: Update Main Website Navigation

To use the dynamic menus on the main website, update the navigation code to fetch from `/api/menus` and render accordingly.

## Step 6: Apply Schema to Database

Run this command to update the D1 database:

```bash
npx wrangler d1 execute qbyten --remote --file=schema.sql
```

## Step 7: Deploy

```bash
npm run build
cp -r admin dist/
cp -r functions dist/
npx wrangler pages deploy dist --project-name=qbyten --commit-dirty=true
```

## Features

✅ Add main menu items
✅ Add submenu items (select parent menu)
✅ Edit menu items
✅ Delete menu items (cascading delete for submenus)
✅ Reorder menus (sort_order field)
✅ Hide/show menus (is_active toggle)
✅ Set link target (_self or _blank)
✅ Add icons to menu items
✅ Hierarchical display (submenus indented)
✅ Visual indicators for hidden menus and submenu count

## Testing

1. Open admin panel
2. Click "Navigasyon Menü" in sidebar
3. Click "Yeni Menü Ekle"
4. Add a main menu: "Ana Sayfa", URL: "/"
5. Add another main menu: "Ürünler", URL: "#products"
6. Add a submenu: Select "Ürünler" as parent, title: "E-Fatura"
7. Edit, reorder, and delete menus
8. Check that changes appear on main website navigation

This implementation provides a complete, production-ready menu management system!
