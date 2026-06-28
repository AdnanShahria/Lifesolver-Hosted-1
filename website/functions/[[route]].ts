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

  // 3. Forward all /api routes to the API core
  if (path.startsWith('/api')) {
    return handleApiRequest(context);
  }

  // 4. Default: pass to Pages static asset server (which handles our HTML shells via _redirects)
  return context.next();
};
