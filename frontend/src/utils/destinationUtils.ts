
import { Destination, Category } from '../types/destination';

export const normalizeDestination = (dest: any): Destination => {
  // Handle coordinates
  const coordinates = dest.coordinates || dest.coordinate || {
    lat: parseFloat(dest.latitude) || 0,
    lng: parseFloat(dest.longitude) || 0
  };

  // Handle price formatting
  const formatPrice = (price: any) => {
    if (typeof price === 'number') {
      return price === 0 ? 'Gratis' : `Rp ${price.toLocaleString('id-ID')}`;
    }
    if (typeof price === 'string' && !isNaN(Number(price))) {
      const numPrice = Number(price);
      return numPrice === 0 ? 'Gratis' : `Rp ${numPrice.toLocaleString('id-ID')}`;
    }
    return price || 'Hubungi pengelola';
  };

  return {
    id: dest._id || dest.id,
    place_id: dest.place_id,
    place_name: dest.place_name || dest.name,
    name: dest.place_name || dest.name,
    description: dest.description,
    location: dest.address || dest.location || dest.full_location || `${dest.city_new || dest.city}`,
    city: dest.city_new || dest.city,
    city_new: dest.city_new,
    rating: dest.average_rating || dest.rating || 0,
    average_rating: dest.average_rating || dest.rating || 0,
    total_reviews: dest.total_reviews || 0,
    duration: dest.duration || "1-2 jam",
    image: dest.image || `https://picsum.photos/400/300?random=${dest.place_id || dest.id}`,
    images: dest.images || [],
    category: dest.category,
    price: dest.price_formatted || dest.price || formatPrice(dest.price),
    gallery: dest.gallery || [],
    facilities: dest.facilities || [],
    activities: dest.activities || [],
    openingHours: dest.openingHours || dest.operating_hours || dest.opening_hours || "08:00 - 17:00",
    contact: dest.contact || dest.phone || "",
    website: dest.website,
    bestTime: dest.bestTime || dest.best_time || "Pagi - Sore",
    capacity: dest.capacity || "Tidak terbatas",
    detailedDescription: dest.detailedDescription || dest.description || dest.detailed_description,
    tips: dest.tips || [],
    coordinates: coordinates,
    coordinate: coordinates,
    latitude: dest.latitude,
    longitude: dest.longitude,
    address: dest.address,
    reviews: dest.reviews || []
  };
};

export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>, 
  fallbackId: string
) => {
  const target = e.currentTarget;
  const currentSrc = target.src;
  
  // Avoid infinite loop - only set fallback if not already using picsum
  if (!currentSrc.includes('picsum.photos')) {
    target.src = `https://picsum.photos/400/300?random=${fallbackId}`;
  }
};

export const formatCategories = (apiCategories: string[]): Category[] => {
  const categoryIcons: { [key: string]: string } = {
    'heritage': '🏛️',
    'nature': '🌿',
    'culture': '🎭',
    'adventure': '⛰️',
    'religious': '🕌',
    'beach': '🏖️',
    'mountain': '🏔️',
    'park': '🌳',
    'taman hiburan': '🎢',
    'museum': '🏛️',
    'candi': '🕌',
    'air terjun': '💧'
  };
  
  return [
    { id: "all", name: "Semua", icon: "🗺️" },
    ...apiCategories.map((cat: string) => ({
      id: cat.toLowerCase(),
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      icon: categoryIcons[cat.toLowerCase()] || '📍'
    }))
  ];
};