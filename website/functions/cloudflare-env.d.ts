/// <reference types="@cloudflare/workers-types" />

type PagesFunctionContext<Env = any> = EventContext<Env, any, Record<string, unknown>>;

interface Env {
  // Example bindings
  DB: D1Database;
  JWT_SECRET: string;
  VITE_TURSO_DB_URL?: string;
  VITE_TURSO_AUTH_TOKEN?: string;
}
