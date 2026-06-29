import { errorResponse, jsonResponse } from '../../utils';

export async function handleDataRoute(context: PagesFunctionContext<Env>): Promise<Response | null> {
  const url = new URL(context.request.url);
  const method = context.request.method;

  if (url.pathname === '/api/data/all' && method === 'GET') {
    // NOTE: Extract userId from auth context
    const userId = "mock_user_id";
    
    try {
      const tables = [
        "tasks", "finance", "budgets", "savings_transactions", "habits", "notes",
        "inventory", "study_subjects", "study_chapters_v2", "study_parts", "study_common_presets"
      ];
      
      const results: any = {};
      
      for (const table of tables) {
        let res;
        try {
          res = await context.env.DB.prepare(`SELECT * FROM ${table} WHERE user_id = ? ORDER BY created_at DESC`).bind(userId).all();
        } catch(e) {
          // Fallback if no created_at column
          res = await context.env.DB.prepare(`SELECT * FROM ${table} WHERE user_id = ?`).bind(userId).all();
        }
        results[table] = res.results;
      }
      
      return jsonResponse(results);
    } catch (error: any) {
      return errorResponse(`Data all handler error: ${error.message}`, 500);
    }
  }
  
  return null;
}
