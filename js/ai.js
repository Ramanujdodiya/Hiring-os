/**
 * This file contains all the logic for interacting with the Google Gemini API.
 */

/**
 * Sends a prompt to the Gemini API and returns the text response.
 * @param {string} prompt The prompt to send to the AI model.
 * @returns {Promise<string>} The text response from the AI.
 */
export async function callGeminiAPI(prompt) {
    // IMPORTANT: This is the API key you provided. 
    // For a real-world application, you would store this securely on a backend server
    // and not expose it in the frontend code.
    const apiKey = "AIzaSyBJaJ-W8XK1hJrbwKvC0jf4KKDCKVf45TI"; 
    
    if (!apiKey || apiKey === "YOUR_API_KEY_GOES_HERE") {
        console.error("API Key is missing. Please add it in js/ai.js");
        return "AI features are disabled. Please add your API key in js/ai.js";
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const payload = {
        contents: [{ 
            role: "user", 
            parts: [{ text: prompt }] 
        }]
    };

    try {
        const response = await fetch(apiUrl, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
        });

        if (!response.ok) {
            // Throw an error with the status text to provide more context
            throw new Error(`API call failed with status: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        
        // Safely access the response text
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
            return text;
        } else {
            console.error("Unexpected API response structure:", result);
            return "Could not retrieve a valid response from the AI.";
        }

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return `Error: ${error.message}`;
    }
}
