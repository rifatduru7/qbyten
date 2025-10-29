// Navigation Menu Management API
// Handles CRUD operations for navigation menus (main menu and submenus)

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // GET - List all menus with hierarchical structure
    if (method === 'GET') {
      const id = url.searchParams.get('id');

      if (id) {
        // Get single menu item
        const menu = await env.DB.prepare(
          'SELECT * FROM navigation_menus WHERE id = ?'
        ).bind(id).first();

        if (!menu) {
          return new Response(JSON.stringify({ error: 'Menu not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        return new Response(JSON.stringify({ menu }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Get all menus
      const result = await env.DB.prepare(
        'SELECT * FROM navigation_menus ORDER BY sort_order ASC, id ASC'
      ).all();

      const menus = result.results || [];

      // Build hierarchical structure
      const menuTree = buildMenuTree(menus);

      return new Response(JSON.stringify({ menus: menuTree, flat: menus }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Check authorization for write operations
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // POST - Create new menu item
    if (method === 'POST') {
      const body = await request.json();
      const { title, url, parent_id, sort_order, is_active, target, icon } = body;

      if (!title) {
        return new Response(JSON.stringify({ error: 'Title is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const result = await env.DB.prepare(
        `INSERT INTO navigation_menus (title, url, parent_id, sort_order, is_active, target, icon, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
      ).bind(
        title,
        url || null,
        parent_id || null,
        sort_order || 0,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        target || '_self',
        icon || null
      ).run();

      return new Response(JSON.stringify({
        success: true,
        message: 'Menu created successfully',
        id: result.meta.last_row_id
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // PUT - Update menu item
    if (method === 'PUT') {
      const body = await request.json();
      const { id, title, url, parent_id, sort_order, is_active, target, icon } = body;

      if (!id) {
        return new Response(JSON.stringify({ error: 'ID is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      await env.DB.prepare(
        `UPDATE navigation_menus
         SET title = ?, url = ?, parent_id = ?, sort_order = ?, is_active = ?, target = ?, icon = ?, updated_at = datetime('now')
         WHERE id = ?`
      ).bind(
        title,
        url || null,
        parent_id || null,
        sort_order || 0,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        target || '_self',
        icon || null,
        id
      ).run();

      return new Response(JSON.stringify({
        success: true,
        message: 'Menu updated successfully'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // DELETE - Delete menu item
    if (method === 'DELETE') {
      const id = url.searchParams.get('id');

      if (!id) {
        return new Response(JSON.stringify({ error: 'ID is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Delete menu item (cascade will handle children)
      await env.DB.prepare('DELETE FROM navigation_menus WHERE id = ?')
        .bind(id)
        .run();

      return new Response(JSON.stringify({
        success: true,
        message: 'Menu deleted successfully'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Menu API error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Helper function to build hierarchical menu tree
function buildMenuTree(menus) {
  const menuMap = {};
  const tree = [];

  // Create a map of all menus
  menus.forEach(menu => {
    menuMap[menu.id] = { ...menu, children: [] };
  });

  // Build the tree
  menus.forEach(menu => {
    if (menu.parent_id === null) {
      // Top level menu
      tree.push(menuMap[menu.id]);
    } else {
      // Child menu
      const parent = menuMap[menu.parent_id];
      if (parent) {
        parent.children.push(menuMap[menu.id]);
      }
    }
  });

  return tree;
}
