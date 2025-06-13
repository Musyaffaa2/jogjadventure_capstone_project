// routes/destinations.js
const express = require('express');
const router = express.Router();
const Destination = require('../models/Destination');

// GET /api/destinations - Get all destinations with filters
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      city, 
      category, 
      minPrice, 
      maxPrice, 
      minRating,
      search,
      sort = 'created_at'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (city) filter.city = new RegExp(city, 'i');
    if (category) filter.category = new RegExp(category, 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (minRating) filter.rating = { $gte: Number(minRating) };
    
    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Sort options
    const sortOptions = {};
    switch (sort) {
      case 'price_asc':
        sortOptions.price = 1;
        break;
      case 'price_desc':
        sortOptions.price = -1;
        break;
      case 'rating':
        sortOptions.rating = -1;
        break;
      case 'name':
        sortOptions.place_name = 1;
        break;
      default:
        sortOptions.created_at = -1;
    }

    const destinations = await Destination.find(filter)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-reviews'); // Exclude reviews for list view

    const total = await Destination.countDocuments(filter);

    res.json({
      destinations,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalDestinations: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/destinations/:id - Get single destination
router.get('/:id', async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id)
      .populate('reviews.user_id', 'username profile.name profile.avatar')
      .populate({
        path: 'reviews',
        populate: {
          path: 'user_id',
          select: 'username profile.name profile.avatar'
        }
      });

    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    res.json(destination);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/destinations/search/suggestions - Search suggestions
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const suggestions = await Destination.find({
      $or: [
        { place_name: new RegExp(q, 'i') },
        { city: new RegExp(q, 'i') },
        { category: new RegExp(q, 'i') }
      ]
    })
    .select('place_name city category')
    .limit(10);

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/destinations/nearby/:lat/:lng - Get nearby destinations
router.get('/nearby/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const { radius = 10000 } = req.query; // 10km default

    const destinations = await Destination.find({
      coordinate: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    }).limit(20);

    res.json(destinations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/destinations/categories - Get all categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Destination.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/destinations/cities - Get all cities
router.get('/meta/cities', async (req, res) => {
  try {
    const cities = await Destination.distinct('city');
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/destinations/popular - Get popular destinations
router.get('/featured/popular', async (req, res) => {
  try {
    const popularDestinations = await Destination.find({
      rating: { $gte: 4.0 }
    })
    .sort({ rating: -1, total_reviews: -1 })
    .limit(8)
    .select('-reviews');

    res.json(popularDestinations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/destinations - Create new destination (Admin only)
router.post('/', async (req, res) => {
  try {
    const destination = new Destination(req.body);
    await destination.save();
    res.status(201).json(destination);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;