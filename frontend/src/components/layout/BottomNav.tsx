import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Moon,
  Sun,
  MoreHorizontal,
  X,
  Search,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { useNavPreferences } from "@/hooks/useNavPreferences";
import { useAI } from "@/contexts/AIContext";

export function BottomNav() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [showMore, setShowMore] = useState(false);
  const { mainNavItems, moreNavItems } = useNavPreferences();
  const { isChatOpen, setChatOpen } = useAI();

  // Check if any "more" item is active
  const isMoreActive = moreNavItems.some(item => location.pathname === item.path);

  return (
    <>
      {/* More Menu Overlay */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setShowMore(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed bottom-24 left-4 right-4 glass-card rounded-2xl p-4 z-50 md:hidden shadow-2xl shadow-black/20"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">More Options</h3>
                <button onClick={() => setShowMore(false)} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {moreNavItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setShowMore(false)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${isActive
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "hover:bg-secondary text-muted-foreground"
                        }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="h-[1px] bg-border/20 w-full mb-4" />
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("openGlobalSearch"));
                    setShowMore(false);
                  }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all hover:bg-secondary text-muted-foreground"
                >
                  <Search className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Search</span>
                </button>
                <button
                  onClick={() => {
                    toggleTheme();
                    setShowMore(false);
                  }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all hover:bg-secondary text-muted-foreground"
                >
                  {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <span className="text-[10px] font-medium">Theme</span>
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Bottom Navigation - hidden when AI chat is open */}
      <nav className="bottom-nav" style={isChatOpen ? { display: 'none' } : undefined}>
        <div className="floating-nav-container">

          {/* Primary Nav Items — inner group pill */}
          <div className="nav-group-pill">
            {mainNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} className="relative">
                  <motion.div
                    className={`floating-nav-item ${isActive ? "active" : ""}`}
                    whileTap={{ scale: 0.88 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-bg"
                        className="absolute inset-0 rounded-full -z-10"
                        style={{
                          background: "linear-gradient(135deg, hsl(var(--primary) / 0.12) 0%, hsl(var(--primary) / 0.07) 100%)",
                          border: "1px solid hsl(var(--primary) / 0.40)",
                          boxShadow: "0 0 14px hsl(var(--primary) / 0.18), inset 0 1px 0 rgba(255,255,255,0.15)"
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <item.icon
                      className={`w-[18px] h-[18px] ${isActive ? "text-primary" : ""}`}
                    />
                    <AnimatePresence mode="wait">
                      {isActive && (
                        <motion.span
                          key={item.label}
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: "auto", opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="text-[11px] font-semibold overflow-hidden whitespace-nowrap text-primary"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              );
            })}

            {/* More Button */}
            <button onClick={() => setShowMore(!showMore)} className="relative">
              <motion.div
                className={`floating-nav-item ${showMore || isMoreActive ? "active" : ""}`}
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {(showMore || isMoreActive) && (
                  <motion.div
                    layoutId="nav-active-bg"
                    className="absolute inset-0 rounded-full -z-10"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--primary) / 0.12) 0%, hsl(var(--primary) / 0.07) 100%)",
                      border: "1px solid hsl(var(--primary) / 0.40)",
                      boxShadow: "0 0 14px hsl(var(--primary) / 0.18), inset 0 1px 0 rgba(255,255,255,0.15)"
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <MoreHorizontal
                  className={`w-[18px] h-[18px] ${showMore || isMoreActive ? "text-primary" : ""}`}
                />
              </motion.div>
            </button>
          </div>

          {/* Gradient Divider */}
          <div className="nav-divider" />

          {/* AI Button */}
          <motion.button
            onClick={() => setChatOpen(!isChatOpen)}
            className={`floating-nav-ai-btn ${isChatOpen ? "active" : ""}`}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
          >
            <Sparkles className="w-[18px] h-[18px]" />
          </motion.button>

        </div>
      </nav>
    </>
  );
}
