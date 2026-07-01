import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AIProvider } from "@/contexts/AIContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { PageLoader } from "@/components/ui/PageLoader";

import Index from "./pages/landing/LandingPage";
import TasksPage from "./pages/tasks/TasksPage";
import FinancePage from "./pages/finance/FinancePage";
import NotesPage from "./pages/notes/NotesPage";
import InventoryPage from "./pages/inventory/InventoryPage";
import StudyPage from "./pages/study/StudyPage";
import HabitsPage from "./pages/habits/HabitsPage";
import SettingsPage from "./pages/settings/SettingsPage";
import NotFound from "./pages/shared/NotFound";

import "./index.css";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
        },
    },
});

function AppShell() {
    return (
        <React.Suspense fallback={<PageLoader />}>
            <Routes>
                <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Index />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/finance" element={<FinancePage />} />
                    <Route path="/notes" element={<NotesPage />} />
                    <Route path="/inventory" element={<InventoryPage />} />
                    <Route path="/study" element={<StudyPage />} />
                    <Route path="/habits" element={<HabitsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Route>
                <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
            </Routes>
        </React.Suspense>
    );
}

createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
        <LanguageProvider>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter basename="/app" future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
                    <AuthProvider>
                        <AIProvider>
                            <TooltipProvider>
                                <Toaster />
                                <Sonner theme="system" />
                                <AppShell />
                            </TooltipProvider>
                        </AIProvider>
                    </AuthProvider>
                </BrowserRouter>
            </QueryClientProvider>
        </LanguageProvider>
    </HelmetProvider>
);
