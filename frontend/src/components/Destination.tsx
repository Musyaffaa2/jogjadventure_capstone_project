import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Search,
  MapPin,
  Star,
  Clock,
  Camera,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Navbar from "./Navbar";
import DestinationDetail from "./DestinationDetail";
import {
  normalizeDestination,
  handleImageError,
} from "../utils/destinationUtils";
import { Destination, ApiResponse } from "../types/destination";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function DestinationApp() {
  const location = useLocation();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentView, setCurrentView] = useState<"list" | "detail">("list");
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([
    { id: "all", name: "Semua", icon: "🗺️" },
  ]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get("search");

    if (searchQuery) {
      setSearchTerm(searchQuery);
      fetchDestinations(1, searchQuery); 
    } else {
      fetchDestinations(); 
    }
  }, [location.search]);

  const fetchDestinations = async (page = 1, search = "", category = "all") => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
      });

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (category !== "all") {
        params.append("category", category);
      }

      const response = await fetch(`${API_BASE_URL}api/destinations?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      const normalizedDestinations =
        data.destinations.map(normalizeDestination);

      setDestinations(normalizedDestinations);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Error fetching destinations:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch destinations"
      );
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinationDetails = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}api/destinations/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawDestination = await response.json();
      const destination = normalizeDestination(rawDestination);
      setSelectedDestination(destination);
      setCurrentView("detail");
    } catch (err) {
      console.error("Error fetching destination details:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch destination details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const staticCategories = [
      { id: "all", name: "Semua", icon: "🗺️" },
      { id: "taman-hiburan", name: "Taman Hiburan", icon: "🎢" },
      { id: "bahari", name: "Bahari", icon: "🌊" },
      { id: "budaya", name: "Budaya", icon: "🎭" },
      { id: "cagar-alam", name: "Cagar Alam", icon: "🌿" },
      { id: "pusat-perbelanjaan", name: "Pusat Perbelanjaan", icon: "🛍️" },
    ];
    setCategories(staticCategories);
  }, []);

  // Fungsi trigger pencarian saat Enter
  const handleSearch = () => {
    setCurrentPage(1);
    fetchDestinations(1, searchTerm, selectedCategory);
  };

  const handleViewDetail = (destination: Destination) => {
    fetchDestinationDetails(destination.id);
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

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    fetchDestinations(1, searchTerm, categoryId);
  };

  if (currentView === "detail" && selectedDestination) {
    return (
      <DestinationDetail
        destination={selectedDestination}
        onBack={handleBackToList}
        loading={loading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: "url(https://picsum.photos/1200/400?random=10)",
          }}
        ></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">
            Destinations
          </h1>
          <p className="text-xl drop-shadow-md">
            Temukan keajaiban tersembunyi di Indonesia
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-6 items-center mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari destinasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div className="flex flex-wrap gap-2" style={{ display: "none" }}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                  }`}
                  disabled={loading}
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Memuat destinasi...</span>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-red-800">
                Terjadi Kesalahan
              </h3>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
            <button
              onClick={() =>
                fetchDestinations(currentPage, searchTerm, selectedCategory)
              }
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinations.map((destination) => (
                <div
                  key={destination.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="relative">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-48 object-cover"
                      onError={(e) =>
                        handleImageError(
                          e,
                          destination.place_id?.toString() || destination.id
                        )
                      }
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
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {destination.name}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">
                      {destination.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span>{destination.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4 text-green-500" />
                        <span>{destination.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 fill-current text-yellow-500" />
                        <span className="text-gray-700 font-medium">
                          {destination.rating}/5
                        </span>
                        <span className="text-gray-500">
                          ({destination.total_reviews} ulasan)
                        </span>
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
                  const pageNum =
                    currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${
                        currentPage === pageNum
                          ? "text-white bg-blue-600"
                          : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
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

            {destinations.length === 0 && !loading && !error && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Destinasi tidak ditemukan
                </h3>
                <p className="text-gray-500">
                  Coba ubah kata kunci pencarian atau kategori
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default DestinationApp;
