const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/swa_website').then(async () => {
  const db = mongoose.connection.db;
  
  const urls = [
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&q=80',
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1400&q=80',
    'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1400&q=80'
  ];

  await db.collection('contents').updateOne(
    { section: 'hero', key: 'mediaType' },
    { $set: { value: 'link' } },
    { upsert: true }
  );

  await db.collection('contents').updateOne(
    { section: 'hero', key: 'mediaUrl' },
    { $set: { value: JSON.stringify(urls) } },
    { upsert: true }
  );
  
  console.log('Hero media initialized to the 3 CTABanner images.');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
