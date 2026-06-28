import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { PageLoader } from "@/components/ui/PageLoader";

import WelcomePage from "./pages/auth/WelcomePage";
import PrivacyPolicyPage from "./pages/landing/PrivacyPolicyPage"; // Assuming we moved this
import NotFound from "./pages/shared/NotFound";

import "./index.css";

function IndexShell() {
    return (
        <React.Suspense fallback={<PageLoader />}>
            <Routes>
                <Route path="/" element={<AnimatedPage><WelcomePage /></AnimatedPage>} />
                <Route path="/privacy-policy" element={<AnimatedPage><PrivacyPolicyPage /></AnimatedPage>} />
                <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
            </Routes>
        </React.Suspense>
    );
}

createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
        <LanguageProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <IndexShell />
            </BrowserRouter>
        </LanguageProvider>
    </HelmetProvider>
);
