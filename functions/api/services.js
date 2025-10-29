export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  if (!env.DB) return Response.json({ error: 'D1 binding `DB` not configured' }, { status: 501 });

  try {
    if (method === 'GET') {
      const id = url.searchParams.get('id');
      if (id) {
        const { results } = await env.DB.prepare('SELECT * FROM services WHERE id = ?').bind(id).all();
        return Response.json({ service: results?.[0] || null });
      }
      const { results } = await env.DB.prepare('SELECT * FROM services ORDER BY id DESC').all();
      return Response.json({ services: results ?? [] });
    }

    if (method === 'POST') {
      const body = await request.json();
      const { slug, title, description } = body || {};
      if (!slug || !title) return Response.json({ error: 'slug and title required' }, { status: 400 });
      await env.DB.prepare('INSERT INTO services (slug, title, description) VALUES (?, ?, ?)')
        .bind(slug, title, description || '')
        .run();
      return Response.json({ ok: true });
    }

    if (method === 'PUT') {
      const body = await request.json();
      const { id, title, description } = body || {};
      if (!id) return Response.json({ error: 'id required' }, { status: 400 });
      await env.DB.prepare('UPDATE services SET title = ?, description = ? WHERE id = ?')
        .bind(title || '', description || '', id)
        .run();
      return Response.json({ ok: true });
    }

    if (method === 'DELETE') {
      const id = url.searchParams.get('id');
      if (!id) return Response.json({ error: 'id required' }, { status: 400 });
      await env.DB.prepare('DELETE FROM services WHERE id = ?').bind(id).run();
      return Response.json({ ok: true });
    }

    return new Response('Method Not Allowed', { status: 405 });
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

