module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // Vercel doesn't always pre-parse the body — read it manually
  const body = await new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', chunk => { raw += chunk })
    req.on('end', () => {
      try { resolve(JSON.parse(raw)) } catch { resolve({}) }
    })
    req.on('error', reject)
  })

  const upstream = await fetch(
    'https://vmstudio.app.n8n.cloud/webhook/bc2a3cb3-4171-45bd-88e9-3e689a0d7c31',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )

  const data = await upstream.json()
  res.status(upstream.status).json(data)
}
