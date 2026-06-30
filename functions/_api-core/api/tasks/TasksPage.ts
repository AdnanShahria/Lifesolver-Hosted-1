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

    if (method === 'POST') {
      if (url.pathname.includes('/complete')) {
          const body = await context.request.json() as any;
          const id = body.id;
          if (!id) return errorResponse("Missing ID", 400);
          
          await context.env.DB.prepare(
              "UPDATE tasks SET status = 'done', completed_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?"
          ).bind(id, userId).run();
          
          return jsonResponse({ success: true });
      }

      if (url.pathname.includes('/batch-create')) {
          const body = await context.request.json() as any;
          const parentTask = body.task;
          const subTasks = body.subTasks || [];

          if (!parentTask || !parentTask.id) return errorResponse("Missing main task", 400);

          const stmts = [];

          // Helper to generate insert statement
          const buildInsert = (item: any) => {
              const keys = Object.keys(item);
              const columns = keys.join(', ');
              const placeholders = keys.map(() => '?').join(', ');
              const values = keys.map(k => item[k]);
              return context.env.DB.prepare(`INSERT INTO tasks (${columns}) VALUES (${placeholders})`).bind(...values);
          };

          // 1. Insert parent task
          parentTask.user_id = userId;
          stmts.push(buildInsert(parentTask));

          // 2. Insert subtasks
          for (let i = 0; i < subTasks.length; i++) {
              const st = subTasks[i];
              st.user_id = userId;
              st.parent_task_id = parentTask.id;
              st.order_index = i;
              stmts.push(buildInsert(st));
          }

          // Execute batch
          await context.env.DB.batch(stmts);

          return jsonResponse({ success: true, parent_id: parentTask.id, subtasks_created: subTasks.length });
      }
    }

    // Fallback to dynamicHandler for simple CRUD
    return null;
  } catch (error: any) {
    return errorResponse(`Tasks handler error: ${error.message}`, 500);
  }
}
