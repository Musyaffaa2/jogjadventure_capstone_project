// scripts/testGeospatial.js
const mongoose = require('mongoose');
const Destination = require('../models/Destination');
require('dotenv').config();

async function testGeospatialFeatures() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Test 1: Basic query
    console.log('\n🧪 Test 1: Basic query');
    const totalDocs = await Destination.countDocuments();
    console.log(`Total destinations: ${totalDocs}`);

    // Test 2: Sample data dengan location
    console.log('\n🧪 Test 2: Check location data');
    const sampleDocs = await Destination.find({ location: { $exists: true } }).limit(3);
    sampleDocs.forEach(doc => {
      console.log(`${doc.place_name}:`);
      console.log(`  Location: ${JSON.stringify(doc.location)}`);
      console.log(`  Coordinate: lat=${doc.coordinate.lat}, lng=${doc.coordinate.lng}`);
    });

    if (sampleDocs.length === 0) {
      console.log('❌ No documents with location field found!');
      return;
    }

    // Test 3: Near query (cari tempat di sekitar Yogyakarta)
    console.log('\n🧪 Test 3: Near query around Yogyakarta');
    const yogyaLat = -7.7956;
    const yogyaLng = 110.3695;
    
    const nearbyPlaces = await Destination.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [yogyaLng, yogyaLat] // [longitude, latitude]
          },
          $maxDistance: 10000 // 10km radius
        }
      }
    }).limit(5);

    console.log(`Found ${nearbyPlaces.length} places within 10km of Yogyakarta center:`);
    nearbyPlaces.forEach(place => {
      const distance = place.getDistanceFrom(yogyaLat, yogyaLng);
      console.log(`  - ${place.place_name} (${distance.toFixed(2)} km away)`);
    });

    // Test 4: Using static method
    console.log('\n🧪 Test 4: Using static findNearby method');
    const nearbyWithMethod = await Destination.findNearby(yogyaLat, yogyaLng, 5000);
    console.log(`Found ${nearbyWithMethod.length} places within 5km using static method`);

    // Test 5: Geo Within query (dalam area tertentu)
    console.log('\n🧪 Test 5: Geo Within polygon');
    const withinBounds = await Destination.find({
      location: {
        $geoWithin: {
          $box: [
            [110.3, -7.9], // bottom-left [lng, lat]
            [110.4, -7.7]  // top-right [lng, lat]
          ]
        }
      }
    }).limit(10);

    console.log(`Found ${withinBounds.length} places within bounding box`);
    withinBounds.slice(0, 3).forEach(place => {
      console.log(`  - ${place.place_name} at [${place.location.coordinates[1]}, ${place.location.coordinates[0]}]`);
    });

    // Test 6: Aggregate dengan geospatial
    console.log('\n🧪 Test 6: Aggregate with geospatial');
    const aggregateResult = await Destination.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [yogyaLng, yogyaLat]
          },
          distanceField: 'distance',
          maxDistance: 15000,
          spherical: true
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgDistance: { $avg: '$distance' },
          places: { $push: '$place_name' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    console.log('Places by category within 15km:');
    aggregateResult.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} places (avg distance: ${(cat.avgDistance/1000).toFixed(2)} km)`);
    });

    console.log('\n🎉 All geospatial tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
}

// Run test
if (require.main === module) {
  testGeospatialFeatures()
    .then(() => {
      console.log('✅ Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testGeospatialFeatures };