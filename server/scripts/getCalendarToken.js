/**
 * One-time script to get a Google Calendar refresh token.
 *
 * Steps:
 *  1. Add http://localhost:3001/callback to your Google Cloud Console
 *     → APIs & Services → Credentials → OAuth 2.0 Client → Authorized redirect URIs
 *  2. Run:  node server/scripts/getCalendarToken.js
 *  3. Visit the URL printed in your terminal
 *  4. Sign in with dhruvi@swaspaces.com (local) or well-begin@swaspaces.com (production)
 *  5. Copy the REFRESH TOKEN printed and paste it into server/.env as:
 *     GOOGLE_CALENDAR_REFRESH_TOKEN=<paste here>
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })

const { google } = require('googleapis')
const http       = require('http')
const url        = require('url')

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3001/callback'
)

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
]

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt:      'consent',   // force refresh_token to be returned every time
  scope:       SCOPES,
})

console.log('\n─────────────────────────────────────────────────────────────────')
console.log('  SWA Google Calendar — One-Time Token Setup')
console.log('─────────────────────────────────────────────────────────────────')
console.log('\n  1. Open this URL in your browser:\n')
console.log(' ', authUrl)
console.log('\n  2. Sign in with the calendar account you want to use.')
console.log('  3. The refresh token will be printed here automatically.\n')
console.log('─────────────────────────────────────────────────────────────────\n')

// Spin up a tiny server to capture the OAuth callback
const server = http.createServer(async (req, res) => {
  const { query } = url.parse(req.url, true)
  if (!query.code) {
    res.end('No code found.')
    return
  }

  try {
    const { tokens } = await oauth2Client.getToken(query.code)
    res.end('<h2>✅ Success! You can close this tab.</h2><p>Check your terminal for the refresh token.</p>')

    console.log('\n─────────────────────────────────────────────────────────────────')
    console.log('  ✅ REFRESH TOKEN (copy this into server/.env):')
    console.log('─────────────────────────────────────────────────────────────────')
    console.log(`\nGOOGLE_CALENDAR_REFRESH_TOKEN=${tokens.refresh_token}\n`)
    console.log('─────────────────────────────────────────────────────────────────\n')
  } catch (err) {
    res.end('<h2>❌ Error getting token</h2><p>' + err.message + '</p>')
    console.error('❌ Error:', err.message)
  }

  server.close()
  process.exit(0)
})

server.listen(3001, () => {
  console.log('  Waiting for Google OAuth callback on http://localhost:3001 ...\n')
})
