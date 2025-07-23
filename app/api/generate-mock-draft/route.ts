import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Check for API key or admin authentication
    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.PBS_MONITOR_API_KEY || 'your-secret-key'
    
    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { pbsArticle } = body

    if (!pbsArticle || !pbsArticle.title || !pbsArticle.url) {
      return NextResponse.json(
        { error: 'Invalid PBS article data provided' },
        { status: 400 }
      )
    }

    console.log(`Generating MOCK draft article for: "${pbsArticle.title}"`)
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate mock leftist response based on the PBS article
    const mockDraft = {
      title: `Working Class Analysis: ${pbsArticle.title.replace(/Prime Minister|coalition|Japan's/g, '').trim()} - What This Means for Democracy`,
      excerpt: `While mainstream media focuses on electoral politics, we examine how ${pbsArticle.title.toLowerCase()} reflects broader challenges to democratic participation and working-class representation in modern political systems.`,
      content: `<p>The recent developments in Japan's political landscape, as reported by PBS NewsHour, deserve a deeper analysis from a working-class perspective that mainstream media often overlooks.</p>

<p><strong>Beyond Electoral Politics</strong></p>
<p>While PBS NewsHour reports on the surface-level political maneuvering, we must ask: what does this mean for ordinary working people in Japan? Electoral losses and gains among ruling coalitions often mask the real issues affecting workers, families, and marginalized communities.</p>

<p><strong>The Broader Context</strong></p>
<p>This political shift occurs against a backdrop of:</p>
<ul>
<li>Rising inequality in Japan's economy</li>
<li>Stagnant wages despite corporate profits</li>
<li>Weakening labor protections</li>
<li>Growing housing costs in urban areas</li>
</ul>

<p><strong>What This Means for Workers</strong></p>
<p>Political instability often translates to policy uncertainty that disproportionately affects working families. When coalitions lose power or struggle to maintain majorities, progressive reforms get delayed while corporate interests continue to be protected.</p>

<p><strong>International Solidarity</strong></p>
<p>The challenges facing Japanese workers mirror those experienced by working people globally. From the United States to Europe, we see similar patterns of political systems that prioritize capital over labor, profit over people.</p>

<p><strong>Moving Forward</strong></p>
<p>Real change comes not from electoral shuffling among establishment parties, but from grassroots organizing, labor solidarity, and international cooperation among working-class movements. We must build power from below, not wait for it to trickle down from above.</p>

<p>As we watch these developments unfold, let's remember that our liberation is bound together across borders, and that true democracy means economic democracy - where working people have a real say in the decisions that affect their daily lives.</p>`,
      category: 'politics',
      tags: ['international', 'democracy', 'working-class', 'political-analysis', 'japan'],
      sourceUrl: pbsArticle.url,
      sourceTitle: pbsArticle.title,
      sourcePublishedDate: pbsArticle.publishedDate
    }
    
    return NextResponse.json({
      success: true,
      message: 'Mock draft article generated successfully',
      draft: mockDraft,
      timestamp: new Date().toISOString(),
      note: 'This is a mock draft for testing purposes. Real AI generation requires OpenAI API quota.'
    })
  } catch (error) {
    console.error('Error generating mock draft article:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate mock draft article',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Mock Draft Generation API',
    usage: 'Send POST request with PBS article data to generate a mock draft',
    status: 'Active',
    note: 'This generates mock content for testing the draft editor functionality'
  })
}