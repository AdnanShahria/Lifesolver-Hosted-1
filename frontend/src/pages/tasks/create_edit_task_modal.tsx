import React, { useState, useMemo, useEffect } from "react";
import { Task } from "@/hooks/useTasks";
import { NewTaskState, defaultNewTask } from "./types";
import { format, addDays } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel
} from "@/components/ui/select";
import {
    Plus, FileText, Edit, Zap, Folder, Calendar as CalendarIcon, Clock, ChevronRight, Timer, Package, BookOpen, Save, DollarSign, Check
} from "lucide-react";

interface CreateEditTaskModalProps {
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
    isEditDialogOpen: boolean;
    setIsEditDialogOpen: (open: boolean) => void;
    newTask: NewTaskState;
    setNewTask: React.Dispatch<React.SetStateAction<NewTaskState>>;
    editingTask: Task | null;
    setEditingTask: React.Dispatch<React.SetStateAction<Task | null>>;
    onAddTask: () => Promise<void>;
    onSaveEdit: () => Promise<void>;
    addTaskPending: boolean;
    updateTaskPending: boolean;
    subjects: any[];
    chapters: any[];
    parts: any[];
    budgets: any[];
    habits: any[];
    inventoryItems: any[];
    chaptersBySubject: Record<string, any[]>;
    partsByChapter: Record<string, any[]>;
    tasks: Task[];
    studySubjectId: string;
    setStudySubjectId: (id: string) => void;
    studyChapterId: string;
    setStudyChapterId: (id: string) => void;
    selectedStudyParts: string[];
    setSelectedStudyParts: React.Dispatch<React.SetStateAction<string[]>>;
}

export function CreateEditTaskModal({
    isDialogOpen,
    setIsDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    newTask,
    setNewTask,
    editingTask,
    setEditingTask,
    onAddTask,
    onSaveEdit,
    addTaskPending,
    updateTaskPending,
    subjects,
    chapters,
    parts,
    budgets,
    habits,
    inventoryItems,
    chaptersBySubject,
    partsByChapter,
    tasks,
    studySubjectId,
    setStudySubjectId,
    studyChapterId,
    setStudyChapterId,
    selectedStudyParts,
    setSelectedStudyParts
}: CreateEditTaskModalProps) {
    // Time adjustment popup state
    const [showTimeAdjustPopup, setShowTimeAdjustPopup] = useState(false);
    const [pendingDuration, setPendingDuration] = useState<string>("");

    // Get chapters for selected subject
    const studyChaptersForSubject = useMemo(() => {
        if (!studySubjectId) return [];
        return chapters.filter(c => c.subject_id === studySubjectId);
    }, [studySubjectId, chapters]);

    // Get parts for selected chapter, organized as a tree
    const studyPartsForChapter = useMemo(() => {
        if (!studyChapterId) return [];
        return (partsByChapter[studyChapterId] || []).filter((p: any) => !p.parent_id);
    }, [studyChapterId, partsByChapter]);

    // Get children of a part
    const getChildParts = (parentId: string) => {
        return parts.filter(p => p.parent_id === parentId);
    };

    // Toggle a part in the selected list
    const toggleStudyPart = (partId: string) => {
        setSelectedStudyParts(prev =>
            prev.includes(partId) ? prev.filter(id => id !== partId) : [...prev, partId]
        );
    };

    // Get a part by ID
    const getPartById = (id: string) => parts.find(p => p.id === id);

    // Time calculation helpers
    const timeToMinutes = (time: string): number => {
        if (!time) return 0;
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
    };

    const minutesToTime = (mins: number): string => {
        const h = Math.floor(mins / 60) % 24;
        const m = mins % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    // Auto-calculate time block fields for Create
    const handleStartTimeChange = (time: string) => {
        const updates: Partial<NewTaskState> = { start_time: time };
        if (time && newTask.end_time) {
            const startMins = timeToMinutes(time);
            const endMins = timeToMinutes(newTask.end_time);
            const duration = endMins >= startMins ? endMins - startMins : (24 * 60 - startMins) + endMins;
            updates.estimated_duration = String(duration);
        } else if (time && newTask.estimated_duration && !newTask.end_time) {
            const startMins = timeToMinutes(time);
            const endMins = startMins + Number(newTask.estimated_duration);
            updates.end_time = minutesToTime(endMins);
        }
        setNewTask({ ...newTask, ...updates });
    };

    const handleEndTimeChange = (time: string) => {
        const updates: Partial<NewTaskState> = { end_time: time };
        if (time && newTask.start_time) {
            const startMins = timeToMinutes(newTask.start_time);
            const endMins = timeToMinutes(time);
            const duration = endMins >= startMins ? endMins - startMins : (24 * 60 - startMins) + endMins;
            updates.estimated_duration = String(duration);
        } else if (time && newTask.estimated_duration && !newTask.start_time) {
            const endMins = timeToMinutes(time);
            const startMins = endMins - Number(newTask.estimated_duration);
            updates.start_time = minutesToTime(startMins < 0 ? startMins + 24 * 60 : startMins);
        }
        setNewTask({ ...newTask, ...updates });
    };

    const handleDurationChange = (duration: string) => {
        if (newTask.start_time && newTask.end_time && newTask.estimated_duration) {
            setPendingDuration(duration);
            setShowTimeAdjustPopup(true);
            return;
        }
        const updates: Partial<NewTaskState> = { estimated_duration: duration };
        if (duration && newTask.start_time) {
            const startMins = timeToMinutes(newTask.start_time);
            const endMins = startMins + Number(duration);
            updates.end_time = minutesToTime(endMins);
        } else if (duration && newTask.end_time) {
            const endMins = timeToMinutes(newTask.end_time);
            const startMins = endMins - Number(duration);
            updates.start_time = minutesToTime(startMins < 0 ? startMins + 24 * 60 : startMins);
        }
        setNewTask({ ...newTask, ...updates });
    };

    // Auto-calculate time block fields for Edit
    const handleEditStartTimeChange = (time: string) => {
        if (!editingTask) return;
        const updates: Partial<Task> = { start_time: time };
        if (time && editingTask.end_time) {
            const startMins = timeToMinutes(time);
            const endMins = timeToMinutes(editingTask.end_time);
            const duration = endMins >= startMins ? endMins - startMins : (24 * 60 - startMins) + endMins;
            updates.estimated_duration = duration;
        } else if (time && editingTask.estimated_duration && !editingTask.end_time) {
            const startMins = timeToMinutes(time);
            const endMins = startMins + Number(editingTask.estimated_duration);
            updates.end_time = minutesToTime(endMins);
        }
        setEditingTask({ ...editingTask, ...updates });
    };

    const handleEditEndTimeChange = (time: string) => {
        if (!editingTask) return;
        const updates: Partial<Task> = { end_time: time };
        if (time && editingTask.start_time) {
            const startMins = timeToMinutes(editingTask.start_time);
            const endMins = timeToMinutes(time);
            const duration = endMins >= startMins ? endMins - startMins : (24 * 60 - startMins) + endMins;
            updates.estimated_duration = duration;
        } else if (time && editingTask.estimated_duration && !editingTask.start_time) {
            const endMins = timeToMinutes(time);
            const startMins = endMins - Number(editingTask.estimated_duration);
            updates.start_time = minutesToTime(startMins < 0 ? startMins + 24 * 60 : startMins);
        }
        setEditingTask({ ...editingTask, ...updates });
    };

    const handleEditDurationChange = (durationVal: string) => {
        if (!editingTask) return;
        const duration = Number(durationVal) || 0;
        if (editingTask.start_time && editingTask.end_time && editingTask.estimated_duration) {
            setPendingDuration(durationVal);
            setShowTimeAdjustPopup(true);
            return;
        }
        const updates: Partial<Task> = { estimated_duration: duration };
        if (duration && editingTask.start_time) {
            const startMins = timeToMinutes(editingTask.start_time);
            const endMins = startMins + duration;
            updates.end_time = minutesToTime(endMins);
        } else if (duration && editingTask.end_time) {
            const endMins = timeToMinutes(editingTask.end_time);
            const startMins = endMins - duration;
            updates.start_time = minutesToTime(startMins < 0 ? startMins + 24 * 60 : startMins);
        }
        setEditingTask({ ...editingTask, ...updates });
    };

    const handleTimeAdjustChoice = (adjustField: "start" | "end") => {
        const duration = Number(pendingDuration);
        if (editingTask) {
            // Edit task adjustment
            if (adjustField === "end") {
                const startMins = timeToMinutes(editingTask.start_time || "");
                const endMins = startMins + duration;
                setEditingTask({ ...editingTask, estimated_duration: duration, end_time: minutesToTime(endMins) });
            } else {
                const endMins = timeToMinutes(editingTask.end_time || "");
                const startMins = endMins - duration;
                setEditingTask({ ...editingTask, estimated_duration: duration, start_time: minutesToTime(startMins < 0 ? startMins + 24 * 60 : startMins) });
            }
        } else {
            // New task adjustment
            if (adjustField === "end") {
                const startMins = timeToMinutes(newTask.start_time);
                const endMins = startMins + duration;
                setNewTask({ ...newTask, estimated_duration: pendingDuration, end_time: minutesToTime(endMins) });
            } else {
                const endMins = timeToMinutes(newTask.end_time);
                const startMins = endMins - duration;
                setNewTask({ ...newTask, estimated_duration: pendingDuration, start_time: minutesToTime(startMins < 0 ? startMins + 24 * 60 : startMins) });
            }
        }
        setShowTimeAdjustPopup(false);
        setPendingDuration("");
    };

    return (
        <>
            {/* Create Task Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl sm:rounded-2xl p-0 gap-0 border-0 shadow-2xl bg-card text-card-foreground brightest">
                    {/* ── Header ── */}
                    <div className="px-5 pt-4 pb-3 border-b border-border/30 bg-card/50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                                <Plus className="w-4 h-4 text-primary" />
                            </div>
                            <DialogHeader className="text-left space-y-0">
                                <DialogTitle className="text-base font-semibold tracking-tight leading-tight">Create Task</DialogTitle>
                                <DialogDescription className="text-[11px] text-muted-foreground/60 leading-tight">Plan it. Schedule it. Crush it.</DialogDescription>
                            </DialogHeader>
                        </div>
                    </div>

                    <div className="px-4 pb-2 pt-2 space-y-2.5">
                        {/* ── 📋 Details ── */}
                        <div className="space-y-2">
                            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest ml-1">
                                <FileText className="w-3 h-3" /> Details
                            </p>
                            <div className="bg-card/50 border border-border/40 rounded-2xl p-2.5 space-y-2">
                                <div className="relative">
                                    <Edit className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                    <Input
                                        placeholder="What needs to be done?"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        className="h-9 text-sm font-semibold rounded-xl border-input bg-background/60 shadow-sm placeholder:font-normal pl-10"
                                    />
                                </div>
                                <Textarea
                                    placeholder="Add a description (optional)..."
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    className="min-h-[44px] rounded-xl bg-secondary/20 border-border/30 resize-none text-sm"
                                    rows={1}
                                />
                            </div>
                        </div>

                        {/* ── 🎯 Priority & Date ── */}
                        <div className="space-y-2">
                            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest ml-1">
                                <Zap className="w-3 h-3" /> Priority & Date
                            </p>
                            <div className="bg-card/50 border border-border/40 rounded-2xl p-2.5 space-y-2">
                                {/* Priority Pills */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-medium text-muted-foreground/60 ml-0.5">Priority Level</label>
                                    <div className="grid grid-cols-4 gap-1.5">
                                        <button type="button" onClick={() => setNewTask({ ...newTask, priority: "low" })}
                                            className={`py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-200 ${newTask.priority === "low" ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-[1.02]" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}>
                                            Low
                                        </button>
                                        <button type="button" onClick={() => setNewTask({ ...newTask, priority: "medium" })}
                                            className={`py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-200 ${newTask.priority === "medium" ? "bg-amber-500 text-white shadow-md shadow-amber-500/25 scale-[1.02]" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}>
                                            Med
                                        </button>
                                        <button type="button" onClick={() => setNewTask({ ...newTask, priority: "high" })}
                                            className={`py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-200 ${newTask.priority === "high" ? "bg-orange-500 text-white shadow-md shadow-orange-500/25 scale-[1.02]" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}>
                                            High
                                        </button>
                                        <button type="button" onClick={() => setNewTask({ ...newTask, priority: "urgent" })}
                                            className={`py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-200 ${newTask.priority === "urgent" ? "bg-red-500 text-white shadow-md shadow-red-500/25 scale-[1.02]" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}>
                                            Urgent
                                        </button>
                                    </div>
                                </div>
                                {/* Due Date */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-medium text-muted-foreground/60 ml-0.5">Due Date</label>
                                    {/* Quick date chips */}
                                    <div className="flex gap-1.5 mb-1.5 flex-wrap">
                                        {[
                                            { label: "Today", days: 0 },
                                            { label: "Tomorrow", days: 1 },
                                            { label: "+3 days", days: 3 },
                                            { label: "Next week", days: 7 },
                                        ].map(chip => {
                                            const chipDate = format(addDays(new Date(), chip.days), "yyyy-MM-dd");
                                            const isActive = newTask.due_date === chipDate;
                                            return (
                                                <button
                                                    key={chip.label}
                                                    type="button"
                                                    onClick={() => setNewTask({ ...newTask, due_date: isActive ? "" : chipDate })}
                                                    className={`text-[10px] px-2.5 py-1 rounded-full font-semibold transition-all duration-150 ${
                                                        isActive
                                                            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                                                            : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                                                    }`}
                                                >
                                                    {chip.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <DatePicker
                                        value={newTask.due_date ? newTask.due_date.split('T')[0] : ""}
                                        onChange={(date) => setNewTask({ ...newTask, due_date: date })}
                                        placeholder="Pick a date"
                                        className="h-8 rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ── 📂 Module / Context ── */}
                        <div className="space-y-2">
                            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest ml-1">
                                <Folder className="w-3 h-3" /> Link to Module
                            </p>
                            <div className="bg-card/50 border border-border/40 rounded-2xl p-2.5 space-y-2">
                                <div className="flex gap-2">
                                    <Select value={newTask.context_type} onValueChange={(val) => {
                                        setNewTask({ ...newTask, context_type: val as Task["context_type"], context_id: "" });
                                        if (val !== "study") { setStudySubjectId(""); setStudyChapterId(""); setSelectedStudyParts([]); }
                                    }}>
                                        <SelectTrigger className="h-8 w-1/3 shrink-0 rounded-xl text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">General</SelectItem>
                                            <SelectItem value="study">Study</SelectItem>
                                            <SelectItem value="finance">Finance</SelectItem>
                                            <SelectItem value="habit">Habit</SelectItem>
                                            <SelectItem value="inventory">Inventory</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <div className="flex-1">
                                        {newTask.context_type === "general" ? (
                                            <div className="h-8 flex items-center px-3 rounded-xl border border-dashed border-muted-foreground/20 text-muted-foreground text-xs bg-secondary/10 w-full">
                                                No specific module
                                            </div>
                                        ) : newTask.context_type === "study" ? (
                                            <Select value={studySubjectId} onValueChange={(val) => { setStudySubjectId(val); setStudyChapterId(""); setSelectedStudyParts([]); setNewTask({ ...newTask, context_id: "" }); }}>
                                                <SelectTrigger className="h-8 w-full rounded-xl text-xs">
                                                    <SelectValue placeholder="Select subject..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {subjects.map(s => (
                                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Select value={newTask.context_id || ""} onValueChange={(val) => setNewTask({ ...newTask, context_id: val })}>
                                                <SelectTrigger className="h-8 w-full rounded-xl text-xs">
                                                    <SelectValue placeholder="Select item..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {newTask.context_type === "habit" && habits.map(h => (
                                                        <SelectItem key={h.id} value={h.id}>{h.habit_name}</SelectItem>
                                                    ))}
                                                    {newTask.context_type === "inventory" && inventoryItems.map(i => (
                                                        <SelectItem key={i.id} value={i.id}>{i.item_name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                </div>

                                {/* Study: Chapter selector + Part tree */}
                                {newTask.context_type === "study" && studySubjectId && (
                                    <div className="mt-1 space-y-2">
                                        <Select value={studyChapterId} onValueChange={(val) => { setStudyChapterId(val); setNewTask({ ...newTask, context_id: val }); setSelectedStudyParts([]); }}>
                                            <SelectTrigger className="h-10 rounded-xl">
                                                <SelectValue placeholder="Select chapter..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {studyChaptersForSubject.map(ch => (
                                                    <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        {/* Parts Tree */}
                                        {studyChapterId && studyPartsForChapter.length > 0 && (
                                            <div className="rounded-xl border border-border/50 bg-secondary/10 p-3 space-y-1 max-h-48 overflow-y-auto">
                                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Import Parts as Sub-tasks</p>
                                                {(() => {
                                                    const renderPartTree = (partList: typeof parts, depth: number = 0) => {
                                                        return partList.map(part => {
                                                            const children = getChildParts(part.id);
                                                            const isSelected = selectedStudyParts.includes(part.id);
                                                            const statusIcon = part.status === "completed" ? "✅" : part.status === "in-progress" ? "🔶" : "⬜";
                                                            return (
                                                                <div key={part.id}>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleStudyPart(part.id)}
                                                                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all hover:bg-primary/5 ${isSelected ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                                                                            }`}
                                                                        style={{ paddingLeft: `${8 + depth * 16}px` }}
                                                                    >
                                                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                                                                            }`}>
                                                                            {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                                                                        </div>
                                                                        <span className="text-xs">{statusIcon}</span>
                                                                        <span className="truncate flex-1 text-left">{part.name}</span>
                                                                        {part.estimated_minutes > 0 && (
                                                                            <span className="text-[10px] text-muted-foreground shrink-0">{part.estimated_minutes}m</span>
                                                                        )}
                                                                    </button>
                                                                    {children.length > 0 && renderPartTree(children, depth + 1)}
                                                                </div>
                                                            );
                                                        });
                                                    };
                                                    return renderPartTree(studyPartsForChapter);
                                                })()}
                                            </div>
                                        )}

                                        {studyChapterId && studyPartsForChapter.length === 0 && (
                                            <p className="text-xs text-muted-foreground italic px-1">No parts in this chapter.</p>
                                        )}

                                        {/* Selected Parts Visual */}
                                        {selectedStudyParts.length > 0 && (
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Imported ({selectedStudyParts.length})</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {selectedStudyParts.map(id => {
                                                        const part = getPartById(id);
                                                        if (!part) return null;
                                                        return (
                                                            <span
                                                                key={id}
                                                                className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full text-[11px] font-medium bg-primary/15 text-primary border border-primary/20"
                                                            >
                                                                <BookOpen className="w-3.5 h-3.5" />
                                                                {part.name}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleStudyPart(id)}
                                                                    className="ml-0.5 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                                                                >
                                                                    <Plus className="w-3 h-3 rotate-45" />
                                                                </button>
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── 💰 Finance Section (conditional) ── */}
                        {newTask.context_type === "finance" && (
                            <div className="space-y-2">
                                <p className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest ml-1">
                                    <DollarSign className="w-3 h-3" /> Budget & Cost
                                </p>
                                <div className="bg-card/50 border border-border/40 rounded-2xl p-2.5 space-y-2">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2 flex gap-2 mb-1">
                                            <button type="button"
                                                onClick={() => setNewTask({ ...newTask, finance_type: "expense" })}
                                                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${newTask.finance_type === "expense" ? "bg-red-500 text-white shadow-md shadow-red-500/20" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}
                                            >
                                                💸 Expense
                                            </button>
                                            <button type="button"
                                                onClick={() => setNewTask({ ...newTask, finance_type: "income" })}
                                                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${newTask.finance_type === "income" ? "bg-green-500 text-white shadow-md shadow-green-500/20" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}
                                            >
                                                💰 Income
                                            </button>
                                        </div>

                                        {newTask.finance_type === "expense" && (
                                            <div className="col-span-1">
                                                <Select value={newTask.budget_id} onValueChange={(val) => setNewTask({ ...newTask, budget_id: val })}>
                                                    <SelectTrigger className="h-10 rounded-xl text-xs">
                                                        <SelectValue placeholder="Budget..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {budgets.filter(b => b.type === "budget").map(b => (
                                                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                        <div className={`relative ${newTask.finance_type === "income" ? "col-span-2" : "col-span-1"}`}>
                                            <Input
                                                type="number"
                                                placeholder={newTask.finance_type === "income" ? "Expected income" : "Expected cost"}
                                                value={newTask.expected_cost}
                                                onChange={(e) => setNewTask({ ...newTask, expected_cost: e.target.value })}
                                                className="h-10 rounded-xl bg-background/50 pl-7 text-xs"
                                            />
                                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">৳</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── ⏰ Schedule ── */}
                        <div className="space-y-2">
                            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest ml-1">
                                <Clock className="w-3 h-3" /> Schedule
                            </p>
                            <div className="bg-card/50 border border-border/40 rounded-2xl p-2.5 space-y-2.5">
                                {/* All Day toggle */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground/70 flex items-center gap-1.5"><CalendarIcon className="w-3 h-3" /> All Day</span>
                                    <button
                                        type="button"
                                        onClick={() => setNewTask({ ...newTask, is_all_day: !newTask.is_all_day, start_time: "", end_time: "", estimated_duration: "" })}
                                        className={`w-10 h-5.5 rounded-full transition-all duration-200 relative shrink-0 ${newTask.is_all_day ? "bg-primary" : "bg-secondary/80"}`}
                                        style={{ height: "22px" }}
                                    >
                                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${newTask.is_all_day ? "left-[22px]" : "left-0.5"}`} />
                                    </button>
                                </div>

                                {/* Time fields — hidden when All Day */}
                                {!newTask.is_all_day && (
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1 space-y-1">
                                            <span className="text-[10px] font-medium text-muted-foreground/60 ml-0.5">Start</span>
                                            <TimePicker
                                                value={newTask.start_time}
                                                onChange={(val) => handleStartTimeChange(val)}
                                                placeholder="Start"
                                            />
                                        </div>
                                        <div className="flex items-center pb-2 text-muted-foreground/30">
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <span className="text-[10px] font-medium text-muted-foreground/60 ml-0.5">End</span>
                                            <TimePicker
                                                value={newTask.end_time}
                                                onChange={(val) => handleEndTimeChange(val)}
                                                placeholder="End"
                                            />
                                        </div>
                                        <div className="flex items-center pb-2 text-muted-foreground/30">
                                            <Timer className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="flex-1 space-y-1 relative">
                                            <span className="text-[10px] font-medium text-muted-foreground/60 ml-0.5">Duration</span>
                                            <Input
                                                type="number"
                                                placeholder="—"
                                                value={newTask.estimated_duration}
                                                onChange={(e) => handleDurationChange(e.target.value)}
                                                className="h-8 rounded-lg bg-background/50 text-xs pr-8"
                                            />
                                            <span className="absolute right-2 bottom-[5px] text-[10px] text-muted-foreground">min</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── 🏷️ Labels & Recurrence ── */}
                        <div className="space-y-2">
                            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest ml-1">
                                <Package className="w-3 h-3" /> Extra
                            </p>
                            <div className="bg-card/50 border border-border/40 rounded-2xl p-2.5 space-y-2.5">
                                <Select value={newTask.parent_task_id} onValueChange={(val) => setNewTask({ ...newTask, parent_task_id: val })}>
                                    <SelectTrigger className="h-9 rounded-xl bg-background/50 text-xs w-full">
                                        <SelectValue placeholder="Parent Task (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Parent</SelectItem>
                                        {tasks?.filter(t => t.id !== editingTask?.id).map(t => (
                                            <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    placeholder="Labels (e.g. work, urgent)"
                                    value={newTask.labels}
                                    onChange={(e) => setNewTask({ ...newTask, labels: e.target.value })}
                                    className="h-9 rounded-xl bg-background/50 text-xs"
                                />
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            type="time"
                                            placeholder="Reminder"
                                            value={newTask.reminder_time}
                                            onChange={(e) => setNewTask({ ...newTask, reminder_time: e.target.value })}
                                            className="h-9 rounded-xl bg-background/50 pl-7 text-xs"
                                        />
                                        <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                                    </div>
                                    <Select value={newTask.recurrence_rule} onValueChange={(val) => setNewTask({ ...newTask, recurrence_rule: val })}>
                                        <SelectTrigger className="h-9 rounded-xl bg-background/50 text-xs flex-1">
                                            <SelectValue placeholder="Recurrence" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Footer ── */}
                    <div className="px-4 py-2.5 bg-card/50 border-t border-border/30">
                        <Button
                            onClick={onAddTask}
                            className="w-full h-9 text-sm font-bold rounded-xl bg-primary hover:brightness-110 text-primary-foreground shadow-lg shadow-primary/40 transition-all duration-200 gap-2 tracking-wide"
                            disabled={addTaskPending}
                        >
                            <Zap className="w-3.5 h-3.5" />
                            {addTaskPending ? "Creating..." : "Create Task"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Task Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl sm:rounded-2xl p-0 gap-0 border-0 shadow-2xl bg-card text-card-foreground brightest">
                    {editingTask && (
                        <>
                            {/* ── Header ── */}
                            <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-primary/8 via-card to-card">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-3 shadow-inner border border-white/10">
                                        <Edit className="w-7 h-7 text-primary" />
                                    </div>
                                    <DialogHeader className="mb-1">
                                        <DialogTitle className="text-2xl font-bold tracking-tight">Edit Task</DialogTitle>
                                        <DialogDescription className="text-xs text-muted-foreground/60">Fine-tune the details below.</DialogDescription>
                                    </DialogHeader>
                                </div>
                            </div>

                            <div className="px-6 pb-2 space-y-4">
                                {/* ── 📋 Details ── */}
                                <div className="space-y-2">
                                    <p className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest ml-1">
                                        <FileText className="w-3 h-3" /> Details
                                    </p>
                                    <div className="bg-card/50 border border-border/40 rounded-2xl p-4 space-y-3">
                                        <div className="relative">
                                            <Edit className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                            <Input
                                                placeholder="Task title..."
                                                value={editingTask.title}
                                                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                                className="h-12 text-base font-semibold rounded-xl border-input bg-background/60 shadow-sm placeholder:font-normal pl-10"
                                            />
                                        </div>
                                        <Textarea
                                            placeholder="Add a description..."
                                            value={editingTask.description || ""}
                                            onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                            className="min-h-[60px] rounded-xl bg-secondary/20 border-border/30 resize-none text-sm"
                                            rows={2}
                                        />
                                    </div>
                                </div>

                                {/* ── 🎯 Priority, Status & Date ── */}
                                <div className="space-y-2">
                                    <p className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest ml-1">
                                        <Zap className="w-3 h-3" /> Priority, Status & Date
                                    </p>
                                    <div className="bg-card/50 border border-border/40 rounded-2xl p-4 space-y-4">
                                        {/* Priority Pills */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-medium text-muted-foreground/60 ml-0.5">Priority Level</label>
                                            <div className="grid grid-cols-4 gap-1.5">
                                                <button type="button" onClick={() => setEditingTask({ ...editingTask, priority: "low" })}
                                                    className={`py-2 rounded-xl text-[11px] font-semibold transition-all duration-200 ${editingTask.priority === "low" ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-[1.02]" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}>
                                                    Low
                                                </button>
                                                <button type="button" onClick={() => setEditingTask({ ...editingTask, priority: "medium" })}
                                                    className={`py-2 rounded-xl text-[11px] font-semibold transition-all duration-200 ${editingTask.priority === "medium" ? "bg-amber-500 text-white shadow-md shadow-amber-500/25 scale-[1.02]" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}>
                                                    Med
                                                </button>
                                                <button type="button" onClick={() => setEditingTask({ ...editingTask, priority: "high" })}
                                                    className={`py-2 rounded-xl text-[11px] font-semibold transition-all duration-200 ${editingTask.priority === "high" ? "bg-orange-500 text-white shadow-md shadow-orange-500/25 scale-[1.02]" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}>
                                                    High
                                                </button>
                                                <button type="button" onClick={() => setEditingTask({ ...editingTask, priority: "urgent" })}
                                                    className={`py-2 rounded-xl text-[11px] font-semibold transition-all duration-200 ${editingTask.priority === "urgent" ? "bg-red-500 text-white shadow-md shadow-red-500/25 scale-[1.02]" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}>
                                                    Urgent
                                                </button>
                                            </div>
                                        </div>

                                        {/* Status Pills */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-medium text-muted-foreground/60 ml-0.5">Status</label>
                                            <div className="grid grid-cols-3 gap-1.5">
                                                <button type="button" onClick={() => setEditingTask({ ...editingTask, status: "todo" })}
                                                    className={`py-2 rounded-xl text-[11px] font-semibold transition-all duration-200 ${editingTask.status === "todo" ? "bg-slate-500 text-white shadow-md shadow-slate-500/25 scale-[1.02]" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}>
                                                    To Do
                                                </button>
                                                <button type="button" onClick={() => setEditingTask({ ...editingTask, status: "in-progress" })}
                                                    className={`py-2 rounded-xl text-[11px] font-semibold transition-all duration-200 ${editingTask.status === "in-progress" ? "bg-amber-500 text-white shadow-md shadow-amber-500/25 scale-[1.02]" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}>
                                                    In Progress
                                                </button>
                                                <button type="button" onClick={() => setEditingTask({ ...editingTask, status: "done" })}
                                                    className={`py-2 rounded-xl text-[11px] font-semibold transition-all duration-200 ${editingTask.status === "done" ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-[1.02]" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}>
                                                    Done
                                                </button>
                                            </div>
                                        </div>

                                        {/* Due Date */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-medium text-muted-foreground/60 ml-0.5">Due Date</label>
                                            <DatePicker
                                                value={editingTask.due_date ? editingTask.due_date.split('T')[0] : ""}
                                                onChange={(date) => setEditingTask({ ...editingTask, due_date: date })}
                                                placeholder="Pick a date"
                                                className="h-11 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* ── 📂 Module / Context ── */}
                                <div className="space-y-2">
                                    <p className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest ml-1">
                                        <Folder className="w-3 h-3" /> Link to Module
                                    </p>
                                    <div className="bg-card/50 border border-border/40 rounded-2xl p-4 space-y-3">
                                        <div className="flex gap-2">
                                            <Select value={editingTask.context_type || "general"} onValueChange={(val) => setEditingTask({ ...editingTask, context_type: val as Task["context_type"], context_id: "" })}>
                                                <SelectTrigger className="h-11 w-1/3 shrink-0 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="general">General</SelectItem>
                                                    <SelectItem value="study">Study</SelectItem>
                                                    <SelectItem value="finance">Finance</SelectItem>
                                                    <SelectItem value="habit">Habit</SelectItem>
                                                    <SelectItem value="inventory">Inventory</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <div className="flex-1">
                                                {(!editingTask.context_type || editingTask.context_type === "general") ? (
                                                    <div className="h-11 flex items-center px-4 rounded-xl border border-dashed border-muted-foreground/20 text-muted-foreground text-sm bg-secondary/10 w-full">
                                                        No specific module
                                                    </div>
                                                ) : editingTask.context_type === "study" ? (
                                                    <Select value={editingTask.context_id || ""} onValueChange={(val) => setEditingTask({ ...editingTask, context_id: val })}>
                                                        <SelectTrigger className="h-11 w-full rounded-xl">
                                                            <SelectValue placeholder="Select chapter..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Object.entries(chaptersBySubject).map(([subject, chs]) => (
                                                                <SelectGroup key={subject}>
                                                                    <SelectLabel>{subject}</SelectLabel>
                                                                    {chs.map(ch => <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>)}
                                                                </SelectGroup>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Select value={editingTask.context_id || ""} onValueChange={(val) => setEditingTask({ ...editingTask, context_id: val })}>
                                                        <SelectTrigger className="h-11 w-full rounded-xl">
                                                            <SelectValue placeholder="Select item..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {editingTask.context_type === "habit" && habits.map(h => (
                                                                <SelectItem key={h.id} value={h.id}>{h.habit_name}</SelectItem>
                                                            ))}
                                                            {editingTask.context_type === "inventory" && inventoryItems.map(i => (
                                                                <SelectItem key={i.id} value={i.id}>{i.item_name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── 💰 Finance Section (conditional) ── */}
                                {editingTask.context_type === "finance" && (
                                    <div className="space-y-2">
                                        <p className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest ml-1">
                                            <DollarSign className="w-3 h-3" /> Budget & Cost
                                        </p>
                                        <div className="bg-card/50 border border-border/40 rounded-2xl p-4 space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="col-span-2 flex gap-2 mb-1">
                                                    <button type="button"
                                                        onClick={() => setEditingTask({ ...editingTask, finance_type: "expense" })}
                                                        className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${(editingTask.finance_type || "expense") === "expense" ? "bg-red-500 text-white shadow-md shadow-red-500/20" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}
                                                    >
                                                        Expense
                                                    </button>
                                                    <button type="button"
                                                        onClick={() => setEditingTask({ ...editingTask, finance_type: "income" })}
                                                        className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${editingTask.finance_type === "income" ? "bg-green-500 text-white shadow-md shadow-green-500/20" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}
                                                    >
                                                        Income
                                                    </button>
                                                </div>

                                                {(editingTask.finance_type || "expense") === "expense" && (
                                                    <div className="col-span-1">
                                                        <Select value={editingTask.budget_id || ""} onValueChange={(val) => setEditingTask({ ...editingTask, budget_id: val })}>
                                                            <SelectTrigger className="h-10 rounded-xl text-xs">
                                                                 <SelectValue placeholder="Budget..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {budgets.filter(b => b.type === "budget").map(b => (
                                                                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}
                                                <div className={`relative ${editingTask.finance_type === "income" ? "col-span-2" : "col-span-1"}`}>
                                                    <Input
                                                        type="number"
                                                        placeholder={editingTask.finance_type === "income" ? "Expected income" : "Expected cost"}
                                                        value={editingTask.expected_cost || ""}
                                                        onChange={(e) => setEditingTask({ ...editingTask, expected_cost: Number(e.target.value) || undefined })}
                                                        className="h-10 rounded-xl bg-background/50 pl-7 text-xs"
                                                    />
                                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">৳</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── ⏰ Schedule ── */}
                                <div className="space-y-2">
                                    <p className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest ml-1">
                                        <Clock className="w-3 h-3" /> Schedule
                                    </p>
                                    <div className="bg-card/50 border border-border/40 rounded-2xl p-4">
                                        <div className="flex gap-2 items-end">
                                            <div className="flex-1 space-y-1">
                                                <span className="text-[10px] font-medium text-muted-foreground/60 ml-0.5">Start</span>
                                                <TimePicker
                                                    value={editingTask.start_time || ""}
                                                    onChange={(val) => handleEditStartTimeChange(val || "")}
                                                    placeholder="Start"
                                                />
                                            </div>
                                            <div className="flex items-center pb-2 text-muted-foreground/30">
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <span className="text-[10px] font-medium text-muted-foreground/60 ml-0.5">End</span>
                                                <TimePicker
                                                    value={editingTask.end_time || ""}
                                                    onChange={(val) => handleEditEndTimeChange(val || "")}
                                                    placeholder="End"
                                                />
                                            </div>
                                            <div className="flex items-center pb-2 text-muted-foreground/30">
                                                <Timer className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex-1 space-y-1 relative">
                                                <span className="text-[10px] font-medium text-muted-foreground/60 ml-0.5">Duration</span>
                                                <Input
                                                    type="number"
                                                    placeholder="—"
                                                    value={editingTask.estimated_duration || ""}
                                                    onChange={(e) => handleEditDurationChange(e.target.value)}
                                                    className="h-8 rounded-lg bg-background/50 text-xs pr-8"
                                                />
                                                <span className="absolute right-2 bottom-[5px] text-[10px] text-muted-foreground">min</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── 🏷️ Labels & Recurrence ── */}
                                <div className="space-y-2">
                                    <p className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest ml-1">
                                        <Package className="w-3 h-3" /> Extra
                                    </p>
                                    <div className="bg-card/50 border border-border/40 rounded-2xl p-2.5 space-y-2.5">
                                        <Select value={editingTask.parent_task_id || "none"} onValueChange={(val) => setEditingTask({ ...editingTask, parent_task_id: val === "none" ? undefined : val })}>
                                            <SelectTrigger className="h-9 rounded-xl bg-background/50 text-xs w-full">
                                                <SelectValue placeholder="Parent Task (optional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No Parent</SelectItem>
                                                {tasks?.filter(t => t.id !== editingTask.id).map(t => (
                                                    <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            placeholder="Labels (e.g. work, urgent)"
                                            value={editingTask.labels || ""}
                                            onChange={(e) => setEditingTask({ ...editingTask, labels: e.target.value })}
                                            className="h-9 rounded-xl bg-background/50 text-xs"
                                        />
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Input
                                                    type="time"
                                                    placeholder="Reminder"
                                                    value={editingTask.reminder_time || ""}
                                                    onChange={(e) => setEditingTask({ ...editingTask, reminder_time: e.target.value })}
                                                    className="h-9 rounded-xl bg-background/50 pl-7 text-xs"
                                                />
                                                <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                                            </div>
                                            <Select value={editingTask.recurrence_rule || "none"} onValueChange={(val) => setEditingTask({ ...editingTask, recurrence_rule: val === "none" ? undefined : val })}>
                                                <SelectTrigger className="h-9 rounded-xl bg-background/50 text-xs flex-1">
                                                    <SelectValue placeholder="Recurrence" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    <SelectItem value="daily">Daily</SelectItem>
                                                    <SelectItem value="weekly">Weekly</SelectItem>
                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Footer ── */}
                            <div className="p-4 mt-2 bg-gradient-to-t from-secondary/40 to-transparent border-t border-border/30">
                                <Button
                                    onClick={onSaveEdit}
                                    className="w-full h-12 text-base font-bold shadow-lg shadow-primary/25 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 transition-all duration-300 gap-2"
                                    disabled={updateTaskPending}
                                >
                                    <Save className="w-4.5 h-4.5" />
                                    {updateTaskPending ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Time Adjustment Popup */}
            <Dialog open={showTimeAdjustPopup} onOpenChange={setShowTimeAdjustPopup}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Adjust Time Block</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground mb-4">
                        Which time would you like to keep? The other will be recalculated based on the new duration ({pendingDuration} min).
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            onClick={() => handleTimeAdjustChoice("start")}
                            className="flex flex-col gap-1 h-auto py-3"
                        >
                            <span className="font-medium">Keep End Time</span>
                            <span className="text-xs text-muted-foreground">Adjust Start Time</span>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleTimeAdjustChoice("end")}
                            className="flex flex-col gap-1 h-auto py-3"
                        >
                            <span className="font-medium">Keep Start Time</span>
                            <span className="text-xs text-muted-foreground">Adjust End Time</span>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
