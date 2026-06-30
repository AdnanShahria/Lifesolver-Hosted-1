import { Task } from "@/hooks/useTasks";
import { motion } from "framer-motion";
import { Check, Clock, DollarSign, Repeat, Flag, Bell, BookOpen, Package, Tag, Calendar, Trash2, Edit } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { format, isToday, isTomorrow } from "date-fns";

interface TaskCardProps {
    task: Task;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onStatusChange: (task: Task, status: Task["status"]) => void;
    onDelete: (id: string) => void;
    onStartEdit: (task: Task) => void;
    onPinToggle: (task: Task) => void;
    onPriorityCycle: (task: Task) => void;
    chapters: any[];
    subjects: any[];
    budgets: any[];
    habits: any[];
    inventoryItems: any[];
}

export const TaskCard = React.forwardRef<HTMLDivElement, TaskCardProps>(({
    task,
    onStatusChange,
    onDelete,
    onStartEdit,
    onPriorityCycle,
    chapters,
    subjects,
    budgets,
    habits,
    inventoryItems
}, ref) => {

    const getPriorityColor = (p: Task["priority"]) => {
        switch (p) {
            case "urgent": return "text-red-500 hover:text-red-400";
            case "high": return "text-yellow-500 hover:text-yellow-400";
            case "medium": return "text-blue-500 hover:text-blue-450";
            case "low": return "text-gray-400 hover:text-gray-300";
            default: return "text-gray-400 hover:text-gray-300";
        }
    };

    const getStudyContextLabel = () => {
        if (task.context_type === "study" && task.context_id) {
            const chapter = chapters.find(c => c.id === task.context_id);
            const subject = subjects.find(s => s.id === (chapter ? chapter.subject_id : task.context_id));
            if (chapter && subject) {
                return `${subject.name} - ${chapter.name}`;
            }
            if (subject) return subject.name;
            if (chapter) return chapter.name;
        }
        return null;
    };

    const getHabitLabel = () => {
        if (task.context_type === "habit" && task.context_id) {
            const habit = habits.find(h => h.id === task.context_id);
            return habit ? habit.habit_name : null;
        }
        return null;
    };

    const getInventoryLabel = () => {
        if (task.context_type === "inventory" && task.context_id) {
            const item = inventoryItems.find(i => i.id === task.context_id);
            return item ? item.item_name : null;
        }
        return null;
    };

    const getBudgetLabel = () => {
        if (task.budget_id) {
            const budget = budgets.find(b => b.id === task.budget_id);
            return budget ? budget.name : null;
        }
        return null;
    };

    const getFormattedDate = () => {
        if (!task.due_date) return null;
        try {
            const dateObj = new Date(task.due_date);
            if (isNaN(dateObj.getTime())) return null;
            if (isToday(dateObj)) return "Today";
            if (isTomorrow(dateObj)) return "Tomorrow";
            return format(dateObj, "MMM d");
        } catch (e) {
            return null;
        }
    };

    const dateLabel = getFormattedDate();

    return (
        <motion.div
            ref={ref}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="task-card bg-[#1C1C1E] border border-white/5 rounded-xl overflow-hidden mb-3 hover:border-white/10 transition-colors"
        >
            <div className="flex items-start gap-4 p-4">
                {/* Status Checkbox */}
                <button
                    onClick={(e) => { e.stopPropagation(); onStatusChange(task, task.status === "done" ? "todo" : "done"); }}
                    className={cn(
                        "mt-1 w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-colors shrink-0",
                        task.status === "done"
                            ? "bg-[#4B6BFB] border-[#4B6BFB] text-white"
                            : "border-muted-foreground/40 hover:border-muted-foreground"
                    )}
                >
                    {task.status === "done" && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                </button>

                <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Header: Title + Actions */}
                    <div className="flex items-start justify-between gap-2">
                        <span className={cn(
                            "text-[15px] font-medium leading-normal break-words",
                            task.status === "done" ? "text-muted-foreground/60 line-through" : "text-[#F2F2F7]"
                        )}>
                            {task.title}
                        </span>

                        {/* Card Hover Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); onPriorityCycle(task); }}
                                className={cn("p-1 rounded hover:bg-white/5 transition-colors", getPriorityColor(task.priority))}
                                title={`Priority: ${task.priority}`}
                            >
                                <Flag className="w-3.5 h-3.5" fill={task.priority !== "low" ? "currentColor" : "none"} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onStartEdit(task); }}
                                className="p-1 rounded hover:bg-white/5 text-muted-foreground/80 hover:text-white transition-colors"
                                title="Edit"
                            >
                                <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                                className="p-1 rounded hover:bg-white/5 text-muted-foreground/50 hover:text-red-500 transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Description */}
                    {task.description && (
                        <p className="text-[13px] text-muted-foreground/70 leading-relaxed line-clamp-2">
                            {task.description}
                        </p>
                    )}

                    {/* Metadata Badges Row */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {/* Due Date Badge */}
                        {dateLabel && (
                            <span className={cn(
                                "flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border bg-white/5 border-white/5",
                                dateLabel === "Today" ? "text-green-400 border-green-500/20 bg-green-500/5" :
                                dateLabel === "Tomorrow" ? "text-yellow-400 border-yellow-500/20 bg-yellow-500/5" : "text-muted-foreground/80"
                            )}>
                                <Calendar className="w-3 h-3" />
                                {dateLabel}
                            </span>
                        )}

                        {/* Clock / Time Badge */}
                        {(task.start_time || task.estimated_duration) && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium text-blue-400 bg-blue-500/5 border border-blue-500/10">
                                <Clock className="w-3 h-3" />
                                {task.start_time && `${task.start_time}`}
                                {task.end_time && ` - ${task.end_time}`}
                                {task.estimated_duration && ` (${task.estimated_duration}m)`}
                            </span>
                        )}

                        {/* Study Context Badge */}
                        {getStudyContextLabel() && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 max-w-[200px] truncate">
                                <BookOpen className="w-3 h-3 shrink-0" />
                                <span className="truncate">{getStudyContextLabel()}</span>
                            </span>
                        )}

                        {/* Habit Badge */}
                        {getHabitLabel() && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium text-orange-400 bg-orange-500/5 border border-orange-500/10 max-w-[150px] truncate">
                                <Repeat className="w-3 h-3 shrink-0" />
                                <span className="truncate">{getHabitLabel()}</span>
                            </span>
                        )}

                        {/* Inventory Item Badge */}
                        {getInventoryLabel() && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium text-amber-400 bg-amber-500/5 border border-amber-500/10 max-w-[150px] truncate">
                                <Package className="w-3 h-3 shrink-0" />
                                <span className="truncate">{getInventoryLabel()}</span>
                            </span>
                        )}

                        {/* Finance Expected Cost / Budget Badge */}
                        {task.expected_cost && (
                            <span className={cn(
                                "flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-medium border",
                                task.finance_type === "income" 
                                    ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" 
                                    : "text-red-400 bg-red-500/5 border-red-500/10"
                            )}>
                                <DollarSign className="w-3 h-3 -mr-0.5 shrink-0" />
                                <span>{task.finance_type === "income" ? "+" : "-"}{task.expected_cost}</span>
                                {getBudgetLabel() && <span className="text-[10px] opacity-75 ml-1">({getBudgetLabel()})</span>}
                            </span>
                        )}

                        {/* Recurrence Rule Badge */}
                        {task.recurrence_rule && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium text-purple-400 bg-purple-500/5 border border-purple-500/10 capitalize">
                                <Repeat className="w-3 h-3 shrink-0" />
                                <span>{task.recurrence_rule}</span>
                            </span>
                        )}

                        {/* Reminder Time Badge */}
                        {task.reminder_time && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium text-pink-400 bg-pink-500/5 border border-pink-500/10">
                                <Bell className="w-3 h-3 shrink-0" />
                                <span>{task.reminder_time}</span>
                            </span>
                        )}

                        {/* Labels / Tags Badges */}
                        {task.labels && task.labels.split(",").map(lbl => lbl.trim()).filter(Boolean).map(lbl => (
                            <span key={lbl} className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium text-teal-400 bg-teal-500/5 border border-teal-500/10 max-w-[100px] truncate">
                                <Tag className="w-3 h-3 shrink-0" />
                                <span className="truncate">{lbl}</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
});
