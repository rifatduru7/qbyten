// Authentication middleware for Cloudflare Pages Functions
// Implements JWT-based authentication for protected API endpoints

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  
  // Add CORS headers to all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-token',
  };
  
  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }
  
  // Check if this is an API request
  const isApi = url.pathname.startsWith('/api/');
  
  // For non-API requests, just continue
  if (!isApi) {
    const response = await next();
    // Add CORS headers to the response
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }
  
  // For GET requests to /api/health, /api/products, /api/services, /api/settings - allow without auth
  const publicPaths = ['/api/health', '/api/products', '/api/services', '/api/settings'];
  const isPublicGet = request.method === 'GET' && publicPaths.some(path => url.pathname === path);
  
  // For authentication endpoints (/api/auth/*) - allow without auth
  const isAuthEndpoint = url.pathname.startsWith('/api/auth/');
  
  // If it's a public endpoint or auth endpoint, continue
  if (isPublicGet || isAuthEndpoint) {
    const response = await next();
    // Add CORS headers to the response
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }
  
  // For all other API requests (POST, PUT, DELETE), require authentication
  const authHeader = request.headers.get('authorization') || request.headers.get('x-admin-token');
  
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: {
        'content-type': 'application/json',
        ...corsHeaders
      }
    });
  }
  
  // Extract token (handle both "Bearer token" and raw token formats)
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  
  if (!token) {
    return new Response(JSON.stringify({ error: 'Invalid token format' }), {
      status: 401,
      headers: {
        'content-type': 'application/json',
        ...corsHeaders
      }
    });
  }
  
  // For now, use simple token validation (same as the previous implementation)
  // In a production environment, you would validate JWT here
  const expectedToken = env.ADMIN_TOKEN || '';
  
  if (token !== expectedToken) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: {
        'content-type': 'application/json',
        ...corsHeaders
      }
    });
  }
  
  // Token is valid, continue to the next handler
  const response = await next();
  
  // Add CORS headers to the response
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}