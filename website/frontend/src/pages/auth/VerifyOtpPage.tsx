import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Loader2, ArrowLeft, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/seo/SEO";
import { toast } from "sonner";

export default function VerifyOtpPage() {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(59);
    const [canResend, setCanResend] = useState(false);

    const [searchParams] = useSearchParams();
    const email = searchParams.get("email") || "";

    const { verifyOtp, register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const name = location.state?.name;
    const password = location.state?.password;

    useEffect(() => {
        if (!email) {
            navigate("/login");
        }
    }, [email, navigate]);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    const handleChange = (index: number, value: string) => {
        if (!/^[0-9]*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
        if (pastedData) {
            const newOtp = [...otp];
            for (let i = 0; i < pastedData.length; i++) {
                newOtp[i] = pastedData[i] || "";
            }
            setOtp(newOtp);
            const focusIndex = Math.min(pastedData.length, 5);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
            setError("Please enter a valid 6-digit code");
            return;
        }

        setError("");
        setSuccessMessage("");
        setIsLoading(true);

        const result = await verifyOtp(email, otpCode, name, password);

        if (result.success) {
            toast.success("Verification successful! Welcome to LifeSolver.");
            navigate("/", { replace: true });
        } else {
            setError(result.error || "Verification failed");
            toast.error(result.error || "Verification failed");
        }

        setIsLoading(false);
    };    const handleResend = async () => {
        if (!canResend) return;
        setIsLoading(true);
        setError("");
        setSuccessMessage("");
        
        const result = await register(name || email.split('@')[0], email, password || "dummyPass123");
        
        if (result.success) {
            setSuccessMessage("A new verification code has been sent!");
            toast.success("Verification code sent successfully!");
            setResendTimer(59);
            setCanResend(false);
        } else {
            const errMsg = result.error || "Failed to resend code";
            setError(errMsg);
            toast.error(errMsg);
        }
        setIsLoading(false);
    };

    // Animation presets
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
    };
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <SEO title="Verify Email" description="Verify your email address" />
            
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '45px 45px'
                }} />
                
                {/* Slow floating colorful gradients */}
                <motion.div
                    animate={{ 
                        x: [0, 40, -20, 0], 
                        y: [0, -50, 30, 0],
                        scale: [1, 1.2, 0.85, 1] 
                    }}
                    transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-20 -left-20 w-[450px] h-[450px] bg-primary/10 dark:bg-primary/15 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{ 
                        x: [0, -30, 40, 0], 
                        y: [0, 40, -40, 0],
                        scale: [1, 0.9, 1.15, 1] 
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-20 -right-20 w-[450px] h-[450px] bg-violet-500/10 dark:bg-violet-500/15 rounded-full blur-[100px]"
                />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="w-full max-w-md relative z-10"
            >
                {/* Back Link */}
                <motion.div variants={itemVariants} className="mb-6">
                    <Link 
                        to="/login" 
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Login</span>
                    </Link>
                </motion.div>

                {/* Email Verification Icon & Header */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <motion.div
                        variants={itemVariants}
                        className="relative mb-6"
                    >
                        {/* Outer rotating/pulsing glow outlines */}
                        <div className="absolute -inset-3 bg-gradient-primary rounded-2xl blur-md opacity-30 animate-pulse-glow" />
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-violet-500 rounded-2xl opacity-40 animate-pulse" />
                        
                        <div className="relative w-16 h-16 rounded-2xl bg-card border border-border/80 dark:border-white/10 flex items-center justify-center shadow-xl">
                            <Mail className="w-8 h-8 text-primary animate-float" />
                        </div>
                    </motion.div>

                    <motion.h1 
                        variants={itemVariants}
                        className="text-3xl font-extrabold mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-muted-foreground"
                    >
                        Check your email
                    </motion.h1>
                    
                    <motion.p 
                        variants={itemVariants}
                        className="text-muted-foreground text-sm max-w-sm leading-relaxed"
                    >
                        We sent a 6-digit verification code to <br />
                        <span className="font-semibold text-foreground bg-secondary/80 dark:bg-white/5 px-2 py-0.5 rounded border border-border/50 break-all">{email}</span>
                    </motion.p>
                </div>

                {/* Main OTP Entry Card */}
                <motion.div 
                    variants={itemVariants}
                    className="glass-card p-8 border border-border dark:border-white/5 shadow-2xl relative overflow-hidden"
                >
                    {/* Glowing glass stripe at top */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-primary" />
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: "auto" }}
                                    exit={{ opacity: 0, y: -10, height: 0 }}
                                    className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center"
                                >
                                    {error}
                                </motion.div>
                            )}
                            
                            {successMessage && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: "auto" }}
                                    exit={{ opacity: 0, y: -10, height: 0 }}
                                    className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold text-center"
                                >
                                    {successMessage}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* OTP Grid */}
                        <div className="flex justify-between gap-2 sm:gap-3">
                            {otp.map((digit, index) => (
                                <motion.input
                                    key={index}
                                    whileFocus={{ scale: 1.05, y: -2 }}
                                    ref={(el) => inputRefs.current[index] = el}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className={`w-11 h-14 sm:w-12 sm:h-15 text-center text-2xl font-bold bg-background/50 backdrop-blur-md border-2 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 ${
                                        digit 
                                        ? "border-primary text-primary shadow-[0_0_12px_rgba(var(--primary),0.15)] bg-primary/[0.02]" 
                                        : "border-border dark:border-white/[0.08]"
                                    }`}
                                />
                            ))}
                        </div>

                        {/* Verification Button */}
                        <Button 
                            type="submit" 
                            className="w-full h-12 text-sm font-semibold rounded-xl transition-all duration-300 bg-gradient-primary hover:opacity-95 text-white active:scale-[0.98] shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:pointer-events-none"
                            disabled={isLoading || otp.join("").length !== 6}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Verifying code...</span>
                                </div>
                            ) : (
                                <span>Verify Account</span>
                            )}
                        </Button>
                    </form>

                    {/* Resend Section */}
                    <div className="mt-8 pt-6 border-t border-border/40 dark:border-white/[0.04] text-center">
                        <p className="text-xs text-muted-foreground">
                            Didn't receive the code?{" "}
                            {canResend ? (
                                <button
                                    onClick={handleResend}
                                    disabled={isLoading}
                                    className="text-primary hover:text-primary/80 font-semibold transition-colors inline-flex items-center gap-1 focus:outline-none group/resend"
                                >
                                    <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                                    <span>Resend code</span>
                                </button>
                            ) : (
                                <span className="text-foreground/60 font-medium">
                                    Resend in <span className="font-semibold text-primary">{resendTimer}s</span>
                                </span>
                            )}
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}

