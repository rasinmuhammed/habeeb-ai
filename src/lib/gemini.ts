import React from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
});

export const aiSummariseCommit = async (diff: string) => {
    const response = await model.generateContent([
        `You are an expert programmer, and you are trying to summarize a git diff. 

        **Reminders about the git diff format:**  
        - For every file, there are a few metadata lines, like:  
        \`\`\`
        diff --git a/lib/index.js b/lib/index.js
        index aadf691..bfef603 100644
        --- a/lib/index.js
        +++ b/lib/index.js
        \`\`\`
        This means that 'lib/index.js' was modified in this commit.  
        - Lines starting with **"+"** were added.  
        - Lines starting with **"-"** were removed.  
        - Lines with neither are just context.

        **EXAMPLE SUMMARY COMMENTS:**  
        \`\`\`
        * Increased the number of returned recordings from '10' to '100' [packages/server/recordings_api.ts, packages/server/constants.ts]
        * Fixed a typo in the GitHub Action name [.github/workflows/gpt-commit-summarizer.yml]
        * Moved the 'octokit' initialization to a separate file [src/octokit.ts, src/index.ts]
        * Added an OpenAI API for completions [packages/utils/apis/openai.ts]
        * Lowered numeric tolerance for text files
        \`\`\`
        Most commits will have fewer comments than this example.  
        Do **not** include example parts in your summary.  

        **Now, summarize the following diff file:**  
        \n\n${diff}
        `
    ]);

    return response.response.text();
};

export async function summariseCode(doc: Document) {
    console.log("Getting summary for", doc.metadata.source);
    try{
        const code = doc.pageContent.slice(0,10000);
        const response = await model.generateContent([
        `You are an intelligent senior software Engineer who specialises in onboarding junior software engineers onto projects`,
        `You are onboarding a junior software Engineer and explaining to them the purpose of the ${doc.metadata.source} file
        Here is the code:
        ---
        ${code}
        ---
        Give a summary no more than 100 words of the code above`,
        ]);

        return response.response.text();
    } catch (error) {
        return ''
    }
    
}

export async function generateEmbedding(summary: string) {
    const model = genAI.getGenerativeModel({
        model: "text-embedding-004"
    })
    const result = await model.embedContent(summary)
    const embedding = result.embedding
    return embedding.values
}
