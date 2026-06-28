import { errorResponse, jsonResponse } from '../../utils';

export async function handleTasksRoute(context: PagesFunctionContext<Env>): Promise<Response | null> {
  const url = new URL(context.request.url);
  const method = context.request.method;

  if (!url.pathname.startsWith('/api/tasks')) {
    return null;
  }

  // NOTE: In a real implementation, you would extract the userId from the JWT token.
  const userId = "mock_user_id";

  try {
    if (method === 'GET') {
      if (url.pathname.includes('/context')) {
        const type = url.searchParams.get('type');
        const contextId = url.searchParams.get('id');
        if (!type || !contextId) return errorResponse("Missing context params", 400);

        const { results } = await context.env.DB.prepare(
          "SELECT * FROM tasks WHERE user_id = ? AND context_type = ? AND context_id = ? ORDER BY created_at DESC"
        ).bind(userId, type, contextId).all();
        
        return jsonResponse(results);
      }
      
      // Default GET
      const { results } = await context.env.DB.prepare(
        "SELECT * FROM tasks WHERE user_id = ? AND (parent_task_id IS NULL OR parent_task_id = '') ORDER BY order_index ASC"
      ).bind(userId).all();
      return jsonResponse(results);
    }

    if (method === 'POST') {
      const body = await context.request.json() as any;
      // Assume a randomUUID replacement logic for CF workers using crypto.randomUUID()
      const id = crypto.randomUUID();
      const taskName = body.task_name;
      
      await context.env.DB.prepare(
        "INSERT INTO tasks (id, user_id, task_name) VALUES (?, ?, ?)"
      ).bind(id, userId, taskName).run();
      
      return jsonResponse({ id, success: true });
    }

    return errorResponse("Tasks route not found", 404);
  } catch (error: any) {
    return errorResponse(`Tasks handler error: ${error.message}`, 500);
  }
}
