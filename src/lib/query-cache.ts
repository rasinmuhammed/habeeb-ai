/**
 * Query Cache for RAG System
 * 
 * Implements LRU caching for:
 * - Embeddings (avoid recomputing for similar queries)
 * - Query results (fast responses for repeated questions)
 */

interface CacheEntry<T> {
    value: T
    timestamp: number
    accessCount: number
}

interface CacheConfig {
    maxSize: number
    ttlMs: number
}

class LRUCache<T> {
    private cache: Map<string, CacheEntry<T>> = new Map()
    private config: CacheConfig

    constructor(config: Partial<CacheConfig> = {}) {
        this.config = {
            maxSize: config.maxSize ?? 100,
            ttlMs: config.ttlMs ?? 1000 * 60 * 30 // 30 minutes default
        }
    }

    get(key: string): T | null {
        const entry = this.cache.get(key)

        if (!entry) return null

        // Check if expired
        if (Date.now() - entry.timestamp > this.config.ttlMs) {
            this.cache.delete(key)
            return null
        }

        // Update access count for LRU tracking
        entry.accessCount++
        return entry.value
    }

    set(key: string, value: T): void {
        // Evict if at capacity
        if (this.cache.size >= this.config.maxSize) {
            this.evictLRU()
        }

        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            accessCount: 1
        })
    }

    private evictLRU(): void {
        let lruKey: string | null = null
        let lruAccessCount = Infinity

        for (const [key, entry] of this.cache.entries()) {
            if (entry.accessCount < lruAccessCount) {
                lruAccessCount = entry.accessCount
                lruKey = key
            }
        }

        if (lruKey) {
            this.cache.delete(lruKey)
        }
    }

    invalidate(key: string): void {
        this.cache.delete(key)
    }

    invalidateByPrefix(prefix: string): void {
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key)
            }
        }
    }

    clear(): void {
        this.cache.clear()
    }

    size(): number {
        return this.cache.size
    }

    stats(): { size: number; hitRate: number } {
        return {
            size: this.cache.size,
            hitRate: 0 // Would need to track hits/misses for accurate rate
        }
    }
}

/* ============================================
   Embedding Cache
   ============================================ */

// Cache for query embeddings (key: query text, value: embedding vector)
const embeddingCache = new LRUCache<number[]>({
    maxSize: 200,
    ttlMs: 1000 * 60 * 60 // 1 hour
})

export function getCachedEmbedding(query: string): number[] | null {
    const normalizedQuery = normalizeQuery(query)
    return embeddingCache.get(normalizedQuery)
}

export function setCachedEmbedding(query: string, embedding: number[]): void {
    const normalizedQuery = normalizeQuery(query)
    embeddingCache.set(normalizedQuery, embedding)
}

/* ============================================
   Query Result Cache
   ============================================ */

interface CachedQueryResult {
    fileReferences: { fileName: string; sourceCode: string; summary: string }[]
    context: string
}

// Cache for RAG query results (key: query + projectId, value: results)
const queryResultCache = new LRUCache<CachedQueryResult>({
    maxSize: 100,
    ttlMs: 1000 * 60 * 15 // 15 minutes (shorter since code can change)
})

export function getCachedQueryResult(query: string, projectId: string): CachedQueryResult | null {
    const key = createQueryKey(query, projectId)
    return queryResultCache.get(key)
}

export function setCachedQueryResult(
    query: string,
    projectId: string,
    result: CachedQueryResult
): void {
    const key = createQueryKey(query, projectId)
    queryResultCache.set(key, result)
}

export function invalidateProjectCache(projectId: string): void {
    queryResultCache.invalidateByPrefix(`project:${projectId}:`)
    console.log(`Invalidated cache for project ${projectId}`)
}

/* ============================================
   Helper Functions
   ============================================ */

function normalizeQuery(query: string): string {
    return query
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
}

function createQueryKey(query: string, projectId: string): string {
    const normalizedQuery = normalizeQuery(query)
    return `project:${projectId}:${normalizedQuery}`
}

/* ============================================
   Similarity-Based Cache Lookup
   ============================================ */

/**
 * Simple hash function for fuzzy cache matching
 * Returns similar cache entries for semantically similar queries
 */
function simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
    }
    return hash
}

/**
 * Check if two queries are similar enough to share cache
 */
export function queriesAreSimilar(q1: string, q2: string): boolean {
    const normalized1 = normalizeQuery(q1)
    const normalized2 = normalizeQuery(q2)

    // Exact match
    if (normalized1 === normalized2) return true

    // Simple word overlap check (fast)
    const words1 = new Set(normalized1.split(' '))
    const words2 = new Set(normalized2.split(' '))

    let overlap = 0
    for (const word of words1) {
        if (words2.has(word)) overlap++
    }

    const minWords = Math.min(words1.size, words2.size)
    const overlapRatio = overlap / minWords

    return overlapRatio >= 0.7 // 70% word overlap = similar
}

/* ============================================
   Cache Status for Debugging
   ============================================ */

export function getCacheStats() {
    return {
        embeddingCache: embeddingCache.stats(),
        queryResultCache: queryResultCache.stats()
    }
}

export function clearAllCaches(): void {
    embeddingCache.clear()
    queryResultCache.clear()
    console.log('All RAG caches cleared')
}
