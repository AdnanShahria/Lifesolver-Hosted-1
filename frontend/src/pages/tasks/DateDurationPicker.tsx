import React, { useState } from "react";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Repeat, Bell, ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateDurationPickerProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date | null;
    setSelectedDate: (date: Date) => void;
    startTime: string;
    setStartTime: (time: string) => void;
    endTime: string;
    setEndTime: (time: string) => void;
}

export function DateDurationPicker({
    isOpen,
    onClose,
    selectedDate,
    setSelectedDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime
}: DateDurationPickerProps) {
    const [activeTab, setActiveTab] = useState<"date" | "duration">("duration");
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    });

    const nextMonth = () => setCurrentMonth(addDays(endOfMonth(currentMonth), 1));
    const prevMonth = () => setCurrentMonth(addDays(startOfMonth(currentMonth), -1));

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-[70] flex items-end sm:items-center justify-center"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="w-full max-w-md bg-[#1C1C1E] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5 text-white" />
                        </button>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setActiveTab("date")}
                                className={cn(
                                    "text-[15px] font-medium transition-colors pb-1 border-b-2",
                                    activeTab === "date" ? "text-[#4B6BFB] border-[#4B6BFB]" : "text-muted-foreground border-transparent"
                                )}
                            >
                                Date
                            </button>
                            <button
                                onClick={() => setActiveTab("duration")}
                                className={cn(
                                    "text-[15px] font-medium transition-colors pb-1 border-b-2",
                                    activeTab === "duration" ? "text-[#4B6BFB] border-[#4B6BFB]" : "text-muted-foreground border-transparent"
                                )}
                            >
                                Duration
                            </button>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <Check className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {activeTab === "date" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[17px] font-bold text-white">{format(currentMonth, "MMMM")}</h3>
                                <div className="flex items-center gap-2">
                                    <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-full">
                                        <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                    <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-full">
                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-y-4 text-center">
                                {["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"].map(d => (
                                    <div key={d} className="text-[13px] text-muted-foreground font-medium">{d}</div>
                                ))}
                                {daysInMonth.map((day, i) => {
                                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedDate(day)}
                                            className={cn(
                                                "w-8 h-8 mx-auto flex items-center justify-center rounded-full text-[15px] font-medium transition-colors",
                                                isSelected ? "bg-[#4B6BFB] text-white" : "text-[#F2F2F7] hover:bg-white/10"
                                            )}
                                        >
                                            {format(day, "d")}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === "duration" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#2C2C2E] p-4 rounded-2xl">
                                    <div className="text-[13px] text-muted-foreground mb-1">Date</div>
                                    <div className="text-[#4B6BFB] font-semibold text-[15px]">{selectedDate ? format(selectedDate, "EEE, MMM d") : "Today"}</div>
                                    <div className="text-[11px] text-muted-foreground mt-1">Today</div>
                                </div>
                                <div className="bg-[#2C2C2E] p-4 rounded-2xl">
                                    <div className="text-[13px] text-muted-foreground mb-1">Time</div>
                                    <div className="text-[#4B6BFB] font-semibold text-[15px]">12:00AM - 1:00AM</div>
                                    <div className="text-[11px] text-muted-foreground mt-1">Duration: 1 hour</div>
                                </div>
                            </div>
                            
                            <div className="bg-[#2C2C2E] rounded-2xl px-4 py-3 flex items-center justify-between mt-4">
                                <span className="text-[15px] text-[#F2F2F7] font-medium">All day</span>
                                <div className="w-10 h-6 bg-white/10 rounded-full relative">
                                    <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm" />
                                </div>
                            </div>

                            <div className="space-y-2 mt-4">
                                <button className="w-full flex items-center justify-between p-2">
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Bell className="w-5 h-5" />
                                        <span className="text-[15px]">Reminder</span>
                                    </div>
                                    <div className="text-[15px] text-muted-foreground flex items-center gap-1">On time <X className="w-4 h-4" /></div>
                                </button>
                                <button className="w-full flex items-center justify-between p-2">
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Repeat className="w-5 h-5" />
                                        <span className="text-[15px]">Repeat</span>
                                    </div>
                                    <div className="text-[15px] text-muted-foreground flex items-center gap-1">None <ChevronRight className="w-4 h-4" /></div>
                                </button>
                            </div>

                            <div className="mt-8">
                                <button className="w-full py-3.5 bg-[#FF9500] hover:bg-[#FF9500]/90 text-white rounded-xl font-semibold text-[17px] shadow-lg shadow-[#FF9500]/20 transition-colors">
                                    Upgrade Now
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <div className="mt-6 flex justify-center pb-2">
                        <button onClick={onClose} className="text-red-500 font-medium text-[15px]">
                            Clear
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
