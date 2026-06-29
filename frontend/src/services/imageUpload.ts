import { apiFetch } from "@/lib/api";

export async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("image", file);

    try {
        const data = await apiFetch("/upload", {
            method: "POST",
            body: formData,
        });

        if (!data || !data.success || !data.url) {
            throw new Error("Failed to upload image via backend proxy.");
        }

        return data.url;
    } catch (error: any) {
        throw new Error(error.message || "Failed to upload image");
    }
}
