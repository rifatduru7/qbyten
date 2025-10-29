// Login endpoint for admin authentication with database

export async function onRequest(context) {
  const { request, env } = context;

  // Handle CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Username and password are required' }), {
        status: 400,
        headers: { 'content-type': 'application/json', ...corsHeaders }
      });
    }

    // Hash the provided password (same method as registration)
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Query database for user
    const user = await env.DB.prepare(
      'SELECT id, username, created_at FROM admin_users WHERE username = ? AND password_hash = ?'
    ).bind(username, passwordHash).first();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid username or password' }), {
        status: 401,
        headers: { 'content-type': 'application/json', ...corsHeaders }
      });
    }

    // Generate simple JWT-like token
    const payload = {
      id: user.id,
      username: user.username,
      iat: Date.now(),
      exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    };

    // Simple token encoding (in production use proper JWT library)
    const token = btoa(JSON.stringify(payload)) + '.' + Date.now();

    return new Response(JSON.stringify({
      token,
      user: {
        id: user.id,
        username: user.username
      }
    }), {
      status: 200,
      headers: { 'content-type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Login failed', details: error.message }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders }
    });
  }
}
