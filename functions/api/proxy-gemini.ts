// This file is intended to be deployed as a serverless function (e.g., on Vercel).
// It acts as a secure backend endpoint to proxy requests to the Gemini API
// for trial users, using the developer's API key.

import { GoogleGenAI } from "@google/genai";
import type { GenerateContentParameters } from "@google/genai";

// In-memory store for rate limiting. NOTE: This is ephemeral and will reset if the
// serverless function instance is recycled. For a short 15-minute window, this is
// often sufficient on platforms like Vercel that keep functions warm.
const requestTimestamps: number[] = [];
const RATE_LIMIT_COUNT = 45;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;


export default async function handler(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed.' }), { 
            status: 405, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }

    // --- Rate Limiting Logic (First-Come, First-Served) ---
    const now = Date.now();

    // 1. Remove timestamps older than the 15-minute window to keep the array clean.
    // This is efficient as timestamps are added in chronological order.
    while (requestTimestamps.length > 0 && now - requestTimestamps[0] > RATE_LIMIT_WINDOW_MS) {
        requestTimestamps.shift();
    }

    // 2. Check if the current number of requests within the window exceeds the limit.
    if (requestTimestamps.length >= RATE_LIMIT_COUNT) {
        return new Response(JSON.stringify({
            error: "Wow, Ramai Sekali!\n\nAntusiasme Anda luar biasa! Saat ini server kami sedang ramai. Untuk menjaga semuanya tetap lancar, kami menyediakan 45 'kursi' setiap 15 menit untuk pengguna undangan.\n\nMohon tunggu sebentar dan coba akses kembali dalam beberapa menit ya. Terima kasih!"
        }), {
            status: 429, // Too Many Requests
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 3. If the limit is not reached, record the current request's timestamp.
    requestTimestamps.push(now);
    // --- End of Rate Limiting Logic ---

    // IMPORTANT: Use process.env.API_KEY as per guidelines
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("Server API key (process.env.API_KEY) is not configured.");
        return new Response(JSON.stringify({ error: 'Server API key is not configured.' }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }
    
    const ai = new GoogleGenAI({ apiKey });

    try {
        const payload: GenerateContentParameters = await request.json();
        
        // Basic validation of the payload forwarded from the client
        if (!payload.model || !payload.contents) {
            return new Response(JSON.stringify({ error: 'Invalid payload. "model" and "contents" are required.' }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        const response = await ai.models.generateContent(payload);

        // The client-side service expects an object with a 'text' property,
        // mimicking the response from the Gemini SDK's generateContent method.
        return new Response(JSON.stringify({ text: response.text }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error("Error in proxy-gemini function:", error);
        return new Response(JSON.stringify({ error: error.message || 'An internal server error occurred.' }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }
}