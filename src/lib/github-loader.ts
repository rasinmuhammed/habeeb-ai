import {GithubRepoLoader} from '@langchain/community/document_loaders/web/github'
import { summariseCode, generateEmbedding } from './groq'
import { db} from '@/server/db'
import { Document } from '@langchain/core/documents'
import { Octokit } from 'octokit'

const getFileCount = async (path: string, octokit: Octokit, githubOwner: string, githubRepo:string, acc: number = 0 )=> {
    const {data} = await octokit.rest.repos.getContent({
        owner: githubOwner,
        repo: githubRepo,
        path
    })
    if (!Array.isArray(data) && data.type === 'file'){
        return acc+1
    }
    if (Array.isArray(data)){
        let fileCount = 0
        const directories: string[] = []

        for ( const item of data) {
            if(item.type == 'dir'){
                directories.push(item.path)
            } else {
                fileCount++
            }
        }

        if (directories.length > 0){
            const directoryCounts = await Promise.all(
                directories.map(dirPath => getFileCount(dirPath, octokit, githubOwner, githubRepo, 0))
            )
            fileCount += directoryCounts.reduce((acc, count) => acc + count, 0 )
        }

        return acc + fileCount
    }

    return acc
}

export const checkCredits = async (githubUrl: string, githubToken?: string ) => {
    // Find out how many files are in the repo
    const octokit = new Octokit({ auth: githubToken })
    const githubOwner = githubUrl.split('/')[3]
    const githubRepo = githubUrl.split('/')[4]
    if (!githubOwner || !githubRepo) {
        return 0
    }

    const fileCount = await getFileCount('', octokit, githubOwner, githubRepo, 0)
    return fileCount
}

export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
    const loader = new GithubRepoLoader(githubUrl, {
        accessToken: githubToken || process.env.GITHUB_TOKEN,
        branch: 'main',
        ignoreFiles: ['package-lock.json','yarn.lock','pnpm-lock.yaml','bun.lockb'],
        recursive: true,
        unknown: 'warn',
        maxConcurrency: 5
    })
    const docs = await loader.load()
    return docs
}

export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?: string) => {
    const docs = await loadGithubRepo(githubUrl, githubToken)
    const allEmbeddings = await generateEmbeddings(docs)
    
    // Process in smaller batches to avoid connection timeouts
    const batchSize = 5;
    for (let i = 0; i < allEmbeddings.length; i += batchSize) {
        const batch = allEmbeddings.slice(i, i + batchSize);
        
        await Promise.allSettled(batch.map(async (embedding, batchIndex) => {
            const index = i + batchIndex;
            console.log(`Processing ${index + 1} of ${allEmbeddings.length}`);
            
            if (!embedding) return;

            try {
                const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
                    data: {
                        summary: embedding.summary,
                        sourceCode: embedding.sourceCode,
                        fileName: embedding.fileName,
                        projectId
                    }
                });

                await db.$executeRaw`
                    UPDATE "SourceCodeEmbedding"
                    SET "summaryEmbedding" = ${embedding.embedding}::vector 
                    WHERE "id" = ${sourceCodeEmbedding.id}
                `;
            } catch (error) {
                console.error(`Failed to process embedding ${index}:`, error);
            }
        }));
        
        // Small delay between batches to prevent overwhelming the database
        if (i + batchSize < allEmbeddings.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

const generateEmbeddings = async (docs: Document[]) => {
    // Process embeddings with rate limiting
    const embeddings = [];
    for (let i = 0; i < docs.length; i++) {
        const doc = docs[i]!;
        try {
            const summary = await summariseCode(doc);
            const embedding = await generateEmbedding(summary);
            embeddings.push({ 
                summary, 
                embedding,
                sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
                fileName: doc.metadata.source 
            });
            
            // Add delay every 5 requests to avoid rate limits
            if ((i + 1) % 5 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (error) {
            console.error(`Failed to generate embedding for ${doc.metadata.source}:`, error);
            embeddings.push(null as any);
        }
    }
    return embeddings.filter(Boolean);
}