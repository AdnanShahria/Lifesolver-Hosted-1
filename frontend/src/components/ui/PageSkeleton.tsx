import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
    return (
        <div className="min-h-screen w-full bg-background flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Skeleton (Desktop only) */}
            <div className="hidden md:flex flex-col w-64 border-r border-border/40 p-4 gap-6 bg-card/10 backdrop-blur-sm z-10">
                <div className="flex items-center gap-3 px-2 mb-4">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-6 w-32 rounded-md" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                </div>
                <div className="mt-auto space-y-2">
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="flex-1 flex flex-col relative">
                {/* Ambient background for extra premium feel */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
                </div>
                
                <div className="p-4 md:p-8 flex flex-col gap-6 max-w-6xl w-full mx-auto relative z-10">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-2 md:mb-6 pt-2 md:pt-0">
                        <div className="space-y-2 w-1/2">
                            <Skeleton className="h-8 w-2/3 md:w-1/2 rounded-lg" />
                            <Skeleton className="h-4 w-1/3 md:w-1/4 rounded-md" />
                        </div>
                        <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-full" />
                    </div>
                    
                    {/* Top Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        <Skeleton className="h-24 md:h-32 w-full rounded-2xl md:rounded-3xl" />
                        <Skeleton className="h-24 md:h-32 w-full rounded-2xl md:rounded-3xl" />
                        <Skeleton className="h-24 md:h-32 w-full rounded-2xl md:rounded-3xl" />
                        <Skeleton className="h-24 md:h-32 w-full rounded-2xl md:rounded-3xl hidden md:block" />
                    </div>
                    
                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2 md:mt-4 flex-1">
                        <div className="lg:col-span-2 space-y-4">
                            <Skeleton className="h-[300px] md:h-[400px] w-full rounded-3xl" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-[200px] md:h-[250px] w-full rounded-3xl" />
                            <Skeleton className="h-[200px] md:h-[135px] w-full rounded-3xl" />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Bottom Nav Skeleton (Mobile only) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] border-t border-border/40 bg-background/80 backdrop-blur-lg flex justify-around items-center px-4 z-50 mb-safe">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-12 w-12 rounded-2xl -translate-y-4 border-4 border-background" />
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
        </div>
    );
}
