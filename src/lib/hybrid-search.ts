/**
 * Hybrid Search for RAG System
 * 
 * Combines:
 * 1. Vector similarity search (semantic)
 * 2. Keyword matching (lexical)
 * 3. Weighted scoring for final ranking
 */

import { db } from '@/server/db'

interface SearchResult {
    fileName: string
    sourceCode: string
    summary: string
    vectorScore: number
    keywordScore: number
    combinedScore: number
}

interface HybridSearchConfig {
    vectorWeight: number  // Weight for semantic search (0-1)
    keywordWeight: number // Weight for keyword search (0-1)
    minSimilarity: number // Minimum vector similarity threshold
    maxResults: number    // Maximum results to return
}

const defaultConfig: HybridSearchConfig = {
    vectorWeight: 0.7,
    keywordWeight: 0.3,
    minSimilarity: 0.3,
    maxResults: 5
}

/**
 * Perform hybrid search combining vector similarity and keyword matching
 */
export async function hybridSearch(
    queryVector: number[],
    queryText: string,
    projectId: string,
    config: Partial<HybridSearchConfig> = {}
): Promise<SearchResult[]> {
    const finalConfig = { ...defaultConfig, ...config }
    const keywords = extractKeywords(queryText)
    const vectorQuery = `[${queryVector.join(',')}]`

    // Step 1: Get vector search results with lower threshold to capture more candidates
    const vectorResults = await db.$queryRaw`
    SELECT 
      "fileName", 
      "sourceCode", 
      "summary",
      1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE "projectId" = ${projectId}
    AND 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > ${finalConfig.minSimilarity}
    ORDER BY similarity DESC
    LIMIT 15
  ` as { fileName: string; sourceCode: string; summary: string; similarity: number }[]

    // Step 2: Calculate keyword scores for each result
    const scoredResults: SearchResult[] = vectorResults.map(result => {
        const keywordScore = calculateKeywordScore(
            result.summary + ' ' + result.fileName,
            keywords
        )

        const combinedScore =
            (result.similarity * finalConfig.vectorWeight) +
            (keywordScore * finalConfig.keywordWeight)

        return {
            fileName: result.fileName,
            sourceCode: result.sourceCode,
            summary: result.summary,
            vectorScore: result.similarity,
            keywordScore,
            combinedScore
        }
    })

    // Step 3: Sort by combined score and return top results
    return scoredResults
        .sort((a, b) => b.combinedScore - a.combinedScore)
        .slice(0, finalConfig.maxResults)
}

/**
 * Extract meaningful keywords from query text
 */
function extractKeywords(text: string): string[] {
    // Common stop words to filter out
    const stopWords = new Set([
        'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
        'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'we', 'they',
        'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
        'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
        'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'or',
        'if', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with',
        'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after',
        'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off',
        'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
        'file', 'files', 'code', 'function', 'use', 'need', 'want', 'find', 'look'
    ])

    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word))
}

/**
 * Calculate keyword match score using BM25-inspired scoring
 */
function calculateKeywordScore(text: string, keywords: string[]): number {
    if (keywords.length === 0) return 0

    const normalizedText = text.toLowerCase()
    const words = normalizedText.split(/\s+/)
    const wordSet = new Set(words)

    let score = 0
    let matchedKeywords = 0

    for (const keyword of keywords) {
        // Exact word match
        if (wordSet.has(keyword)) {
            matchedKeywords++
            score += 1.0
            continue
        }

        // Partial match (keyword is substring of a word)
        for (const word of words) {
            if (word.includes(keyword) || keyword.includes(word)) {
                matchedKeywords++
                score += 0.5
                break
            }
        }
    }

    // Normalize score by number of keywords
    const normalizedScore = matchedKeywords / keywords.length

    // Apply diminishing returns for very high matches
    return Math.min(normalizedScore, 1.0)
}

/**
 * Re-rank results based on specific criteria
 */
export function rerank(
    results: SearchResult[],
    criteria: {
        boostFilePatterns?: string[]  // Patterns to boost (e.g., ['components/', 'hooks/'])
        demoteFilePatterns?: string[] // Patterns to demote (e.g., ['test', '.spec'])
        preferredExtensions?: string[] // File extensions to prefer
    } = {}
): SearchResult[] {
    return results.map(result => {
        let adjustedScore = result.combinedScore

        // Boost certain file patterns
        if (criteria.boostFilePatterns) {
            for (const pattern of criteria.boostFilePatterns) {
                if (result.fileName.includes(pattern)) {
                    adjustedScore *= 1.2
                    break
                }
            }
        }

        // Demote certain file patterns
        if (criteria.demoteFilePatterns) {
            for (const pattern of criteria.demoteFilePatterns) {
                if (result.fileName.toLowerCase().includes(pattern.toLowerCase())) {
                    adjustedScore *= 0.7
                    break
                }
            }
        }

        // Prefer certain file extensions
        if (criteria.preferredExtensions) {
            for (const ext of criteria.preferredExtensions) {
                if (result.fileName.endsWith(ext)) {
                    adjustedScore *= 1.1
                    break
                }
            }
        }

        return {
            ...result,
            combinedScore: adjustedScore
        }
    }).sort((a, b) => b.combinedScore - a.combinedScore)
}

/**
 * Calculate confidence level for the search results
 */
export function calculateConfidence(results: SearchResult[]): {
    level: 'high' | 'medium' | 'low'
    score: number
    explanation: string
} {
    if (results.length === 0) {
        return {
            level: 'low',
            score: 0,
            explanation: 'No relevant files found in the codebase'
        }
    }

    const topScore = results[0]?.combinedScore ?? 0
    const avgScore = results.reduce((sum, r) => sum + r.combinedScore, 0) / results.length

    if (topScore >= 0.7 && avgScore >= 0.5) {
        return {
            level: 'high',
            score: topScore,
            explanation: 'Found highly relevant code matches'
        }
    }

    if (topScore >= 0.5 || avgScore >= 0.4) {
        return {
            level: 'medium',
            score: topScore,
            explanation: 'Found moderately relevant code matches'
        }
    }

    return {
        level: 'low',
        score: topScore,
        explanation: 'Limited relevant code found - answer may be incomplete'
    }
}
