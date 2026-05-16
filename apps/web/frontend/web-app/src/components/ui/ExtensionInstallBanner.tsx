import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Chrome, Shield, BarChart3, Zap, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "./button";

// ─── Constants ────────────────────────────────────────────────────────────────
const DISMISS_KEY = "ls-extension-banner-dismissed";
const EXTENSION_CHECK_ATTR = "data-lifesolver-extension";

// TODO: Replace with your actual Chrome Web Store extension ID after publishing
const CHROME_STORE_URL = "https://chrome.google.com/webstore/detail/lifesolver-the-growth-hacker/YOUR_EXTENSION_ID_HERE";

// ─── Detection Helpers ──────────────────────────────────────────────────────
function isChromeBrowser(): boolean {
    const ua = navigator.userAgent;
    // Chrome but not Edge, Opera, or Brave (they also use Chromium)
    const isChromium = /Chrome\//.test(ua);
    const isEdge = /Edg\//.test(ua);
    const isOpera = /OPR\//.test(ua);
    // Brave detection
    const isBrave = (navigator as any).brave !== undefined;
    return isChromium && !isEdge && !isOpera && !isBrave;
}

function isExtensionInstalled(): boolean {
    return document.documentElement.hasAttribute(EXTENSION_CHECK_ATTR);
}

// ─── Feature Pills ──────────────────────────────────────────────────────────
const features = [
    { icon: Shield, label: "Block Distractions", color: "from-teal-400 to-cyan-500" },
    { icon: BarChart3, label: "Usage Analytics", color: "from-sky-400 to-blue-500" },
    { icon: Zap, label: "Focus Engine", color: "from-amber-400 to-orange-500" },
];

// ─── Component ──────────────────────────────────────────────────────────────
export function ExtensionInstallBanner() {
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Don't show if not Chrome
        if (!isChromeBrowser()) return;

        // Don't show if previously dismissed
        if (localStorage.getItem(DISMISS_KEY) === "true") return;

        // Wait a moment for the extension content script to inject its marker
        const timer = setTimeout(() => {
            if (!isExtensionInstalled()) {
                setVisible(true);
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    function handleDismiss() {
        setDismissed(true);
        setTimeout(() => {
            setVisible(false);
            localStorage.setItem(DISMISS_KEY, "true");
        }, 400);
    }

    function handleInstall() {
        window.open(CHROME_STORE_URL, "_blank", "noopener,noreferrer");
    }

    if (!visible) return null;

    return (
        <AnimatePresence>
            {!dismissed && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="fixed top-0 left-0 right-0 z-[9999]"
                    id="extension-install-banner"
                >
                    {/* Backdrop blur strip */}
                    <div className="relative overflow-hidden">
                        {/* Background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-950/95 via-indigo-950/95 to-sky-950/95 backdrop-blur-xl" />

                        {/* Animated shimmer */}
                        <motion.div
                            className="absolute inset-0 opacity-20"
                            style={{
                                background: "linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.3) 50%, transparent 100%)",
                                backgroundSize: "200% 100%",
                            }}
                            animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />

                        {/* Border glow at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />

                        {/* Content */}
                        <div className="relative z-10 max-w-6xl mx-auto px-4 py-3 sm:py-3.5">
                            <div className="flex items-center justify-between gap-3 sm:gap-6">
                                {/* Left side: Chrome icon + message */}
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                    {/* Chrome icon with pulse */}
                                    <div className="relative shrink-0 hidden sm:block">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400/20 to-indigo-500/20 border border-sky-400/30 flex items-center justify-center">
                                            <Chrome className="w-5 h-5 text-sky-400" />
                                        </div>
                                        <motion.div
                                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400"
                                            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                            <span className="text-white font-semibold text-sm sm:text-base truncate">
                                                Supercharge your LifeSolver
                                            </span>
                                        </div>
                                        <p className="text-sky-200/70 text-xs sm:text-sm truncate">
                                            Install the Growth Hacker extension for distraction blocking & focus tools
                                        </p>
                                    </div>
                                </div>

                                {/* Center: Feature pills (hidden on mobile) */}
                                <div className="hidden lg:flex items-center gap-2 shrink-0">
                                    {features.map((f) => (
                                        <div
                                            key={f.label}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-sky-200/80"
                                        >
                                            <f.icon className="w-3 h-3" />
                                            {f.label}
                                        </div>
                                    ))}
                                </div>

                                {/* Right side: CTA + dismiss */}
                                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                    <Button
                                        onClick={handleInstall}
                                        className="bg-gradient-to-r from-sky-400 to-cyan-500 text-white font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 h-auto rounded-full shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-[1.03] transition-all duration-200 flex items-center gap-1.5"
                                        id="extension-install-cta"
                                    >
                                        <Chrome className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Add to Chrome</span>
                                        <span className="sm:hidden">Install</span>
                                        <ExternalLink className="w-3 h-3 opacity-60" />
                                    </Button>

                                    <button
                                        onClick={handleDismiss}
                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sky-300/50 hover:text-white hover:bg-white/10 transition-all duration-200"
                                        aria-label="Dismiss extension install banner"
                                        id="extension-banner-dismiss"
                                    >
                                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
