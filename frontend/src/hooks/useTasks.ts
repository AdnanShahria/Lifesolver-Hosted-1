import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export interface Task {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    status: "todo" | "in-progress" | "done";
    priority: "low" | "medium" | "high" | "urgent";
    due_date?: string;
    created_at: string;
    completed_at?: string;
    context_type?: "general" | "study" | "finance" | "habit" | "project" | "inventory";
    context_id?: string;
    budget_id?: string;
    expected_cost?: number;
    finance_type?: "income" | "expense";
    start_time?: string;
    end_time?: string;
    estimated_duration?: number;
    actual_duration?: number;
    recurrence_rule?: string;
    parent_task_id?: string;
    order_index?: number;
    labels?: string;
    reminder_time?: string;
    is_pinned?: boolean;
}

const ALL_TASK_FIELDS = [
    "title", "description", "status", "priority", "due_date", "completed_at",
    "context_type", "context_id", "budget_id", "expected_cost", "finance_type",
    "start_time", "end_time", "estimated_duration", "actual_duration",
    "recurrence_rule", "parent_task_id", "order_index", "labels",
    "reminder_time", "is_pinned"
];

export function useTasks() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const userId = user?.id;

    const tasksQuery = useQuery({
        queryKey: ["tasks", userId],
        queryFn: async () => {
            if (!userId) return [];
            return apiFetch("/api/tasks");
        },
        enabled: !!userId && queryClient.isFetching({ queryKey: ["appData", userId] }) === 0,
        initialData: () => {
            const appData = queryClient.getQueryData<any>(["appData", userId]);
            return appData?.tasks;
        },
        staleTime: 1000 * 60 * 2, // 2 min — useAppData pre-populates this cache
    });

    const addTask = useMutation({
        mutationFn: async (task: Partial<Omit<Task, "id" | "user_id" | "created_at">>) => {
            if (!userId) throw new Error("Not authenticated");
            const res = await apiFetch("/api/tasks", {
                method: "POST",
                body: JSON.stringify(task)
            });
            return res.id;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
    });

    const addTasksBatch = useMutation({
        mutationFn: async ({ task, subTasks }: { task: Partial<Omit<Task, "id" | "user_id" | "created_at">>, subTasks: Partial<Omit<Task, "id" | "user_id" | "created_at" | "parent_task_id">>[] }) => {
            if (!userId) throw new Error("Not authenticated");
            
            // Generate parent UUID to link subtasks before sending to backend, or let backend generate it
            // the backend batch-create expects the parent task to be fully formed except id, 
            // wait, the dynamic POST handler creates UUID if missing. My batch-create implementation didn't create an ID if missing!
            // I should generate IDs here to be safe!
            const parentId = crypto.randomUUID();
            const parentTaskToSubmit = { ...task, id: parentId };
            
            const subTasksToSubmit = subTasks.map(st => ({ ...st, id: crypto.randomUUID() }));

            const res = await apiFetch("/api/tasks/batch-create", {
                method: "POST",
                body: JSON.stringify({ task: parentTaskToSubmit, subTasks: subTasksToSubmit })
            });
            return res.parent_id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["study"] });
        },
    });

    const updateTask = useMutation({
        mutationFn: async (task: Partial<Task> & { id: string }) => {
            await apiFetch("/api/tasks", {
                method: "PUT",
                body: JSON.stringify(task)
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["study"] }); // Sync study page
        },
    });

    const deleteTask = useMutation({
        mutationFn: async (id: string) => {
            await apiFetch(`/api/tasks/${id}`, { method: "DELETE" });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
    });

    const completeTask = useMutation({
        mutationFn: async (id: string) => {
            await apiFetch("/api/tasks/complete", {
                method: "POST",
                body: JSON.stringify({ id })
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["finance"] }); // Also refresh finance data
            queryClient.invalidateQueries({ queryKey: ["budgets"] }); // Also refresh budgets/savings
            queryClient.invalidateQueries({ queryKey: ["study"] }); // Sync study page
        },
    });

    // Get tasks by context (e.g., all tasks linked to a study chapter)
    const getTasksByContext = async (contextType: string, contextId: string) => {
        if (!userId) return [];
        return apiFetch(`/api/tasks/context?type=${contextType}&id=${contextId}`);
    };

    // Get subtasks for a parent task
    const getSubtasks = async (parentTaskId: string) => {
        if (!userId) return [];
        return apiFetch(`/api/tasks/subtasks?parentId=${parentTaskId}`);
    };

    return {
        tasks: tasksQuery.data ?? [],
        isLoading: tasksQuery.isLoading,
        error: tasksQuery.error,
        addTask,
        addTasksBatch,
        updateTask,
        deleteTask,
        completeTask,
        getTasksByContext,
        getSubtasks,
    };
}

