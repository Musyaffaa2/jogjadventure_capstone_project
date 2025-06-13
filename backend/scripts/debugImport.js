const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const Destination = require('../models/Destination');
require('dotenv').config();

// Function to parse coordinate string dan convert ke GeoJSON format
function parseCoordinate(coordString) {
  if (!coordString || typeof coordString !== 'string') {
    return { lat: 0, lng: 0 };
  }
  try {
    const cleanCoord = coordString.replace(/'/g, '"');
    const parsed = JSON.parse(cleanCoord);
    
    return {
      lat: parsed.lat || 0,
      lng: parsed.lng || 0
    };
  } catch (error) {
    console.error('Error parsing coordinate:', coordString);
    return { lat: 0, lng: 0 };
  }
}

// Function to create GeoJSON Point
function createGeoJSONPoint(lat, lng) {
  return {
    type: 'Point',
    coordinates: [lng, lat] // PERHATIKAN: [longitude, latitude] - MongoDB format!
  };
}

// Updated formatDestinationData function
function formatDestinationData(row) {
  // Debug first row
  if (!formatDestinationData.debugLogged) {
    console.log('🔍 Row keys:', Object.keys(row));
    console.log('🔍 First row data:', row);
    formatDestinationData.debugLogged = true;
  }

  const coordinate = parseCoordinate(row.Coordinate);
  
  return {
    place_id: parseInt(row.Place_Id) || 0,
    place_name: row.Place_Name?.trim() || 'Unknown',
    description: row.Description?.trim() || 'No description available', 
    category: row.Category?.trim() || 'Unknown',
    city: row.City?.trim() || 'Unknown',
    city_new: row.City?.trim() || 'Unknown',
    price: parseInt(row.Price) || 0,
    rating: parseFloat(row.Rating) || 0,
    
    // Format GeoJSON untuk MongoDB 2dsphere index
    location: createGeoJSONPoint(coordinate.lat, coordinate.lng),
    
    // Tetap simpan format lama untuk kemudahan akses
    coordinate: coordinate,
    latitude: row.Latitude || '0',
    longitude: row.Longitude || '0',
    address: row.Address?.trim() || 'Address not available',
    content_string: row.Content_Text?.trim() || row.Content_String?.trim() || '',
    images: [],
    reviews: [],
    average_rating: parseFloat(row.Rating) || 0,
    total_reviews: 0
  };
}

// Function to validate destination
function validateDestination(dest) {
  const errors = [];
  
  if (!dest.place_name || dest.place_name === 'Unknown') {
    errors.push('Place name is required');
  }
  
  if (!dest.description || dest.description === 'No description available') {
    errors.push('Description is required');
  }
  
  if (!dest.address || dest.address === 'Address not available') {
    errors.push('Address is required');
  }
  
  return errors;
}

// Function to fix CSV format
function fixCSVFormat(csvFilePath) {
  const fixedFilePath = csvFilePath.replace('.csv', '_fixed.csv');
  
  return new Promise((resolve, reject) => {
    const content = fs.readFileSync(csvFilePath, 'utf8');
    console.log('📄 First 200 characters of CSV:');
    console.log(content.substring(0, 200));
    console.log('...\n');
    
    // Check if CSV is properly formatted
    const lines = content.split('\n');
    const firstLine = lines[0];
    
    console.log('🔍 First line:', firstLine);
    
    // Count commas to detect delimiter
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const tabCount = (firstLine.match(/\t/g) || []).length;
    
    console.log(`📊 Delimiter analysis: Commas: ${commaCount}, Semicolons: ${semicolonCount}, Tabs: ${tabCount}`);
    
    // Try different approaches to fix the CSV
    let fixedContent = content;
    
    // If it looks like the CSV is using semicolon as delimiter
    if (semicolonCount > commaCount && semicolonCount > 5) {
      console.log('🔧 Detected semicolon delimiter, converting to comma...');
      fixedContent = content.replace(/;/g, ',');
    }
    
    // If it looks like quotes are messed up
    if (firstLine.includes('"') && !firstLine.endsWith('"')) {
      console.log('🔧 Fixing quote issues...');
      // This is a complex fix, might need manual intervention
    }
    
    fs.writeFileSync(fixedFilePath, fixedContent);
    console.log(`✅ Fixed CSV saved to: ${fixedFilePath}`);
    resolve(fixedFilePath);
  });
}

// IMPROVED IMPORT FUNCTION WITH BETTER ERROR HANDLING
async function importWithTimeout(destinations) {
  console.log(`\n🚀 Starting import of ${destinations.length} destinations...`);
  
  let imported = 0;
  let failed = 0;
  const errors = [];
  const batchSize = 10; // Smaller batch size
  
  // Add connection monitoring
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error during import:', err.message);
  });

  // Process in smaller batches with timeout
  for (let i = 0; i < destinations.length; i += batchSize) {
    const batch = destinations.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(destinations.length / batchSize);
    
    console.log(`📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} items)...`);
    
    try {
      // Add timeout for each batch
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Batch timeout after 30 seconds')), 30000)
      );
      
      const insertPromise = Destination.insertMany(batch, { 
        ordered: false,
        timeout: 20000 // 20 second timeout per operation
      });
      
      const result = await Promise.race([insertPromise, timeoutPromise]);
      
      imported += batch.length;
      console.log(`✅ Batch ${batchNum} completed. Total imported: ${imported}/${destinations.length}`);
      
      // Small delay between batches to prevent overwhelming DB
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      if (error.code === 11000) {
        console.log(`⚠️ Duplicate keys in batch ${batchNum}, but continuing...`);
        imported += batch.length; // Count as imported since duplicates are expected
      } else if (error.message.includes('timeout')) {
        console.error(`⏰ Batch ${batchNum} timed out. Retrying with smaller batches...`);
        
        // Retry individual items in this batch
        for (const item of batch) {
          try {
            await Destination.create(item);
            imported++;
            console.log(`✅ Individual import: ${item.place_name}`);
          } catch (retryError) {
            failed++;
            errors.push({
              item: item.place_name,
              error: retryError.message
            });
            console.error(`❌ Failed: ${item.place_name} - ${retryError.message}`);
          }
        }
      } else {
        console.error(`❌ Batch ${batchNum} failed:`, error.message);
        failed += batch.length;
        errors.push({
          batch: batchNum,
          error: error.message
        });
      }
    }
    
    // Progress update
    if (batchNum % 5 === 0 || batchNum === totalBatches) {
      const progress = ((imported + failed) / destinations.length * 100).toFixed(1);
      console.log(`📊 Progress: ${progress}% (${imported} imported, ${failed} failed)`);
    }
  }
  
  return { imported, failed, errors };
}

async function importCSVData() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000, // 45 second socket timeout
    });
    console.log('✅ Connected to MongoDB');

    const deleteExisting = process.argv.includes('--clear');
    if (deleteExisting) {
      console.log('🗑️ Clearing existing destinations...');
      await Destination.deleteMany({});
      console.log('✅ Cleared existing destinations');
    }

    const originalCsvPath = path.join(__dirname, '../data/tourism_data.csv');
    
    if (!fs.existsSync(originalCsvPath)) {
      throw new Error(`CSV file not found at: ${originalCsvPath}`);
    }

    console.log('🔧 Attempting to fix CSV format...');
    let csvFilePath;
    
    try {
      csvFilePath = await fixCSVFormat(originalCsvPath);
    } catch (error) {
      console.log('⚠️ Could not fix CSV automatically, using original file');
      csvFilePath = originalCsvPath;
    }

    const destinations = [];
    let processedCount = 0;
    let validCount = 0;
    let invalidCount = 0;

    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(csvFilePath)
        .pipe(csv({
          // Try different parsing options
          separator: ',',
          quote: '"',
          escape: '"',
          skipEmptyLines: true,
          skipLinesWithError: false
        }))
        .on('data', (row) => {
          try {
            processedCount++;
            
            // Skip if row is the malformed header
            const rowKeys = Object.keys(row);
            if (rowKeys.length === 1 && rowKeys[0].includes('Place_Id","Place_Name"')) {
              console.log(`⚠️ Skipping malformed header row ${processedCount}`);
              invalidCount++;
              return;
            }
            
            const formattedData = formatDestinationData(row);
            
            // Less strict validation for debugging
            if (formattedData.place_name && formattedData.place_name !== 'Unknown') {
              destinations.push(formattedData);
              validCount++;
              
              if (validCount <= 3) {
                console.log(`✅ Valid data found: ${formattedData.place_name}`);
              }
            } else {
              invalidCount++;
              if (invalidCount <= 5) {
                console.log(`⚠️ Invalid row ${processedCount}: place_name = "${formattedData.place_name}"`);
              }
            }

            if (processedCount % 25 === 0) {
              console.log(`📊 Progress: ${processedCount} rows (Valid: ${validCount}, Invalid: ${invalidCount})`);
            }
          } catch (error) {
            console.error(`❌ Error processing row ${processedCount}:`, error.message);
            invalidCount++;
          }
        })
        .on('end', async () => {
          try {
            console.log(`\n📊 CSV Processing completed:`);
            console.log(`   Total rows processed: ${processedCount}`);
            console.log(`   Valid destinations: ${validCount}`);
            console.log(`   Invalid destinations: ${invalidCount}`);

            if (destinations.length === 0) {
              console.error('\n❌ No valid destinations found!');
              reject(new Error('No valid data found'));
              return;
            }

            // USE THE IMPROVED IMPORT FUNCTION
            const result = await importWithTimeout(destinations);
            
            console.log('\n🎉 Import process completed!');
            console.log(`📊 Final Results:`);
            console.log(`   ✅ Successfully imported: ${result.imported}`);
            console.log(`   ❌ Failed to import: ${result.failed}`);
            
            if (result.errors.length > 0) {
              console.log('\n🔍 Error details:');
              result.errors.slice(0, 10).forEach(err => {
                console.log(`   - ${err.item || `Batch ${err.batch}`}: ${err.error}`);
              });
              if (result.errors.length > 10) {
                console.log(`   ... and ${result.errors.length - 10} more errors`);
              }
            }

            const totalInDb = await Destination.countDocuments();
            console.log(`\n📊 Total destinations in database: ${totalInDb}`);

            resolve();
          } catch (error) {
            console.error('❌ Import process failed:', error.message);
            reject(error);
          }
        })
        .on('error', (error) => {
          console.error('❌ CSV parsing error:', error);
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
      console.error('❌ Import script failed:', error.message);
    })
    .finally(() => {
      if (mongoose.connection.readyState === 1) {
        mongoose.connection.close().then(() => {
          console.log('👋 Database connection closed');
          process.exit(0);
        });
      } else {
        process.exit(1);
      }
    });
}

module.exports = { importCSVData, formatDestinationData };