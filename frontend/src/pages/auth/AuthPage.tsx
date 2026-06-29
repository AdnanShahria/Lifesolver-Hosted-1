import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Eye, EyeOff, Sparkles, Check, X, ArrowRight, Rocket, Star, Users, Brain, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/seo/SEO";

export default function AuthPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login, register, googleLogin, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            window.location.href = "/app";
        }
    }, [isAuthenticated]);

    // Determine initial tab from current URL
    const getInitialTab = () => {
        return window.location.pathname.endsWith("register") ? "register" : "login";
    };

    const [activeTab, setActiveTab] = useState<"login" | "register">(getInitialTab());
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Sync tab state on browser back/forward buttons
    useEffect(() => {
        const handlePopState = () => {
            setActiveTab(getInitialTab());
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    const from = location.state?.from?.pathname || "/";

    const handleTabChange = (tab: "login" | "register") => {
        if (isLoading) return;
        setActiveTab(tab);
        setError("");
        // Update browser URL without triggering React Router route unmounting
        window.history.pushState(null, "", `/auth/${tab}`);
    };

    // Password strength checks (for Register tab)
    const passwordChecks = {
        length: password.length >= 6,
        match: password === confirmPassword && confirmPassword.length > 0,
    };

    const canSubmitRegister = name && email && password && passwordChecks.length && passwordChecks.match;

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const result = await login(email, password);

        if (result.success) {
            window.location.href = "/app";
        } else if (result.requiresVerification) {
            navigate(`/verify-otp?email=${encodeURIComponent(email)}`, { replace: true });
        } else {
            setError(result.error || "Login failed");
        }

        setIsLoading(false);
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!passwordChecks.length) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (!passwordChecks.match) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        const result = await register(name, email, password);

        if (result.success) {
            navigate(`/verify-otp?email=${encodeURIComponent(email)}`, { 
                replace: true,
                state: { email, name, password }
            });
        } else {
            setError(result.error || "Registration failed");
        }

        setIsLoading(false);
    };

    // Left panel dynamic variants for backgrounds
    const bgOpacityStyle = {
        login: activeTab === "login" ? 1 : 0,
        register: activeTab === "register" ? 1 : 0,
    };

    return (
        <div className="min-h-screen flex bg-background">
            <SEO 
                title={activeTab === "login" ? "Login" : "Register"} 
                description={activeTab === "login" ? "Sign in to LifeSolver." : "Create your LifeSolver account."} 
            />

            {/* Left Branding Panel — hidden on mobile */}
            <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative overflow-hidden flex-col justify-between p-10">
                {/* Background crossfade gradients */}
                <div 
                    className="absolute inset-0 bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 transition-opacity duration-700 ease-in-out" 
                    style={{ opacity: bgOpacityStyle.login }} 
                />
                <div 
                    className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 transition-opacity duration-700 ease-in-out" 
                    style={{ opacity: bgOpacityStyle.register }} 
                />

                {/* Grid vs Dots pattern crossfade */}
                <div 
                    className="absolute inset-0 opacity-[0.04] transition-opacity duration-700 ease-in-out" 
                    style={{
                        opacity: activeTab === "login" ? 0.04 : 0,
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }} 
                />
                <div 
                    className="absolute inset-0 opacity-[0.06] transition-opacity duration-700 ease-in-out" 
                    style={{
                        opacity: activeTab === "register" ? 0.06 : 0,
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }} 
                />

                {/* Floating orbs */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Violet Theme Orbs */}
                    <div className="transition-opacity duration-700" style={{ opacity: bgOpacityStyle.login }}>
                        <motion.div
                            animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
                            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-20 left-20 w-64 h-64 bg-violet-500/20 rounded-full blur-[100px]"
                        />
                        <motion.div
                            animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
                            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/15 rounded-full blur-[100px]"
                        />
                    </div>

                    {/* Emerald Theme Orbs */}
                    <div className="transition-opacity duration-700" style={{ opacity: bgOpacityStyle.register }}>
                        <motion.div
                            animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
                            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-16 right-20 w-72 h-72 bg-emerald-500/15 rounded-full blur-[100px]"
                        />
                        <motion.div
                            animate={{ x: [0, 20, 0], y: [0, -30, 0] }}
                            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute bottom-24 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]"
                        />
                    </div>
                </div>

                {/* Logo and Brand Name */}
                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg">
                            <img src="/logo.svg" alt="LifeSolver" className="w-7 h-7" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">LifeSolver</span>
                    </motion.div>
                </div>

                {/* Left Panel Main Visual Content (Dynamic Switch) */}
                <div className="relative z-10 flex-1 flex flex-col justify-center -mt-6">
                    <AnimatePresence mode="wait">
                        {activeTab === "login" ? (
                            <motion.div
                                key="login-visual"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                            >
                                <p className="text-violet-300/80 text-sm font-semibold uppercase tracking-[0.2em] mb-3">Welcome back</p>
                                <h2 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] mb-4">
                                    Your second<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400">brain, reimagined.</span>
                                </h2>
                                <p className="text-white/50 text-base max-w-sm leading-relaxed mb-10">
                                    AI-powered productivity that adapts to you.
                                </p>

                                {/* 3D Tilted App Mockup */}
                                <div className="relative w-full max-w-[420px]" style={{ perspective: '1200px' }}>
                                    <motion.div
                                        animate={{ y: [0, -6, 0] }}
                                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                        className="relative"
                                        style={{ transform: 'rotateX(8deg) rotateY(-3deg)', transformStyle: 'preserve-3d' }}
                                    >
                                        <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/30 via-fuchsia-500/20 to-blue-500/30 rounded-3xl blur-2xl opacity-60" />
                                        <div className="relative bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                                            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                                    <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                                                    <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                                                </div>
                                                <p className="text-white/30 text-[10px] font-mono">life-solver.vercel.app/dashboard</p>
                                                <div className="w-12" />
                                            </div>
                                            <div className="p-5 space-y-4">
                                                <div className="grid grid-cols-3 gap-3">
                                                    {[
                                                        { label: "Tasks Done", value: "18", change: "+5", color: "text-emerald-400" },
                                                        { label: "Focus Time", value: "4.2h", change: "+1.3h", color: "text-blue-400" },
                                                        { label: "AI Actions", value: "32", change: "+12", color: "text-violet-400" },
                                                    ].map((stat, i) => (
                                                        <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5">
                                                            <p className="text-white/40 text-[10px] uppercase tracking-wider">{stat.label}</p>
                                                            <div className="flex items-baseline gap-1.5 mt-1">
                                                                <p className="text-white font-bold text-lg">{stat.value}</p>
                                                                <span className={`text-[10px] font-semibold ${stat.color}`}>{stat.change}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <p className="text-white/50 text-xs font-medium">Weekly Overview</p>
                                                        <div className="flex gap-1">
                                                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                                                                <span key={i} className="text-[8px] text-white/20 w-4 text-center">{d}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <svg viewBox="0 0 280 60" className="w-full h-12">
                                                        <defs>
                                                            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                                                                <stop offset="0%" stopColor="#8b5cf6" />
                                                                <stop offset="50%" stopColor="#d946ef" />
                                                                <stop offset="100%" stopColor="#3b82f6" />
                                                            </linearGradient>
                                                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                                                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                                                            </linearGradient>
                                                        </defs>
                                                        <motion.path
                                                            d="M 0 45 Q 20 35 40 30 T 80 20 T 120 35 T 160 15 T 200 25 T 240 10 T 280 18"
                                                            fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round"
                                                            initial={{ pathLength: 0 }}
                                                            animate={{ pathLength: 1 }}
                                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                                        />
                                                        <path
                                                            d="M 0 45 Q 20 35 40 30 T 80 20 T 120 35 T 160 15 T 200 25 T 240 10 T 280 18 V 60 H 0 Z"
                                                            fill="url(#areaGrad)"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="flex items-center gap-3 bg-gradient-to-r from-violet-500/10 to-blue-500/10 rounded-xl px-4 py-3 border border-violet-500/20">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0">
                                                        <Sparkles className="w-3 h-3 text-white" />
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="text-violet-200/85 text-xs font-medium truncate">
                                                            ✨ "You have 3 tasks due today. Want me to prioritize?"
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="register-visual"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                            >
                                <p className="text-emerald-300/80 text-sm font-semibold uppercase tracking-[0.2em] mb-3">Get started free</p>
                                <h2 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] mb-4">
                                    One app for<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400">your entire life.</span>
                                </h2>
                                <p className="text-white/50 text-base max-w-sm leading-relaxed">
                                    Tasks, finances, notes, and AI — beautifully unified.
                                </p>

                                {/* Orbital Ring System */}
                                <div className="mt-6 relative w-full max-w-[420px] h-[280px]">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px]">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0 rounded-full border border-white/10"
                                        />
                                        <motion.div
                                            animate={{ rotate: -360 }}
                                            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-[-20px] rounded-full border border-white/[0.06] border-dashed"
                                        />
                                    </div>

                                    {/* Center brain node */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 z-30">
                                        <div className="relative w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl border border-emerald-400/30">
                                            <Brain className="w-6 h-6 text-white" />
                                        </div>
                                    </div>

                                    {/* Orbiting Nodes */}
                                    {[
                                        { icon: Check, label: "Tasks", color: "from-blue-500 to-indigo-600", angle: 0, radius: 100 },
                                        { icon: Database, label: "Finance", color: "from-emerald-500 to-green-600", angle: 120, radius: 100 },
                                        { icon: Sparkles, label: "Notes", color: "from-amber-500 to-orange-600", angle: 240, radius: 100 },
                                    ].map((node, i) => {
                                        const x = Math.cos((node.angle * Math.PI) / 180) * node.radius;
                                        const y = Math.sin((node.angle * Math.PI) / 180) * node.radius;
                                        return (
                                            <div
                                                key={i}
                                                className="absolute z-20"
                                                style={{
                                                    top: `calc(50% + ${y}px - 20px)`,
                                                    left: `calc(50% + ${x}px - 20px)`,
                                                }}
                                            >
                                                <div className={`w-10 h-10 bg-gradient-to-br ${node.color} rounded-xl flex items-center justify-center shadow-lg border border-white/10`}>
                                                    <node.icon className="w-4.5 h-4.5 text-white" />
                                                </div>
                                                <p className="text-white/60 text-[9px] font-semibold text-center mt-1 uppercase tracking-wider">{node.label}</p>
                                            </div>
                                        );
                                    })}

                                    {/* Feature pills */}
                                    <div className="absolute -right-2 top-8 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-3 py-1 shadow-lg">
                                        <p className="text-white/70 text-[9px] font-semibold">🚀 Set up in 2 min</p>
                                    </div>
                                    <div className="absolute -left-2 bottom-12 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-3 py-1 shadow-lg">
                                        <p className="text-white/70 text-[9px] font-semibold">⭐ Free forever</p>
                                    </div>
                                    <div className="absolute right-4 bottom-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full px-3 py-1 shadow-lg border border-emerald-400/20">
                                        <p className="text-white text-[9px] font-semibold">👥 1K+ Users</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="relative z-10">
                    <p className="text-white/30 text-sm">© 2026 LifeSolver. All rights reserved.</p>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 flex items-start lg:items-center justify-center px-4 py-6 sm:p-8 relative overflow-y-auto min-h-screen lg:min-h-0" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)', paddingTop: 'env(safe-area-inset-top, 16px)' }}>
                {/* Mobile-only background blobs */}
                <div className="lg:hidden fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[420px] relative z-10 my-auto py-2"
                >
                    {/* Main UI Form Card */}
                    <div className="rounded-2xl sm:rounded-3xl border border-violet-300/60 dark:border-violet-500/30 bg-card/60 backdrop-blur-md p-5 sm:p-6 shadow-xl relative overflow-hidden">
                        
                        {/* Mobile Logo */}
                        <div className="lg:hidden text-center mb-5">
                            <div className="inline-flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
                                    <img src="/logo.svg" alt="LifeSolver" className="w-6 h-6 object-contain" />
                                </div>
                                <span className="text-2xl font-bold text-blue-800 dark:text-blue-400">LifeSolver</span>
                            </div>
                        </div>

                        {/* Top Segment Control (Tabs) */}
                        <div className="grid grid-cols-2 p-1 bg-violet-100/50 dark:bg-violet-950/20 rounded-full mb-6 border border-violet-200/50 dark:border-violet-800/20 relative">
                            <button
                                type="button"
                                onClick={() => handleTabChange("register")}
                                className={`py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all relative ${
                                    activeTab === "register" 
                                        ? "text-blue-900 dark:text-white" 
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {activeTab === "register" && (
                                    <motion.div
                                        layoutId="active-tab-bg"
                                        className="absolute inset-0 bg-white dark:bg-violet-900 rounded-full shadow border border-violet-200 dark:border-violet-700/30"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">Create Account</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTabChange("login")}
                                className={`py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all relative ${
                                    activeTab === "login" 
                                        ? "text-blue-900 dark:text-white" 
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {activeTab === "login" && (
                                    <motion.div
                                        layoutId="active-tab-bg"
                                        className="absolute inset-0 bg-white dark:bg-violet-900 rounded-full shadow border border-violet-200 dark:border-violet-700/30"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">Sign In</span>
                            </button>
                        </div>

                        {/* Header Titles */}
                        <div className="mb-5">
                            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                                {activeTab === "login" ? "Sign In" : "Create Account"}
                            </h1>
                            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                                {activeTab === "login" 
                                    ? "Welcome back! Enter your credentials to continue." 
                                    : "Fill in your details to get started."}
                            </p>
                        </div>

                        {/* Form Submission */}
                        <form onSubmit={activeTab === "login" ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm flex items-center gap-2 px-5"
                                >
                                    <div className="w-2 h-2 rounded-full bg-destructive shrink-0" />
                                    {error}
                                </motion.div>
                            )}

                            {/* Full Name field (Register only) */}
                            <AnimatePresence initial={false}>
                                {activeTab === "register" && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.25, ease: "easeInOut" }}
                                        className="space-y-1.5"
                                    >
                                        <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="Adnan Shahria"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required={activeTab === "register"}
                                            className="h-11 sm:h-12 rounded-full bg-background border-border/50 focus:border-primary transition-colors px-4 sm:px-5 text-sm sm:text-base"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Email field (Both) */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                    className="h-11 sm:h-12 rounded-full bg-background border-border/50 focus:border-primary transition-colors px-4 sm:px-5 text-sm sm:text-base"
                                />
                            </div>

                            {/* Password field (Both) */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                                    {activeTab === "login" && (
                                        <Link to="/forgot-password" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete={activeTab === "login" ? "current-password" : "new-password"}
                                        className="h-11 sm:h-12 pr-12 rounded-full bg-background border-border/50 focus:border-primary transition-colors px-4 sm:px-5 text-sm sm:text-base"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary/50"
                                    >
                                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password field (Register only) */}
                            <AnimatePresence initial={false}>
                                {activeTab === "register" && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.25, ease: "easeInOut" }}
                                        className="space-y-1.5"
                                    >
                                        <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required={activeTab === "register"}
                                            autoComplete="new-password"
                                            className="h-11 sm:h-12 rounded-full bg-background border-border/50 focus:border-primary transition-colors px-4 sm:px-5 text-sm sm:text-base"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Password validation indicators (Register only) */}
                            {activeTab === "register" && password && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-1.5 pt-1"
                                >
                                    <div className={`flex items-center gap-2 text-xs sm:text-sm ${passwordChecks.length ? "text-emerald-500" : "text-muted-foreground"}`}>
                                        {passwordChecks.length ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                        <span>At least 6 characters</span>
                                    </div>
                                    {confirmPassword && (
                                        <div className={`flex items-center gap-2 text-xs sm:text-sm ${passwordChecks.match ? "text-emerald-500" : "text-red-400"}`}>
                                            {passwordChecks.match ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                            <span>Passwords match</span>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Submit Button */}
                            <Button 
                                type="submit" 
                                className="w-full h-11 sm:h-12 text-sm sm:text-base rounded-full font-semibold group mt-2 bg-blue-800 hover:bg-blue-900 text-white" 
                                disabled={isLoading || (activeTab === "register" && !canSubmitRegister)}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        {activeTab === "login" ? "Signing in..." : "Creating account..."}
                                    </>
                                ) : (
                                    <>
                                        {activeTab === "login" ? "Sign In" : "Create Account"}
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
