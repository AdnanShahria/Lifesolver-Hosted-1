import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";

interface MonthlySpendingCardProps {
  thisMonthTotal: number;
  lastMonthTotal: number;
  expenseTrend: number;
  expenseChartData: { name: string; value: number; color: string }[];
}

export function MonthlySpendingCard({
  thisMonthTotal,
  lastMonthTotal,
  expenseTrend,
  expenseChartData
}: MonthlySpendingCardProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-violet-500/10 bg-white/80 dark:bg-card/80 backdrop-blur-xl dark:bg-gradient-to-br dark:from-violet-950/20 dark:via-card/80 dark:to-fuchsia-950/20 shadow-sm shadow-slate-200/50 dark:shadow-none p-4 sm:p-5 h-full relative overflow-hidden">
      {/* Glow orb */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-violet-400 opacity-[0.06] dark:opacity-[0.06] blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-fuchsia-100 shadow-sm border border-fuchsia-200/50">
              <BarChart3 className="w-4 h-4 text-fuchsia-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-fuchsia-700">Monthly Spending</h3>
              <p className="text-[10px] text-fuchsia-600/80">This month's overview</p>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-violet-500/20 dark:border-violet-500/35 hover:bg-violet-500/10 dark:hover:bg-violet-500/20 transition-all duration-200"
            >
              <ChevronDown className={`w-3.5 h-3.5 text-violet-500 dark:text-violet-400 transition-transform duration-350 ${isExpanded ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>

        <AnimatePresence>
          {(!isMobile || isExpanded) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {/* Hero amount */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-fuchsia-800">৳{thisMonthTotal.toLocaleString()}</span>
                {expenseTrend !== 0 && (
                  <Badge className={`text-[9px] rounded-full px-2 h-5 font-semibold ${expenseTrend > 0
                    ? "bg-red-500/10 text-red-500 border-red-300/30 dark:border-red-500/20 hover:bg-red-500/15"
                    : "bg-green-500/10 text-green-500 border-green-300/30 dark:border-green-500/20 hover:bg-green-500/15"
                    }`}>
                    {expenseTrend > 0 ? "↑" : "↓"} {Math.abs(expenseTrend)}%
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground/60 mb-4">vs ৳{lastMonthTotal.toLocaleString()} last month</p>

              {expenseChartData.length > 0 ? (
                <div className="relative h-44 -mx-2 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expenseChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={72}
                        paddingAngle={3} dataKey="value" stroke="none" cornerRadius={4}>
                        {expenseChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid #8b5cf6", borderRadius: "0.75rem", fontSize: "12px", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
                        formatter={(value: any) => [`৳${Number(value || 0).toLocaleString()}`, ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-fuchsia-600">Total</span>
                    <span className="text-sm font-bold text-fuchsia-800">৳{thisMonthTotal.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-2">
                    <BarChart3 className="w-6 h-6 text-violet-400/40" />
                  </div>
                  <p className="text-xs text-muted-foreground">No expenses this month</p>
                </div>
              )}

              {/* Category breakdown with bars */}
              <div className="space-y-2.5">
                {expenseChartData.slice(0, 4).map((cat, i) => {
                  const pct = thisMonthTotal > 0 ? Math.round((cat.value / thisMonthTotal) * 100) : 0;
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                          <span className="text-xs font-medium text-slate-800">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-semibold">{pct}%</span>
                          <span className="text-xs font-bold text-slate-800">৳{cat.value.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-violet-100/40 dark:bg-violet-900/20 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
