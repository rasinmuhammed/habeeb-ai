import {Octokit} from "octokit";
import { db } from "@/server/db";
import axios from "axios";
import { aiSummariseCommit } from "./groq";

export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

type Response = {
    commitHash: string;
    commitMessage: string;
    commitAuthorName: string;
    commitAuthorAvatar: string;
    commitDate: string;
}

export const getCommitHashes = async (githubUrl: string): Promise<Response[]> => {
    const [ owner, repo ] = githubUrl.split('/').slice(-2)
    if(!owner || !repo) {
        throw new Error("Invalid github URL")
    }
    const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo
    })
    const sortedCommits = data.sort((a: any, b: any) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()) as any[]

    return sortedCommits.slice(0, 15).map((commit: any) => ({
        commitHash: commit.sha as string,
        commitMessage: commit.commit.message ?? "",
        commitAuthorName: commit.commit?.author?.name ?? "",
        commitAuthorAvatar: commit?.author?.avatar_url ?? "",
        commitDate: commit.commit?.author?.date ?? ""
    }))
}

export const pollCommits = async (projectId: string)=> {
    const {githubUrl} = await fetchProjectGithubUrl(projectId)
    if (!githubUrl) {
        throw new Error(`No GitHub URL found for project ${projectId}`);
    }

    const commitHashes = await getCommitHashes(githubUrl)
    const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes)
    
    // Process commits sequentially with rate limiting to avoid overwhelming Groq API
    const summaries: string[] = [];
    for (let i = 0; i < unprocessedCommits.length; i++) {
        const commit = unprocessedCommits[i]!;
        console.log(`Summarizing commit ${i + 1}/${unprocessedCommits.length}: ${commit.commitHash}`);
        
        try {
            const summary = await summariseCommit(githubUrl, commit.commitHash);
            summaries.push(summary);
            
            // Add delay between commits to respect rate limits (12000 TPM on free tier)
            if (i < unprocessedCommits.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
            }
        } catch (error) {
            console.error(`Failed to summarize commit ${commit.commitHash}:`, error);
            summaries.push(""); // Push empty string to maintain array alignment
        }
    }

    const commits = await db.commit.createMany({
        data: summaries.map((summary, index) => {
            console.log(`Saving commit ${index + 1}`)
            return {
                projectId: projectId,
                commitHash: unprocessedCommits[index]!.commitHash,
                commitMessage: unprocessedCommits[index]!.commitMessage,
                commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
                commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
                commitDate: unprocessedCommits[index]!.commitDate,
                summary: summary
            }
        })
    })
    return commits
}

async function summariseCommit(githubUrl: string, commitHash: string): Promise<string> {
    try {
        const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
            headers: {
                Accept: "application/vnd.github.v3.diff",
            },
            timeout: 10000, // 10 second timeout
        });
        
        return await aiSummariseCommit(data);
    } catch (error: any) {
        console.error(`Failed to fetch or summarize commit ${commitHash}:`, error.message);
        return "Unable to generate summary";
    }
}

async function fetchProjectGithubUrl(projectId: string) {
    const project = await db.project.findUnique({
        where: { id: projectId},
        select: {
            githubUrl: true
        }
    })
    return {githubUrl: project?.githubUrl}
}

async function filterUnprocessedCommits(projectId: string, commitHashes: Response[]) {
    const processedCommits = await db.commit.findMany({
        where: {projectId}
    })
    const unprocessedCommits = commitHashes.filter((commit) => !processedCommits.some((processedCommit) => processedCommit.commitHash === commit.commitHash))
    return unprocessedCommits
}