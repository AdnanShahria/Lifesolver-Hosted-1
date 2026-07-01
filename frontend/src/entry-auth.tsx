import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { PageLoader } from "@/components/ui/PageLoader";
import { AnimatePresence } from "framer-motion";

import AuthPage from "./pages/auth/AuthPage";
import VerifyOtpPage from "./pages/auth/VerifyOtpPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import NotFound from "./pages/shared/NotFound";

import "./index.css";

const queryClient = new QueryClient();
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "no-client-id";

function AuthShell() {
    const location = useLocation();
    return (
        <React.Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<AnimatedPage><AuthPage /></AnimatedPage>} />
                    <Route path="/register" element={<AnimatedPage><AuthPage /></AnimatedPage>} />
                    <Route path="/verify-otp" element={<AnimatedPage><VerifyOtpPage /></AnimatedPage>} />
                    <Route path="/forgot-password" element={<AnimatedPage><ForgotPasswordPage /></AnimatedPage>} />
                    <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
                </Routes>
            </AnimatePresence>
        </React.Suspense>
    );
}

createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
        <LanguageProvider>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <Toaster />
                        <Sonner theme="system" />
                        <BrowserRouter basename="/auth" future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
                            <AuthShell />
                        </BrowserRouter>
                    </AuthProvider>
                </QueryClientProvider>
            </GoogleOAuthProvider>
        </LanguageProvider>
    </HelmetProvider>
);
