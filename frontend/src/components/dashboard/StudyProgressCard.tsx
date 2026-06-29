import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StudyProgressCardProps {
  studyProgress: number;
  completedChapters: number;
  allChapters: any[];
  subjectProgressList: any[];
}

export function StudyProgressCard({
  studyProgress,
  completedChapters,
  allChapters,
  subjectProgressList
}: StudyProgressCardProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [expandedSection, setExpandedSection] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="rounded-2xl border-2 border-violet-200 dark:border-violet-500/20 bg-gradient-to-br from-violet-50/80 via-card/80 to-purple-50/80 dark:from-violet-950/80 dark:via-card/80 dark:to-purple-950/80 backdrop-blur-sm p-4 sm:p-5 relative overflow-hidden h-full">
      <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-violet-500 opacity-[0.05] blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-violet-500/15 shadow-sm shadow-violet-500/10">
              <GraduationCap className="w-4 h-4 text-violet-500" />
            </div>
            <h3 className="font-semibold text-sm">Study Progress</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-violet-500">{studyProgress}%</span>
            <Badge className="text-[9px] rounded-full bg-violet-500/10 text-violet-500 border-violet-300/30 dark:border-violet-500/20 hover:bg-violet-500/15">
              {completedChapters}/{allChapters.length}
            </Badge>
            {isMobile && (
              <button
                onClick={(e) => { e.stopPropagation(); setExpandedSection(!expandedSection); }}
                className="w-7 h-7 flex items-center justify-center rounded-full border border-violet-500/20 dark:border-violet-500/35 hover:bg-violet-500/10 dark:hover:bg-violet-500/20 transition-all duration-200 ml-1.5 shrink-0"
              >
                <ChevronDown className={`w-3.5 h-3.5 text-violet-500 dark:text-violet-400 transition-transform duration-350 ${expandedSection ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {(!isMobile || expandedSection) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {subjectProgressList.length > 0 ? (
                <div className="space-y-3">
                  {subjectProgressList.slice(0, 3).map((sp, i) => (
                    <div key={sp.subject}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-semibold">{sp.subject}</span>
                        <span className="font-bold text-violet-500">{sp.progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-violet-100/50 dark:bg-violet-900/20 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${sp.progress}%` }}
                          transition={{ duration: 1, delay: 0.3 + i * 0.15 }}
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 shadow-sm shadow-violet-500/20"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">No study data</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
