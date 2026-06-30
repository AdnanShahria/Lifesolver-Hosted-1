import { handleApiRequest } from './_api-core';
import { createTursoD1Shim } from './turso-shim';

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.env.VITE_TURSO_DB_URL && context.env.VITE_TURSO_AUTH_TOKEN) {
    context.env.DB = createTursoD1Shim(
      context.env.VITE_TURSO_DB_URL,
      context.env.VITE_TURSO_AUTH_TOKEN
    ) as any;
  }

  const url = new URL(context.request.url);
  const path = url.pathname;

  // 1. Pass through static file extensions (fast path for assets)
  if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$/)) {
    return context.next();
  }

  // 2. Pass through Vite development and HMR paths
  if (path.startsWith('/@') || path.startsWith('/node_modules/') || path.startsWith('/src/')) {
    return context.next();
  }
  // 3. Handle CORS pre-flight requests and API routing
  if (path.startsWith('/api') && context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  if (path.startsWith('/api')) {
    const response = await handleApiRequest(context);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    try {
      for (const [key, val] of Object.entries(corsHeaders)) {
        response.headers.set(key, val);
      }
      return response;
    } catch (e) {
      const headers = new Headers(response.headers);
      for (const [key, val] of Object.entries(corsHeaders)) {
        headers.set(key, val);
      }
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }
  }

  // 4. Default: pass to Pages static asset server (which handles our HTML shells via _redirects)
  return context.next();
};
