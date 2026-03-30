const nodemailer = require('nodemailer')

// ── TRANSPORTER ──────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   'smtp.gmail.com',
  port:   587,
  secure: false,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
})

// ── SEND EMAIL ───────────────────────────────────────────────────
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

// ── SHARED HELPERS ───────────────────────────────────────────────
function row(label, value) {
  return `
    <tr>
      <td style="padding:10px 0 10px 0;width:120px;vertical-align:top;">
        <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#A0845C;">${label}</span>
      </td>
      <td style="padding:10px 0 10px 12px;vertical-align:top;border-left:2px solid #F0E8DC;">
        <span style="font-size:14px;color:#3B2A1A;font-weight:500;line-height:1.5;">${value}</span>
      </td>
    </tr>
  `
}

function meetButton(meetLink) {
  if (!meetLink) return ''
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
      <tr>
        <td align="center">
          <a href="${meetLink}" target="_blank"
            style="display:inline-flex;align-items:center;gap:10px;background:#1a73e8;color:#ffffff;text-decoration:none;
                   padding:14px 32px;border-radius:50px;font-size:15px;font-weight:700;font-family:'Helvetica Neue',Arial,sans-serif;
                   letter-spacing:0.3px;box-shadow:0 4px 16px rgba(26,115,232,0.35);">
            <svg width="20" height="20" viewBox="0 0 48 48" style="flex-shrink:0;">
              <path d="M35 14l9-7v34l-9-7V14z" fill="#ffffff" opacity="0.9"/>
              <rect x="4" y="10" width="31" height="28" rx="4" fill="#ffffff" opacity="0.9"/>
              <path d="M35 14l9-7v34l-9-7V14z" fill="none" stroke="#ffffff" stroke-width="1"/>
            </svg>
            Join Google Meet
          </a>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-top:10px;">
          <a href="${meetLink}" style="font-size:12px;color:#1a73e8;text-decoration:none;font-family:'Helvetica Neue',Arial,sans-serif;
             word-break:break-all;">${meetLink}</a>
        </td>
      </tr>
    </table>
  `
}

// ── TEMPLATE: Confirmation (sent to the person who booked) ───────
const bookingConfirmationTemplate = (booking) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Confirmed — SWA Wellness</title>
</head>
<body style="margin:0;padding:0;background:#F7F1EA;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F1EA;padding:48px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(59,42,26,0.10);">

        <!-- ── TOP BAND ── -->
        <tr>
          <td style="background:linear-gradient(135deg,#3B2A1A 0%,#5C3D2E 100%);padding:36px 40px 28px;text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#C4956A;">SWA WELLNESS</p>
            <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:#F5ECD7;letter-spacing:0.5px;">
              Your Demo is Confirmed
            </h1>
          </td>
        </tr>

        <!-- ── SUCCESS ICON ── -->
        <tr>
          <td align="center" style="padding:32px 40px 0;">
            <div style="width:56px;height:56px;background:#E8F5E9;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 style="margin:0 0 8px;font-size:18px;font-weight:700;color:#3B2A1A;">Hi ${booking.name}! 👋</h2>
            <p style="margin:0;font-size:15px;color:#7A6652;line-height:1.7;max-width:420px;">
              We've received your demo request. Here's everything you need for your session.
            </p>
          </td>
        </tr>

        ${booking.meetLink ? `
        <!-- ── MEET LINK SECTION ── -->
        <tr>
          <td style="padding:24px 40px 0;">
            <div style="background:#EDF3FE;border-radius:14px;padding:24px;text-align:center;border:1px solid #C5D8FA;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#1a73e8;">Your Google Meet Link</p>
              <p style="margin:0 0 16px;font-size:13px;color:#4A6FA5;">Use this link to join your scheduled session</p>
              ${meetButton(booking.meetLink)}
            </div>
          </td>
        </tr>
        ` : ''}

        <!-- ── BOOKING DETAILS ── -->
        <tr>
          <td style="padding:24px 40px;">
            <div style="background:#FAF6F1;border-radius:14px;padding:24px;border:1px solid #EDE0CF;">
              <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#A0845C;">Booking Details</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${row('Date',      booking.date)}
                ${row('Time',      booking.timeSlot + ' IST')}
                ${row('Company',   booking.company)}
                ${row('Team Size', booking.teamSize)}
                ${booking.message ? row('Message', booking.message) : ''}
              </table>
            </div>
          </td>
        </tr>

        <!-- ── NOTE ── -->
        <tr>
          <td style="padding:0 40px 32px;">
            <p style="margin:0;font-size:14px;color:#7A6652;line-height:1.8;text-align:center;">
              Our team will reach out if there are any changes.<br/>
              Questions? Simply reply to this email. 🌿
            </p>
          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <tr>
          <td style="background:#FAF6F1;border-top:1px solid #EDE0CF;padding:20px 40px;text-align:center;">
            <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#A0845C;letter-spacing:1px;text-transform:uppercase;">SWA Wellness</p>
            <p style="margin:0;font-size:11px;color:#B8A898;">Where Self Meets Its True Essence</p>
            <p style="margin:8px 0 0;font-size:11px;color:#C4B5A5;">© 2025 SWA Wellness. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>
`

// ── TEMPLATE: Admin Notification ─────────────────────────────────
const bookingNotificationTemplate = (booking) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Booking — SWA Admin</title>
</head>
<body style="margin:0;padding:0;background:#F7F1EA;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F1EA;padding:48px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(59,42,26,0.10);">

        <!-- ── TOP BAND ── -->
        <tr>
          <td style="background:linear-gradient(135deg,#3B2A1A 0%,#5C3D2E 100%);padding:36px 40px 28px;text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#C4956A;">SWA ADMIN ALERT</p>
            <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:#F5ECD7;">
              New Demo Booking
            </h1>
          </td>
        </tr>

        <!-- ── ALERT BANNER ── -->
        <tr>
          <td style="padding:24px 40px 0;">
            <div style="background:#FFF8E7;border-radius:12px;padding:14px 20px;border-left:4px solid #F0B429;display:flex;align-items:center;gap:10px;">
              <span style="font-size:20px;">🔔</span>
              <p style="margin:0;font-size:14px;color:#7A5C1E;font-weight:600;">
                A new demo has been booked. Follow up within 24 hours.
              </p>
            </div>
          </td>
        </tr>

        ${booking.meetLink ? `
        <!-- ── MEET LINK ── -->
        <tr>
          <td style="padding:20px 40px 0;">
            <div style="background:#EDF3FE;border-radius:14px;padding:20px;text-align:center;border:1px solid #C5D8FA;">
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#1a73e8;">Google Meet Created</p>
              ${meetButton(booking.meetLink)}
            </div>
          </td>
        </tr>
        ` : ''}

        <!-- ── CLIENT DETAILS ── -->
        <tr>
          <td style="padding:20px 40px;">
            <div style="background:#FAF6F1;border-radius:14px;padding:24px;border:1px solid #EDE0CF;">
              <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#A0845C;">Client Details</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${row('Name',      booking.name)}
                ${row('Email',     booking.email)}
                ${row('Phone',     booking.phone)}
                ${row('Company',   booking.company)}
                ${row('Team Size', booking.teamSize)}
                ${row('Date',      booking.date)}
                ${row('Time',      booking.timeSlot + ' IST')}
                ${row('Status',    booking.status || 'pending')}
                ${booking.message ? row('Message', booking.message) : ''}
              </table>
            </div>
          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <tr>
          <td style="background:#FAF6F1;border-top:1px solid #EDE0CF;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#A0845C;font-weight:600;">SWA Admin Dashboard — Confidential</p>
            <p style="margin:4px 0 0;font-size:11px;color:#C4B5A5;">© 2025 SWA Wellness. Do not forward.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>
`

module.exports = { sendEmail, bookingConfirmationTemplate, bookingNotificationTemplate }
