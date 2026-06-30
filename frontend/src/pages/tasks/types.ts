import { Task } from "@/hooks/useTasks";

export interface NewTaskState {
    title: string;
    description: string;
    priority: Task["priority"];
    status: Task["status"];
    due_date: string;
    context_type: Task["context_type"];
    context_id: string;
    budget_id: string;
    expected_cost: string;
    finance_type: "income" | "expense";
    start_time: string;
    end_time: string;
    estimated_duration: string;
    is_all_day: boolean;
    labels: string;
    reminder_time: string;
    recurrence_rule: string;
    parent_task_id: string;
}

export const defaultNewTask: NewTaskState = {
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    due_date: "",
    context_type: "general",
    context_id: "",
    budget_id: "",
    expected_cost: "",
    finance_type: "expense",
    start_time: "",
    end_time: "",
    estimated_duration: "",
    is_all_day: false,
    labels: "",
    reminder_time: "",
    recurrence_rule: "",
    parent_task_id: "",
};

export const priorityColors = {
    low: "bg-green-500/20 text-green-400 border-green-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    urgent: "bg-red-500/20 text-red-400 border-red-500/30",
};
