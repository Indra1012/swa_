const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    console.log(`✅ MongoDB connected: ${conn.connection.host} / ${conn.connection.name}`)
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`)
    process.exit(1)
  }
}

// Event listeners for ongoing connection health
mongoose.connection.on('error',        (err) => console.error(`❌ MongoDB error: ${err.message}`))
mongoose.connection.on('disconnected', ()    => console.warn('⚠️  MongoDB disconnected'))
mongoose.connection.on('reconnected',  ()    => console.log('✅ MongoDB reconnected'))

module.exports = connectDB
