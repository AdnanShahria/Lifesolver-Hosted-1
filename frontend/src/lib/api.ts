
export async function apiFetch(path: string, options: RequestInit = {}) {
    const token = localStorage.getItem("lifeos-token");
    
    // Auto-detect if we need to remove /api from path provided since backend is mapped to /api
    const relativePath = path.startsWith('/api') ? path : `/api${path.startsWith('/') ? path : `/${path}`}`;

    // Support Capacitor by prepending VITE_BACKEND_URL if it is an absolute URL
    let backendUrl = import.meta.env.VITE_BACKEND_URL || "";
    const isCapacitor = window.location.origin.startsWith("capacitor:") || 
                        window.location.origin.startsWith("file:") ||
                        (window.location.origin.startsWith("http://localhost") && !window.location.port);
    
    if (backendUrl.includes("localhost") && import.meta.env.PROD && !isCapacitor) {
        backendUrl = ""; // Ignore misconfigured localhost URL in web production
    }

    const base = backendUrl.startsWith("http") && (isCapacitor || !window.location.origin.includes("localhost")) 
        ? backendUrl.replace(/\/$/, "") 
        : "";
    
    const urlPath = `${base}${relativePath}`;
    
    const isFormData = options.body instanceof FormData;
    
    const headers: Record<string, string> = {
        ...(!isFormData ? { "Content-Type": "application/json" } : {}),
        ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    let response: Response;
    try {
        response = await fetch(urlPath, {
            ...options,
            headers,
        });
    } catch (networkError: any) {
        console.error(`[apiFetch] Network error on ${urlPath}:`, networkError.message);
        throw new Error(`Network error: Unable to reach the server. Please check your connection.`);
    }

    if (response.status === 401 && !urlPath.includes("/auth/")) {
        // Unauthorized, potentially expired token -> remove and redirect
        localStorage.removeItem("lifeos-token");
        window.dispatchEvent(new Event("unauthorized"));
        throw new Error("Unauthorized");
    }

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        const errorMsg = err.error || `Request failed with status ${response.status}`;
        const hint = err.hint ? ` (${err.hint})` : "";
        const detail = err.detail ? ` [${err.detail}]` : "";
        console.error(`[apiFetch] ${response.status} on ${urlPath}: ${errorMsg}${detail}${hint}`);
        throw new Error(errorMsg);
    }

    // Attempt to parse JSON
    return response.json().catch(() => ({}));
}
