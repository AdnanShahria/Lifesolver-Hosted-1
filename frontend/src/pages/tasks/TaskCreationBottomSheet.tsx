import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Task } from "@/hooks/useTasks";
import { NewTaskState } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar as CalendarIcon,
    Flag,
    Tag,
    ArrowRight,
    Clock,
    DollarSign,
    Repeat,
    Check,
    Folder,
    Hash,
    BookOpen,
    ChevronDown,
    Send,
    Package,
    Plus,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DateDurationPicker } from "./DateDurationPicker";
import { useStudy } from "@/hooks/useStudy";
import { useBudget } from "@/hooks/useBudget";

// ==========================================
// 1. Custom UI Elements (Native-Style, Custom Coded)
// ==========================================

interface CustomSelectOption {
    value: string;
    label: string;
}

interface CustomSelectProps {
    value: string;
    onChange: (val: string) => void;
    options: CustomSelectOption[];
    placeholder?: string;
}

function CustomSelect({ value, onChange, options, placeholder = "Select..." }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative w-full">
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="w-full bg-black/35 rounded-lg h-9 px-3 text-sm text-white border border-white/10 outline-none flex items-center justify-between hover:bg-black/50 transition-colors"
            >
                <span className={cn("truncate pr-2", !selectedOption && "text-muted-foreground/40")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
            </button>

            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" onClick={() => setIsOpen(false)} />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-[300px] max-h-[70vh] flex flex-col bg-[#2C2C2E] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                            >
                                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                                    <span className="text-sm font-semibold text-white">{placeholder}</span>
                                    <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-muted-foreground hover:bg-white/10 hover:text-white transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="overflow-y-auto p-2 space-y-1">
                                    {options.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => {
                                                onChange(opt.value);
                                                setIsOpen(false);
                                            }}
                                            className={cn(
                                                "w-full text-left px-3 py-3 rounded-xl text-sm text-white transition-colors flex items-center justify-between",
                                                value === opt.value ? "bg-primary/20 text-primary font-medium" : "hover:bg-white/5"
                                            )}
                                        >
                                            <span className="truncate pr-2">{opt.label}</span>
                                            {value === opt.value && <Check className="w-4 h-4 text-primary shrink-0" />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}

interface CustomTimePickerProps {
    value: string;
    onChange: (val: string) => void;
    label: string;
}

function CustomTimePicker({ value, onChange, label }: CustomTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    
    // Parse current value (HH:MM)
    const [hh, mm] = value ? value.split(":") : ["12", "00"];
    
    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
    const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0')); // 5 min intervals

    return (
        <div className="flex-1 relative">
            <label className="text-[10px] text-muted-foreground uppercase ml-1">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="w-full mt-1 bg-black/35 rounded-lg h-9 px-3 text-sm text-white border border-white/10 outline-none flex items-center justify-between hover:bg-black/50 transition-colors"
            >
                <span>{value || "12:00"}</span>
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>

            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" onClick={() => setIsOpen(false)} />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-[320px] bg-[#2C2C2E] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                            >
                                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                                    <span className="text-sm font-semibold text-white">Select {label}</span>
                                    <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-muted-foreground hover:bg-white/10 hover:text-white transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-5 flex gap-5 justify-center">
                                    <div className="flex-1">
                                        <span className="text-[11px] text-muted-foreground block text-center mb-2 uppercase font-semibold">Hour</span>
                                        <div className="h-48 overflow-y-auto no-scrollbar bg-black/30 rounded-xl p-1.5 space-y-1 border border-white/5">
                                            {hours.map(h => (
                                                <button
                                                    key={h}
                                                    type="button"
                                                    onClick={() => onChange(`${h}:${mm}`)}
                                                    className={cn(
                                                        "w-full text-center py-2.5 rounded-lg text-sm transition-all duration-200",
                                                        hh === h ? "bg-primary text-white font-bold shadow-md scale-[1.02]" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                                                    )}
                                                >
                                                    {h}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-[11px] text-muted-foreground block text-center mb-2 uppercase font-semibold">Minute</span>
                                        <div className="h-48 overflow-y-auto no-scrollbar bg-black/30 rounded-xl p-1.5 space-y-1 border border-white/5">
                                            {minutes.map(m => (
                                                <button
                                                    key={m}
                                                    type="button"
                                                    onClick={() => onChange(`${hh}:${m}`)}
                                                    className={cn(
                                                        "w-full text-center py-2.5 rounded-lg text-sm transition-all duration-200",
                                                        mm === m ? "bg-primary text-white font-bold shadow-md scale-[1.02]" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                                                    )}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-black/20 border-t border-white/10 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!value) onChange(`${hh}:${mm}`); // default
                                            setIsOpen(false);
                                        }}
                                        className="w-full py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Check className="w-4 h-4" strokeWidth={3} />
                                        Confirm
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}

// ==========================================
// 2. Main TaskCreationBottomSheet Component
// ==========================================

interface TaskCreationBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    newTask: NewTaskState;
    setNewTask: React.Dispatch<React.SetStateAction<NewTaskState>>;
    onAddTask: (selectedStudyParts?: string[]) => Promise<void>;
    onOpenFullScreen?: () => void;
    studySubjectId: string;
    setStudySubjectId: (id: string) => void;
    studyChapterId: string;
    setStudyChapterId: (id: string) => void;
    selectedStudyParts: string[];
    setSelectedStudyParts: React.Dispatch<React.SetStateAction<string[]>>;
    habits: any[];
    inventoryItems: any[];
    tasks: Task[];
}

export function TaskCreationBottomSheet({
    isOpen,
    onClose,
    newTask,
    setNewTask,
    onAddTask,
    onOpenFullScreen,
    studySubjectId,
    setStudySubjectId,
    studyChapterId,
    setStudyChapterId,
    selectedStudyParts,
    setSelectedStudyParts,
    habits,
    inventoryItems,
    tasks
}: TaskCreationBottomSheetProps) {
    const { subjects, chapters, partsByChapter } = useStudy();
    const { budgets } = useBudget();

    const [showPriorityMenu, setShowPriorityMenu] = useState(false);
    const [showTagMenu, setShowTagMenu] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showContextMenu, setShowContextMenu] = useState(false);
    
    // Inline expander state
    const [expandedSection, setExpandedSection] = useState<
        "time" | "finance" | "study" | "recurrence" | "habit" | "inventory" | "extra" | null
    >(null);

    // Success animation state
    const [isSuccess, setIsSuccess] = useState(false);

    // Mutual time & duration calculations
    const timeToMinutes = (t: string): number => {
        if (!t) return 0;
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
    };

    const minutesToTime = (mins: number): string => {
        const totalMins = (mins + 24 * 60) % (24 * 60);
        const h = Math.floor(totalMins / 60);
        const m = totalMins % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const handleTimeFieldChange = (field: "start_time" | "end_time" | "estimated_duration", value: string) => {
        setNewTask(prev => {
            const updated = { ...prev, [field]: value };
            const start = updated.start_time;
            const end = updated.end_time;
            const dur = updated.estimated_duration;

            if (field === "start_time") {
                if (value && end) {
                    const diff = (timeToMinutes(end) - timeToMinutes(value) + 24 * 60) % (24 * 60);
                    updated.estimated_duration = String(diff);
                } else if (value && dur) {
                    const endMins = timeToMinutes(value) + parseInt(dur);
                    updated.end_time = minutesToTime(endMins);
                }
            } else if (field === "end_time") {
                if (start && value) {
                    const diff = (timeToMinutes(value) - timeToMinutes(start) + 24 * 60) % (24 * 60);
                    updated.estimated_duration = String(diff);
                } else if (value && dur) {
                    const startMins = (timeToMinutes(value) - parseInt(dur) + 24 * 60) % (24 * 60);
                    updated.start_time = minutesToTime(startMins);
                }
            } else if (field === "estimated_duration") {
                if (value) {
                    const durVal = parseInt(value);
                    if (!isNaN(durVal)) {
                        if (start) {
                            const endMins = timeToMinutes(start) + durVal;
                            updated.end_time = minutesToTime(endMins);
                        } else if (end) {
                            const startMins = (timeToMinutes(end) - durVal + 24 * 60) % (24 * 60);
                            updated.start_time = minutesToTime(startMins);
                        }
                    }
                }
            }
            return updated;
        });
    };

    const handleAddTask = async () => {
        if (!newTask.title.trim()) return;
        setIsSuccess(true);
        // Add a slight delay for the animation to play
        setTimeout(async () => {
            await onAddTask(selectedStudyParts);
            setIsSuccess(false);
            setExpandedSection(null);
            onClose();
        }, 800);
    };

    const handleMenuToggle = (menu: "priority" | "tag" | "context") => {
        setShowPriorityMenu(menu === "priority" ? !showPriorityMenu : false);
        setShowTagMenu(menu === "tag" ? !showTagMenu : false);
        setShowContextMenu(menu === "context" ? !showContextMenu : false);
        setExpandedSection(null);
    };

    const toggleSection = (section: typeof expandedSection) => {
        setExpandedSection(prev => prev === section ? null : section);
        setShowPriorityMenu(false);
        setShowTagMenu(false);
        setShowContextMenu(false);
    };

    const studyChaptersForSubject = studySubjectId ? chapters.filter(c => c.subject_id === studySubjectId) : [];
    const studyPartsForChapter = studyChapterId ? (partsByChapter[studyChapterId] || []).filter((p: any) => !p.parent_id) : [];

    const toggleStudyPart = (partId: string) => {
        setSelectedStudyParts(prev =>
            prev.includes(partId) ? prev.filter(id => id !== partId) : [...prev, partId]
        );
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="task-creation-bottom-sheet-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-[60] flex flex-col justify-end md:justify-center md:items-center md:p-4"
                        onClick={onClose}
                    >
                        {/* Date Picker Dialog */}
                        <AnimatePresence>
                            {showDatePicker && (
                                <DateDurationPicker
                                    isOpen={showDatePicker}
                                    onClose={() => setShowDatePicker(false)}
                                    selectedDate={newTask.due_date ? new Date(newTask.due_date) : new Date()}
                                    setSelectedDate={(d) => setNewTask({ ...newTask, due_date: d.toISOString() })}
                                    startTime={newTask.start_time || ""}
                                    setStartTime={(t) => handleTimeFieldChange("start_time", t)}
                                    endTime={newTask.end_time || ""}
                                    setEndTime={(t) => handleTimeFieldChange("end_time", t)}
                                />
                            )}
                        </AnimatePresence>

                        {/* Main Input Sheet */}
                        <motion.div
                            key="task-creation-input-sheet"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-full bg-[#1C1C1E] rounded-t-3xl md:rounded-3xl p-5 pb-8 md:pb-6 shadow-2xl md:max-w-lg md:w-full border border-white/10 flex flex-col gap-3 relative z-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <input
                                type="text"
                                placeholder="What would you like to do?"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                className="w-full bg-transparent text-white text-[19px] placeholder:text-muted-foreground/50 border-none outline-none font-medium"
                                autoFocus
                            />
                            <textarea
                                placeholder="Description"
                                value={newTask.description || ""}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                className="w-full bg-transparent text-muted-foreground text-[15px] placeholder:text-muted-foreground/30 border-none outline-none resize-none h-8"
                            />

                            {/* Inline Expanders Container */}
                            <AnimatePresence>
                                {expandedSection && (
                                    <motion.div
                                        key={`expanded-section-${expandedSection}`}
                                        initial={{ height: 0, opacity: 0, overflow: "hidden" }}
                                        animate={{ 
                                            height: "auto", 
                                            opacity: 1,
                                            transitionEnd: { overflow: "visible" } 
                                        }}
                                        exit={{ 
                                            height: 0, 
                                            opacity: 0,
                                            transitionEnd: { overflow: "hidden" }
                                        }}
                                    >
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 mb-2 space-y-3 relative z-40">
                                            {expandedSection === "time" && (
                                                <div className="space-y-2.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground/70 flex items-center gap-1.5 font-medium">
                                                            <CalendarIcon className="w-3.5 h-3.5" /> All Day
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setNewTask({ ...newTask, is_all_day: !newTask.is_all_day, start_time: "", end_time: "", estimated_duration: "" })}
                                                            className={cn(
                                                                "w-10 h-5.5 rounded-full transition-all duration-200 relative shrink-0",
                                                                newTask.is_all_day ? "bg-primary" : "bg-white/10"
                                                            )}
                                                            style={{ height: "22px" }}
                                                        >
                                                            <span className={cn(
                                                                "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200",
                                                                newTask.is_all_day ? "left-[22px]" : "left-0.5"
                                                            )} />
                                                        </button>
                                                    </div>
                                                    {!newTask.is_all_day && (
                                                        <div className="flex gap-2">
                                                            <CustomTimePicker
                                                                value={newTask.start_time || ""}
                                                                onChange={(val) => handleTimeFieldChange("start_time", val)}
                                                                label="Start Time"
                                                            />
                                                            <CustomTimePicker
                                                                value={newTask.end_time || ""}
                                                                onChange={(val) => handleTimeFieldChange("end_time", val)}
                                                                label="End Time"
                                                            />
                                                            <div className="flex-1">
                                                                <label className="text-[10px] text-muted-foreground uppercase ml-1">Duration (m)</label>
                                                                <input type="number" placeholder="mins" value={newTask.estimated_duration} onChange={(e) => handleTimeFieldChange("estimated_duration", e.target.value)} className="w-full bg-black/30 rounded-lg h-9 px-2 text-sm text-white border border-white/10 mt-1 outline-none focus:border-primary/50 transition-colors" />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-end pt-1">
                                                        <button onClick={() => setExpandedSection(null)} className="text-[11px] text-primary font-semibold hover:underline flex items-center gap-1 uppercase tracking-wider bg-primary/10 px-2 py-1 rounded-md hover:bg-primary/20 transition-colors">
                                                            <Check className="w-3 h-3" /> Done
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {expandedSection === "finance" && (
                                                <div className="space-y-2">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => setNewTask({...newTask, finance_type: "expense"})} className={cn("flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors", newTask.finance_type === "expense" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-black/30 text-muted-foreground border border-white/10")}>Expense</button>
                                                        <button onClick={() => setNewTask({...newTask, finance_type: "income"})} className={cn("flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors", newTask.finance_type === "income" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-black/30 text-muted-foreground border border-white/10")}>Income</button>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {newTask.finance_type === "expense" && (
                                                            <div className="flex-1">
                                                                <CustomSelect
                                                                    value={newTask.budget_id}
                                                                    onChange={(val) => setNewTask({ ...newTask, budget_id: val })}
                                                                    options={[
                                                                        { value: "", label: "Select Budget" },
                                                                        ...budgets.filter(b => b.type === "budget").map(b => ({ value: b.id, label: b.name }))
                                                                    ]}
                                                                    placeholder="Select Budget"
                                                                />
                                                            </div>
                                                        )}
                                                        <input type="number" placeholder="Expected Amount" value={newTask.expected_cost} onChange={(e) => setNewTask({...newTask, expected_cost: e.target.value})} className="flex-1 bg-black/30 rounded-lg h-9 px-2 text-sm text-white border border-white/10 outline-none focus:border-green-500/50 transition-colors" />
                                                    </div>
                                                    <div className="flex justify-end pt-1">
                                                        <button onClick={() => setExpandedSection(null)} className="text-[11px] text-green-500 font-semibold hover:underline flex items-center gap-1 uppercase tracking-wider bg-green-500/10 px-2 py-1 rounded-md hover:bg-green-500/20 transition-colors">
                                                            <Check className="w-3 h-3" /> Done
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {expandedSection === "recurrence" && (
                                                <div className="space-y-2">
                                                    <div className="flex gap-2">
                                                        <CustomSelect
                                                            value={newTask.recurrence_rule || ""}
                                                            onChange={(val) => setNewTask({ ...newTask, recurrence_rule: val })}
                                                            options={[
                                                                { value: "", label: "No Recurrence" },
                                                                { value: "daily", label: "Daily" },
                                                                { value: "weekly", label: "Weekly" },
                                                                { value: "monthly", label: "Monthly" }
                                                            ]}
                                                            placeholder="No Recurrence"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end pt-1">
                                                        <button onClick={() => setExpandedSection(null)} className="text-[11px] text-purple-400 font-semibold hover:underline flex items-center gap-1 uppercase tracking-wider bg-purple-500/10 px-2 py-1 rounded-md hover:bg-purple-500/20 transition-colors">
                                                            <Check className="w-3 h-3" /> Done
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {expandedSection === "study" && (
                                                <div className="space-y-2">
                                                    <CustomSelect
                                                        value={studySubjectId}
                                                        onChange={(val) => {
                                                            setStudySubjectId(val);
                                                            setStudyChapterId("");
                                                            setSelectedStudyParts([]);
                                                        }}
                                                        options={[
                                                            { value: "", label: "Select Subject" },
                                                            ...subjects.map(s => ({ value: s.id, label: s.name }))
                                                        ]}
                                                        placeholder="Select Subject"
                                                    />
                                                    {studySubjectId && (
                                                        <CustomSelect
                                                            value={studyChapterId}
                                                            onChange={(val) => {
                                                                setStudyChapterId(val);
                                                                setSelectedStudyParts([]);
                                                                setNewTask({ ...newTask, context_id: val });
                                                            }}
                                                            options={[
                                                                { value: "", label: "Select Chapter" },
                                                                ...studyChaptersForSubject.map(ch => ({ value: ch.id, label: ch.name }))
                                                            ]}
                                                            placeholder="Select Chapter"
                                                        />
                                                    )}
                                                    {studyChapterId && studyPartsForChapter.length > 0 && (
                                                        <div className="bg-black/30 border border-white/5 rounded-lg p-2 max-h-32 overflow-y-auto space-y-1">
                                                            <p className="text-[10px] text-muted-foreground uppercase mb-1 font-semibold tracking-wider">Import Parts as Sub-tasks</p>
                                                            {studyPartsForChapter.map(part => (
                                                                <button key={part.id} onClick={() => toggleStudyPart(part.id)} className={cn("w-full flex items-center justify-between p-2 rounded-md text-xs transition-colors", selectedStudyParts.includes(part.id) ? "bg-blue-500/20 text-blue-400 font-medium" : "text-white hover:bg-white/5")}>
                                                                    <span className="truncate pr-2">{part.name}</span>
                                                                    {selectedStudyParts.includes(part.id) && <Check className="w-3.5 h-3.5 shrink-0" />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="flex justify-end pt-1">
                                                        <button onClick={() => setExpandedSection(null)} className="text-[11px] text-blue-400 font-semibold hover:underline flex items-center gap-1 uppercase tracking-wider bg-blue-500/10 px-2 py-1 rounded-md hover:bg-blue-500/20 transition-colors">
                                                            <Check className="w-3 h-3" /> Done
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {expandedSection === "habit" && (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] text-muted-foreground uppercase ml-1">Link to Habit</label>
                                                    <CustomSelect
                                                        value={newTask.context_id || ""}
                                                        onChange={(val) => setNewTask({ ...newTask, context_id: val })}
                                                        options={[
                                                            { value: "", label: "Select a habit..." },
                                                            ...(habits || []).map(h => ({ value: h.id, label: h.habit_name }))
                                                        ]}
                                                        placeholder="Select a habit..."
                                                    />
                                                    <div className="flex justify-end pt-1">
                                                        <button onClick={() => setExpandedSection(null)} className="text-[11px] text-orange-400 font-semibold hover:underline flex items-center gap-1 uppercase tracking-wider bg-orange-500/10 px-2 py-1 rounded-md hover:bg-orange-500/20 transition-colors">
                                                            <Check className="w-3 h-3" /> Done
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {expandedSection === "inventory" && (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] text-muted-foreground uppercase ml-1">Link to Inventory Item</label>
                                                    <CustomSelect
                                                        value={newTask.context_id || ""}
                                                        onChange={(val) => setNewTask({ ...newTask, context_id: val })}
                                                        options={[
                                                            { value: "", label: "Select an item..." },
                                                            ...(inventoryItems || []).map(i => ({ value: i.id, label: i.item_name }))
                                                        ]}
                                                        placeholder="Select an item..."
                                                    />
                                                    <div className="flex justify-end pt-1">
                                                        <button onClick={() => setExpandedSection(null)} className="text-[11px] text-amber-400 font-semibold hover:underline flex items-center gap-1 uppercase tracking-wider bg-amber-500/10 px-2 py-1 rounded-md hover:bg-amber-500/20 transition-colors">
                                                            <Check className="w-3 h-3" /> Done
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {expandedSection === "extra" && (
                                                <div className="space-y-2">
                                                    <div className="flex gap-2 items-start">
                                                        <div className="flex-1">
                                                            <label className="text-[10px] text-muted-foreground uppercase ml-1">Parent Task</label>
                                                            <div className="mt-1">
                                                                <CustomSelect
                                                                    value={newTask.parent_task_id || ""}
                                                                    onChange={(val) => setNewTask({ ...newTask, parent_task_id: val })}
                                                                    options={[
                                                                        { value: "", label: "No Parent" },
                                                                        ...(tasks || []).map(t => ({ value: t.id, label: t.title }))
                                                                    ]}
                                                                    placeholder="No Parent"
                                                                />
                                                            </div>
                                                        </div>
                                                        <CustomTimePicker
                                                            value={newTask.reminder_time || ""}
                                                            onChange={(val) => setNewTask({ ...newTask, reminder_time: val })}
                                                            label="Reminder"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end pt-1">
                                                        <button onClick={() => setExpandedSection(null)} className="text-[11px] text-pink-400 font-semibold hover:underline flex items-center gap-1 uppercase tracking-wider bg-pink-500/10 px-2 py-1 rounded-md hover:bg-pink-500/20 transition-colors">
                                                            <Check className="w-3 h-3" /> Done
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Horizontal Chips Row */}
                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-1 px-1">
                                <button onClick={() => toggleSection("time")} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap border transition-all duration-300", expandedSection === "time" ? "bg-primary/20 border-primary text-primary ring-2 ring-primary/30" : (newTask.start_time || newTask.estimated_duration) ? "bg-primary/20 border-primary/50 text-primary shadow-[0_0_10px_rgba(75,107,251,0.3)]" : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10")}>
                                    <Clock className="w-3.5 h-3.5 shrink-0" /> Time {(newTask.start_time || newTask.estimated_duration) && <Check className="w-3.5 h-3.5 ml-0.5 shrink-0" />}
                                </button>
                                <button onClick={() => { if(expandedSection !== "finance") setNewTask({...newTask, context_type: "finance"}); toggleSection("finance"); }} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap border transition-all duration-300", expandedSection === "finance" ? "bg-green-500/20 border-green-500 text-green-400 ring-2 ring-green-500/30" : (newTask.expected_cost || newTask.budget_id) ? "bg-green-500/20 border-green-500/50 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]" : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10")}>
                                    <DollarSign className="w-3.5 h-3.5 shrink-0" /> Cost {(newTask.expected_cost || newTask.budget_id) && <Check className="w-3.5 h-3.5 ml-0.5 shrink-0" />}
                                </button>
                                <button onClick={() => { if(expandedSection !== "study") setNewTask({...newTask, context_type: "study"}); toggleSection("study"); }} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap border transition-all duration-300", expandedSection === "study" ? "bg-blue-500/20 border-blue-500 text-blue-400 ring-2 ring-blue-500/30" : (selectedStudyParts.length > 0 || studyChapterId) ? "bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]" : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10")}>
                                    <BookOpen className="w-3.5 h-3.5 shrink-0" /> Study Parts {(selectedStudyParts.length > 0 || studyChapterId) && <Check className="w-3.5 h-3.5 ml-0.5 shrink-0" />}
                                </button>
                                <button onClick={() => toggleSection("recurrence")} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap border transition-all duration-300", expandedSection === "recurrence" ? "bg-purple-500/20 border-purple-500 text-purple-400 ring-2 ring-purple-500/30" : newTask.recurrence_rule ? "bg-purple-500/20 border-purple-500/50 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]" : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10")}>
                                    <Repeat className="w-3.5 h-3.5 shrink-0" /> Repeat {newTask.recurrence_rule && <Check className="w-3.5 h-3.5 ml-0.5 shrink-0" />}
                                </button>
                                {newTask.context_type === "habit" && (
                                    <button onClick={() => toggleSection("habit")} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap border transition-all duration-300", expandedSection === "habit" ? "bg-orange-500/20 border-orange-500 text-orange-400 ring-2 ring-orange-500/30" : newTask.context_id ? "bg-orange-500/20 border-orange-500/50 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]" : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10")}>
                                        <Repeat className="w-3.5 h-3.5 shrink-0" /> Habit {newTask.context_id && <Check className="w-3.5 h-3.5 ml-0.5 shrink-0" />}
                                    </button>
                                )}
                                {newTask.context_type === "inventory" && (
                                    <button onClick={() => toggleSection("inventory")} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap border transition-all duration-300", expandedSection === "inventory" ? "bg-amber-500/20 border-amber-500 text-amber-400 ring-2 ring-amber-500/30" : newTask.context_id ? "bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]" : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10")}>
                                        <Package className="w-3.5 h-3.5 shrink-0" /> Item {newTask.context_id && <Check className="w-3.5 h-3.5 ml-0.5 shrink-0" />}
                                    </button>
                                )}
                                <button onClick={() => toggleSection("extra")} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap border transition-all duration-300", expandedSection === "extra" ? "bg-pink-500/20 border-pink-500 text-pink-400 ring-2 ring-pink-500/30" : (newTask.parent_task_id || newTask.reminder_time) ? "bg-pink-500/20 border-pink-500/50 text-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.3)]" : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10")}>
                                    <Plus className="w-3.5 h-3.5 shrink-0" /> Extra {(newTask.parent_task_id || newTask.reminder_time) && <Check className="w-3.5 h-3.5 ml-0.5 shrink-0" />}
                                </button>
                            </div>

                            {/* Bottom Actions Row */}
                            <div className="flex items-center justify-between border-t border-white/5 pt-2">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setShowDatePicker(true)} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white text-[13px] font-medium hover:bg-white/20 transition-colors">
                                        <CalendarIcon className="w-4 h-4" /> Today
                                    </button>
                                    <button onClick={() => handleMenuToggle("priority")} className={cn("p-2 rounded-full transition-colors", newTask.priority !== "medium" ? "bg-primary/20 text-primary" : "text-white hover:bg-white/10")}>
                                        <Flag className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleMenuToggle("tag")} className={cn("p-2 rounded-full transition-colors", newTask.labels ? "bg-primary/20 text-primary" : "text-white hover:bg-white/10")}>
                                        <Tag className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleMenuToggle("context")} className={cn("p-2 rounded-full transition-colors", newTask.context_type !== "general" ? "bg-primary/20 text-primary" : "text-white hover:bg-white/10")}>
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                                <button onClick={() => onOpenFullScreen?.()} className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground">
                                    <ChevronDown className="w-5 h-5 -rotate-90" />
                                </button>
                            </div>

                            {/* Full Width Save Task Button */}
                            <button
                                type="button"
                                onClick={handleAddTask}
                                className={cn(
                                    "w-full mt-1.5 py-3 rounded-xl flex items-center justify-center gap-2 text-white font-bold text-sm shadow-lg transition-all duration-300",
                                    isSuccess
                                        ? "bg-green-500 shadow-green-500/20"
                                        : "bg-[#4B6BFB] hover:brightness-110 hover:scale-[1.01] shadow-primary/25",
                                    !newTask.title.trim() && "opacity-50 pointer-events-none"
                                )}
                                disabled={!newTask.title.trim() || isSuccess}
                            >
                                {isSuccess ? (
                                    <>
                                        <Check className="w-5 h-5 animate-bounce" strokeWidth={3} />
                                        <span>Saved!</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" strokeWidth={3} />
                                        <span>Save Task</span>
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global Portaled Modals for Priority, Tag, Context */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {(showPriorityMenu || showTagMenu || showContextMenu) && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" onClick={() => { setShowPriorityMenu(false); setShowTagMenu(false); setShowContextMenu(false); }} />
                            
                            {showPriorityMenu && (
                                <motion.div
                                    key="priority-popup-menu"
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="relative w-full max-w-[280px] bg-[#2C2C2E] rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
                                >
                                    <div className="px-4 py-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
                                        <span className="text-sm font-semibold text-white">Set Priority</span>
                                        <button onClick={() => setShowPriorityMenu(false)} className="p-1 rounded-full text-muted-foreground hover:bg-white/10 hover:text-white transition-colors">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="p-2">
                                        <button onClick={() => { setNewTask({ ...newTask, priority: "urgent" }); setShowPriorityMenu(false); }} className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 rounded-xl text-white transition-colors">
                                            <span className="flex items-center gap-3"><Flag className="w-5 h-5 text-red-500" fill="currentColor" /> High Priority</span>
                                            {newTask.priority === "urgent" && <Check className="w-4 h-4 text-red-500" />}
                                        </button>
                                        <button onClick={() => { setNewTask({ ...newTask, priority: "high" }); setShowPriorityMenu(false); }} className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 rounded-xl text-white transition-colors">
                                            <span className="flex items-center gap-3"><Flag className="w-5 h-5 text-yellow-500" fill="currentColor" /> Medium Priority</span>
                                            {newTask.priority === "high" && <Check className="w-4 h-4 text-yellow-500" />}
                                        </button>
                                        <button onClick={() => { setNewTask({ ...newTask, priority: "medium" }); setShowPriorityMenu(false); }} className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 rounded-xl text-white transition-colors">
                                            <span className="flex items-center gap-3"><Flag className="w-5 h-5 text-blue-500" fill="currentColor" /> Low Priority</span>
                                            {newTask.priority === "medium" && <Check className="w-4 h-4 text-blue-500" />}
                                        </button>
                                        <button onClick={() => { setNewTask({ ...newTask, priority: "low" }); setShowPriorityMenu(false); }} className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 rounded-xl text-white transition-colors">
                                            <span className="flex items-center gap-3"><Flag className="w-5 h-5 text-gray-500" /> No Priority</span>
                                            {newTask.priority === "low" && <Check className="w-4 h-4 text-gray-500" />}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {showTagMenu && (
                                <motion.div
                                    key="tag-popup-menu"
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="relative w-full max-w-[320px] bg-[#2C2C2E] rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
                                >
                                    <div className="px-4 py-4 border-b border-white/10 bg-black/20 flex items-center gap-2">
                                        <Hash className="w-5 h-5 text-primary" />
                                        <span className="text-sm text-white font-semibold">Add Labels</span>
                                    </div>
                                    <div className="p-4">
                                        <input
                                            type="text"
                                            placeholder="e.g. work, urgent, home"
                                            value={newTask.labels}
                                            onChange={(e) => setNewTask({ ...newTask, labels: e.target.value })}
                                            className="w-full bg-black/30 text-white text-[14px] rounded-xl border border-white/10 p-3.5 outline-none focus:border-primary/50 transition-colors"
                                            autoFocus
                                        />
                                        <button onClick={() => setShowTagMenu(false)} className="w-full mt-4 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2">
                                            <Check className="w-4 h-4" strokeWidth={3} />
                                            Done
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {showContextMenu && (
                                <motion.div
                                    key="context-popup-menu"
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="relative w-full max-w-[300px] bg-[#2C2C2E] rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
                                >
                                    <div className="px-4 py-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
                                        <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Move to Project</span>
                                        <button onClick={() => setShowContextMenu(false)} className="p-1 rounded-full text-muted-foreground hover:bg-white/10 hover:text-white transition-colors">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="p-2">
                                        {(["general", "study", "finance", "habit", "inventory"] as Task["context_type"][]).map(ctx => (
                                            <button
                                                key={ctx}
                                                onClick={() => {
                                                    setNewTask({ ...newTask, context_type: ctx, context_id: "" });
                                                    setShowContextMenu(false);
                                                    if (ctx === "study") setExpandedSection("study");
                                                    else if (ctx === "finance") setExpandedSection("finance");
                                                    else if (ctx === "habit") setExpandedSection("habit");
                                                    else if (ctx === "inventory") setExpandedSection("inventory");
                                                    else setExpandedSection(null);
                                                }}
                                                className={cn(
                                                    "w-full flex items-center justify-between p-3.5 hover:bg-white/5 rounded-xl text-white capitalize text-[14px] transition-colors",
                                                    newTask.context_type === ctx ? "bg-primary/20 text-primary font-medium" : ""
                                                )}
                                            >
                                                <span className="flex items-center gap-3">
                                                    <Folder className={cn("w-5 h-5", newTask.context_type === ctx ? "text-primary" : "text-muted-foreground")} />
                                                    {ctx}
                                                </span>
                                                {newTask.context_type === ctx && <Check className="w-4 h-4 text-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-3 bg-black/20 border-t border-white/10">
                                        <button onClick={() => { setShowContextMenu(false); onOpenFullScreen?.(); }} className="w-full flex items-center justify-center gap-2 p-2.5 hover:bg-white/5 rounded-xl text-white text-[13px] text-muted-foreground transition-colors">
                                            Advanced Linking...
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
