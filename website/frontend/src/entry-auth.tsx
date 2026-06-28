import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyOtpPage from "./pages/auth/VerifyOtpPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import NotFound from "./pages/shared/NotFound";

import "./index.css";

const queryClient = new QueryClient();
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "no-client-id";

function AuthShell() {
    return (
        <React.Suspense fallback={<PageLoader />}>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
                <Route path="/register" element={<AnimatedPage><RegisterPage /></AnimatedPage>} />
                <Route path="/verify-otp" element={<AnimatedPage><VerifyOtpPage /></AnimatedPage>} />
                <Route path="/forgot-password" element={<AnimatedPage><ForgotPasswordPage /></AnimatedPage>} />
                <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
            </Routes>
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
                        <BrowserRouter basename="/auth" future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                            <AuthShell />
                        </BrowserRouter>
                    </AuthProvider>
                </QueryClientProvider>
            </GoogleOAuthProvider>
        </LanguageProvider>
    </HelmetProvider>
);
