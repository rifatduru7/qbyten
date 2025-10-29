// Simple write-protection for API: require admin token for mutating requests
// Usage: set an Environment Variable in Pages named ADMIN_TOKEN

export const onRequest = [
  async (context, next) => {
    const { request, env } = context;
    const method = request.method.toUpperCase();
    const url = new URL(request.url);

    const isApi = url.pathname.startsWith('/api/');
    const isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    if (isApi && isWrite) {
      const header = request.headers.get('x-admin-token') || request.headers.get('authorization');
      const incoming = header?.replace(/^Bearer\s+/i, '') || '';
      const expected = env.ADMIN_TOKEN || '';
      if (!expected || incoming !== expected) {
        return new Response('Unauthorized', {
          status: 401,
          headers: { 'content-type': 'text/plain; charset=utf-8' }
        });
      }
    }

    return next();
  }
];
