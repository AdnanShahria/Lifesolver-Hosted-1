import { cn } from "@/lib/utils";

/**
 * Base skeleton element — uses CSS variables so it adapts to every theme.
 * The shimmer sweep uses the foreground color at low opacity so it always
 * contrasts against the muted background, even on OLED / Mocha / Nord themes.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton-base", className)}
      {...props}
    />
  );
}

/** A row of text-sized skeleton lines */
function SkeletonText({ lines = 2, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3 rounded", i === lines - 1 && lines > 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

/** A skeleton that mimics a stat card */
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border/30 p-4 space-y-3 bg-card/40", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-8 rounded-xl" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
      <Skeleton className="h-7 w-24 rounded" />
      <Skeleton className="h-3 w-32 rounded" />
    </div>
  );
}

/** A skeleton that mimics a list row item */
function SkeletonListItem({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 py-3 px-4 rounded-xl border border-border/20 bg-card/30", className)}>
      <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-1/2 rounded" />
        <Skeleton className="h-3 w-1/3 rounded" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonListItem };
