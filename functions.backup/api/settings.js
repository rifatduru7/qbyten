// Basic placeholder API for future D1-backed settings
// Bind D1 as `DB` in Cloudflare Pages project settings when ready.

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  try {
    if (!env.DB) {
      return new Response(
        JSON.stringify({ error: 'D1 binding `DB` not configured' }),
        { status: 501, headers: { 'content-type': 'application/json' } }
      );
    }

    if (method === 'GET') {
      const { results } = await env.DB.prepare(
        'SELECT key, value FROM settings ORDER BY key'
      ).all();
      return Response.json({ settings: results ?? [] });
    }

    if (method === 'PUT' || method === 'POST') {
      const body = await request.json().catch(() => ({}));
      if (!body || typeof body.key !== 'string') {
        return Response.json({ error: 'Invalid body' }, { status: 400 });
      }
      const value = typeof body.value === 'string' ? body.value : JSON.stringify(body.value ?? null);
      await env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
        .bind(body.key, value)
        .run();
      return Response.json({ ok: true });
    }

    return new Response('Method Not Allowed', { status: 405 });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err?.message || err) }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}

