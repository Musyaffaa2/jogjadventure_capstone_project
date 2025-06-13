const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const Destination = require('../models/Destination');
require('dotenv').config();

// Function to parse coordinate string to object
function parseCoordinate(coordString) {
  if (!coordString || typeof coordString !== 'string') {
    return { lat: 0, lng: 0 };
  }
  try {
    const cleanCoord = coordString.replace(/'/g, '"');
    return JSON.parse(cleanCoord);
  } catch (error) {
    console.error('Error parsing coordinate:', coordString);
    return { lat: 0, lng: 0 };
  }
}

// Function to find the correct column name (case-insensitive)
function findColumn(row, possibleNames) {
  const keys = Object.keys(row);
  for (const possibleName of possibleNames) {
    const found = keys.find(key => 
      key.toLowerCase().trim() === possibleName.toLowerCase().trim()
    );
    if (found) return found;
  }
  return null;
}

// Function to clean and format data with flexible column mapping
function formatDestinationData(row) {
  // Debug: Show available columns for first row
  if (!formatDestinationData.headerLogged) {
    console.log('🔍 Available CSV columns:', Object.keys(row));
    formatDestinationData.headerLogged = true;
  }

  // Flexible column mapping - try different possible names
  const placeIdCol = findColumn(row, ['Place_Id', 'place_id', 'id', 'Place Id', 'PlaceId']);
  const placeNameCol = findColumn(row, ['Place_Name', 'place_name', 'name', 'Place Name', 'PlaceName', 'destination_name']);
  const descriptionCol = findColumn(row, ['Description', 'description', 'desc', 'Description ', 'deskripsi']);
  const categoryCol = findColumn(row, ['Category', 'category', 'type', 'jenis', 'kategori']);
  const cityCol = findColumn(row, ['City', 'city', 'kota', 'City ']);
  const cityNewCol = findColumn(row, ['City_New', 'city_new', 'City New', 'kota_baru']);
  const priceCol = findColumn(row, ['Price', 'price', 'harga', 'cost', 'tarif']);
  const ratingCol = findColumn(row, ['Rating', 'rating', 'rate', 'nilai', 'score']);
  const coordinateCol = findColumn(row, ['Coordinate', 'coordinate', 'coordinates', 'coord', 'lokasi']);
  const latitudeCol = findColumn(row, ['Latitude', 'latitude', 'lat', 'lintang']);
  const longitudeCol = findColumn(row, ['Longitude', 'longitude', 'lng', 'long', 'bujur']);
  const addressCol = findColumn(row, ['Address', 'address', 'alamat', 'lokasi_alamat']);
  const contentCol = findColumn(row, ['Content_String', 'content_string', 'content', 'isi', 'konten']);

  const formatted = {
    place_id: placeIdCol ? parseInt(row[placeIdCol]) || 0 : 0,
    place_name: placeNameCol ? row[placeNameCol]?.trim() : 'Unknown',
    description: descriptionCol ? row[descriptionCol]?.trim() : '',
    category: categoryCol ? row[categoryCol]?.trim() : 'Unknown',
    city: cityCol ? row[cityCol]?.trim() : 'Unknown',
    city_new: cityNewCol ? row[cityNewCol]?.trim() : (cityCol ? row[cityCol]?.trim() : 'Unknown'),
    price: priceCol ? (parseInt(row[priceCol]) || 0) : 0,
    rating: ratingCol ? (parseFloat(row[ratingCol]) || 0) : 0,
    coordinate: coordinateCol ? parseCoordinate(row[coordinateCol]) : { lat: 0, lng: 0 },
    latitude: latitudeCol ? row[latitudeCol] : '0',
    longitude: longitudeCol ? row[longitudeCol] : '0',
    address: addressCol ? row[addressCol]?.trim() : '',
    content_string: contentCol ? row[contentCol]?.trim() : '',
    images: [],
    reviews: [],
    average_rating: ratingCol ? (parseFloat(row[ratingCol]) || 0) : 0,
    total_reviews: 0
  };

  // Show first successful mapping
  if (!formatDestinationData.sampleLogged && formatted.place_name !== 'Unknown') {
    console.log('✅ Sample mapped data:', {
      place_name: formatted.place_name,
      description: formatted.description?.substring(0, 50) + '...',
      category: formatted.category,
      city: formatted.city
    });
    formatDestinationData.sampleLogged = true;
  }

  return formatted;
}

// Function to validate destination data
function validateDestination(dest) {
  const errors = [];
  
  if (!dest.place_name || dest.place_name.trim() === '' || dest.place_name === 'Unknown') {
    errors.push('Place name is required');
  }
  
  if (!dest.description || dest.description.trim() === '') {
    errors.push('Description is required');
  }
  
  if (!dest.address || dest.address.trim() === '') {
    errors.push('Address is required');
  }
  
  return errors;
}

async function importCSVData() {
  try {
    // Check MongoDB connection
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const deleteExisting = process.argv.includes('--clear');
    if (deleteExisting) {
      await Destination.deleteMany({});
      console.log('🗑️  Cleared existing destinations');
    }

    const csvFilePath = path.join(__dirname, '../data/tourism_data.csv');
    
    // Check if file exists
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSV file not found at: ${csvFilePath}`);
    }
    
    console.log('📂 Reading CSV file:', csvFilePath);

    const destinations = [];
    let processedCount = 0;
    let validCount = 0;
    let invalidCount = 0;

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          try {
            processedCount++;
            const formattedData = formatDestinationData(row);
            
            // Validate the data
            const validationErrors = validateDestination(formattedData);
            
            if (validationErrors.length === 0) {
              destinations.push(formattedData);
              validCount++;
            } else {
              invalidCount++;
              if (invalidCount <= 5) { // Show only first 5 invalid records
                console.log(`⚠️  Row ${processedCount} validation failed: ${validationErrors.join(', ')}`);
                console.log(`   Place: ${formattedData.place_name}`);
              }
            }

            // Show progress every 25 rows
            if (processedCount % 25 === 0) {
              console.log(`📊 Processed ${processedCount} rows (Valid: ${validCount}, Invalid: ${invalidCount})`);
            }
          } catch (error) {
            console.error('Error processing row:', error);
            invalidCount++;
          }
        })
        .on('end', async () => {
          try {
            console.log(`\n📊 Processing completed:`);
            console.log(`   Total rows: ${processedCount}`);
            console.log(`   Valid destinations: ${validCount}`);
            console.log(`   Invalid destinations: ${invalidCount}`);

            if (destinations.length === 0) {
              console.error('\n❌ No valid destinations found!');
              console.log('This could be due to:');
              console.log('1. CSV column names not matching expected format');
              console.log('2. All records missing required fields (place_name, description, address)');
              console.log('3. Data format issues');
              
              // Show a sample of raw data for debugging
              console.log('\n🔍 Debug: First few rows structure needed');
              reject(new Error('No valid data found'));
              return;
            }

            console.log(`\n🚀 Starting import of ${destinations.length} valid destinations...`);
            
            const batchSize = 50; // Smaller batch size for better error handling
            let imported = 0;
            let failed = 0;

            for (let i = 0; i < destinations.length; i += batchSize) {
              const batch = destinations.slice(i, i + batchSize);
              try {
                // Use insertMany with ordered: false to continue on duplicates
                const result = await Destination.insertMany(batch, { 
                  ordered: false,
                  rawResult: true 
                });
                imported += result.insertedCount || batch.length;
                console.log(`✅ Imported batch ${Math.floor(i/batchSize) + 1}: ${imported}/${destinations.length} total`);
              } catch (error) {
                if (error.code === 11000) {
                  // Handle duplicate key errors
                  const duplicates = error.writeErrors ? error.writeErrors.length : 0;
                  const successful = batch.length - duplicates;
                  imported += successful;
                  console.log(`⚠️  Batch ${Math.floor(i/batchSize) + 1}: ${successful} imported, ${duplicates} duplicates skipped`);
                } else {
                  console.error(`❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, error.message);
                  failed += batch.length;
                }
              }
            }

            console.log('\n🎉 Data import completed!');
            console.log(`📈 Successfully imported: ${imported} destinations`);
            if (failed > 0) {
              console.log(`❌ Failed to import: ${failed} destinations`);
            }

            // Verify final count
            const totalInDb = await Destination.countDocuments();
            console.log(`📊 Total destinations in database: ${totalInDb}`);

            // Show statistics
            if (totalInDb > 0) {
              const stats = await Destination.aggregate([
                {
                  $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    avgRating: { $avg: '$rating' },
                    avgPrice: { $avg: '$price' }
                  }
                },
                { $sort: { count: -1 } }
              ]);

              console.log('\n📊 Database Statistics:');
              stats.forEach(stat => {
                console.log(`${stat._id}: ${stat.count} destinations (avg rating: ${stat.avgRating.toFixed(1)}, avg price: ${stat.avgPrice.toFixed(0)})`);
              });
            }

            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          console.error('❌ CSV reading error:', error);
          reject(error);
        });
    });

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

// Run import
if (require.main === module) {
  importCSVData()
    .then(() => {
      console.log('✅ Import script completed successfully');
    })
    .catch((error) => {
      console.error('❌ Import script failed:', error);
      process.exit(1);
    })
    .finally(() => {
      if (mongoose.connection.readyState === 1) {
        mongoose.connection.close().then(() => {
          console.log('👋 Database connection closed');
          process.exit(0);
        });
      }
    });
}

module.exports = { importCSVData, formatDestinationData };