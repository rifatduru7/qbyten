// Settings API endpoint for managing site settings

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'D1 binding `DB` not configured' }), {
      status: 501,
      headers: { 'content-type': 'application/json' }
    });
  }

  try {
    // GET - Get all settings or a specific setting by key
    if (method === 'GET') {
      const key = url.searchParams.get('key');
      
      if (key) {
        // Get a specific setting by key
        const result = await env.DB.prepare('SELECT key, value FROM settings WHERE key = ?')
          .bind(key)
          .first();
        
        if (!result) {
          return new Response(JSON.stringify({ error: 'Setting not found' }), {
            status: 404,
            headers: { 'content-type': 'application/json' }
          });
        }
        
        return new Response(JSON.stringify({
          key: result.key,
          value: result.value
        }), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      } else {
        // Get all settings
        const { results } = await env.DB.prepare(
          'SELECT key, value, updated_at FROM settings ORDER BY key'
        ).all();
        
        return new Response(JSON.stringify({ 
          settings: results ?? [] 
        }), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      }
    }

    // POST/PUT - Create or update a setting (requires authentication)
    if (method === 'POST' || method === 'PUT') {
      const body = await request.json().catch(() => ({}));
      const { key, value } = body || {};
      
      // Validate input
      if (!key || typeof key !== 'string') {
        return new Response(JSON.stringify({ error: 'key is required and must be a string' }), {
          status: 400,
          headers: { 'content-type': 'application/json' }
        });
      }
      
      // Convert value to string if it's not already
      const valueStr = typeof value === 'string' ? value : JSON.stringify(value ?? '');
      
      // Check if setting already exists
      const existingSetting = await env.DB.prepare('SELECT key FROM settings WHERE key = ?')
        .bind(key)
        .first();
      
      if (existingSetting) {
        // Update existing setting
        await env.DB.prepare(
          'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?'
        )
          .bind(valueStr, key)
          .run();
        
        return new Response(JSON.stringify({
          success: true,
          message: 'Setting updated successfully',
          data: { key, value: valueStr }
        }), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      } else {
        // Create new setting
        await env.DB.prepare(
          'INSERT INTO settings (key, value) VALUES (?, ?)'
        )
          .bind(key, valueStr)
          .run();
        
        return new Response(JSON.stringify({
          success: true,
          message: 'Setting created successfully',
          data: { key, value: valueStr }
        }), {
          status: 201,
          headers: { 'content-type': 'application/json' }
        });
      }
    }

    // DELETE - Delete a setting (requires authentication)
    if (method === 'DELETE') {
      const key = url.searchParams.get('key');
      
      if (!key) {
        return new Response(JSON.stringify({ error: 'key parameter is required' }), {
          status: 400,
          headers: { 'content-type': 'application/json' }
        });
      }
      
      // Check if setting exists
      const existingSetting = await env.DB.prepare('SELECT key FROM settings WHERE key = ?')
        .bind(key)
        .first();
      
      if (!existingSetting) {
        return new Response(JSON.stringify({ error: 'Setting not found' }), {
          status: 404,
          headers: { 'content-type': 'application/json' }
        });
      }
      
      // Delete the setting
      await env.DB.prepare('DELETE FROM settings WHERE key = ?')
        .bind(key)
        .run();
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Setting deleted successfully'
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Method not allowed
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}