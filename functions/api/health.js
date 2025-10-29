// Health check endpoint to verify API and D1 database connectivity

export async function onRequest(context) {
  const { env } = context;

  try {
    // Check if D1 database is available
    let dbStatus = 'not_available';
    let dbError = null;
    let dbName = 'qbyten';
    let dbSize = null;
    let recordCounts = {};

    if (env.DB) {
      try {
        // Simple query to test database connectivity
        await env.DB.prepare('SELECT 1').first();
        dbStatus = 'available';

        // Get table counts
        try {
          const productsCount = await env.DB.prepare('SELECT COUNT(*) as count FROM products').first();
          const servicesCount = await env.DB.prepare('SELECT COUNT(*) as count FROM services').first();
          const settingsCount = await env.DB.prepare('SELECT COUNT(*) as count FROM settings').first();

          recordCounts = {
            products: productsCount?.count || 0,
            services: servicesCount?.count || 0,
            settings: settingsCount?.count || 0
          };
        } catch (e) {
          // Ignore count errors
        }
      } catch (error) {
        dbStatus = 'error';
        dbError = error.message;
      }
    }

    const healthData = {
      ok: true,
      ts: Date.now(),
      database: {
        status: dbStatus,
        error: dbError,
        name: dbName,
        size: dbSize,
        records: recordCounts
      },
      api: 'running'
    };

    return new Response(JSON.stringify(healthData), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      ok: false,
      ts: Date.now(),
      error: 'Health check failed',
      details: error.message
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}