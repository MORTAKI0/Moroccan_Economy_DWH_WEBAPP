// File: src/app/api/test-gemini/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const MODEL_NAME = "gemini-pro"; // Or "gemini-1.0-pro", "gemini-1.5-pro-latest" etc. Check available models.

export async function GET(request: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error('GEMINI_API_KEY is not set in environment variables.');
            return NextResponse.json({ error: 'API key not configured. Please set GEMINI_API_KEY.' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const generationConfig = {
            temperature: 0.9, // Controls randomness. Lower for more predictable, higher for more creative.
            topK: 1,
            topP: 1,
            maxOutputTokens: 256, // Max length of the generated response
        };

        // Basic safety settings - adjust as needed for your use case
        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        // A simple prompt for testing
        const parts = [
            { text: "Hello Gemini! Write a one-sentence positive affirmation." },
        ];

        const result = await model.generateContent({
            contents: [{ role: "user", parts }],
            generationConfig,
            safetySettings,
        });

        if (result.response) {
            const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
                return NextResponse.json({ message: text });
            } else {
                // Check for blockages or empty content
                let errorMessage = "Gemini returned a response, but no text content was found.";
                if (result.response.promptFeedback?.blockReason) {
                    errorMessage += ` Prompt blocked due to: ${result.response.promptFeedback.blockReason}.`;
                    if (result.response.promptFeedback.safetyRatings) {
                        errorMessage += ` Safety Ratings: ${JSON.stringify(result.response.promptFeedback.safetyRatings)}`;
                    }
                } else if (result.response.candidates && result.response.candidates.length > 0 && result.response.candidates[0].finishReason) {
                    errorMessage += ` Candidate finish reason: ${result.response.candidates[0].finishReason}.`;
                    if (result.response.candidates[0].safetyRatings) {
                        errorMessage += ` Safety Ratings: ${JSON.stringify(result.response.candidates[0].safetyRatings)}`;
                    }
                }
                console.error("Gemini Response Issue:", result.response);
                return NextResponse.json({ error: errorMessage, details: result.response }, { status: 500 });
            }
        } else {
            // This case should ideally not happen if the API call itself was successful
            // but the structure of the response was unexpected.
            console.error("Gemini API call succeeded but result.response is undefined or falsy:", result);
            return NextResponse.json({ error: "Failed to get a valid response structure from Gemini.", details: result }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Error calling Gemini API:', error);
        // More detailed error logging
        let errorMessage = 'Internal Server Error calling Gemini API.';
        if (error.message) {
            errorMessage += ` Message: ${error.message}`;
        }
        if (error.response && error.response.data) { // If using a library that structures errors this way (e.g. axios)
            errorMessage += ` Details: ${JSON.stringify(error.response.data)}`;
        }
        return NextResponse.json({ error: errorMessage, details: error.toString() }, { status: 500 });
    }
}