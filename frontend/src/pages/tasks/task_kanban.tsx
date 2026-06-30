import { Task } from "@/hooks/useTasks";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import React from "react";

interface TaskKanbanProps {
    filteredTasks: Task[];
    onStatusChange: (task: Task, status: Task["status"]) => void;
}

export function TaskKanban({ filteredTasks, onStatusChange }: TaskKanbanProps) {
    const statuses = ["todo", "in-progress", "done"] as const;

    const bgColors = {
        todo: "bg-secondary/30",
        "in-progress": "bg-amber-500/5 border-amber-500/20",
        done: "bg-emerald-500/5 border-emerald-500/20",
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar min-h-[500px]">
            {statuses.map(status => {
                const colTasks = filteredTasks.filter(t => t.status === status);
                const title = status === "todo" ? "To Do" : status === "in-progress" ? "In Progress" : "Done";

                return (
                    <div
                        key={status}
                        className={`flex-1 min-w-[280px] max-w-[350px] shrink-0 snap-center rounded-2xl border border-border/40 p-3 flex flex-col gap-3 ${bgColors[status]}`}
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                        onDrop={(e) => {
                            e.preventDefault();
                            const taskId = e.dataTransfer.getData("taskId");
                            if (taskId) {
                                const task = filteredTasks.find(t => t.id === taskId);
                                if (task && task.status !== status) {
                                    onStatusChange(task, status);
                                }
                            }
                        }}
                    >
                        <div className="flex items-center justify-between px-1">
                            <h3 className="font-semibold text-sm capitalize">{title}</h3>
                            <span className="text-[10px] text-muted-foreground/60 bg-background/50 px-2 py-0.5 rounded-full">
                                {colTasks.length}
                            </span>
                        </div>
                        <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                            <AnimatePresence>
                                {colTasks.map(task => (
                                    <motion.div
                                        key={task.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                    >
                                        <div
                                            draggable
                                            onDragStart={(e: React.DragEvent) => {
                                                e.dataTransfer.setData("taskId", task.id);
                                                e.dataTransfer.effectAllowed = "move";
                                            }}
                                            className={`bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-3 shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all ${
                                                task.context_type === "habit" ? "bg-emerald-500/5 border-emerald-500/20" : ""
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <p className={`text-sm font-medium leading-tight ${task.status === "done" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                                                    {task.title}
                                                </p>
                                                {task.priority !== "low" && (
                                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1 ${
                                                        task.priority === "urgent" ? "bg-red-500" :
                                                            task.priority === "high" ? "bg-orange-500" : "bg-amber-400"
                                                    }`} />
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                <span>{task.due_date ? format(new Date(task.due_date), "MMM d") : "No date"}</span>
                                                {task.context_type && task.context_type !== "general" && (
                                                    <span className="capitalize opacity-60">{task.context_type}</span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {colTasks.length === 0 && (
                                <div className="h-24 flex items-center justify-center border-2 border-dashed border-border/40 rounded-xl text-xs text-muted-foreground/40">
                                    Drop tasks here
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
