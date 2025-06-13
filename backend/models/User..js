// models/User.js
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    name: String,
    avatar: String,
    bio: String
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination'
  }],
  visited_places: [{
    destination_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination'
    },
    visited_at: {
      type: Date,
      default: Date.now
    }
  }],
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);