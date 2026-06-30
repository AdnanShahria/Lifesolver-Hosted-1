import { useState, useMemo, useEffect } from "react";
import { SkeletonListItem } from "@/components/ui/skeleton";
import { SEO } from "@/components/seo/SEO";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Plus, Send, Calendar as CalendarIcon } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { format, isSameDay, startOfDay } from "date-fns";

import { useTasks, Task } from "@/hooks/useTasks";
import { useStudy } from "@/hooks/useStudy";
import { useBudget } from "@/hooks/useBudget";
import { useHabits } from "@/hooks/useHabits";
import { useInventory } from "@/hooks/useInventory";
import { useNotes } from "@/hooks/useNotes";

import { NewTaskState, defaultNewTask } from "./types";
import { TaskCard } from "./task_card";
import { TaskKanban } from "./task_kanban";
import { CreateEditTaskModal } from "./create_edit_task_modal";
import { ImportStudyModal } from "./import_study_modal";
import { TaskCalendar } from "./task_calendar";
import { TaskCreationBottomSheet } from "./TaskCreationBottomSheet";

export default function TasksPage() {
    const { tasks, isLoading, addTask, addTasksBatch, updateTask, deleteTask, completeTask } = useTasks();
    const { subjects, chapters, parts, chaptersBySubject: studyChaptersBySubject, partsByChapter } = useStudy();
    const { budgets } = useBudget();
    const { habits } = useHabits();
    const { items: inventoryItems } = useInventory();
    const { notes } = useNotes();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [newTask, setNewTask] = useState<NewTaskState>(defaultNewTask);

    // Date Selection State
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Accordion expand state — only one card open at a time
    const [expandedId, setExpandedId] = useState<string | null>(null);
    
    const [isFullScreenCreateOpen, setIsFullScreenCreateOpen] = useState(false);

    // UI control state
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
    const [quickTaskTitle, setQuickTaskTitle] = useState("");

    // Study import state lifted from modals
    const [studySubjectId, setStudySubjectId] = useState("");
    const [studyChapterId, setStudyChapterId] = useState("");
    const [selectedStudyParts, setSelectedStudyParts] = useState<string[]>([]);

    // Import Study State
    const [importStudyOpen, setImportStudyOpen] = useState(false);

    const getTaskDateKey = (date: Date) => format(date, "yyyy-MM-dd");

    const location = useLocation();

    // Check for incoming state to pre-fill task (e.g. from Inventory)
    useEffect(() => {
        if (location.state && location.state.newTask) {
            setNewTask({ ...defaultNewTask, ...location.state.newTask });
            setIsDialogOpen(true);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleAddTask = async (partsToImport?: string[]) => {
        if (!newTask.title.trim()) return;
        
        const partsList = partsToImport || selectedStudyParts;
        
        const taskPayload = {
            title: newTask.title,
            description: newTask.description || undefined,
            priority: newTask.priority,
            status: newTask.status,
            due_date: newTask.due_date || undefined,
            context_type: newTask.context_type,
            context_id: newTask.context_id || undefined,
            budget_id: newTask.budget_id || undefined,
            expected_cost: newTask.expected_cost ? parseFloat(newTask.expected_cost) : undefined,
            finance_type: newTask.context_type === "finance" ? newTask.finance_type : undefined,
            start_time: newTask.start_time || undefined,
            end_time: newTask.end_time || undefined,
            estimated_duration: newTask.estimated_duration ? parseInt(newTask.estimated_duration) : undefined,
            labels: newTask.labels || undefined,
            reminder_time: newTask.reminder_time || undefined,
            recurrence_rule: newTask.recurrence_rule || undefined,
            parent_task_id: newTask.parent_task_id || undefined,
        };

        if (partsList && partsList.length > 0) {
            const subTasks = partsList.map((partId) => {
                const partInfo = parts.find(p => p.id === partId);
                return {
                    title: partInfo?.name || "Study Part",
                    priority: newTask.priority,
                    status: "todo" as const,
                    context_type: "study" as const,
                    context_id: newTask.context_id || undefined,
                    due_date: newTask.due_date || undefined,
                };
            });
            await addTasksBatch.mutateAsync({ task: taskPayload, subTasks });
        } else {
            await addTask.mutateAsync(taskPayload);
        }
        
        setNewTask(defaultNewTask);
        setIsDialogOpen(false);
        setStudySubjectId("");
        setStudyChapterId("");
        setSelectedStudyParts([]);
    };

    const handleStatusChange = (task: Task, status: Task["status"]) => {
        if (status === "done") {
            completeTask.mutate(task.id);
        } else {
            updateTask.mutate({ id: task.id, status });
        }
    };

    const handlePinToggle = (task: Task) => {
        updateTask.mutate({ id: task.id, is_pinned: !task.is_pinned });
    };

    const handleStartEdit = (task: Task) => {
        setEditingTask(task);
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingTask) return;
        await updateTask.mutateAsync({
            id: editingTask.id,
            title: editingTask.title,
            description: editingTask.description,
            priority: editingTask.priority,
            status: editingTask.status,
            due_date: editingTask.due_date,
            context_type: editingTask.context_type,
            context_id: editingTask.context_id,
            budget_id: editingTask.budget_id,
            expected_cost: editingTask.expected_cost,
            finance_type: editingTask.finance_type,
            start_time: editingTask.start_time,
            end_time: editingTask.end_time,
            estimated_duration: editingTask.estimated_duration,
            labels: editingTask.labels,
            reminder_time: editingTask.reminder_time,
            recurrence_rule: editingTask.recurrence_rule,
            parent_task_id: editingTask.parent_task_id,
        });
        setIsEditDialogOpen(false);
        setEditingTask(null);
    };

    // Calculate Counts for DateStrip (Past 7 days + Next 14 days)
    const dateStripCounts = useMemo(() => {
        const counts: Record<string, { total: number; done: number }> = {};
        tasks.forEach(t => {
            if (t.due_date) {
                if (!counts[t.due_date]) counts[t.due_date] = { total: 0, done: 0 };
                counts[t.due_date].total++;
                if (t.status === "done") counts[t.due_date].done++;
            }
        });
        return counts;
    }, [tasks]);

    // Filter Tasks for VALID Daily View
    const filteredTasks = useMemo(() => {
        const today = startOfDay(new Date());
        const selDateKey = getTaskDateKey(selectedDate);
        const isToday = isSameDay(selectedDate, today);

        return tasks.filter(task => {
            // Search filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                if (!task.title.toLowerCase().includes(q) && !(task.description || "").toLowerCase().includes(q)) return false;
            }
            // Date Logic
            if (task.due_date === selDateKey) return true; // Exact match

            // Overdue Logic: Only show on "Today"
            if (isToday && task.due_date && new Date(task.due_date) < today && task.status !== "done") {
                return true;
            }

            return false;
        }).sort((a, b) => {
            // Simple Sort: Pinned -> Status (Done last) -> Priority -> Created
            if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
            if (a.status === "done" && b.status !== "done") return 1;
            if (a.status !== "done" && b.status === "done") return -1;

            // Priority sorting
            const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
            const pA = priorityOrder[a.priority] || 2;
            const pB = priorityOrder[b.priority] || 2;
            if (pA !== pB) return pA - pB;

            return 0;
        });
    }, [tasks, selectedDate, searchQuery]);

    // Group filtered tasks into sections
    const groupedTasks = useMemo(() => {
        const today = startOfDay(new Date());
        const selDateKey = getTaskDateKey(selectedDate);
        const isToday = isSameDay(selectedDate, today);

        if (isToday) {
            const overdue = filteredTasks.filter(t => t.due_date && new Date(t.due_date) < today && t.status !== "done");
            const todayTasks = filteredTasks.filter(t => t.due_date === selDateKey);
            const groups: { label: string; emoji: string; tasks: typeof filteredTasks; color: string }[] = [];
            if (overdue.length) groups.push({ label: "Overdue", emoji: "⚠️", tasks: overdue, color: "text-red-400" });
            if (todayTasks.length) groups.push({ label: "Today", emoji: "📅", tasks: todayTasks, color: "text-primary" });
            return groups;
        } else {
            if (!filteredTasks.length) return [];
            const label = format(selectedDate, "EEE, MMM d");
            return [{ label, emoji: "📆", tasks: filteredTasks, color: "text-foreground" }];
        }
    }, [filteredTasks, selectedDate]);

    // Group chapters by subject for the selector
    const chaptersBySubject = useMemo(() => {
        const grouped: Record<string, typeof chapters> = {};
        chapters.forEach(ch => {
            const subject = subjects.find(s => s.id === ch.subject_id)?.name || "Unknown";
            if (!grouped[subject]) grouped[subject] = [];
            grouped[subject].push(ch);
        });
        return grouped;
    }, [chapters, subjects]);

    return (
        <AppLayout className="!pt-0 relative min-h-screen overflow-x-hidden">
            <SEO title="Tasks" description="Manage your tasks, projects, and to-dos." />

            {/* Ambient Background Glows */}
            <div className="fixed top-[-10%] left-[-5%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-50 mix-blend-screen z-0" style={{ animation: 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
            <div className="fixed bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-blue-600/20 rounded-full blur-[150px] pointer-events-none opacity-40 mix-blend-screen z-0" style={{ animation: 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
            <div className="fixed top-[30%] left-[60%] w-[30vw] h-[30vw] max-w-[500px] max-h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none opacity-30 mix-blend-screen z-0" style={{ animation: 'pulse 10s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 sm:space-y-6 pb-32 sm:pb-24 relative z-10"
            >
                <TaskCalendar
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    dateStripCounts={dateStripCounts}
                />

                {/* Main Content */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonListItem key={i} />
                            ))}
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground/50">
                            <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-4">
                                <CalendarIcon className="w-8 h-8 opacity-50" />
                            </div>
                            <p className="text-lg font-medium text-foreground/80">{searchQuery ? "No tasks found" : "No tasks for this day"}</p>
                            <p className="text-sm max-w-xs mt-1">{searchQuery ? `No results for "${searchQuery}"` : "Enjoy your free time or plan ahead!"}</p>
                        </div>
                    ) : viewMode === "kanban" ? (
                        <TaskKanban
                            filteredTasks={filteredTasks}
                            onStatusChange={handleStatusChange}
                        />
                    ) : (
                            <div className="space-y-8 px-4 w-full">
                                {/* Tasks Section (Today) */}
                                {filteredTasks.length > 0 && (
                                    <div className="space-y-4">
                                        <h2 className="text-[17px] font-bold text-white mb-2">Today</h2>
                                        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
                                            <AnimatePresence mode="popLayout">
                                                {filteredTasks.map(task => (
                                                    <TaskCard
                                                        key={task.id}
                                                        task={task}
                                                        isExpanded={expandedId === task.id}
                                                        onToggleExpand={() => setExpandedId(expandedId === task.id ? null : task.id)}
                                                        onStatusChange={handleStatusChange}
                                                        onDelete={(id) => deleteTask.mutate(id)}
                                                        onStartEdit={handleStartEdit}
                                                        onPinToggle={handlePinToggle}
                                                        onPriorityCycle={(t) => {
                                                            const cycle: Task["priority"][] = ["low", "medium", "high", "urgent"];
                                                            const next = cycle[(cycle.indexOf(t.priority) + 1) % cycle.length];
                                                            updateTask.mutate({ id: t.id, priority: next });
                                                        }}
                                                        chapters={chapters}
                                                        subjects={subjects}
                                                        budgets={budgets}
                                                        habits={habits}
                                                        inventoryItems={inventoryItems}
                                                    />
                                                ))}
                                            </AnimatePresence>
                                        </motion.div>
                                    </div>
                                )}

                                {/* Notes and Habits Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                                    {/* Notes Section */}
                                    {notes && notes.length > 0 && (
                                        <div className="space-y-4">
                                            <h2 className="text-[17px] font-bold text-white mb-2">Note</h2>
                                            <div className="bg-[#1C1C1E]/80 backdrop-blur-md rounded-2xl overflow-hidden p-5 border border-white/5 shadow-2xl h-full">
                                                {notes.slice(0, 3).map((note, i) => (
                                                    <div key={note.id} className={`flex items-start gap-4 ${i > 0 ? "mt-5 pt-5 border-t border-white/5" : ""}`}>
                                                        <div className="mt-0.5 text-primary/80 w-6 h-6 flex items-center justify-center shrink-0 bg-primary/10 rounded-md">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-[15px] font-semibold text-white truncate mb-1">
                                                                {note.title}
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[#4B6BFB] text-xs font-semibold uppercase tracking-wider">
                                                                    Today
                                                                </span>
                                                                <span className="text-muted-foreground/50 text-xs font-medium uppercase tracking-wider">
                                                                    Inbox
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Habits Section */}
                                    {habits && habits.length > 0 && (
                                        <div className="space-y-4">
                                            <h2 className="text-[17px] font-bold text-white mb-2">Habit</h2>
                                            <div className="bg-[#1C1C1E]/80 backdrop-blur-md rounded-2xl overflow-hidden p-5 border border-white/5 shadow-2xl h-full">
                                                {habits.slice(0, 3).map((habit, i) => (
                                                    <div key={habit.id} className={`flex items-center gap-4 ${i > 0 ? "mt-5 pt-5 border-t border-white/5" : ""}`}>
                                                        <div className="w-6 h-6 flex items-center justify-center shrink-0 text-emerald-500 bg-emerald-500/10 rounded-md">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0 flex items-center justify-between">
                                                            <span className="text-[15px] font-semibold text-white truncate">
                                                                {habit.habit_name}
                                                            </span>
                                                            <span className="text-[#4B6BFB] text-xs font-semibold uppercase tracking-wider">
                                                                Today
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

            {/* Floating Action Button */}
            <button
                onClick={() => setIsDialogOpen(true)}
                className="fixed right-5 md:right-6 bottom-24 md:bottom-40 z-50 w-[60px] h-[60px] rounded-full bg-[#4B6BFB] text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
            >
                <Plus className="w-8 h-8 stroke-[2.5]" />
            </button>

            {/* Task Creation Bottom Sheet */}
            <TaskCreationBottomSheet
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                newTask={newTask}
                setNewTask={setNewTask}
                onAddTask={handleAddTask}
                onOpenFullScreen={() => {
                    setIsDialogOpen(false);
                    setIsFullScreenCreateOpen(true);
                }}
                studySubjectId={studySubjectId}
                setStudySubjectId={setStudySubjectId}
                studyChapterId={studyChapterId}
                setStudyChapterId={setStudyChapterId}
                selectedStudyParts={selectedStudyParts}
                setSelectedStudyParts={setSelectedStudyParts}
                habits={habits || []}
                inventoryItems={inventoryItems || []}
                tasks={tasks || []}
            />

            <CreateEditTaskModal
                isDialogOpen={isFullScreenCreateOpen}
                setIsDialogOpen={setIsFullScreenCreateOpen}
                isEditDialogOpen={isEditDialogOpen}
                setIsEditDialogOpen={setIsEditDialogOpen}
                newTask={newTask}
                setNewTask={setNewTask}
                editingTask={editingTask}
                setEditingTask={setEditingTask}
                onAddTask={handleAddTask}
                onSaveEdit={handleSaveEdit}
                addTaskPending={addTask.isPending}
                updateTaskPending={updateTask.isPending}
                subjects={subjects}
                chapters={chapters}
                parts={parts}
                budgets={budgets}
                habits={habits}
                inventoryItems={inventoryItems}
                chaptersBySubject={chaptersBySubject}
                partsByChapter={partsByChapter}
                tasks={tasks || []}
                studySubjectId={studySubjectId}
                setStudySubjectId={setStudySubjectId}
                studyChapterId={studyChapterId}
                setStudyChapterId={setStudyChapterId}
                selectedStudyParts={selectedStudyParts}
                setSelectedStudyParts={setSelectedStudyParts}
            />

            <ImportStudyModal
                isOpen={importStudyOpen}
                onOpenChange={setImportStudyOpen}
                subjects={subjects}
                studyChaptersBySubject={studyChaptersBySubject}
                partsByChapter={partsByChapter}
                onImportSelect={(p, subjId, chapId) => {
                    setNewTask({
                        ...defaultNewTask,
                        title: p.name,
                        context_type: "study",
                        context_id: chapId, // Link to chapter for context
                        estimated_duration: String(p.estimated_minutes),
                        start_time: p.scheduled_time || "",
                        due_date: p.scheduled_date ? new Date(p.scheduled_date).toISOString() : "",
                    });
                    setImportStudyOpen(false);
                    setIsDialogOpen(true);
                }}
            />
        </AppLayout>
    );
}
