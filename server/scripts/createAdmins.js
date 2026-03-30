/**
 * One-time admin creation script.
 * Run with:  node server/scripts/createAdmins.js
 *
 * Creates both SWA admin accounts with a hashed password directly in MongoDB.
 * Does NOT touch seeders. Safe to re-run — uses upsert logic.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')
const User     = require('../models/User')

const ADMINS = [
  { name: 'Dhruvi Shah',    email: 'dhruvi@swaspaces.com' },
  { name: 'SWA Well-Being', email: 'well-begin@swaspaces.com' },
]

// Password is hashed before storage — never stored as plaintext
const RAW_PASSWORD = 'Swa@Spaces#2025'

async function run() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('✅ Connected to MongoDB\n')

  const hash = await bcrypt.hash(RAW_PASSWORD, 10)

  for (const admin of ADMINS) {
    const existing = await User.findOne({ email: admin.email })

    if (existing) {
      // Already exists — ensure role is admin and update password hash
      existing.role     = 'admin'
      existing.password = hash
      existing.name     = admin.name
      // Mark password as modified so pre-save hook does NOT re-hash an already-hashed value
      existing.$__.activePaths.paths.password = 'modify'
      // Use updateOne to bypass pre-save hook since we already have the hash
      await User.updateOne(
        { email: admin.email },
        { $set: { role: 'admin', password: hash, name: admin.name } }
      )
      console.log(`🔄 Updated existing user → admin: ${admin.email}`)
    } else {
      // Insert fresh — bypass pre-save hook by using insertOne with already-hashed password
      await User.collection.insertOne({
        name:      admin.name,
        email:     admin.email,
        password:  hash,
        googleId:  null,
        role:      'admin',
        avatar:    '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      console.log(`✅ Created new admin: ${admin.email}`)
    }
  }

  console.log('\n🎉 Both admin accounts are ready.')
  console.log('─────────────────────────────────────────')
  console.log('  Emails:   dhruvi@swaspaces.com')
  console.log('            well-begin@swaspaces.com')
  console.log('  Password: Swa@Spaces#2025')
  console.log('─────────────────────────────────────────')
  console.log('  ⚠️  Save the password securely. Delete this script after use.')

  await mongoose.disconnect()
  process.exit(0)
}

run().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
