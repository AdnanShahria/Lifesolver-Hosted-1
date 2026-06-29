import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Loader2, Sparkles, AlertCircle, Lightbulb, ChevronDown } from "lucide-react";
import { callGroqAPI, sanitizeJsonString } from "@/ai/core/groq-client";

// Props derived from the dashboard context needed for summary generation
interface AiSummaryCardProps {
  todayStr: string;
  todayDisplay: string;
  allTasks: any[];
  completedTasks: any[];
  pendingTasks: any[];
  highPriorityTasks: any[];
  allHabits: any[];
  habitsCompletedToday: number;
  balance: number;
  thisMonthTotal: number;
  budgetRemaining: number;
  totalSavings: number;
  expenseChartData: any[];
  studyProgress: number;
  subjectProgressList: any[];
  notes: any[];
}

export function AiSummaryCard({
  todayStr,
  todayDisplay,
  allTasks,
  completedTasks,
  pendingTasks,
  highPriorityTasks,
  allHabits,
  habitsCompletedToday,
  balance,
  thisMonthTotal,
  budgetRemaining,
  totalSavings,
  expenseChartData,
  studyProgress,
  subjectProgressList,
  notes
}: AiSummaryCardProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // AI State
  const [aiSummary, setAiSummary] = useState<{ summary: string; alerts: string[]; tips: string[] } | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Refresh rate limiting and timing state
  const [refreshStats, setRefreshStats] = useState<{
    date: string;
    clicksUsed: number;
    lastRefreshedTime: string | null;
  }>(() => {
    const cached = localStorage.getItem("lifeos-ai-summary-limit");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.date === todayStr) {
          return {
            date: todayStr,
            clicksUsed: typeof parsed.clicksUsed === "number" ? parsed.clicksUsed : 0,
            lastRefreshedTime: parsed.lastRefreshedTime || null
          };
        }
      } catch {}
    }
    return { date: todayStr, clicksUsed: 0, lastRefreshedTime: null };
  });

  useEffect(() => {
    // Note: Migrating to standard CSS max-width approach where possible, 
    // but preserving exact state toggles for the expander mechanism to prevent UI breakage
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem("lifeos-daily-summary");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.date === todayStr) setAiSummary(parsed.data);
      } catch { }
    }
  }, [todayStr]);

  useEffect(() => {
    const cached = localStorage.getItem("lifeos-ai-summary-limit");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.date === todayStr) {
          setRefreshStats({
            date: todayStr,
            clicksUsed: typeof parsed.clicksUsed === "number" ? parsed.clicksUsed : 0,
            lastRefreshedTime: parsed.lastRefreshedTime || null
          });
          return;
        }
      } catch {}
    }
    setRefreshStats({ date: todayStr, clicksUsed: 0, lastRefreshedTime: null });
  }, [todayStr]);

  const generateAISummary = async () => {
    const clicksLeft = Math.max(0, 5 - refreshStats.clicksUsed);
    if (clicksLeft <= 0) {
      setSummaryError("You have reached the limit of 5 AI updates today.");
      return;
    }

    setIsSummaryLoading(true);
    setSummaryError(null);
    try {
      const contextPrompt = `You are an intelligent daily briefing AI for a personal life management app called LifeSolver. Analyze ALL of the user's data below and generate a concise, actionable daily summary.

Today's Date: ${todayDisplay}
Time: ${new Date().toLocaleTimeString()}

=== TASKS (${allTasks.length} total, ${completedTasks.length} completed, ${pendingTasks.length} pending) ===
High Priority: ${highPriorityTasks.map(t => t.title).join(', ') || 'None'}
Pending Tasks: ${pendingTasks.slice(0, 8).map(t => `"${t.title}" [${t.priority}] due:${t.due_date || 'none'}`).join('; ') || 'None'}

=== HABITS (${allHabits.length} total, ${habitsCompletedToday}/${allHabits.length} done today) ===
${allHabits.map(h => `${h.habit_name}: streak=${h.streak_count}, done_today=${h.last_completed_date?.startsWith(todayStr) ? 'yes' : 'no'}`).join('\n') || 'No habits'}

=== FINANCE ===
Balance: ৳${balance}
This Month Spending: ৳${thisMonthTotal}
Budget Remaining: ৳${budgetRemaining}
Total Savings: ৳${totalSavings}
Top Expense Categories: ${expenseChartData.slice(0, 3).map(c => `${c.name}=৳${c.value}`).join(', ') || 'None'}

=== STUDY (${studyProgress}% overall) ===
${subjectProgressList.slice(0, 5).map(s => `${s.subject}: ${s.progress}%`).join(', ') || 'No study data'}

=== NOTES (${(notes || []).length} total) ===
${(notes || []).slice(0, 5).map(n => `"${n.title}"`).join(', ') || 'No notes'}

Respond in this EXACT JSON format:
{
  "summary": "A 2-3 sentence overview of the user's day so far and what they should focus on",
  "alerts": ["important warnings or overdue items - max 3 items"],
  "tips": ["actionable suggestions based on their data - max 3 items"]
}`;

      const response = await callGroqAPI([
        { role: "system", content: contextPrompt },
        { role: "user", content: "Generate my daily AI briefing summary." }
      ], { temperature: 0.5, maxTokens: 512 });

      const parsed = JSON.parse(sanitizeJsonString(response));
      const summaryData = {
        summary: parsed.summary || "No summary available.",
        alerts: parsed.alerts || [],
        tips: parsed.tips || [],
      };
      setAiSummary(summaryData);
      localStorage.setItem("lifeos-daily-summary", JSON.stringify({ date: todayStr, data: summaryData }));

      // Increment clicks and record timestamp
      const newClicksUsed = Math.min(refreshStats.clicksUsed + 1, 5);
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      const timeStr = `${hours}.${minutesStr} ${ampm}`;
      const newStats = {
        date: todayStr,
        clicksUsed: newClicksUsed,
        lastRefreshedTime: timeStr
      };
      setRefreshStats(newStats);
      localStorage.setItem("lifeos-ai-summary-limit", JSON.stringify(newStats));
    } catch (err) {
      console.error("AI Summary error:", err);
      setSummaryError("Failed to generate summary. Check your AI integration configuration.");
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const clicksLeft = Math.max(0, 5 - refreshStats.clicksUsed);
  const isDev = import.meta.env.DEV;
  const activeSummary = aiSummary || (isDev ? {
    summary: "Fantastic momentum today! You have successfully completed your key tasks and checked off your primary habits. Your monthly living expenses are 12% lower than last month, putting you on track to meet your savings target. Keep this energy going!",
    alerts: [
      "Task 'Release lifeos-v2.0 production build' is high priority and due today",
      "Habit 'Morning workout (30 min)' is still pending completion"
    ],
    tips: [
      "Your top expense is Food. Meal prepping today can save you around ৳4,000 this week.",
      "Complete 'Database Sharding' in System Design to wrap up your study goals for this week."
    ]
  } : null);

  return (
    <div className="rounded-2xl border-2 border-sky-200 dark:border-sky-500/20 bg-gradient-to-br from-sky-50/80 via-card/80 to-indigo-50/80 dark:from-sky-950/80 dark:via-card/80 dark:to-indigo-950/80 backdrop-blur-sm p-4 sm:p-5 relative overflow-hidden h-full">
      {/* Background accents */}
      <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-[80px] opacity-20 pointer-events-none"
        style={{ background: "linear-gradient(135deg, #38bdf8, #6366f1)" }} />
      <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full blur-[60px] opacity-10 pointer-events-none"
        style={{ background: "linear-gradient(135deg, #6366f1, #ec4899)" }} />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/10">
                <Brain className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Orbit AI Summary</h3>
                {refreshStats.lastRefreshedTime && (
                  <p className="text-[10px] text-sky-500 dark:text-sky-400 font-medium mt-0.5 leading-none">
                    (Updated: {refreshStats.lastRefreshedTime})
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={generateAISummary}
                  disabled={isSummaryLoading || clicksLeft <= 0}
                  className="text-xs font-semibold text-sky-500 dark:text-sky-400 hover:text-sky-400 dark:hover:text-sky-300 disabled:opacity-50 disabled:cursor-not-allowed border border-sky-500/30 dark:border-sky-400/30 rounded-full px-3 py-1 bg-sky-500/10 dark:bg-sky-500/15 hover:bg-sky-500/20 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 flex items-center gap-1.5"
                >
                  {isSummaryLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-sky-500 dark:text-sky-400" />
                      <span>Refreshing...</span>
                    </>
                  ) : (
                    <span>Refresh</span>
                  )}
                </button>
                <div className="flex flex-col items-end text-[9px] text-slate-500 dark:text-slate-300 font-medium leading-none">
                  <span>{clicksLeft} left today</span>
                </div>
              </div>
              {isMobile && (
                <button
                  onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                  className="w-7 h-7 flex items-center justify-center rounded-full border border-sky-500/20 dark:border-sky-500/35 hover:bg-sky-500/10 dark:hover:bg-sky-500/20 transition-all duration-200 self-center"
                  aria-label="Toggle Summary"
                >
                  <ChevronDown className={`w-3.5 h-3.5 text-sky-500 dark:text-sky-400 transition-transform duration-350 ${isExpanded ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {(!isMobile || isExpanded) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {summaryError && !isDev && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="p-3 rounded-xl bg-red-500/8 border border-red-500/15 text-red-400 text-sm mb-3"
                    >
                      {summaryError}
                    </motion.div>
                  )}

                  {activeSummary ? (
                    <motion.div key="summary" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      {/* Editorial Briefing Segment */}
                      <p className="text-sm text-foreground/90 leading-relaxed font-medium pl-3 border-l-2 border-sky-400 dark:border-sky-500">
                        {activeSummary.summary}
                      </p>

                      {/* Columns Grid Segment */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {/* Attention required */}
                        {activeSummary.alerts.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 pb-1 border-b border-amber-500/10">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Attention Required</span>
                            </div>
                            <ul className="space-y-1.5">
                              {activeSummary.alerts.map((a, i) => (
                                <li key={i} className="text-xs text-slate-700 dark:text-slate-200 font-medium flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                  <span className="leading-tight">{a}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Suggestions */}
                        {activeSummary.tips.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 pb-1 border-b border-sky-500/10">
                              <Lightbulb className="w-3.5 h-3.5 text-sky-500" />
                              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-500">Suggestions</span>
                            </div>
                            <ul className="space-y-1.5">
                              {activeSummary.tips.map((t, i) => (
                                <li key={i} className="text-xs text-slate-700 dark:text-slate-200 font-medium flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                                  <span className="leading-tight">{t}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : !isSummaryLoading && (!summaryError || isDev) && (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-8 text-center"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/10 to-indigo-500/10 flex items-center justify-center mb-3">
                        <Sparkles className="w-6 h-6 text-sky-400/40" />
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">Click "Generate" for your AI-powered daily briefing</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-1">Orbit analyzes tasks, habits, finances & study data</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
