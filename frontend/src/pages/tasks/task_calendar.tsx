import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { SlidersHorizontal, LayoutList } from "lucide-react";
import { DateStrip } from "@/components/tasks/DateStrip";

interface TaskCalendarProps {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    viewMode: "list" | "kanban";
    setViewMode: (mode: "list" | "kanban") => void;
    dateStripCounts: Record<string, { total: number; done: number }>;
}

function useDarkMode() {
    const [isDark, setIsDark] = useState(() =>
        document.documentElement.classList.contains("dark")
    );

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains("dark"));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    return isDark;
}

export function TaskCalendar({
    selectedDate,
    setSelectedDate,
    viewMode,
    setViewMode,
    dateStripCounts
}: TaskCalendarProps) {
    const isDark = useDarkMode();

    const lightStyle: React.CSSProperties = {
        background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(59,130,246,0.14) 55%, rgba(147,197,253,0.09) 100%)",
        border: "1px solid rgba(99, 102, 241, 0.22)",
    };

    const darkStyle: React.CSSProperties = {
        background: "linear-gradient(135deg, rgba(30,58,138,0.25) 0%, rgba(17,24,39,0.4) 60%, rgba(30,64,175,0.15) 100%)",
        border: "1px solid rgba(59, 130, 246, 0.25)",
    };

    return (
        <div
            className="flex flex-col pt-4 pb-2 backdrop-blur-xl rounded-3xl mb-4"
            style={isDark ? darkStyle : lightStyle}
        >
            {/* Top row: month name + controls */}
            <div className="flex items-center justify-between px-4 mb-4">
                <h1 
                    className="text-3xl font-extrabold tracking-tight dark:text-white"
                    style={{ color: isDark ? "#ffffff" : "#000000" }}
                >
                    {format(selectedDate, "MMMM")}
                </h1>
                <div className="flex items-center gap-4 text-blue-500/70 dark:text-muted-foreground">
                    <button className="hover:text-blue-800 dark:hover:text-white transition-colors">
                        <SlidersHorizontal className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode(viewMode === "list" ? "kanban" : "list")}
                        className="hover:text-blue-800 dark:hover:text-white transition-colors"
                    >
                        <LayoutList className="w-5 h-5" />
                    </button>
                    <button className="hover:text-blue-800 dark:hover:text-white transition-colors">
                        <span className="text-xl leading-none rotate-90 inline-block font-bold pb-2">...</span>
                    </button>
                </div>
            </div>

            {/* Date Strip */}
            <div className="w-full">
                <DateStrip
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    taskCounts={dateStripCounts}
                />
            </div>
        </div>
    );
}
