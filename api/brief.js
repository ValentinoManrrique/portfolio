export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const upstream = await fetch(
    'https://vmstudio.app.n8n.cloud/webhook/bc2a3cb3-4171-45bd-88e9-3e689a0d7c31',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    }
  )

  const data = await upstream.json()
  res.status(upstream.status).json(data)
}
