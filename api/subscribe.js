import { MongoClient } from 'mongodb'

// Reused across warm invocations of the same serverless instance instead of
// opening a new connection per request — MongoDB connections are expensive
// to establish and Vercel functions can be reused between calls.
let clientPromise

function getClient() {
  if (!clientPromise) {
    const uri = process.env.MONGODB_URI
    if (!uri) throw new Error('MONGODB_URI is not set')
    clientPromise = new MongoClient(uri).connect()
  }
  return clientPromise
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Invalid email' })
  }

  try {
    const client = await getClient()
    const subscribers = client.db('bekind').collection('subscribers')
    await subscribers.updateOne(
      { email },
      { $setOnInsert: { email, subscribedAt: new Date() } },
      { upsert: true }
    )
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('subscribe error:', err)
    return res.status(500).json({ error: 'Subscription failed' })
  }
}
