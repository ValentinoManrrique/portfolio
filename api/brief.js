const SYSTEM = `You are writing a conversion brief for VM Studio — a one-person design and development studio run by Valentino Manrrique (UI/UX Designer, Frontend Developer, n8n automation expert, AI integration specialist — 6+ years, Upwork Top Rated Plus, $75/hr, 5 stars, $20K+ earned).

Your job is not to summarize — it is to make this specific client feel deeply understood and confident that VM Studio is the right choice for their situation. Mirror their own words back. Be specific, never generic. Every field must speak directly to what this client said.

Return ONLY valid JSON (no markdown, no backticks, no code fences).`

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  let body = req.body
  if (!body) {
    body = await new Promise((resolve) => {
      let raw = ''
      req.on('data', chunk => { raw += chunk })
      req.on('end', () => {
        try { resolve(JSON.parse(raw)) } catch { resolve({}) }
      })
    })
  }

  const { projectType, goal, timeline, budget, challenge, context } = body

  const userMessage = `Client answers:
- Project type: ${projectType}
- Main goals: ${goal}
- Timeline: ${timeline}
- Budget: ${budget}
- Challenges: ${challenge}
- Extra context: ${context || 'None provided'}

Return ONLY valid JSON:
{
  "projectName": "A short, evocative 3–5 word name that captures the essence of their specific goal — not generic",
  "projectType": "${projectType}",
  "timelineEstimate": "Realistic delivery estimate based on their timeline and scope",
  "complexity": "low, medium, or high — based on scope, timeline, and challenge combination",
  "insight": "One sharp sentence naming the real underlying problem behind their stated challenge — the thing they feel but haven't fully articulated. Start with 'The real challenge here is...' or similar.",
  "aiApproach": "2–3 sentences explaining the exact AI mechanism for this specific project. Not 'AI will help' — state precisely: what input Claude receives, what it does to it, what comes out, and what the client never has to do manually again.",
  "scope": "2–3 sentences describing exactly what will be built. Use the client's own words. Reference their specific goals and challenges. Must feel written for them, not from a template.",
  "budgetNote": "One honest sentence on how their budget aligns with scope. If tight, say so and explain what you'll prioritize.",
  "deliverables": ["Concrete deliverable tied to their stated goal", "Second specific deliverable", "Third specific deliverable", "Handoff or post-launch support deliverable"],
  "whyMe": ["Restate their challenge then explain why VM Studio has solved this before", "Reference their specific goal or timeline with a concrete credential", "Strong trust signal: Top Rated Plus, 5 stars, $20K+ earned, or a specific outcome"],
  "phases": ["Phase name: description specific to this project", "Phase name: description", "Phase name: description", "Phase name: handoff and support"],
  "phaseDurations": ["e.g. 3 days", "e.g. 1 week", "e.g. 4 days", "e.g. 2 days"],
  "nextStep": "One confident action-oriented sentence telling them exactly what to do right now."
}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: SYSTEM,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return res.status(502).json({ error: `Claude API ${response.status}`, detail: err })
    }

    const claude = await response.json()
    const text = claude.content?.[0]?.text || ''
    let data
    try { data = JSON.parse(text) } catch { data = { raw: text } }
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
