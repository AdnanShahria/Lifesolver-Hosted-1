import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Chrome, Shield, BarChart3, Zap, Download, Sparkles, CheckCircle2, ExternalLink, FolderOpen, Puzzle, ToggleRight, ArrowRight, Package } from "lucide-react";
import { Button } from "./button";

// ─── Constants ────────────────────────────────────────────────────────────────
const DISMISS_KEY = "ls-extension-banner-dismissed";
const EXTENSION_CHECK_ATTR = "data-lifesolver-extension";
const EXTENSION_DOWNLOAD_URL = "/downloads/lifesolver-extension.zip";

// ─── Detection Helpers ──────────────────────────────────────────────────────
function isChromeBrowser(): boolean {
    const ua = navigator.userAgent;
    const isChromium = /Chrome\//.test(ua);
    const isEdge = /Edg\//.test(ua);
    const isOpera = /OPR\//.test(ua);
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

// ─── Installation Steps ─────────────────────────────────────────────────────
const installSteps = [
    {
        step: 1,
        icon: Download,
        title: "Download & Extract",
        description: "The ZIP file has been downloaded. Extract (unzip) it to a folder on your computer.",
        detail: "Right-click the ZIP → \"Extract All\" → Choose a permanent location (don't delete this folder later).",
        color: "from-sky-400 to-cyan-500",
    },
    {
        step: 2,
        icon: Puzzle,
        title: "Open Extensions Page",
        description: "Open Chrome and go to the extensions page.",
        detail: "Type chrome://extensions in the address bar and press Enter.",
        copyable: "chrome://extensions",
        color: "from-indigo-400 to-violet-500",
    },
    {
        step: 3,
        icon: ToggleRight,
        title: "Enable Developer Mode",
        description: "Turn on Developer Mode using the toggle switch.",
        detail: "Find the \"Developer mode\" toggle in the top-right corner and switch it ON.",
        color: "from-amber-400 to-orange-500",
    },
    {
        step: 4,
        icon: FolderOpen,
        title: "Load the Extension",
        description: "Click \"Load unpacked\" and select the extracted folder.",
        detail: "Click the \"Load unpacked\" button → Navigate to the folder you extracted → Select the folder and click \"Select Folder\".",
        color: "from-emerald-400 to-teal-500",
    },
    {
        step: 5,
        icon: CheckCircle2,
        title: "Pin & Enjoy!",
        description: "Pin LifeSolver to your toolbar for quick access.",
        detail: "Click the puzzle icon (🧩) in Chrome toolbar → Find \"LifeSolver\" → Click the pin icon (📌) to keep it visible.",
        color: "from-rose-400 to-pink-500",
    },
];

// ─── Install Guide Modal ────────────────────────────────────────────────────
function InstallGuideModal({ onClose }: { onClose: () => void }) {
    const [copiedStep, setCopiedStep] = useState<number | null>(null);

    function handleCopy(text: string, step: number) {
        navigator.clipboard.writeText(text);
        setCopiedStep(step);
        setTimeout(() => setCopiedStep(null), 2000);
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-hidden rounded-2xl border border-sky-500/20 shadow-2xl shadow-sky-900/30"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 px-6 pt-6 pb-5">
                    {/* Shimmer */}
                    <motion.div
                        className="absolute inset-0 opacity-10"
                        style={{
                            background: "linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.4) 50%, transparent 100%)",
                            backgroundSize: "200% 100%",
                        }}
                        animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />

                    <div className="relative flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Install LifeSolver Extension</h2>
                                <p className="text-sky-300/70 text-sm">Follow these 5 easy steps</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sky-300/50 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Steps */}
                <div className="bg-gradient-to-b from-slate-900 to-slate-950 px-6 py-5 overflow-y-auto max-h-[calc(85vh-120px)]">
                    <div className="space-y-4">
                        {installSteps.map((s, i) => (
                            <motion.div
                                key={s.step}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group"
                            >
                                <div className="flex gap-3">
                                    {/* Step number + connector line */}
                                    <div className="flex flex-col items-center shrink-0">
                                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg`}>
                                            <s.icon className="w-4 h-4 text-white" />
                                        </div>
                                        {i < installSteps.length - 1 && (
                                            <div className="w-0.5 flex-1 bg-gradient-to-b from-sky-400/30 to-transparent mt-2" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 pb-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold text-sky-400/60 uppercase tracking-widest">Step {s.step}</span>
                                        </div>
                                        <h3 className="text-sm font-semibold text-white mb-1">{s.title}</h3>
                                        <p className="text-xs text-sky-200/60 leading-relaxed mb-2">{s.description}</p>
                                        <div className="bg-white/5 border border-white/5 rounded-lg px-3 py-2.5">
                                            <p className="text-xs text-sky-100/80 leading-relaxed">{s.detail}</p>
                                            {s.copyable && (
                                                <button
                                                    onClick={() => handleCopy(s.copyable!, s.step)}
                                                    className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono hover:bg-sky-500/20 transition-colors"
                                                >
                                                    {copiedStep === s.step ? (
                                                        <>
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                                            <span className="text-emerald-400">Copied!</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span>{s.copyable}</span>
                                                            <ExternalLink className="w-3 h-3 opacity-50" />
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Success note */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                    >
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-emerald-300">You're all set!</p>
                                <p className="text-xs text-emerald-300/60 mt-1">
                                    After installing, log into LifeSolver through the extension popup. Your data will sync automatically.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Main Banner Component ──────────────────────────────────────────────────
export function ExtensionInstallBanner() {
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [showGuide, setShowGuide] = useState(false);

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
        // Trigger the ZIP download
        const a = document.createElement("a");
        a.href = EXTENSION_DOWNLOAD_URL;
        a.download = "lifesolver-extension.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Show the installation guide
        setShowGuide(true);
    }

    if (!visible) return null;

    return (
        <>
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
                                            <Download className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Install Extension</span>
                                            <span className="sm:hidden">Install</span>
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

            {/* Installation Guide Modal */}
            <AnimatePresence>
                {showGuide && (
                    <InstallGuideModal onClose={() => setShowGuide(false)} />
                )}
            </AnimatePresence>
        </>
    );
}
