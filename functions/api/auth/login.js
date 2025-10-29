// Authentication endpoint for admin login
// Returns a simple token (in production, this would return a JWT)

export async function onRequest(context) {
  const { request, env } = context;
  
  try {
    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'content-type': 'application/json' }
      });
    }
    
    // Parse the request body
    const body = await request.json().catch(() => ({}));
    const { username, password } = body;
    
    // Validate input
    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Username and password required' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }
    
    // For now, use simple credential validation
    // In production, you would check against a database with hashed passwords
    const adminUsername = env.ADMIN_USERNAME || 'admin';
    const adminPassword = env.ADMIN_PASSWORD || 'admin';
    
    if (username !== adminUsername || password !== adminPassword) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'content-type': 'application/json' }
      });
    }
    
    // Return the admin token (in production, this would be a JWT)
    const token = env.ADMIN_TOKEN || 'admin-token';
    
    return new Response(JSON.stringify({
      token: token,
      user: {
        id: 1,
        username: username
      }
    }), {
      status: 200,
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