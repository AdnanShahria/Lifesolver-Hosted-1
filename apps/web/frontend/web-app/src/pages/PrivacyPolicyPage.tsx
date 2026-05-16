import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Lock, Eye, Database, Trash2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo/SEO";

export default function PrivacyPolicyPage() {
    const sections = [
        {
            icon: Database,
            title: "Information We Collect",
            content: [
                "**Account Information**: When you register, we collect your name, email address, and encrypted password.",
                "**User Content**: Tasks, notes, financial records, habits, study materials, and inventory data you create within the app.",
                "**Extension Data**: If you use the LifeSolver browser extension, we collect browsing usage analytics (time spent per domain), friction interaction data, and journal entries — all synced to your account for personalized productivity insights.",
                "**Device Information**: Browser type, operating system, and device type for compatibility and performance optimization.",
                "We do NOT collect or store passwords in plain text, payment card details, or sell any user data to third parties."
            ]
        },
        {
            icon: Eye,
            title: "How We Use Your Data",
            content: [
                "**Productivity Analytics**: Your browsing data and task completion rates power the Intelligence Dashboard and AI-driven insights.",
                "**Personalization**: Orbit AI uses your tasks, habits, and financial data to provide contextual, personalized recommendations.",
                "**Friction Engine**: The Growth Hacker friction features use domain-level browsing data to apply appropriate focus aids.",
                "**Sync**: Your data is synced across devices to ensure a seamless experience between the web app and browser extension.",
                "We never use your data for advertising. Your productivity data is yours."
            ]
        },
        {
            icon: Lock,
            title: "Data Security",
            content: [
                "All data in transit is encrypted using TLS 1.3 (HTTPS).",
                "Passwords are hashed using industry-standard bcrypt algorithms.",
                "Authentication tokens are securely stored and expire automatically.",
                "The browser extension stores data locally in Chrome's secure storage API and only syncs with your authenticated account.",
                "We conduct regular security reviews of our codebase and infrastructure."
            ]
        },
        {
            icon: Shield,
            title: "Browser Extension Permissions",
            content: [
                "**storage**: Stores your settings, cached data, and usage analytics locally on your device.",
                "**tabs**: Tracks which domain you're visiting to power usage analytics and friction features.",
                "**alarms**: Schedules periodic data syncs and detox timer countdowns.",
                "**activeTab**: Allows the extension popup to interact with the current tab.",
                "**host_permissions (<all_urls>)**: Required to inject the content script that powers focus gates, feed hiding, scroll friction, and visual friction across all websites. Without this, the Growth Hacker engine cannot function.",
                "We request only the minimum permissions necessary. The extension does NOT read page content, form inputs, passwords, or personal messages."
            ]
        },
        {
            icon: Trash2,
            title: "Data Retention & Deletion",
            content: [
                "Your data is retained as long as your account is active.",
                "You can delete individual items (tasks, notes, transactions) at any time from the app.",
                "To delete your entire account and all associated data, contact us at the email below.",
                "Extension usage data older than 90 days is automatically purged from our servers.",
                "Local extension data can be cleared at any time by uninstalling the extension or clearing Chrome storage."
            ]
        },
        {
            icon: Mail,
            title: "Contact & Your Rights",
            content: [
                "You have the right to access, correct, or delete your personal data at any time.",
                "You can export your data from the Settings page in the app.",
                "For any privacy concerns, data deletion requests, or questions, contact us at: **lifesolver.privacy@gmail.com**",
                "This privacy policy may be updated periodically. We will notify users of significant changes via the app."
            ]
        }
    ];

    return (
        <main className="min-h-screen bg-background">
            <SEO
                title="Privacy Policy | LifeSolver"
                description="LifeSolver's privacy policy — how we collect, use, and protect your data across the web app and browser extension."
            />

            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 left-1/4 w-[700px] h-[700px] rounded-full blur-[160px]"
                    style={{ background: "radial-gradient(circle, rgba(77,208,225,0.08) 0%, transparent 70%)" }} />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
                    style={{ background: "radial-gradient(circle, rgba(128,222,234,0.06) 0%, transparent 70%)" }} />
            </div>

            {/* Header */}
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-20">
                {/* Back button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-8"
                >
                    <Link to="/welcome">
                        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Button>
                    </Link>
                </motion.div>

                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-400/10 text-sky-500 text-sm font-medium mb-4 border border-sky-400/20">
                        <Shield className="w-4 h-4" />
                        Privacy & Security
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        Privacy <span className="text-gradient-ice">Policy</span>
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Last updated: May 16, 2026 — We take your privacy seriously. This policy explains how LifeSolver collects, uses, and protects your data.
                    </p>
                </motion.div>

                {/* Sections */}
                <div className="space-y-6">
                    {sections.map((section, i) => (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                            className="glass-card p-6 sm:p-8 rounded-2xl border border-sky-200/30 dark:border-sky-800/30"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400/20 to-cyan-500/20 flex items-center justify-center">
                                    <section.icon className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                                </div>
                                <h2 className="text-lg sm:text-xl font-semibold text-foreground">{section.title}</h2>
                            </div>
                            <ul className="space-y-3">
                                {section.content.map((item, j) => (
                                    <li key={j} className="text-sm text-muted-foreground leading-relaxed pl-4 border-l-2 border-sky-400/20">
                                        <span dangerouslySetInnerHTML={{
                                            __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-medium">$1</strong>')
                                        }} />
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                {/* Footer note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center mt-12 text-sm text-muted-foreground"
                >
                    <p>LifeSolver — Your data, your control. Always.</p>
                    <p className="mt-2">
                        <Link to="/welcome" className="text-sky-500 hover:text-sky-400 transition-colors">
                            Return to Home →
                        </Link>
                    </p>
                </motion.div>
            </div>
        </main>
    );
}
