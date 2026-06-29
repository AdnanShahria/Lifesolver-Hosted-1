import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PageSkeleton } from "@/components/ui/PageSkeleton";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <PageSkeleton />;
    }

    if (!isAuthenticated) {
        // Redirect out of the /app shell to the root welcome page
        window.location.href = "/";
        return null;
    }

    return <>{children}</>;
}
