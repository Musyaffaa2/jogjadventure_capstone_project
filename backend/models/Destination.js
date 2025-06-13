// models/Destination.js - Updated dengan GeoJSON support
const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  place_id: {
    type: Number,
    required: true,
    unique: true
  },
  place_name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  city: {
    type: String,
    required: true,
    index: true
  },
  city_new: {
    type: String,
    index: true
  },
  price: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  // GeoJSON format untuk MongoDB geospatial queries
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function(coordinates) {
          return coordinates.length === 2 && 
                 coordinates[0] >= -180 && coordinates[0] <= 180 && // longitude
                 coordinates[1] >= -90 && coordinates[1] <= 90;    // latitude
        },
        message: 'Coordinates must be [longitude, latitude] with valid ranges'
      }
    }
  },
  // Tetap simpan format lama untuk backward compatibility
  coordinate: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number, 
      required: true
    }
  },
  latitude: String,
  longitude: String,
  address: {
    type: String,
    required: true
  },
  content_string: String,
  images: [{
    type: String // URL gambar
  }],
  reviews: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  average_rating: {
    type: Number,
    default: 0
  },
  total_reviews: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes untuk optimasi search
destinationSchema.index({ 
  place_name: 'text', 
  description: 'text', 
  category: 'text',
  city: 'text' 
});

// GeoJSON index untuk geospatial queries
destinationSchema.index({ location: '2dsphere' });

// Middleware untuk auto-update updated_at
destinationSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Method untuk mendapatkan jarak dari titik tertentu
destinationSchema.methods.getDistanceFrom = function(lat, lng) {
  const earthRadius = 6371; // km
  const dLat = (lat - this.coordinate.lat) * Math.PI / 180;
  const dLng = (lng - this.coordinate.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.coordinate.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return earthRadius * c;
};

// Static method untuk mencari berdasarkan lokasi
destinationSchema.statics.findNearby = function(lat, lng, maxDistance = 10000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat] // [longitude, latitude]
        },
        $maxDistance: maxDistance // dalam meter
      }
    }
  });
};

module.exports = mongoose.model('Destination', destinationSchema);