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
      
      if (url.pathname.includes('/subtasks')) {
        const parentId = url.searchParams.get('parentId');
        if (!parentId) return errorResponse("Missing parentId", 400);

        const { results } = await context.env.DB.prepare(
            "SELECT * FROM tasks WHERE user_id = ? AND parent_task_id = ? ORDER BY order_index ASC"
        ).bind(userId, parentId).all();
        
        return jsonResponse(results);
      }
    }

    if (method === 'POST' && url.pathname.includes('/complete')) {
        const body = await context.request.json() as any;
        const id = body.id;
        if (!id) return errorResponse("Missing ID", 400);
        
        await context.env.DB.prepare(
            "UPDATE tasks SET status = 'done', completed_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?"
        ).bind(id, userId).run();
        
        return jsonResponse({ success: true });
    }

    // Fallback to dynamicHandler for simple CRUD
    return null;
  } catch (error: any) {
    return errorResponse(`Tasks handler error: ${error.message}`, 500);
  }
}
