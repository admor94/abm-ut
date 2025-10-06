// This file is intended to be deployed as a serverless function (e.g., on Vercel).
// It acts as a secure backend endpoint to proxy requests to the Gemini API
// for trial users, using the developer's API key.

import { GoogleGenAI } from "@google/genai";
import type { GenerateContentParameters } from "@google/genai";

export default async function handler(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed.' }), { 
            status: 405, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }

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
