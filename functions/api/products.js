// Products API endpoint for CRUD operations on products table

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
    // GET - List all products or get a specific product
    if (method === 'GET') {
      const id = url.searchParams.get('id');
      
      if (id) {
        // Get a specific product by ID
        const { results } = await env.DB.prepare('SELECT * FROM products WHERE id = ?')
          .bind(id)
          .all();
        
        return new Response(JSON.stringify({ 
          product: results?.[0] || null 
        }), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      } else {
        // Get all products
        const { results } = await env.DB.prepare('SELECT * FROM products ORDER BY id DESC')
          .all();
        
        return new Response(JSON.stringify({ 
          products: results ?? [] 
        }), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      }
    }

    // POST - Create a new product (requires authentication)
    if (method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const { slug, title, description, color } = body || {};
      
      // Validate required fields
      if (!slug || !title) {
        return new Response(JSON.stringify({ error: 'slug and title required' }), {
          status: 400,
          headers: { 'content-type': 'application/json' }
        });
      }
      
      // Check if slug already exists
      const existingSlug = await env.DB.prepare('SELECT id FROM products WHERE slug = ?')
        .bind(slug)
        .first();
      
      if (existingSlug) {
        return new Response(JSON.stringify({ error: 'Product with this slug already exists' }), {
          status: 409,
          headers: { 'content-type': 'application/json' }
        });
      }
      
      // Insert the new product
      const result = await env.DB.prepare(
        'INSERT INTO products (slug, title, description, color) VALUES (?, ?, ?, ?)'
      )
        .bind(slug, title, description || '', color || '')
        .run();
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Product created successfully',
        data: {
          id: result.meta.last_row_id,
          slug,
          title,
          description: description || '',
          color: color || ''
        }
      }), {
        status: 201,
        headers: { 'content-type': 'application/json' }
      });
    }

    // PUT - Update a product (requires authentication)
    if (method === 'PUT') {
      const body = await request.json().catch(() => ({}));
      const { id, title, description, color } = body || {};
      
      // Validate required fields
      if (!id) {
        return new Response(JSON.stringify({ error: 'id required' }), {
          status: 400,
          headers: { 'content-type': 'application/json' }
        });
      }
      
      // Check if product exists
      const existingProduct = await env.DB.prepare('SELECT id FROM products WHERE id = ?')
        .bind(id)
        .first();
      
      if (!existingProduct) {
        return new Response(JSON.stringify({ error: 'Product not found' }), {
          status: 404,
          headers: { 'content-type': 'application/json' }
        });
      }
      
      // Update the product
      await env.DB.prepare(
        'UPDATE products SET title = ?, description = ?, color = ? WHERE id = ?'
      )
        .bind(title || '', description || '', color || '', id)
        .run();
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Product updated successfully',
        data: { id, title, description, color }
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }

    // DELETE - Delete a product (requires authentication)
    if (method === 'DELETE') {
      const id = url.searchParams.get('id');
      
      if (!id) {
        return new Response(JSON.stringify({ error: 'id required' }), {
          status: 400,
          headers: { 'content-type': 'application/json' }
        });
      }
      
      // Check if product exists
      const existingProduct = await env.DB.prepare('SELECT id FROM products WHERE id = ?')
        .bind(id)
        .first();
      
      if (!existingProduct) {
        return new Response(JSON.stringify({ error: 'Product not found' }), {
          status: 404,
          headers: { 'content-type': 'application/json' }
        });
      }
      
      // Delete the product
      await env.DB.prepare('DELETE FROM products WHERE id = ?')
        .bind(id)
        .run();
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Product deleted successfully'
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