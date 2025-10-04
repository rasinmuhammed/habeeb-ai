import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY!
});

// Keep Gemini for embeddings (Groq doesn't do embeddings)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embeddingModel = genAI.getGenerativeModel({
    model: "text-embedding-004"
});

export const aiSummariseCommit = async (diff: string) => {
    // Truncate diff if too large (Groq has token limits)
    const maxDiffLength = 8000; // Approximately 2000 tokens
    const truncatedDiff = diff.length > maxDiffLength 
        ? diff.slice(0, maxDiffLength) + "\n\n... (diff truncated due to size)"
        : diff;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an expert programmer summarizing git diffs. Be concise."
                },
                {
                    role: "user",
                    content: `Summarize this git diff concisely:

**Format rules:**
- Lines with "+" were added
- Lines with "-" were removed
- Focus on what changed, not every detail

**Example output:**
* Added user authentication [auth.ts]
* Fixed bug in API endpoint [api/users.ts]
* Updated dependencies [package.json]

**Diff to summarize:**
${truncatedDiff}`
                }
            ],
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            temperature: 0.3,
            max_tokens: 300,
        });

        return completion.choices[0]?.message?.content || "";
    } catch (error: any) {
        console.error("Error summarizing commit:", error.message);
        // Return a basic summary if API fails
        return "Unable to generate summary due to size or rate limits.";
    }
};

export async function summariseCode(doc: Document) {
    console.log("Getting summary for", doc.metadata.source);
    try {
        const code = doc.pageContent.slice(0, 10000);
        
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an intelligent senior software Engineer who specialises in onboarding junior software engineers onto projects."
                },
                {
                    role: "user",
                    content: `You are onboarding a junior software Engineer and explaining to them the purpose of the ${doc.metadata.source} file.
Here is the code:
---
${code}
---
Give a summary no more than 100 words of the code above.`
                }
            ],
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            temperature: 0.3,
            max_tokens: 150,
        });

        return completion.choices[0]?.message?.content || "";
    } catch (error) {
        console.error("Error summarizing code:", error);
        return "";
    }
}

// Keep using Gemini for embeddings as Groq doesn't provide embedding models
export async function generateEmbedding(summary: string) {
    try {
        const result = await embeddingModel.embedContent(summary);
        const embedding = result.embedding;
        return embedding.values;
    } catch (error: any) {
        console.error("Error generating embedding:", error.message);
        // Return a zero vector as fallback (768 dimensions for text-embedding-004)
        return new Array(768).fill(0);
    }
}