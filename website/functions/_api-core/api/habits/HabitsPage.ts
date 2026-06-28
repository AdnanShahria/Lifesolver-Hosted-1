import { errorResponse, jsonResponse } from '../../utils';

export async function handleHabitsRoute(context: PagesFunctionContext<Env>): Promise<Response | null> {
  const url = new URL(context.request.url);
  const method = context.request.method;

  // Assuming /api/habits/*
  if (!url.pathname.startsWith('/api/habits')) {
    return null;
  }

  // NOTE: In a real implementation, you would extract the userId from the JWT token.
  // We'll mock it for now since auth isn't fully implemented in this skeleton.
  const userId = "mock_user_id";

  try {
    if (url.pathname.includes('/complete') && method === 'POST') {
      const body = await context.request.json() as any;
      // Implementation of habit completion streak logic
      // Note: we use context.env.DB here
      const habit: any = body.habit;
      const date: string = body.date;
      
      const todayStr = new Date().toISOString().split("T")[0];
      const targetDateStr = date ? date.split("T")[0] : todayStr;
      
      let newStreak = habit.streak_count + 1; // Simplified for the scaffold
      let newLastCompleted = targetDateStr;

      await context.env.DB.prepare(
        "UPDATE habits SET streak_count = ?, last_completed_date = ? WHERE id = ? AND user_id = ?"
      ).bind(newStreak, newLastCompleted, habit.id, userId).run();

      return jsonResponse({ success: true, newStreak, newLastCompleted });
    }

    if (url.pathname.endsWith('/all') && method === 'GET') {
      const { results } = await context.env.DB.prepare(
        "SELECT * FROM habits WHERE user_id = ? ORDER BY habit_name ASC"
      ).bind(userId).all();
      return jsonResponse(results);
    }

    if (url.pathname.endsWith('/all') && method === 'DELETE') {
      await context.env.DB.prepare(
        "DELETE FROM habits WHERE user_id = ?"
      ).bind(userId).run();
      return jsonResponse({ success: true });
    }

    // Dynamic fallback for simple CRUD can be handled by dynamicHandler
    // but if we handle everything here:
    return errorResponse("Habits route not found", 404);
  } catch (error: any) {
    return errorResponse(`Habits handler error: ${error.message}`, 500);
  }
}
