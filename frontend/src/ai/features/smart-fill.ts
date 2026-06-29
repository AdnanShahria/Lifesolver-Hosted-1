import { callGroqAPI, sanitizeJsonString } from "../core/groq-client";

export async function smartFillForm<T>(
    unstructuredText: string,
    schemaDescription: string,
    paramName: string = "formData"
): Promise<T> {
    const systemPrompt = `
    You are a Smart Fill AI. Your job is to extract structured data from unstructured user text to fill a form.
    
    TARGET JSON SCHEMA:
    ${schemaDescription}
    
    INSTRUCTIONS:
    1. Extract relevant information from the user's text.
    2. Map it to the keys in the target schema.
    3. Infer missing fields if obvious (e.g., "gaming chair" -> category: "Furniture").
    4. Return ONLY valid JSON.
    `;

    const userMessage = `Input Text: "${unstructuredText}"`;

    try {
        const result = await callGroqAPI([
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
        ]);

        // Attempt to parse the JSON with sanitization
        return JSON.parse(sanitizeJsonString(result)) as T;
    } catch (error) {
        console.error("Smart Fill Error:", error);
        throw new Error("Failed to parse input text.");
    }
}
