// Groq API Client

import { ChatMessage, AIIntent } from './types';

const _envUrl = import.meta.env.VITE_BACKEND_URL || "";
const BASE_URL = (_envUrl.includes("localhost") && import.meta.env.PROD) 
    ? "/api/ai/enhance" 
    : (_envUrl ? _envUrl.replace('/api/auth', '/api/ai/enhance') : "/api/ai/enhance");

export async function callGroqAPI(
    messages: ChatMessage[],
    options: {
        temperature?: number;
        maxTokens?: number;
    } = {}
): Promise<string> {
    console.log("Sending chat request to AI proxy...");

    // Ensure the system prompt strongly enforces raw JSON without markdown formatting
    // We inject a strong reminder to the last system message just in case
    const enhancedMessages = messages.map(m => {
        if (m.role === 'system') {
            return {
                ...m,
                content: m.content + "\n\nCRITICAL: Output ONLY raw JSON payload. Do NOT wrap in ```json or any other markdown fences. Start the response with { and end with }. Your ENTIRE output must be exactly ONE JSON object. For multiple actions, use {\"actions\": [...], \"response_text\": \"...\"}. NEVER output multiple JSON objects concatenated like {...}{...}."
            };
        }
        return m;
    });

    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            messages: enhancedMessages,
            temperature: options.temperature,
            max_tokens: options.maxTokens,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("AI Proxy Error Body:", errorBody);
        throw new Error(`AI proxy error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();

    if (data.provider === "1st ai model") {
        console.log("accurately, received reply from 1st ai model (Qwen 3.5)");
    } else if (data.provider === "2nd model") {
        console.log("Received reply from 2nd model (Groq)");
        if (data.debug) {
            console.warn("⚠️ HF Fallback Reason:", data.debug);
        }
    }

    if (!data.success || !data.content) {
        throw new Error(data.error || "AI returned empty response");
    }

    // Clean any markdown code blocks if the AI disobeyed
    let content = data.content;
    if (content.startsWith("```json")) {
        content = content.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (content.startsWith("```")) {
        content = content.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    return content.trim();
}

// Split concatenated JSON objects like `{...}{...}{...}` into individual JSON strings.
// This handles the case where the AI returns multiple objects without array wrapping.
function splitConcatenatedJSON(raw: string): string[] {
    const objects: string[] = [];
    let depth = 0;
    let start = -1;

    for (let i = 0; i < raw.length; i++) {
        const ch = raw[i];
        if (ch === '{') {
            if (depth === 0) start = i;
            depth++;
        } else if (ch === '}') {
            depth--;
            if (depth === 0 && start !== -1) {
                objects.push(raw.substring(start, i + 1));
                start = -1;
            }
        }
    }

    return objects;
}

/**
 * Safely sanitizes a raw string containing JSON by:
 * 1. Extracting only the JSON portion (from the first '{' or '[' to the last '}' or ']')
 * 2. Escaping literal newlines, tabs, and carriage returns that reside inside JSON string values.
 */
export function sanitizeJsonString(raw: string): string {
    const trimmed = raw.trim();
    
    // Find the bounds of the outer JSON object or array
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    const firstBracket = trimmed.indexOf('[');
    const lastBracket = trimmed.lastIndexOf(']');
    
    let start = -1;
    let end = -1;
    
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        start = firstBrace;
        end = lastBrace;
    } else if (firstBracket !== -1) {
        start = firstBracket;
        end = lastBracket;
    }
    
    if (start === -1 || end === -1 || end < start) {
        return trimmed;
    }
    
    const jsonToParse = trimmed.substring(start, end + 1);
    
    let result = "";
    let inString = false;
    let escape = false;
    
    for (let i = 0; i < jsonToParse.length; i++) {
        const char = jsonToParse[i];
        
        if (escape) {
            result += char;
            escape = false;
            continue;
        }
        
        if (char === '\\') {
            result += char;
            escape = true;
            continue;
        }
        
        if (char === '"') {
            inString = !inString;
            result += char;
            continue;
        }
        
        if (inString) {
            if (char === '\n') {
                result += '\\n';
            } else if (char === '\r') {
                result += '\\r';
            } else if (char === '\t') {
                result += '\\t';
            } else {
                result += char;
            }
        } else {
            result += char;
        }
    }
    
    return result;
}

// Parse AI response — supports single, batch, and concatenated JSON formats
export function parseAIResponse(content: string): AIIntent[] {
    const jsonToParse = sanitizeJsonString(content);

    try {
        // First, try standard single-object parse
        try {
            const parsed = JSON.parse(jsonToParse);
            console.log("Raw AI Response parsed:", parsed);

            // Batch format: { actions: [...], response_text: "..." }
            if (parsed.actions && Array.isArray(parsed.actions)) {
                const topLevelResponse = parsed.response_text;

                // If there are no actions, but there is a response, return it! 
                if (parsed.actions.length === 0) {
                    return [{
                        action: "CHAT",
                        data: {},
                        response_text: topLevelResponse || "I couldn't find any actions to take.",
                    }];
                }

                return parsed.actions.map((a: any, i: number) => {
                    let rText = "";
                    if (i === 0) {
                        rText = topLevelResponse || a.response_text || "Done!";
                    } else {
                        rText = a.response_text || "";
                    }

                    return {
                        action: a.action || "CHAT",
                        data: a.data || {},
                        response_text: rText,
                    };
                });
            }

            // Single format: { action: "...", data: {...}, response_text: "..." }
            return [{
                action: parsed.action || "CHAT",
                data: parsed.data || {},
                response_text: parsed.response_text || "I'm not sure how to help with that.",
            }];
        } catch {
            // JSON.parse failed — likely concatenated JSON objects like `{...}{...}{...}`
            // Try splitting them apart and parsing each one individually
            const chunks = splitConcatenatedJSON(jsonToParse);

            if (chunks.length > 1) {
                console.log(`Detected ${chunks.length} concatenated JSON objects, parsing individually...`);
                const intents: AIIntent[] = [];
                const responseTexts: string[] = [];

                for (const chunk of chunks) {
                    try {
                        const obj = JSON.parse(chunk);
                        intents.push({
                            action: obj.action || "CHAT",
                            data: obj.data || {},
                            response_text: obj.response_text || "",
                        });
                        if (obj.response_text) {
                            responseTexts.push(obj.response_text);
                        }
                    } catch {
                        console.warn("Failed to parse individual JSON chunk:", chunk);
                    }
                }

                if (intents.length > 0) {
                    // Combine all response_texts into the first intent for display
                    if (intents.length > 1 && responseTexts.length > 0) {
                        intents[0].response_text = responseTexts.join('\n');
                    }
                    console.log(`Successfully parsed ${intents.length} actions from concatenated JSON`);
                    return intents;
                }
            }

            // Single chunk that still failed to parse — fall through to fallback
            throw new Error("Could not parse JSON content");
        }
    } catch (e) {
        console.warn("JSON Parse failed for content:", content, e);
        // Fallback: If it's not JSON, treat the whole thing as a CHAT response 
        // This prevents the "Sorry, I had trouble understanding" message if the AI just talks.
        return [{
            action: "CHAT",
            data: {},
            response_text: content.length > 500 ? content.substring(0, 500) + "..." : content,
        }];
    }
}
