import { useRef, useEffect } from "react";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

interface DateStripProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    taskCounts: Record<string, { total: number; done: number }>; // key: YYYY-MM-DD
}

export function DateStrip({ selectedDate, onSelectDate, taskCounts }: DateStripProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const days: Date[] = [];

    const today = startOfDay(new Date());
    for (let i = -7; i <= 14; i++) {
        days.push(addDays(today, i));
    }

    useEffect(() => {
        if (scrollRef.current) {
            const index = days.findIndex(d => isSameDay(d, selectedDate));
            if (index !== -1) {
                const itemWidth = 56;
                const centerOffset = scrollRef.current.clientWidth / 2 - itemWidth / 2;
                scrollRef.current.scrollTo({
                    left: index * itemWidth - centerOffset,
                    behavior: "smooth"
                });
            }
        }
    }, [selectedDate]);

    return (
        <div
            ref={scrollRef}
            className="flex items-center overflow-x-auto no-scrollbar scroll-smooth gap-1 pb-4 pt-1 px-4"
        >
            {days.map((date) => {
                const dateKey = format(date, "yyyy-MM-dd");
                const count = taskCounts[dateKey] || { total: 0, done: 0 };
                const isSelected = isSameDay(date, selectedDate);
                const hasTasks = count.total > 0;

                const dayLabel = format(date, "EEE");

                return (
                    <div
                        key={dateKey}
                        onClick={() => onSelectDate(date)}
                        className="flex flex-col items-center gap-3 shrink-0 cursor-pointer w-12"
                    >
                        <span className={cn(
                            "text-xs font-semibold tracking-wide transition-colors",
                            isSelected 
                                ? "text-[#4B6BFB] dark:text-primary" 
                                : "text-blue-800/60 dark:text-muted-foreground"
                        )}>
                            {dayLabel}
                        </span>

                        <div className="relative flex flex-col items-center">
                            <div className={cn(
                                "flex items-center justify-center rounded-full w-10 h-10 transition-all duration-200",
                                isSelected 
                                    ? "bg-[#4B6BFB] text-white shadow-md shadow-blue-500/25 dark:shadow-none" 
                                    : "text-blue-900/80 dark:text-foreground hover:bg-blue-500/10 dark:hover:bg-white/5"
                            )}>
                                <span className={cn(
                                    "text-sm font-bold",
                                )}>
                                    {format(date, "d")}
                                </span>
                            </div>
                            
                            {/* Dot indicator below */}
                            {hasTasks && !isSelected && (
                                <div className="absolute -bottom-3 w-1 h-1 rounded-full bg-[#4B6BFB]" />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
