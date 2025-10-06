// This file is intended to be deployed as a serverless function (e.g., on Vercel, Netlify, Google Cloud Functions).
// It acts as a secure backend endpoint to validate invite codes without exposing them to the client.

interface InviteCodeDetails {
  code: string;
  durationMinutes: number; // Use -1 for unlimited
}

// This will now store user-specific timestamps: code -> Map<userId, timestamp>
// In a real-world production app, this should be a persistent database (e.g., Vercel KV, Firebase).
const usedCodesStore = new Map<string, Map<string, number>>();

/**
 * Parses the invite codes from the environment variable and applies requested modifications.
 * @returns {InviteCodeDetails[]} An array of invite code details.
 */
function getInviteCodes(): InviteCodeDetails[] {
    const codesJson = process.env.INVITE_CODES_JSON;
    let baseCodes: InviteCodeDetails[] = [];
    if (codesJson) {
        try {
            baseCodes = JSON.parse(codesJson);
        } catch (error) {
            console.error("Failed to parse INVITE_CODES_JSON:", error);
        }
    }
    
    // Simulate user request: remove RS110294, add ADMOR94 if they don't exist
    const filteredCodes = baseCodes.filter(c => c.code !== 'RS110294');
    if (!filteredCodes.some(c => c.code === 'ADMOR94')) {
        filteredCodes.push({ code: 'ADMOR94', durationMinutes: 90 });
    }
    return filteredCodes;
}

/**
 * This is the main handler for the serverless function.
 * It expects a POST request with a JSON body like: { "code": "YOUR_CODE", "userId": "CLIENT_UUID" }
 */
export default async function handler(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ status: 'invalid', error: 'Method not allowed.' }), { status: 405 });
    }

    try {
        const ALL_CODES = getInviteCodes();
        const body = await request.json();
        const inputCode = body.code?.trim().toUpperCase();
        const userId = body.userId;

        if (!inputCode || !userId) {
            return new Response(JSON.stringify({ status: 'invalid', error: 'Code and userId are required.' }), { status: 400 });
        }

        const codeDetails = ALL_CODES.find(c => c.code === inputCode);
        
        if (!codeDetails) {
            return new Response(JSON.stringify({ status: 'invalid', error: 'Kode invite tidak valid.' }), { status: 404 });
        }
        
        // Developer code is always valid and unlimited, bypassing daily checks
        if (codeDetails.code === 'RADINALLSHARE') {
             return new Response(JSON.stringify({
                status: 'valid',
                durationMs: -1,
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        const codeUserTimestamps = usedCodesStore.get(inputCode);
        const lastUsedTimestamp = codeUserTimestamps?.get(userId);
        const oneDayInMs = 24 * 60 * 60 * 1000;

        if (lastUsedTimestamp && (Date.now() - lastUsedTimestamp < oneDayInMs)) {
            // Code has been used by this specific user within the last 24 hours
            return new Response(JSON.stringify({ 
                status: 'reused', 
                resetTimestamp: lastUsedTimestamp + oneDayInMs
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // Fresh use for this user or expired cooldown
        if (!codeUserTimestamps) {
            usedCodesStore.set(inputCode, new Map());
        }
        usedCodesStore.get(inputCode)!.set(userId, Date.now());

        const GRACE_PERIOD_MS = 2 * 60 * 1000;
        const durationMs = codeDetails.durationMinutes === -1 
            ? -1 
            : (codeDetails.durationMinutes * 60 * 1000) + GRACE_PERIOD_MS;
        
        return new Response(JSON.stringify({
            status: 'valid',
            durationMs: durationMs,
        }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ status: 'invalid', error: 'Invalid request body.' }), { status: 400 });
    }
}