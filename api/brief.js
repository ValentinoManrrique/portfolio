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

  try {
    const upstream = await fetch(
      'https://vmstudio.app.n8n.cloud/webhook/bc2a3cb3-4171-45bd-88e9-3e689a0d7c31',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )

    if (!upstream.ok) {
      return res.status(502).json({ error: `n8n returned ${upstream.status}` })
    }

    const text = await upstream.text()
    let data
    try { data = JSON.parse(text) } catch { data = { raw: text } }
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
