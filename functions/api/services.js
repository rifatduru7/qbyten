// Services API endpoint for CRUD operations on services table

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
    // GET - List all services or get a specific service
    if (method === 'GET') {
      const id = url.searchParams.get('id');
      
      if (id) {
        // Get a specific service by ID
        const { results } = await env.DB.prepare('SELECT * FROM services WHERE id = ?')
          .bind(id)
          .all();
        
        return new Response(JSON.stringify({ 
          service: results?.[0] || null 
        }), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      } else {
        // Get all services
        const { results } = await env.DB.prepare('SELECT * FROM services ORDER BY id DESC')
          .all();
        
        return new Response(JSON.stringify({ 
          services: results ?? [] 
        }), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      }
    }

    // POST - Create a new service (requires authentication)
    if (method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const { slug, title, description } = body || {};
      
      // Validate required fields
      if (!slug || !title) {
        return new Response(JSON.stringify({ error: 'slug and title required' }), {
          status: 400,
          headers: { 'content-type': 'application/json' }
        });
      }
      
      // Check if slug already exists
      const existingSlug = await env.DB.prepare('SELECT id FROM services WHERE slug = ?')
        .bind(slug)
        .first();
      
      if (existingSlug) {
        return new Response(JSON.stringify({ error: 'Service with this slug already exists' }), {
          status: 409,
          headers: { 'content-type': 'application/json' }
        });
      }
      
      // Insert the new service
      const result = await env.DB.prepare(
        'INSERT INTO services (slug, title, description) VALUES (?, ?, ?)'
      )
        .bind(slug, title, description || '')
        .run();
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Service created successfully',
        data: {
          id: result.meta.last_row_id,
          slug,
          title,
          description: description || ''
        }
      }), {
        status: 201,
        headers: { 'content-type': 'application/json' }
      });
    }

    // PUT - Update a service (requires authentication)
    if (method === 'PUT') {
      const body = await request.json().catch(() => ({}));
      const { id, title, description } = body || {};
      
      // Validate required fields
      if (!id) {
        return new Response(JSON.stringify({ error: 'id required' }), {
          status: 400,
          headers: { 'content-type': 'application/json' }
        });
      }
      
      // Check if service exists
      const existingService = await env.DB.prepare('SELECT id FROM services WHERE id = ?')
        .bind(id)
        .first();
      
      if (!existingService) {
        return new Response(JSON.stringify({ error: 'Service not found' }), {
          status: 404,
          headers: { 'content-type': 'application/json' }
        });
      }
      
      // Update the service
      await env.DB.prepare(
        'UPDATE services SET title = ?, description = ? WHERE id = ?'
      )
        .bind(title || '', description || '', id)
        .run();
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Service updated successfully',
        data: { id, title, description }
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }

    // DELETE - Delete a service (requires authentication)
    if (method === 'DELETE') {
      const id = url.searchParams.get('id');
      
      if (!id) {
        return new Response(JSON.stringify({ error: 'id required' }), {
          status: 400,
          headers: { 'content-type': 'application/json' }
        });
      }
      
      // Check if service exists
      const existingService = await env.DB.prepare('SELECT id FROM services WHERE id = ?')
        .bind(id)
        .first();
      
      if (!existingService) {
        return new Response(JSON.stringify({ error: 'Service not found' }), {
          status: 404,
          headers: { 'content-type': 'application/json' }
        });
      }
      
      // Delete the service
      await env.DB.prepare('DELETE FROM services WHERE id = ?')
        .bind(id)
        .run();
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Service deleted successfully'
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