// scripts/fixGeospatialIndex.js
const mongoose = require('mongoose');
require('dotenv').config();

async function fixGeospatialIssue() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('destinations');

    // 1. Drop index geospatial yang bermasalah
    console.log('🗑️ Dropping problematic geospatial index...');
    try {
      await collection.dropIndex('coordinate_2dsphere');
      console.log('✅ Dropped coordinate_2dsphere index');
    } catch (error) {
      console.log('ℹ️ Index coordinate_2dsphere not found (probably already dropped)');
    }

    // 2. Check dan drop index lain yang mungkin bermasalah
    console.log('🔍 Checking existing indexes...');
    const existingIndexes = await collection.listIndexes().toArray();
    console.log('Current indexes:', existingIndexes.map(idx => idx.name));

    for (const index of existingIndexes) {
      if (index.name !== '_id_' && index.name.includes('coordinate')) {
        try {
          await collection.dropIndex(index.name);
          console.log(`✅ Dropped index: ${index.name}`);
        } catch (error) {
          console.log(`⚠️ Could not drop index ${index.name}:`, error.message);
        }
      }
    }

    // 3. Fix coordinate format untuk semua documents
    console.log('🔧 Fixing coordinate format in existing documents...');
    const documents = await collection.find({}).toArray();
    console.log(`Found ${documents.length} documents to process`);
    
    let fixed = 0;
    for (const doc of documents) {
      const updates = {};
      
      // Parse coordinate dari berbagai format yang mungkin ada
      let lat = 0, lng = 0;
      
      if (doc.coordinate) {
        if (typeof doc.coordinate.lat === 'number') {
          lat = doc.coordinate.lat;
          lng = doc.coordinate.lng;
        } else if (typeof doc.coordinate.lat === 'string') {
          lat = parseFloat(doc.coordinate.lat) || 0;
          lng = parseFloat(doc.coordinate.lng) || 0;
        }
      }
      
      // Fallback ke latitude/longitude string
      if (lat === 0 && lng === 0) {
        lat = parseFloat(doc.latitude) || 0;
        lng = parseFloat(doc.longitude) || 0;
      }
      
      // Pastikan koordinat valid
      if (lat !== 0 || lng !== 0) {
        // Update coordinate ke format yang konsisten
        updates.coordinate = { lat, lng };
        
        // Tambahkan location field dengan format GeoJSON
        updates.location = {
          type: 'Point',
          coordinates: [lng, lat] // [longitude, latitude] - MongoDB format!
        };
        
        await collection.updateOne({ _id: doc._id }, { $set: updates });
        fixed++;
        
        if (fixed <= 5) {
          console.log(`✅ Fixed coordinate for: ${doc.place_name} (${lat}, ${lng})`);
        }
      } else {
        console.log(`⚠️ Invalid coordinates for: ${doc.place_name}`);
      }
    }
    
    console.log(`✅ Fixed ${fixed} documents`);

    // 4. Create new indexes with proper format
    console.log('📊 Creating new indexes...');
    
    // GeoJSON index untuk location field
    await collection.createIndex({ location: '2dsphere' });
    console.log('✅ Created location_2dsphere index');
    
    // Text search index
    await collection.createIndex({ 
      place_name: 'text', 
      description: 'text', 
      category: 'text',
      city: 'text' 
    });
    console.log('✅ Created text search index');
    
    // Other useful indexes
    await collection.createIndex({ category: 1 });
    await collection.createIndex({ city: 1 });
    await collection.createIndex({ city_new: 1 });
    
    // Unique index untuk place_id
    try {
      await collection.createIndex({ place_id: 1 }, { unique: true });
      console.log('✅ Created unique place_id index');
    } catch (error) {
      console.log('⚠️ Could not create unique place_id index (might have duplicates)');
    }

    console.log('🎉 Migration completed successfully!');
    
    // Verify results
    const count = await collection.countDocuments();
    console.log(`📊 Total documents: ${count}`);
    
    const newIndexes = await collection.listIndexes().toArray();
    console.log('📊 Current indexes:');
    newIndexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Test GeoJSON query
    console.log('\n🧪 Testing GeoJSON query...');
    const testDoc = await collection.findOne({ location: { $exists: true } });
    if (testDoc) {
      console.log(`✅ Sample location data: ${JSON.stringify(testDoc.location)}`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
}

// Run migration
if (require.main === module) {
  fixGeospatialIssue()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixGeospatialIssue };