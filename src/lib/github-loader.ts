import {GithubRepoLoader} from '@langchain/community/document_loaders/web/github'
import { summariseCode, generateEmbedding } from './gemini'
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
    await Promise.allSettled(allEmbeddings.map(async (embedding, index) => {
        console.log(`Processing ${index} of ${allEmbeddings.length}`)
        if (!embedding) return

        const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
            data: {
                summary: embedding.summary,
                sourceCode: embedding.sourceCode,
                fileName: embedding.fileName,
                projectId
            }
        })

        await db.$executeRaw`
            UPDATE "SourceCodeEmbedding"
            SET "summaryEmbedding" = ${embedding.embedding}::vector 
            WHERE "id" = ${sourceCodeEmbedding.id}
            `
    }))
}

const generateEmbeddings = async (docs: Document[]) => {
    return await Promise.all(docs.map(async doc => {
        const summary = await summariseCode(doc)
        const embedding = await generateEmbedding(summary)
        return { 
            summary, 
            embedding,
            sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
            fileName: doc.metadata.source 
        }

    }))
}


// Document {
//     pageContent: "\n# Travelling Salesman Problem Solver\n\nThis repository contains a Python program to solve the Travelling Salesman Problem (TSP) using the Lin-Kernighan algorithm. Given a set of cities and their coordinates, the program finds the optimal tour that visits each city exactly once and returns to the starting city.\n\n## Usage\n\nTo use the program, follow these steps:\n\n1. Install the required dependencies by running the following command:\n```python\npip install osmnx requests\n```\n\n2. Replace the `city_names` list with the names of the cities you want to visit. Make sure the names are in the format \"Place Name, City\". For example:\n```python\ncity_names = [\n    \"Kozhikode Beach,Kozhikode\",\n    \"Tali Temple,Kozhikode\",\n    \"Mananchira Square,Kozhikode\",\n    \"Chevayur,Kozhikode\",\n    \"Hilite Mall,Kozhikode\"\n]\n```\n3. Run the program by executing the script:\n```python\npython tsp_solver.py\n```\n4. The program will output the optimal tour starting from the specified city and its cost. For example:\n```python\nOptimal tour starting from Chevayur, Kozhikode:\nChevayur, Kozhikode -> Kozhikode Beach, Kozhikode -> Tali Temple, Kozhikode -> Hilite Mall, Kozhikode -> Mananchira Square, Kozhikode -> Chevayur, Kozhikode\n\nOptimal cost:  32.78\n```\n\n## Dependencies\n\nThe program relies on the following dependencies:\n\nosmnx: Used to obtain the coordinates of the specified cities using OpenStreetMap data.\nrequests: Used to query the Open Source Routing Machine (OSRM) API to calculate the distances between cities.\n\n\n",
//     metadata: {
//       source: "README.md",
//       repository: "https://github.com/rasinmuhammed/Travelling-Salesman-Problem",
//       branch: "main",
//     },
//     id: undefined,
//   },