import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { AIChatInterface } from "../ai/AIChatInterface";
import { GlobalSearch } from "../ui/GlobalSearch";
import { AnimatedPage } from "./AnimatedPage";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { useTheme } from "@/hooks/useTheme";

export function DashboardLayout() {
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { theme } = useTheme();

    useAppData(); // Kicks off the background prefetch of all app data

    return (
        <div className="min-h-screen bg-background">
            {/* Ambient background gradient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {theme === "light" ? (
                    <>
                        {/* Blue smoky foggy theme with 5% opacity */}
                        <div className="absolute top-[-10%] left-[-10%] w-[75vw] h-[75vw] max-w-[1000px] bg-blue-500/5 rounded-full blur-[120px] animate-smoke-1" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[65vw] h-[65vw] max-w-[900px] bg-sky-400/5 rounded-full blur-[130px] animate-smoke-2" />
                        <div className="absolute top-1/4 left-1/3 w-[55vw] h-[55vw] max-w-[800px] bg-indigo-400/5 rounded-full blur-[140px] animate-smoke-3" />
                    </>
                ) : (
                    <>
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
                    </>
                )}
            </div>

            {/* Sidebar - Desktop only */}
            <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

            {/* Main content */}
            <main className={`transition-all duration-300 ${isSidebarCollapsed ? "md:ml-20" : "md:ml-64"} min-h-screen md:pb-8 mobile-fixed-layout flex flex-col`}>
                <div className="max-w-6xl w-full mx-auto px-3 sm:px-4 md:px-6 pt-4 sm:pt-6 md:pt-6 pb-24 md:pb-8 flex-1">
                    <AnimatePresence mode="wait">
                        <AnimatedPage key={location.pathname}>
                            <Outlet />
                        </AnimatedPage>
                    </AnimatePresence>
                </div>
            </main>

            {/* AI Chat Interface */}
            <AIChatInterface />
            <GlobalSearch />

            {/* Bottom Nav - Mobile only */}
            <BottomNav />
        </div>
    );
}
