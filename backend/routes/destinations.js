
const express = require("express");
const router = express.Router();
const Destination = require("../models/Destination");

// Cache untuk mengurangi query berulang
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 menit

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Optimized image processing berdasarkan struktur data yang benar
const processImages = (destination) => {
  let mainImage = null;
  let gallery = [];

  // 1. Cek images array dengan is_primary = true
  if (destination.images && destination.images.length > 0) {
    const primaryImage = destination.images.find(img => img.is_primary === true);
    if (primaryImage) {
      mainImage = primaryImage.url;
    } else {
      // Fallback ke image pertama jika tidak ada primary
      mainImage = destination.images[0].url;
    }
    
    // Gallery dari images yang bukan primary
    gallery = destination.images
      .filter(img => !img.is_primary)
      .map(img => img.url);
  }
  
  // 2. Fallback ke main_image Cloudinary (legacy)
  if (!mainImage && destination.main_image?.url) {
    mainImage = destination.main_image.url;
  }
  
  // 3. Gallery dari gallery_images Cloudinary (legacy)
  if (gallery.length === 0 && destination.gallery_images?.length > 0) {
    gallery = destination.gallery_images
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(img => img.url)
      .filter(Boolean);
  }
  
  // 4. Final fallbacks jika tidak ada gambar
  if (!mainImage) {
    mainImage = `https://picsum.photos/400/300?random=${destination.place_id || destination._id}`;
  }
  
  if (gallery.length === 0) {
    gallery = [
      `https://picsum.photos/600/400?random=${destination.place_id}1`,
      `https://picsum.photos/600/400?random=${destination.place_id}2`,
      `https://picsum.photos/600/400?random=${destination.place_id}3`,
    ];
  }

  return { mainImage, gallery };
};

// Optimized transformation dengan field selection
const transformDestination = (destination, includeGallery = true) => {
  const { mainImage, gallery } = processImages(destination);
  
  // Base transformation sesuai struktur data yang benar
  const transformed = {
    id: destination._id,
    place_id: destination.place_id,
    name: destination.place_name,
    description: destination.description,
    location: destination.city_new || destination.city,
    rating: destination.average_rating || destination.rating || 0,
    total_reviews: destination.total_reviews || 0,
    image: mainImage,
    category: destination.category,
    price: destination.price ? `Rp ${destination.price.toLocaleString("id-ID")}` : "Gratis",
    coordinates: {
      lat: destination.location?.coordinates?.[1] || 
           destination.coordinate?.lat || 
           parseFloat(destination.latitude) || 0,
      lng: destination.location?.coordinates?.[0] || 
           destination.coordinate?.lng || 
           parseFloat(destination.longitude) || 0,
    },
  };

  // Add optional fields untuk detail view
  if (includeGallery) {
    transformed.gallery = gallery;
    transformed.duration = destination.duration || "2-3 jam";
    transformed.facilities = destination.facilities || ["Parkir", "Toilet", "Restoran"];
    transformed.activities = destination.activities || ["Wisata", "Fotografi"];
    transformed.openingHours = destination.operating_hours || "08:00 - 17:00 WIB";
    transformed.contact = destination.contact || "+62 274 000000";
    transformed.website = destination.website;
    transformed.bestTime = destination.best_time || "Pagi dan sore hari";
    transformed.capacity = destination.capacity || "Unlimited";
    transformed.tips = destination.tips || ["Bawa kamera", "Datang pagi hari"];
    transformed.address = destination.address;
    transformed.contentString = destination.content_string;
  }

  return transformed;
};

// ========== OPTIMIZED ENDPOINTS ==========

// GET /api/destinations - OPTIMIZED dengan aggregation
router.get("/", async (req, res) => {
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
      sort = "created_at",
    } = req.query;

    // Build aggregation pipeline
    const pipeline = [];

    // 1. Match stage - sesuai dengan struktur data yang ada
    const matchStage = {};
    
    // Filter berdasarkan city
    if (city) {
      matchStage.$or = [
        { city: new RegExp(city, "i") },
        { city_new: new RegExp(city, "i") }
      ];
    }
    
    if (category) matchStage.category = new RegExp(category, "i");
    
    // Filter berdasarkan price
    if (minPrice || maxPrice) {
      matchStage.price = {};
      if (minPrice) matchStage.price.$gte = Number(minPrice);
      if (maxPrice) matchStage.price.$lte = Number(maxPrice);
    }
    
    // Filter berdasarkan rating
    if (minRating) {
      matchStage.$or = [
        { average_rating: { $gte: Number(minRating) } },
        { rating: { $gte: Number(minRating) } }
      ];
    }

    // Text search
    if (search) {
      matchStage.$or = [
        { place_name: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { city: new RegExp(search, "i") },
        { city_new: new RegExp(search, "i") },
        { category: new RegExp(search, "i") },
        { address: new RegExp(search, "i") },
      ];
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // 2. Add computed fields
    pipeline.push({
      $addFields: {
        effective_rating: {
          $ifNull: ["$average_rating", "$rating", 0]
        }
      }
    });

    // 3. Sort stage
    const sortStage = {};
    switch (sort) {
      case "price_asc":
        sortStage.price = 1;
        break;
      case "price_desc":
        sortStage.price = -1;
        break;
      case "rating":
        sortStage.effective_rating = -1;
        sortStage.total_reviews = -1;
        break;
      case "name":
        sortStage.place_name = 1;
        break;
      case "popular":
        sortStage.effective_rating = -1;
        sortStage.total_reviews = -1;
        sortStage.view_count = -1;
        break;
      default:
        sortStage.created_at = -1;
    }
    pipeline.push({ $sort: sortStage });

    // 4. Project only needed fields untuk list view
    pipeline.push({
      $project: {
        place_id: 1,
        place_name: 1,
        description: 1,
        city: 1,
        city_new: 1,
        category: 1,
        price: 1,
        rating: 1,
        average_rating: 1,
        total_reviews: 1,
        images: 1, // Ambil semua images
        main_image: 1, // Legacy support
        location: 1,
        coordinate: 1,
        latitude: 1,
        longitude: 1,
        created_at: 1,
        updated_at: 1,
        content_string: 1
      }
    });

    // 5. Facet untuk pagination dan total count
    pipeline.push({
      $facet: {
        data: [
          { $skip: (page - 1) * parseInt(limit) },
          { $limit: parseInt(limit) }
        ],
        totalCount: [
          { $count: "count" }
        ]
      }
    });

    const [result] = await Destination.aggregate(pipeline);
    const destinations = result.data || [];
    const total = result.totalCount[0]?.count || 0;

    // Transform hasil
    const transformedDestinations = destinations.map(dest => 
      transformDestination(dest, false) // false = tidak include gallery untuk list view
    );

    res.json({
      destinations: transformedDestinations,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalDestinations: total,
      hasNext: page < Math.ceil(total / parseInt(limit)),
      hasPrev: page > 1,
    });

  } catch (error) {
    console.error("Error fetching destinations:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/destinations/featured/popular 
router.get("/featured/popular", async (req, res) => {
  try {
    const cacheKey = "popular_destinations";
    let popularDestinations = getCachedData(cacheKey);
    
    if (!popularDestinations) {
      popularDestinations = await Destination.aggregate([
        {
          $addFields: {
            effective_rating: { $ifNull: ["$average_rating", "$rating", 0] },
            popularity_score: {
              $add: [
                { $multiply: [{ $ifNull: ["$average_rating", "$rating", 0] }, 2] },
                { $multiply: [{ $ifNull: ["$total_reviews", 0] }, 0.1] },
                { $multiply: [{ $ifNull: ["$view_count", 0] }, 0.01] }
              ]
            }
          }
        },
        {
          $match: {
            effective_rating: { $gte: 4.0 }
          }
        },
        {
          $sort: { 
            popularity_score: -1,
            effective_rating: -1, 
            total_reviews: -1 
          }
        },
        {
          $limit: 8
        },
        {
          $project: {
            place_id: 1, place_name: 1, description: 1, city: 1, city_new: 1,
            category: 1, price: 1, rating: 1, average_rating: 1, total_reviews: 1,
            images: 1, main_image: 1, // Include both image structures
            location: 1, coordinate: 1, latitude: 1, longitude: 1,
            content_string: 1
          }
        }
      ]);
      
      setCachedData(cacheKey, popularDestinations);
    }

    const transformedDestinations = popularDestinations.map(dest => 
      transformDestination(dest, false)
    );
    
    res.json(transformedDestinations);

  } catch (error) {
    console.error("Error fetching popular destinations:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/destinations/search-suggestions
router.get("/search-suggestions", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const cacheKey = `suggestions_${q.toLowerCase()}`;
    let suggestions = getCachedData(cacheKey);
    
    if (!suggestions) {
      suggestions = await Destination.aggregate([
        {
          $match: {
            $or: [
              { place_name: new RegExp(q, "i") },
              { city: new RegExp(q, "i") },
              { city_new: new RegExp(q, "i") },
              { category: new RegExp(q, "i") },
              { description: new RegExp(q, "i") },
            ]
          }
        },
        {
          $addFields: {
            relevance_score: {
              $sum: [
                { $cond: [{ $regexMatch: { input: "$place_name", regex: q, options: "i" } }, 10, 0] },
                { $cond: [{ $regexMatch: { input: "$category", regex: q, options: "i" } }, 5, 0] },
                { $cond: [{ $regexMatch: { input: "$city", regex: q, options: "i" } }, 5, 0] },
                { $cond: [{ $regexMatch: { input: "$city_new", regex: q, options: "i" } }, 5, 0] },
                { $cond: [{ $regexMatch: { input: "$description", regex: q, options: "i" } }, 1, 0] }
              ]
            }
          }
        },
        {
          $sort: { relevance_score: -1, average_rating: -1 }
        },
        {
          $limit: 8
        },
        {
          $project: {
            place_name: 1, city: 1, city_new: 1, category: 1,
            images: 1, main_image: 1
          }
        }
      ]);
      
      setCachedData(cacheKey, suggestions);
    }

    const transformedSuggestions = suggestions.map((suggestion) => {
      const { mainImage } = processImages(suggestion);
      return {
        name: suggestion.place_name,
        location: suggestion.city_new || suggestion.city,
        category: suggestion.category,
        image: mainImage,
      };
    });

    res.json({ suggestions: transformedSuggestions });

  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({ error: error.message, suggestions: [] });
  }
});

// GET /api/destinations/nearby/:lat/:lng
router.get("/nearby/:lat/:lng", async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const { radius = 10000, limit = 20 } = req.query;

    // Build manual distance calculation untuk compatibility
    const destinations = await Destination.aggregate([
      {
        $addFields: {
          // Manual distance calculation
          distance: {
            $multiply: [
              6371000, // Earth radius in meters
              {
                $acos: {
                  $add: [
                    {
                      $multiply: [
                        { $sin: { $multiply: [{ $divide: [parseFloat(lat), 57.2958] }] } },
                        {
                          $sin: {
                            $multiply: [
                              {
                                $divide: [
                                  {
                                    $cond: [
                                      { $ne: ["$location.coordinates", null] },
                                      { $arrayElemAt: ["$location.coordinates", 1] },
                                      {
                                        $cond: [
                                          { $ne: ["$coordinate.lat", null] },
                                          "$coordinate.lat",
                                          { $toDecimal: "$latitude" }
                                        ]
                                      }
                                    ]
                                  },
                                  57.2958
                                ]
                              }
                            ]
                          }
                        }
                      ]
                    },
                    {
                      $multiply: [
                        { $cos: { $multiply: [{ $divide: [parseFloat(lat), 57.2958] }] } },
                        {
                          $cos: {
                            $multiply: [
                              {
                                $divide: [
                                  {
                                    $cond: [
                                      { $ne: ["$location.coordinates", null] },
                                      { $arrayElemAt: ["$location.coordinates", 1] },
                                      {
                                        $cond: [
                                          { $ne: ["$coordinate.lat", null] },
                                          "$coordinate.lat",
                                          { $toDecimal: "$latitude" }
                                        ]
                                      }
                                    ]
                                  },
                                  57.2958
                                ]
                              }
                            ]
                          }
                        },
                        {
                          $cos: {
                            $multiply: [
                              {
                                $divide: [
                                  {
                                    $subtract: [
                                      {
                                        $cond: [
                                          { $ne: ["$location.coordinates", null] },
                                          { $arrayElemAt: ["$location.coordinates", 0] },
                                          {
                                            $cond: [
                                              { $ne: ["$coordinate.lng", null] },
                                              "$coordinate.lng",
                                              { $toDecimal: "$longitude" }
                                            ]
                                          }
                                        ]
                                      },
                                      parseFloat(lng)
                                    ]
                                  },
                                  57.2958
                                ]
                              }
                            ]
                          }
                        }
                      ]
                    }
                  ]
                }
              }
            ]
          }
        }
      },
      {
        $match: {
          distance: { $lte: parseInt(radius) }
        }
      },
      {
        $sort: { distance: 1, average_rating: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          place_id: 1, place_name: 1, description: 1, city: 1, city_new: 1,
          category: 1, price: 1, rating: 1, average_rating: 1, total_reviews: 1,
          images: 1, main_image: 1,
          location: 1, coordinate: 1, latitude: 1, longitude: 1,
          distance: 1, content_string: 1
        }
      }
    ]);

    const transformedDestinations = destinations.map(dest => ({
      ...transformDestination(dest, false),
      distance: Math.round(dest.distance / 1000 * 100) / 100 // Convert to km, 2 decimal places
    }));

    res.json(transformedDestinations);

  } catch (error) {
    console.error("Error fetching nearby destinations:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/destinations/city/:cityName
router.get("/city/:cityName", async (req, res) => {
  try {
    const { cityName } = req.params;
    const { limit = 12, page = 1 } = req.query;
    
    const destinations = await Destination.find({
      $or: [
        { city: new RegExp(cityName, "i") },
        { city_new: new RegExp(cityName, "i") }
      ]
    })
    .sort({ average_rating: -1, total_reviews: -1 })
    .limit(parseInt(limit))
    .skip((page - 1) * parseInt(limit))
    .lean();

    const transformedDestinations = destinations.map(dest => 
      transformDestination(dest, false)
    );

    res.json(transformedDestinations);

  } catch (error) {
    console.error("Error fetching destinations by city:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/destinations/:id 
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cek cache terlebih dahulu
    const cacheKey = `destination_${id}`;
    let destination = getCachedData(cacheKey);
    
    if (!destination) {
      // Query dengan populate reviews
      destination = await Destination.findById(id)
        .populate({
          path: "reviews.user_id",
          select: "username profile.name profile.avatar"
        })
        .lean(); // Gunakan lean() untuk performance
      
      if (!destination) {
        return res.status(404).json({ error: "Destination not found" });
      }
      
      // Cache hasil
      setCachedData(cacheKey, destination);
    }

    // Increment view count (async, tidak perlu ditunggu)
    if (!getCachedData(`viewed_${id}`)) {
      Destination.findByIdAndUpdate(id, { $inc: { view_count: 1 } }).exec();
      setCachedData(`viewed_${id}`, true);
    }

    const transformedDestination = {
      ...transformDestination(destination, true),
      reviews: destination.reviews || [],
      view_count: destination.view_count || 0
    };

    res.json(transformedDestination);

  } catch (error) {
    console.error("Error fetching destination:", error);
    res.status(500).json({ error: error.message });
  }
});

// Clear cache setiap 10 menit
setInterval(() => {
  cache.clear();
  console.log("Cache cleared");
}, 10 * 60 * 1000);

module.exports = router;