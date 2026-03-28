const nodemailer = require('nodemailer')

// ── TRANSPORTER ──
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,   // TLS via STARTTLS on port 587
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
})

// ── SEND EMAIL ──
const sendEmail = async ({ to, cc, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from:    `"SWA Wellness" <${process.env.NODEMAILER_USER}>`,
      to,
      ...(cc && { cc }),
      subject,
      html,
    })
    console.log(`✅ Email sent to: ${to}`)
    return info
  } catch (err) {
    console.error('❌ Email failed:', err.message)
    throw err
  }
}

// ── TEMPLATE: booking confirmation (sent to the person who booked) ──
const bookingConfirmationTemplate = (booking) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#FAF5EF;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF5EF;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(66,49,31,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#42311F;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-family:Georgia,serif;font-size:28px;color:#D1B29D;letter-spacing:1px;">SWA™</h1>
              <p style="margin:6px 0 0;font-size:12px;color:rgba(209,178,157,0.7);letter-spacing:1.5px;text-transform:uppercase;">Where Self Meets Its True Essence</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:24px;color:#42311F;">Booking Confirmed ✓</h2>
              <p style="margin:0 0 28px;font-size:15px;color:#9E664B;line-height:1.6;">
                Hi <strong>${booking.name}</strong>, thank you for reaching out! We've received your demo request and our team will be in touch shortly.
              </p>

              <!-- Details card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF5EF;border-radius:12px;border:1px solid rgba(209,178,157,0.3);margin-bottom:28px;">
                <tr><td style="padding:24px 28px;">
                  <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#9E664B;font-weight:600;">Booking Details</p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                    ${row('Company',   booking.company)}
                    ${row('Team Size', booking.teamSize)}
                    ${row('Date',      booking.date)}
                    ${row('Time Slot', booking.timeSlot)}
                    ${booking.message ? row('Message', booking.message) : ''}
                  </table>
                </td></tr>
              </table>

              <p style="margin:0;font-size:14px;color:#9E664B;line-height:1.7;">
                If you have any questions before then, feel free to reply to this email.<br/>
                We look forward to connecting with you! 🌿
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#FAF5EF;border-top:1px solid rgba(209,178,157,0.3);padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:rgba(66,49,31,0.45);">© 2025 SWA Wellness. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

// ── TEMPLATE: booking notification (sent to admin) ──
const bookingNotificationTemplate = (booking) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#FAF5EF;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF5EF;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(66,49,31,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#42311F;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-family:Georgia,serif;font-size:24px;color:#D1B29D;">🔔 New Booking Received</h1>
              <p style="margin:6px 0 0;font-size:12px;color:rgba(209,178,157,0.7);letter-spacing:1.5px;text-transform:uppercase;">SWA Admin Notification</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 24px;font-size:15px;color:#9E664B;line-height:1.6;">
                A new demo request has been submitted. Review the details below and follow up within 24 hours.
              </p>

              <!-- Details card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF5EF;border-radius:12px;border:1px solid rgba(209,178,157,0.3);margin-bottom:28px;">
                <tr><td style="padding:24px 28px;">
                  <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#9E664B;font-weight:600;">Booking Details</p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                    ${row('Name',      booking.name)}
                    ${row('Email',     booking.email)}
                    ${row('Phone',     booking.phone)}
                    ${row('Company',   booking.company)}
                    ${row('Team Size', booking.teamSize)}
                    ${row('Date',      booking.date)}
                    ${row('Time Slot', booking.timeSlot)}
                    ${row('Status',    booking.status || 'pending')}
                    ${booking.message ? row('Message', booking.message) : ''}
                  </table>
                </td></tr>
              </table>

              <p style="margin:0;font-size:13px;color:rgba(66,49,31,0.5);line-height:1.7;">
                Log in to the SWA Admin Dashboard to confirm or manage this booking.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#FAF5EF;border-top:1px solid rgba(209,178,157,0.3);padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:rgba(66,49,31,0.45);">© 2025 SWA Wellness Admin — Confidential</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

// ── SHARED ROW HELPER (keeps templates DRY) ──
function row(label, value) {
  return `
    <tr>
      <td style="padding:6px 0;font-size:13px;color:rgba(66,49,31,0.5);width:110px;vertical-align:top;">${label}</td>
      <td style="padding:6px 0;font-size:13px;color:#42311F;font-weight:500;vertical-align:top;">${value}</td>
    </tr>
  `
}

module.exports = { sendEmail, bookingConfirmationTemplate, bookingNotificationTemplate }
