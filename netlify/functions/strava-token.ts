import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  if (!process.env.STRAVA_CLIENT_SECRET) {
    return { statusCode: 500, body: JSON.stringify({ error: 'STRAVA_CLIENT_SECRET env var is not set' }) }
  }

  const body = JSON.parse(event.body ?? '{}')

  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...body,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
    }),
  })

  const data = await response.text()
  return {
    statusCode: response.status,
    headers: { 'Content-Type': 'application/json' },
    body: data,
  }
}
