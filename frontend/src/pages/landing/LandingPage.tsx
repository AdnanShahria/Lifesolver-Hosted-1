import { useEffect, useMemo, useState } from "react";
import { SEO } from "@/components/seo/SEO";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, ListTodo, Target, TrendingUp, CalendarDays, PiggyBank,
  BookOpen, Flame, BarChart3, Activity, ArrowUpRight, ArrowDownRight,
  GraduationCap, ChevronDown
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "@/hooks/useTheme";
import { useFinance } from "@/hooks/useFinance";
import { useBudget } from "@/hooks/useBudget";
import { useTasks } from "@/hooks/useTasks";
import { useHabits } from "@/hooks/useHabits";
import { useStudy } from "@/hooks/useStudy";
import { useNotes } from "@/hooks/useNotes";
import { useAuth } from "@/contexts/AuthContext";
import { Helmet } from "react-helmet-async";

import { AiSummaryCard } from "@/components/dashboard/AiSummaryCard";
import { MonthlySpendingCard } from "@/components/dashboard/MonthlySpendingCard";
import { ActivityOverviewCard } from "@/components/dashboard/ActivityOverviewCard";
import { TasksAndHabitsCard } from "@/components/dashboard/TasksAndHabitsCard";
import { StudyProgressCard } from "@/components/dashboard/StudyProgressCard";

// Color palette
const CATEGORY_COLORS: Record<string, string> = {
  "Food": "#06d6a0", "Transport": "#118ab2", "Entertainment": "#ffd166",
  "Bills": "#8338ec", "Shopping": "#ef476f", "Health": "#26de81",
  "Education": "#4ecdc4", "Other": "#95a5a6",
};

// Animated radial ring
function RadialProgress({ progress, size = 52, strokeWidth = 5, color = "#00D4AA", children }: {
  progress: number; size?: number; strokeWidth?: number; color?: string; children?: React.ReactNode;
}) {
  const r = (size - strokeWidth) / 2;
  const c = r * 2 * Math.PI;
  const o = c - (Math.min(100, Math.max(0, progress)) / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor"
          strokeWidth={strokeWidth} className="text-muted-foreground/10" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={o}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      )}
    </div>
  );
}

// Stagger children animation wrapper
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const CollapsibleContent = ({ isExpanded, isMobile, children }: { isExpanded: boolean, isMobile: boolean, children: React.ReactNode }) => (
  <AnimatePresence>
    {(!isMobile || isExpanded) && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

const ExpandButton = ({ isExpanded, onClick, isMobile }: { isExpanded: boolean, onClick: () => void, isMobile: boolean }) => isMobile ? (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ml-2"
  >
    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
  </button>
) : null;


const Index = () => {
  const { theme } = useTheme();
  const { user } = useAuth();

  // Mobile check and expand state
  const [isMobile, setIsMobile] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "activity": true,
    "spending": true,
    "tasks": true,
    "habits": true,
    "study": true,
    "transactions": true,
    "ai_summary": true
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Life Hub AI Dashboard",
    "description": "Comprehensive personal dashboard for tracking tasks, habits, finances, and study progress with AI-driven insights.",
    "applicationCategory": "Productivity",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const { balance: rawBalance, totalIncome: rawTotalIncome, totalExpenses: rawTotalExpenses, expensesByCategory: rawExpensesByCategory, regularEntries: rawRegularEntries } = useFinance();
  const { totalSavings: rawTotalSavings, budgetRemaining: rawBudgetRemaining, primaryBudget: rawPrimaryBudget, savingsGoals: rawSavingsGoals } = useBudget();
  const { tasks: rawTasks } = useTasks();
  const { habits: rawHabits } = useHabits();
  const { chapters: rawChapters, subjects: rawSubjects, subjectProgress: rawSubjectProgress, chapterProgress: rawChapterProgress } = useStudy();
  const { notes: rawNotes } = useNotes();

  const isDev = import.meta.env.DEV;
  const todayStr = new Date().toISOString().split("T")[0];
  const lastMonthStr = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  }, []);

  const tasks = useMemo(() => {
    if (isDev && (!rawTasks || rawTasks.length === 0)) {
      return [
        { id: "t1", title: "Release lifeos-v2.0 production build", status: "pending", priority: "urgent", due_date: todayStr },
        { id: "t2", title: "Review UI feedback and mockups", status: "pending", priority: "high", due_date: todayStr },
        { id: "t3", title: "Complete system architecture diagram", status: "done", priority: "medium", due_date: todayStr },
        { id: "t4", title: "Update habits tracking system", status: "done", priority: "low", due_date: todayStr },
        { id: "t5", title: "Schedule SaaS landing page audit", status: "pending", priority: "medium", due_date: todayStr }
      ];
    }
    return rawTasks || [];
  }, [rawTasks, isDev, todayStr]);

  const habits = useMemo(() => {
    if (isDev && (!rawHabits || rawHabits.length === 0)) {
      return [
        { id: "h1", habit_name: "Code 2 hours daily", streak_count: 14, last_completed_date: todayStr },
        { id: "h2", habit_name: "Morning workout (30 min)", streak_count: 7, last_completed_date: "" },
        { id: "h3", habit_name: "Read 15 pages of book", streak_count: 22, last_completed_date: todayStr },
        { id: "h4", habit_name: "Drink 3L water", streak_count: 5, last_completed_date: todayStr }
      ];
    }
    return rawHabits || [];
  }, [rawHabits, isDev, todayStr]);

  const notes = useMemo(() => {
    if (isDev && (!rawNotes || rawNotes.length === 0)) {
      return [
        { id: "n1", title: "App Roadmap Ideas" },
        { id: "n2", title: "Personal Budget Plan" },
        { id: "n3", title: "SaaS Checklist" },
        { id: "n4", title: "Interview Prep Notes" }
      ];
    }
    return rawNotes || [];
  }, [rawNotes, isDev]);

  const regularEntries = useMemo(() => {
    if (isDev && (!rawRegularEntries || rawRegularEntries.length === 0)) {
      return [
        { id: "tx1", date: todayStr, type: "income", amount: 120000, category: "Salary", description: "Monthly Software Engineer Salary" },
        { id: "tx2", date: todayStr, type: "expense", amount: 12000, category: "Food", description: "Sushi dinner with friends" },
        { id: "tx3", date: todayStr, type: "expense", amount: 9000, category: "Bills", description: "High-speed Internet & Electricity" },
        { id: "tx4", date: todayStr, type: "expense", amount: 5000, category: "Transport", description: "Uber rides & fuel" },
        { id: "tx5", date: todayStr, type: "expense", amount: 4500, category: "Entertainment", description: "Netflix, Spotify & Gym" },
        { id: "tx6", date: lastMonthStr, type: "expense", amount: 15000, category: "Food", description: "Grocery and dine out" },
        { id: "tx7", date: lastMonthStr, type: "expense", amount: 10000, category: "Bills", description: "Rent & Utilities" },
        { id: "tx8", date: lastMonthStr, type: "expense", amount: 5000, category: "Transport", description: "Fuel and transit" },
        { id: "tx9", date: lastMonthStr, type: "expense", amount: 10000, category: "Shopping", description: "Cloths and tech gears" }
      ];
    }
    return rawRegularEntries || [];
  }, [rawRegularEntries, isDev, todayStr, lastMonthStr]);

  const balance = useMemo(() => {
    if (isDev && rawBalance === 0 && (!rawRegularEntries || rawRegularEntries.length === 0)) {
      return 84500;
    }
    return rawBalance;
  }, [rawBalance, rawRegularEntries, isDev]);

  const totalIncome = useMemo(() => {
    if (isDev && rawTotalIncome === 0 && (!rawRegularEntries || rawRegularEntries.length === 0)) {
      return 120000;
    }
    return rawTotalIncome;
  }, [rawTotalIncome, rawRegularEntries, isDev]);

  const totalExpenses = useMemo(() => {
    if (isDev && rawTotalExpenses === 0 && (!rawRegularEntries || rawRegularEntries.length === 0)) {
      return 35500;
    }
    return rawTotalExpenses;
  }, [rawTotalExpenses, rawRegularEntries, isDev]);

  const expensesByCategory = useMemo(() => {
    if (isDev && (!rawExpensesByCategory || Object.keys(rawExpensesByCategory).length === 0)) {
      return { Food: 12000, Transport: 5000, Entertainment: 4500, Bills: 9000, Shopping: 5000 };
    }
    return rawExpensesByCategory || {};
  }, [rawExpensesByCategory, isDev]);

  const totalSavings = useMemo(() => {
    if (isDev && rawTotalSavings === 0) {
      return 250000;
    }
    return rawTotalSavings;
  }, [rawTotalSavings, isDev]);

  const budgetRemaining = useMemo(() => {
    if (isDev && rawBudgetRemaining === 0 && !rawPrimaryBudget) {
      return 14500;
    }
    return rawBudgetRemaining;
  }, [rawBudgetRemaining, rawPrimaryBudget, isDev]);

  const primaryBudget = useMemo(() => {
    if (isDev && !rawPrimaryBudget) {
      return { name: "Monthly Living Expenses", target_amount: 50000 };
    }
    return rawPrimaryBudget;
  }, [rawPrimaryBudget, isDev]);

  const savingsGoals = useMemo(() => {
    if (isDev && (!rawSavingsGoals || rawSavingsGoals.length === 0)) {
      return [{ id: "g1" }, { id: "g2" }];
    }
    return rawSavingsGoals || [];
  }, [rawSavingsGoals, isDev]);

  const subjects = useMemo(() => {
    if (isDev && (!rawSubjects || rawSubjects.length === 0)) {
      return [
        { id: "s1", name: "System Design" },
        { id: "s2", name: "Machine Learning" },
        { id: "s3", name: "Financial Markets" }
      ];
    }
    return rawSubjects || [];
  }, [rawSubjects, isDev]);

  const chapters = useMemo(() => {
    if (isDev && (!rawChapters || rawChapters.length === 0)) {
      return [
        { id: "c1", name: "Load Balancers & Caching", subject_id: "s1" },
        { id: "c2", name: "Database Sharding & Replication", subject_id: "s1" },
        { id: "c3", name: "Neural Networks Intro", subject_id: "s2" },
        { id: "c4", name: "Time Series Forecasting", subject_id: "s3" }
      ];
    }
    return rawChapters || [];
  }, [rawChapters, isDev]);

  const chapterProgress = useMemo(() => {
    if (isDev && (!rawChapterProgress || Object.keys(rawChapterProgress).length === 0)) {
      return { "c1": 100, "c2": 40, "c3": 100, "c4": 20 };
    }
    return rawChapterProgress || {};
  }, [rawChapterProgress, isDev]);

  const subjectProgress = useMemo(() => {
    if (isDev && (!rawSubjectProgress || Object.keys(rawSubjectProgress).length === 0)) {
      return { "s1": 70, "s2": 100, "s3": 20 };
    }
    return rawSubjectProgress || {};
  }, [rawSubjectProgress, isDev]);

  useEffect(() => { document.documentElement.classList.add(theme); }, []);

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 21 ? "Good evening" : "Good night";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  // ===== TASK ANALYTICS =====
  const allTasks = tasks || [];
  const todaysTasks = allTasks.filter(t => t.due_date?.split("T")[0] === todayStr);
  const pendingTasks = allTasks.filter(t => t.status !== "done");
  const completedTasks = allTasks.filter(t => t.status === "done");
  const highPriorityTasks = pendingTasks.filter(t => t.priority === "high" || t.priority === "urgent");
  const taskCompletionRate = allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;

  // ===== HABIT ANALYTICS =====
  const allHabits = habits || [];
  const habitsCompletedToday = allHabits.filter(h => {
    if (!h.last_completed_date) return false;
    return h.last_completed_date.split("T")[0] === todayStr;
  }).length;
  const habitCompletionRate = allHabits.length > 0 ? Math.round((habitsCompletedToday / allHabits.length) * 100) : 0;
  const bestStreak = allHabits.length > 0 ? Math.max(...allHabits.map(h => h.streak_count), 0) : 0;

  // ===== STUDY ANALYTICS =====
  const allChapters = chapters || [];
  const completedChapters = allChapters.filter(c => (chapterProgress[c.id] || 0) === 100).length;
  const studyProgress = allChapters.length > 0 ? Math.round(allChapters.reduce((s, c) => s + (chapterProgress[c.id] || 0), 0) / allChapters.length) : 0;
  const subjectProgressList = (subjects || []).map(s => ({ subject: s.name, progress: subjectProgress[s.id] || 0 })).sort((a, b) => b.progress - a.progress);

  // ===== FINANCE ANALYTICS =====
  const thisMonthExpenses = (regularEntries || []).filter(e => {
    const d = new Date(e.date);
    const now = new Date();
    return e.type === "expense" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const lastMonthExpenses = (regularEntries || []).filter(e => {
    const d = new Date(e.date);
    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const lastYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return e.type === "expense" && d.getMonth() === lastMonth && d.getFullYear() === lastYear;
  });
  const lastMonthTotal = lastMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const expenseTrend = lastMonthTotal > 0 ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100) : 0;

  // Expense chart data
  const expenseChartData = Object.entries(expensesByCategory || {}).map(([name, value]) => ({
    name, value: Number(value), color: CATEGORY_COLORS[name] || CATEGORY_COLORS["Other"],
  }));

  const formatCurrency = (amount: number) => `৳${Math.abs(amount).toLocaleString()}`;

  // Format date safely
  const formatTaskDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr + "T00:00:00");
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch { return ""; }
  };

  // ===== AI SUMMARY =====
  const [aiSummary, setAiSummary] = useState<{ summary: string; alerts: string[]; tips: string[] } | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem("lifeos-daily-summary");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.date === todayStr) setAiSummary(parsed.data);
      } catch { }
    }
  }, []);

  // The generateAISummary function and callGroqAPI are removed as per instructions,
  // implying this logic has been moved or is no longer needed here.
  /*
  const generateAISummary = async () => {
    setIsSummaryLoading(true);
    setSummaryError(null);
    try {
      const contextPrompt = `You are an intelligent daily briefing AI for a personal life management app called LifeSolver. Analyze ALL of the user's data below and generate a concise, actionable daily summary.

Today's Date: ${today}
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

      const parsed = JSON.parse(response);
      const summaryData = {
        summary: parsed.summary || "No summary available.",
        alerts: parsed.alerts || [],
        tips: parsed.tips || [],
      };
      setAiSummary(summaryData);
      localStorage.setItem("lifeos-daily-summary", JSON.stringify({ date: todayStr, data: summaryData }));
    } catch (err) {
      console.error("AI Summary error:", err);
      setSummaryError("Failed to generate summary. Check your API key.");
    } finally {
      setIsSummaryLoading(false);
    }
  };
  */

  // Stat card data
  const statCards = [
    {
      icon: Target, label: "Budget Left", value: `৳${budgetRemaining.toLocaleString()}`,
      sub: primaryBudget?.name || "No budget",
      accent: "#f59e0b", gradient: "from-amber-500/20 via-amber-400/10 to-yellow-500/5",
      borderColor: "border-amber-200 dark:border-amber-500/25",
      trend: budgetRemaining >= 0 ? { value: Math.round((budgetRemaining / (primaryBudget?.target_amount || 1)) * 100), up: true } : null,
    },
    {
      icon: PiggyBank, label: "Total Savings", value: `৳${totalSavings.toLocaleString()}`,
      sub: `${savingsGoals.length} goal(s)`,
      accent: "#10b981", gradient: "from-emerald-500/20 via-emerald-400/10 to-green-500/5",
      borderColor: "border-emerald-200 dark:border-emerald-500/25",
      trend: null,
      className: "hidden sm:block",
    },
    {
      icon: Wallet, label: "Balance", value: `${balance >= 0 ? "" : "-"}${formatCurrency(balance)}`,
      sub: `Income: ৳${totalIncome.toLocaleString()}`,
      accent: "#3b82f6", gradient: "from-blue-500/20 via-blue-400/10 to-sky-500/5",
      borderColor: "border-blue-200 dark:border-blue-500/25",
      trend: balance >= 0 ? { value: Math.round((balance / (totalIncome || 1)) * 100), up: true } : null,
      className: "hidden sm:block",
    },
    {
      icon: ListTodo, label: "Pending Tasks", value: String(pendingTasks.length),
      sub: `${highPriorityTasks.length} high priority`,
      accent: "#ef4444", gradient: "from-rose-500/20 via-rose-400/10 to-pink-500/5",
      borderColor: "border-rose-200 dark:border-rose-500/25",
      trend: null,
    },
  ];

  return (
    <AppLayout className="!pt-6 sm:!pt-8 md:pt-6">
      <SEO title="Dashboard" description="Overview of your tasks, finance, habits, and study progress." />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
        {/* ===== HEADER ===== */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
          {/* Mobile Header Card */}
          <div className="block md:hidden">
            <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 p-6 text-white shadow-lg shadow-indigo-500/25 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -ml-12 -mb-12"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 text-white/80 text-xs font-medium mb-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>{today}</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight mb-1">
                  {greeting}, <span className="text-white">{user?.name?.split(" ")[0] || "User"}</span>
                </h1>
                <p className="text-white/70 text-xs">Here's your daily snapshot</p>
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex flex-col lg:flex-row items-stretch gap-4">
            <div className="flex-1 rounded-2xl border-2 border-primary/10 bg-card/80 bg-gradient-to-br from-primary/15 via-card/80 to-transparent backdrop-blur-sm p-6 sm:p-8 relative overflow-hidden shadow-sm">
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col justify-center h-full">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2 font-medium">
                  <CalendarDays className="w-4 h-4 text-primary/70" />
                  <span>{today}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                  {greeting}, <span className="text-gradient">{user?.name?.split(" ")[0] || "User"}</span>
                </h1>
                <p className="text-muted-foreground text-sm">{aiSummary?.summary ? aiSummary.summary : "Here's your daily snapshot"}</p>
              </div>
            </div>

            {/* Compact Activity Overview for lg view (laptop view) */}
            <div className="hidden lg:block w-[360px] xl:w-[420px] shrink-0">
              <ActivityOverviewCard 
                compact={true}
                completedTasks={completedTasks}
                allTasks={allTasks}
                habitsCompletedToday={habitsCompletedToday}
                allHabits={allHabits}
                studyProgress={studyProgress}
                notes={notes || []}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===== STAT CARDS ===== */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-3 mb-3 sm:mb-6">
        {statCards.map((stat) => (
          <motion.div key={stat.label} variants={fadeUp}
            className={`group relative overflow-hidden rounded-xl p-2 sm:p-3 bg-gradient-to-br ${stat.gradient} border-2 ${stat.borderColor} hover:shadow-lg transition-all duration-300 cursor-default ${stat.className || ""}`}
          >
            {/* Glow orb */}
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-20 blur-xl transition-opacity duration-500 group-hover:opacity-45 pointer-events-none"
              style={{ backgroundColor: stat.accent }} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="p-1 sm:p-1.5 rounded-lg shadow-sm" style={{ backgroundColor: `${stat.accent}20` }}>
                    <stat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: stat.accent }} />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold tracking-wide" style={{ color: stat.accent }}>{stat.label}</span>
                </div>
                {stat.trend && (
                  <Badge variant="outline" className="text-[8px] sm:text-[9px] h-4 sm:h-4.5 font-semibold px-1 flex items-center gap-0.5" style={{ borderColor: `${stat.accent}30`, color: stat.accent, backgroundColor: `${stat.accent}10` }}>
                    {stat.trend.up ? <ArrowUpRight className="w-2 h-2 sm:w-2.5 sm:h-2.5" /> : <ArrowDownRight className="w-2 h-2 sm:w-2.5 sm:h-2.5" />}
                    {stat.trend.value}%
                  </Badge>
                )}
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <h3 className="text-sm sm:text-lg md:text-xl font-black tracking-tight">{stat.value}</h3>
                <span className="text-[8px] sm:text-[9px] text-muted-foreground/60 font-medium truncate max-w-[80px] sm:max-w-[120px]">{stat.sub}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ===== BENTO GRID ===== */}
      <motion.div variants={stagger} initial="hidden" animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 mb-4 sm:mb-6"
      >

        {/* ── AI Summary (span 8) ── */}
        <motion.div variants={fadeUp} className="lg:col-span-8 order-1">
          <AiSummaryCard 
            todayStr={todayStr}
            todayDisplay={today}
            allTasks={allTasks}
            completedTasks={completedTasks}
            pendingTasks={pendingTasks}
            highPriorityTasks={highPriorityTasks}
            allHabits={allHabits}
            habitsCompletedToday={habitsCompletedToday}
            balance={balance}
            thisMonthTotal={thisMonthTotal}
            budgetRemaining={budgetRemaining}
            totalSavings={totalSavings}
            expenseChartData={expenseChartData}
            studyProgress={studyProgress}
            subjectProgressList={subjectProgressList}
            notes={notes || []}
          />
        </motion.div>

        {/* ── Monthly Spending (span 4) ── */}
        <motion.div variants={fadeUp} className="lg:col-span-4 order-3 lg:order-2">
          <MonthlySpendingCard 
            thisMonthTotal={thisMonthTotal}
            lastMonthTotal={lastMonthTotal}
            expenseTrend={expenseTrend}
            expenseChartData={expenseChartData}
          />
        </motion.div>

        {/* ===== ACTIVITY OVERVIEW (Moved inside grid for mobile ordering) ===== */}
        <motion.div variants={fadeUp} className="lg:hidden col-span-1 lg:col-span-12 order-2 lg:order-3">
          <ActivityOverviewCard 
            completedTasks={completedTasks}
            allTasks={allTasks}
            habitsCompletedToday={habitsCompletedToday}
            allHabits={allHabits}
            studyProgress={studyProgress}
            notes={notes || []}
          />
        </motion.div>
      </motion.div>

      {/* ===== BOTTOM 3-COL GRID ===== */}
      <motion.div variants={stagger} initial="hidden" animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6"
      >
        {/* ── Recent Tasks and Habits ── */}
        <TasksAndHabitsCard 
          completedTasks={completedTasks}
          pendingTasks={pendingTasks}
          taskCompletionRate={taskCompletionRate}
          formatTaskDate={formatTaskDate}
          habitsCompletedToday={habitsCompletedToday}
          allHabits={allHabits}
          bestStreak={bestStreak}
          habitCompletionRate={habitCompletionRate}
          todayStr={todayStr}
        />

        {/* ── Study Progress ── */}
        <motion.div variants={fadeUp} className="h-full">
          <StudyProgressCard 
            studyProgress={studyProgress}
            completedChapters={completedChapters}
            allChapters={allChapters}
            subjectProgressList={subjectProgressList}
          />
        </motion.div>
      </motion.div>
    </AppLayout>
  );
};

export default Index;
