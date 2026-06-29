import { errorResponse, jsonResponse } from '../utils';

const ALLOWED_TABLES = [
  "tasks", "expenses", "budgets", "finance", "habits",
  "inventory", "inventory_items", "inventory_categories", "notes", "settings",
  "gym_workout_plans", "gym_exercises", "gym_workout_logs",
  "gym_set_logs", "gym_body_metrics", "gym_personal_records",
  "study_sessions", "study_topics", "study_subjects", "study_chapters_v2", "study_parts", "study_goals", "study_common_presets",
  "savings_transactions"
];

export async function dynamicHandler(context: PagesFunctionContext<Env>): Promise<Response | null> {
  const url = new URL(context.request.url);
  const method = context.request.method;
  
  // Match /api/dynamic/:table/:id, /api/data/:table/:id, or /api/:table/:id
  const match = url.pathname.match(/^\/api\/(?:dynamic\/|data\/)?([a-zA-Z0-9_]+)(?:\/([a-zA-Z0-9_\-]+))?$/);
  if (!match) return null; // Not a match for dynamic CRUD

  const table = match[1];
  
  if (!ALLOWED_TABLES.includes(table)) {
    return errorResponse(`Invalid or unauthorized table: ${table}`, 400);
  }

  // NOTE: Extract userId from auth context
  const userId = "mock_user_id";

  try {
    if (method === 'GET') {
      let results;
      if (table === "settings") {
        const res = await context.env.DB.prepare(`SELECT * FROM ${table} WHERE user_id = ? LIMIT 1`).bind(userId).all();
        results = res.results;
      } else {
        try {
          const res = await context.env.DB.prepare(`SELECT * FROM ${table} WHERE user_id = ? ORDER BY created_at DESC`).bind(userId).all();
          results = res.results;
        } catch (e: any) {
          // Fallback if no created_at column
          const res = await context.env.DB.prepare(`SELECT * FROM ${table} WHERE user_id = ?`).bind(userId).all();
          results = res.results;
        }
      }
      return jsonResponse(results);
    }

    if (method === 'POST') {
      const body = await context.request.json() as any;
      const id = body.id || crypto.randomUUID();
      const keys = Object.keys(body).filter(k => k !== 'id' && k !== 'user_id');
      
      const columns = ['id', 'user_id', ...keys].join(', ');
      const placeholders = ['?', '?', ...keys.map(() => '?')].join(', ');
      const values = [id, userId, ...keys.map(k => body[k])];

      const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
      await context.env.DB.prepare(sql).bind(...values).run();

      return jsonResponse({ id, success: true });
    }

    if (method === 'PUT') {
      const body = await context.request.json() as any;
      const { id: bodyId, ...updates } = body;
      const id = match[2] || bodyId || url.searchParams.get('id');
      
      if (!id) return errorResponse("Missing ID for update", 400);

      const keys = Object.keys(updates).filter(k => k !== 'user_id');
      if (keys.length === 0) return jsonResponse({ success: true, message: "No updates provided" });

      const setClause = keys.map(k => `${k} = ?`).join(', ');
      const values = [...keys.map(k => updates[k]), id, userId];

      const sql = `UPDATE ${table} SET ${setClause} WHERE id = ? AND user_id = ?`;
      await context.env.DB.prepare(sql).bind(...values).run();

      return jsonResponse({ success: true });
    }

    if (method === 'DELETE') {
      const id = match[2] || url.searchParams.get('id');
      if (!id) return errorResponse("Missing ID for deletion", 400);

      await context.env.DB.prepare(`DELETE FROM ${table} WHERE id = ? AND user_id = ?`).bind(id, userId).run();
      return jsonResponse({ success: true });
    }

    return errorResponse('Method Not Allowed', 405);
  } catch (error: any) {
    return errorResponse(`Dynamic handler error on table ${table}: ${error.message}`, 500);
  }
}
