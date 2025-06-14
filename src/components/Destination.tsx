
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Search, MapPin, Star, Clock, Camera, ArrowLeft, Phone, Globe, Calendar, Users, Wallet, Navigation, Loader2, AlertCircle } from "lucide-react";
import Navbar from './Navbar';

interface Destination {
  id: string;
  name: string;
  description: string;
  location: string;
  rating: number;
  duration: string;
  image: string;
  category: string;
  price: string;
  gallery: string[];
  facilities: string[];
  activities: string[];
  openingHours: string;
  contact: string;
  website?: string;
  bestTime: string;
  capacity: string;
  detailedDescription: string;
  tips: string[];
  coordinates: { lat: number; lng: number };
  reviews?: {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

interface ApiResponse {
  destinations: Destination[];
  currentPage: number;
  totalPages: number;
  totalDestinations: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function DestinationApp() {
  const location = useLocation();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentView, setCurrentView] = useState<"list" | "detail">("list");
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([
    { id: "all", name: "Semua", icon: "🗺️" }
  ]);

  // Extract search query from URL on component mount
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('search');
    
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [location.search]);

  // Fetch destinations from API
  const fetchDestinations = async (page = 1, search = "", category = "all") => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      });
      
      if (search.trim()) {
        params.append('search', search.trim());
      }
      
      if (category !== 'all') {
        params.append('category', category);
      }

      const response = await fetch(`${API_BASE_URL}/destinations?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      setDestinations(data.destinations);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      
    } catch (err) {
      console.error('Error fetching destinations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch destinations');
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/destinations/meta/categories`);
      if (response.ok) {
        const apiCategories = await response.json();
        const categoryIcons: { [key: string]: string } = {
          'heritage': '🏛️',
          'nature': '🌿',
          'culture': '🎭',
          'adventure': '⛰️',
          'religious': '🕌',
          'beach': '🏖️',
          'mountain': '🏔️',
          'park': '🌳'
        };
        
        const formattedCategories = [
          { id: "all", name: "Semua", icon: "🗺️" },
          ...apiCategories.map((cat: string) => ({
            id: cat.toLowerCase(),
            name: cat.charAt(0).toUpperCase() + cat.slice(1),
            icon: categoryIcons[cat.toLowerCase()] || '📍'
          }))
        ];
        
        setCategories(formattedCategories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch single destination details
  const fetchDestinationDetails = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/destinations/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const destination: Destination = await response.json();
      setSelectedDestination(destination);
      setCurrentView("detail");
      
    } catch (err) {
      console.error('Error fetching destination details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch destination details');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDestinations();
    fetchCategories();
  }, []);

  // Handle search and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchDestinations(1, searchTerm, selectedCategory);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory]);

  const handleViewDetail = (destination: Destination) => {
    fetchDestinationDetails(destination.id);
    // Add scroll to top
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedDestination(null);
    setError(null);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchDestinations(newPage, searchTerm, selectedCategory);
  };

  if (currentView === "detail" && selectedDestination) {
    return <DestinationDetail destination={selectedDestination} onBack={handleBackToList} loading={loading} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url(https://picsum.photos/1200/400?random=10)'
          }}
        ></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">Destinations</h1>
          <p className="text-xl drop-shadow-md">Temukan keajaiban tersembunyi di Indonesia</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Search Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-6 items-center mb-8">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari destinasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Memuat destinasi...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-red-800">Terjadi Kesalahan</h3>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
            <button 
              onClick={() => fetchDestinations(currentPage, searchTerm, selectedCategory)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Destination Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinations.map(destination => (
                <div key={destination.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="relative">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://picsum.photos/400/300?random=${destination.id}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-green-600 shadow-md">
                      {destination.price}
                    </div>
                    <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 backdrop-blur-sm">
                      <Camera className="w-3 h-3" />
                      Photo Spot
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{destination.name}</h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">{destination.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span>{destination.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4 text-green-500" />
                        <span>{destination.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 fill-current text-yellow-500" />
                        <span className="text-gray-700 font-medium">{destination.rating}/5</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleViewDetail(destination)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-md hover:shadow-lg"
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${
                        currentPage === pageNum
                          ? 'text-white bg-blue-600'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            {/* No Results */}
            {destinations.length === 0 && !loading && !error && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Destinasi tidak ditemukan</h3>
                <p className="text-gray-500">Coba ubah kata kunci pencarian atau kategori</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function DestinationDetail({ destination, onBack, loading }: { 
  destination: Destination; 
  onBack: () => void;
  loading: boolean;
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Memuat detail destinasi...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Daftar
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-96">
        <img
          src={destination.gallery[activeImageIndex] || destination.image}
          alt={destination.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = `https://picsum.photos/800/400?random=${destination.id}`;
          }}
        />
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-4xl font-bold mb-2">{destination.name}</h1>
          <div className="flex items-center gap-4 text-lg">
            <span className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-current text-yellow-400" />
              {destination.rating}/5
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-5 h-5" />
              {destination.location}
            </span>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      {destination.gallery && destination.gallery.length > 1 && (
        <div className="container mx-auto px-6 py-6">
          <div className="flex gap-2 overflow-x-auto">
            {destination.gallery.map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`flex-shrink-0 rounded-lg overflow-hidden ${
                  activeImageIndex === index ? 'ring-3 ring-blue-500' : ''
                }`}
              >
                <img
                  src={image}
                  alt={`${destination.name} ${index + 1}`}
                  className="w-20 h-20 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://picsum.photos/100/100?random=${destination.id}${index}`;
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Tentang Destinasi</h2>
              <p className="text-gray-600 leading-relaxed">{destination.detailedDescription}</p>
            </div>

            {/* Activities */}
            {destination.activities && destination.activities.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Aktivitas</h2>
                <div className="grid grid-cols-2 gap-3">
                  {destination.activities.map((activity, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700">{activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Facilities */}
            {destination.facilities && destination.facilities.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Fasilitas</h2>
                <div className="grid grid-cols-3 gap-3">
                  {destination.facilities.map((facility, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{facility}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {destination.tips && destination.tips.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Tips Berkunjung</h2>
                <div className="space-y-3">
                  {destination.tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="w-6 h-6 bg-yellow-400 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {destination.reviews && destination.reviews.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Ulasan Pengunjung</h2>
                <div className="space-y-4">
                  {destination.reviews.slice(0, 5).map((review, index) => (
                    <div key={index} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {review.user_id?.profile?.name?.[0] || review.user_id?.username?.[0] || '?'}
                        </div>
                        <span className="font-medium text-gray-800">
                          {review.user_id?.profile?.name || review.user_id?.username || 'Anonymous'}
                        </span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < review.rating ? 'fill-current text-yellow-500' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Informasi Cepat</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-sm text-gray-500">Harga Tiket</div>
                    <div className="font-semibold text-green-600">{destination.price}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-500">Jam Operasional</div>
                    <div className="font-semibold">{destination.openingHours}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  <div>
                    <div className="text-sm text-gray-500">Waktu Terbaik</div>
                    <div className="font-semibold">{destination.bestTime}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="text-sm text-gray-500">Kapasitas</div>
                    <div className="font-semibold">{destination.capacity}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Kontak</h3>
              <div className="space-y-3">
                {destination.contact && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-green-500" />
                    <a href={`tel:${destination.contact}`} className="text-blue-600 hover:underline">
                      {destination.contact}
                    </a>
                  </div>
                )}
                
                {destination.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <a href={`https://${destination.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {destination.website}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Navigation className="w-5 h-5 text-red-500" />
                  <a 
                    href={`https://maps.google.com/?q=${destination.coordinates.lat},${destination.coordinates.lng}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Buka di Google Maps
                  </a>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-md">
                Booking Sekarang
              </button>
              <button className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition-all font-semibold">
                Tambah ke Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DestinationApp;
