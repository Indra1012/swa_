/**
 * Creates a Google Calendar event with a Google Meet link.
 * Requires GOOGLE_CALENDAR_REFRESH_TOKEN in .env (run scripts/getCalendarToken.js once to get it).
 */
const { google } = require('googleapis')

const createMeetEvent = async ({ name, email, company, date, timeSlot }) => {
  if (!process.env.GOOGLE_CALENDAR_REFRESH_TOKEN) {
    console.warn('⚠️  GOOGLE_CALENDAR_REFRESH_TOKEN not set — skipping Meet creation')
    return null
  }

  try {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CALENDAR_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    )
    auth.setCredentials({ refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN })

    // Parse "10:00 AM" → hours + minutes
    const match = timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (!match) return null

    let h = parseInt(match[1])
    const m = parseInt(match[2])
    const meridiem = match[3].toUpperCase()
    if (meridiem === 'PM' && h !== 12) h += 12
    if (meridiem === 'AM' && h === 12) h = 0

    const [year, month, day] = date.split('-').map(Number)
    const startDt = new Date(Date.UTC(year, month - 1, day, h - 5, m - 30, 0)) // IST = UTC+5:30
    const endDt   = new Date(startDt.getTime() + 30 * 60 * 1000)

    const calendar = google.calendar({ version: 'v3', auth })

    const calEmail = process.env.GOOGLE_CALENDAR_EMAIL || process.env.NODEMAILER_USER

    const event = {
      summary:     `SWA Wellbeing Demo — ${company}`,
      description: `30-min demo call with ${name} from ${company}.\nBooking email: ${email}`,
      start: { dateTime: startDt.toISOString(), timeZone: 'Asia/Kolkata' },
      end:   { dateTime: endDt.toISOString(),   timeZone: 'Asia/Kolkata' },
      attendees: [
        { email, displayName: name },
        { email: calEmail, organizer: true },
      ],
      conferenceData: {
        createRequest: {
          requestId: `swa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email',  minutes: 60 },
          { method: 'popup',  minutes: 10 },
        ],
      },
    }

    const res = await calendar.events.insert({
      calendarId:            'primary',
      resource:              event,
      conferenceDataVersion: 1,
      sendUpdates:           'all',
    })

    const meetLink =
      res.data.hangoutLink ||
      res.data.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri ||
      null

    console.log(`✅ Google Meet created: ${meetLink}`)
    return meetLink
  } catch (err) {
    console.error('❌ createMeetEvent error:', err.message)
    return null  // non-fatal — booking still proceeds
  }
}

module.exports = createMeetEvent
