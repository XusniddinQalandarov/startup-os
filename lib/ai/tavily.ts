// Tavily API for real-time web search
const TAVILY_API_URL = 'https://api.tavily.com/search'

interface TavilySearchResult {
  title: string
  url: string
  content: string
  score: number
}

interface TavilyResponse {
  results: TavilySearchResult[]
  answer?: string
}

export interface SearchResult {
  title: string
  url: string
  snippet: string
}

export async function searchWeb(query: string, maxResults: number = 5): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY

  if (!apiKey) {
    console.warn('TAVILY_API_KEY not configured, skipping web search')
    return []
  }

  try {
    console.log(`[Tavily] Searching: "${query}"`)
    
    const response = await fetch(TAVILY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        search_depth: 'basic',
        include_answer: false,
        include_raw_content: false,
        max_results: maxResults,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Tavily] API error ${response.status}:`, errorText)
      return []
    }

    const data: TavilyResponse = await response.json()
    console.log(`[Tavily] Found ${data.results?.length || 0} results`)
    
    if (!data.results || data.results.length === 0) {
      return []
    }
    
    return data.results.map(r => ({
      title: r.title,
      url: r.url,
      snippet: r.content?.slice(0, 300) || '',
    }))
  } catch (error) {
    console.error('[Tavily] Error searching web:', error)
    return []
  }
}

// Search for competitors specifically
export async function searchCompetitors(idea: string, targetUsers?: string): Promise<{
  results: SearchResult[]
  context: string
}> {
  // Use the full idea for more specific results
  const queries = [
    `"${idea}" competitor companies`,
    `"${idea}" similar platforms alternatives`,
  ]
  
  // Add target users context if provided
  if (targetUsers) {
    queries.push(`${targetUsers} "${idea}" solutions platforms`)
  }

  console.log(`[Tavily] Searching competitors for: "${idea}"`)
  
  const allResults: SearchResult[] = []
  
  for (const query of queries) {
    const results = await searchWeb(query, 4)
    allResults.push(...results)
    
    // Small delay between requests
    if (queries.indexOf(query) < queries.length - 1) {
      await new Promise(r => setTimeout(r, 200))
    }
  }

  // Deduplicate by URL
  const uniqueResults = allResults.filter(
    (r, i, arr) => arr.findIndex(x => x.url === r.url) === i
  )

  console.log(`[Tavily] Total unique results: ${uniqueResults.length}`)

  // Create context for AI analysis
  const context = uniqueResults.length > 0
    ? uniqueResults
        .map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\nContent: ${r.snippet}`)
        .join('\n\n---\n\n')
    : ''

  return {
    results: uniqueResults,
    context,
  }
}
