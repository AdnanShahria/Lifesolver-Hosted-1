import { dynamicHandler } from './api/dynamicHandler';
import { handleHabitsRoute } from './api/habits/HabitsPage';
import { handleTasksRoute } from './api/tasks/TasksPage';
import { handleFinanceRoute } from './api/finance/FinancePage';
import { handleAuthRoute } from './api/auth/AuthPage';
import { handleAiRoute } from './api/ai/AiHandler';
import { handleUploadRoute } from './api/upload/UploadHandler';

// This acts as a router chain. 
// Every handler should return `Promise<Response | null>`.
// If it returns null, we try the next handler in the chain.
export async function handleApiRequest(context: PagesFunctionContext<Env>): Promise<Response> {
  
  const aiResponse = await handleAiRoute(context);
  if (aiResponse) return aiResponse;

  const uploadResponse = await handleUploadRoute(context);
  if (uploadResponse) return uploadResponse;

  const authResponse = await handleAuthRoute(context);
  if (authResponse) return authResponse;

  const habitsResponse = await handleHabitsRoute(context);
  if (habitsResponse) return habitsResponse;

  const tasksResponse = await handleTasksRoute(context);
  if (tasksResponse) return tasksResponse;

  const financeResponse = await handleFinanceRoute(context);
  if (financeResponse) return financeResponse;
  
  // Last resort: Dynamic CRUD handler
  const dynamicResponse = await dynamicHandler(context);
  if (dynamicResponse) return dynamicResponse;

  return new Response(JSON.stringify({ error: 'Not Found' }), { 
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}
