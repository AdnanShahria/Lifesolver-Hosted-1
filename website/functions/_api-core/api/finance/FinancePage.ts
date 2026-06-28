import { errorResponse, jsonResponse } from '../../utils';

export async function handleFinanceRoute(context: PagesFunctionContext<Env>): Promise<Response | null> {
  const url = new URL(context.request.url);
  const method = context.request.method;

  if (!url.pathname.startsWith('/api/savings') && !url.pathname.startsWith('/api/finance') && !url.pathname.startsWith('/api/budgets') && !url.pathname.startsWith('/api/expenses')) {
    return null;
  }

  // NOTE: In a real implementation, extract userId from JWT token.
  const userId = "mock_user_id";

  try {
    if (url.pathname.includes('/savings/add') && method === 'POST') {
      const body = await context.request.json() as any;
      
      await context.env.DB.prepare(
        "UPDATE budgets SET current_amount = current_amount + ? WHERE id = ? AND user_id = ?"
      ).bind(body.amount, body.id, userId).run();
      
      const txId = crypto.randomUUID();
      const type = body.amount >= 0 ? "deposit" : "withdraw";
      const today = new Date().toISOString().split("T")[0];
      
      await context.env.DB.prepare(
        "INSERT INTO savings_transactions (id, savings_id, user_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(txId, body.id, userId, type, Math.abs(body.amount), body.description || null, today).run();
      
      return jsonResponse({ success: true, txId });
    }

    if (url.pathname.includes('/savings/tx') && method === 'PUT') {
      const body = await context.request.json() as any;
      const reverseOld = body.oldType === "deposit" ? -body.oldAmount : body.oldAmount;
      await context.env.DB.prepare(
        "UPDATE budgets SET current_amount = current_amount + ? WHERE id = ? AND user_id = ?"
      ).bind(reverseOld, body.savingsId, userId).run();
      
      const applyNew = body.newType === "deposit" ? body.newAmount : -body.newAmount;
      await context.env.DB.prepare(
        "UPDATE budgets SET current_amount = current_amount + ? WHERE id = ? AND user_id = ?"
      ).bind(applyNew, body.savingsId, userId).run();
      
      await context.env.DB.prepare(
        "UPDATE savings_transactions SET amount = ?, type = ?, date = ?, description = ? WHERE id = ? AND user_id = ?"
      ).bind(body.newAmount, body.newType, body.newDate, body.newDescription || null, body.id, userId).run();
      
      return jsonResponse({ success: true });
    }

    if (url.pathname.includes('/savings/tx') && method === 'DELETE') {
      const body = await context.request.json() as any;
      const reverseAmount = body.type === "deposit" ? -body.amount : body.amount;
      
      await context.env.DB.prepare(
        "UPDATE budgets SET current_amount = current_amount + ? WHERE id = ? AND user_id = ?"
      ).bind(reverseAmount, body.savingsId, userId).run();
      
      await context.env.DB.prepare(
        "DELETE FROM savings_transactions WHERE id = ? AND user_id = ?"
      ).bind(body.id, userId).run();
      
      return jsonResponse({ success: true });
    }

    return null; // Delegate other operations (e.g. GET /api/expenses) to dynamic handler or other routes
  } catch (error: any) {
    return errorResponse(`Finance handler error: ${error.message}`, 500);
  }
}
