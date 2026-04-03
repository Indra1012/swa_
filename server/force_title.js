const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/swa_website').then(async () => {
  const db = mongoose.connection.db;
  
  await db.collection('contents').updateOne(
    { section: 'testimonials', key: 'title' },
    { $set: { value: 'Voices of SWA' } },
    { upsert: true }
  );
  
  console.log('Testimonial title forced to DB successfully.');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
