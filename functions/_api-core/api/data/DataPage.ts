import { errorResponse, jsonResponse } from '../../utils';

export async function handleDataRoute(context: PagesFunctionContext<Env>): Promise<Response | null> {
  const url = new URL(context.request.url);
  const method = context.request.method;

  if (url.pathname === '/api/data/all' && method === 'GET') {
    // NOTE: Extract userId from auth context
    const userId = "mock_user_id";
    
    try {
      const tablesWithCreatedAt = [
        "tasks", "budgets", "savings_transactions", "notes",
        "study_subjects", "study_chapters_v2", "study_parts", "study_common_presets"
      ];
      const tables = [
        "tasks", "finance", "budgets", "savings_transactions", "habits", "notes",
        "inventory", "study_subjects", "study_chapters_v2", "study_parts", "study_common_presets"
      ];
      
      const statements = tables.map(table => {
        const query = tablesWithCreatedAt.includes(table)
          ? `SELECT * FROM ${table} WHERE user_id = ? ORDER BY created_at DESC`
          : `SELECT * FROM ${table} WHERE user_id = ?`;
        return context.env.DB.prepare(query).bind(userId);
      });

      const batchResults = await context.env.DB.batch(statements);
      
      const results: any = {};
      tables.forEach((table, idx) => {
        results[table] = batchResults[idx].results;
      });
      
      return jsonResponse(results);
    } catch (error: any) {
      return errorResponse(`Data all handler error: ${error.message}`, 500);
    }
  }
  
  return null;
}
