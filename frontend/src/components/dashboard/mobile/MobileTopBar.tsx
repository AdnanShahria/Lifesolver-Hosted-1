import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, LayoutList, MoreVertical } from 'lucide-react';

interface MobileTopBarProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
}

export function MobileTopBar({ currentDate, onDateSelect }: MobileTopBarProps) {
  // Generate a mock week based on current date (for simplicity, we show around the current date)
  // E.g., showing Saturday to Friday as in the screenshot
  const [weekOffset, setWeekOffset] = useState(0);

  // Generate days for the week view
  const generateWeek = () => {
    const days: Date[] = [];
    const today = new Date();
    // Go to previous Saturday
    const start = new Date(today);
    const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
    const diffToSat = dayOfWeek === 6 ? 0 : dayOfWeek + 1;
    start.setDate(today.getDate() - diffToSat + (weekOffset * 7));

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = generateWeek();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Use the month of the first day in the current view
  const displayMonth = monthNames[weekDays[3].getMonth()];

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-2">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{displayMonth}</h1>
        <div className="flex items-center gap-4 text-muted-foreground">
          <button className="hover:text-foreground transition-colors"><SlidersHorizontal className="w-5 h-5" /></button>
          <button className="hover:text-foreground transition-colors"><LayoutList className="w-5 h-5" /></button>
          <button className="hover:text-foreground transition-colors"><MoreVertical className="w-5 h-5" /></button>
        </div>
      </div>
      
      <div className="flex justify-between px-4 pt-1 pb-3">
        {weekDays.map((date, i) => {
          const isSelected = isSameDay(date, currentDate);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          const hasDot = date.getDate() % 2 !== 0; // Mock dot logic

          return (
            <button 
              key={i}
              onClick={() => onDateSelect(date)}
              className="flex flex-col items-center gap-2 relative min-w-[36px]"
            >
              <span className={`text-[11px] font-medium ${isSelected ? 'text-blue-500' : 'text-muted-foreground'}`}>
                {dayName}
              </span>
              <div className="relative flex justify-center items-center h-9 w-9">
                {isSelected && (
                  <motion.div
                    layoutId="selected-day"
                    className="absolute inset-0 bg-blue-600 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 text-sm font-semibold ${isSelected ? 'text-white' : 'text-foreground'}`}>
                  {date.getDate()}
                </span>
                
                {/* Mock W27 indicator */}
                {i === 0 && !isSelected && (
                   <span className="absolute -bottom-3 text-[8px] text-muted-foreground/50">W27</span>
                )}
              </div>
              {/* Event Dot */}
              {hasDot && !isSelected && (
                <div className="w-1 h-1 rounded-full bg-blue-600/50 absolute bottom-[-8px]"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
