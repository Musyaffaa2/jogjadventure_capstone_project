import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DestinationApiService } from "../services/destinationApi";

// Define the type for destination data
interface Destination {
  id: string | number;
  name: string;
  image: string;
  description: string;
  rating: number;
  location?: string;
  category?: string;
  price?: string | number;
  size: string;
}

function DestinationPopular() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data dari API saat komponen mount
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Menggunakan fetchPopularDestinations yang sudah diurutkan berdasarkan rating
        const data = await DestinationApiService.fetchPopularDestinations();
        
        // Transform data untuk menyesuaikan format yang dibutuhkan komponen
        const transformedData: Destination[] = data.map((dest: any) => ({
          id: dest.id || dest.place_id,
          name: dest.name || dest.place_name,
          image: dest.image,
          description: dest.description,
          rating: dest.rating || dest.average_rating,
          location: dest.location || dest.city,
          category: dest.category,
          price: dest.price,
          // Menentukan ukuran card secara dinamis berdasarkan rating
          size: (dest.rating || dest.average_rating) >= 4.5 ? "large" : "small"
        }));
        
        setDestinations(transformedData);
      } catch (err) {
        console.error("Error fetching destinations:", err);
        setError("Gagal memuat destinasi. Silakan coba lagi.");
        
        setDestinations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  // Navigation functions - bergeser satu card per satu
  const goToPrevious = () => {
    if (isAnimating || destinations.length === 0) return;
    setIsAnimating(true);
    setCurrentSlide((prev) =>
      prev === 0 ? destinations.length - 1 : prev - 1
    );
    setTimeout(() => setIsAnimating(false), 600);
  };

  const goToNext = () => {
    if (isAnimating || destinations.length === 0) return;
    setIsAnimating(true);
    setCurrentSlide((prev) =>
      prev === destinations.length - 1 ? 0 : prev + 1
    );
    setTimeout(() => setIsAnimating(false), 600);
  };

  // Get current set of destinations to display (6 cards starting from currentSlide)
  const getCurrentDestinations = (): Destination[] => {
    if (destinations.length === 0) return [];
    const result: Destination[] = [];
    for (let i = 0; i < 6; i++) {
      const index = (currentSlide + i) % destinations.length;
      result.push(destinations[index]);
    }
    return result;
  };

  const currentDestinations = getCurrentDestinations();

  // Function to retry fetching data
  const retryFetch = () => {
    setError(null);
    setLoading(true);
    // Re-trigger useEffect by changing a dependency or call fetch function directly
    const fetchDestinations = async () => {
      try {
        const data = await DestinationApiService.fetchPopularDestinations();
        const transformedData: Destination[] = data.map((dest: any) => ({
          id: dest.id || dest.place_id,
          name: dest.name || dest.place_name,
          image: dest.image,
          description: dest.description,
          rating: dest.rating || dest.average_rating,
          location: dest.location || dest.city,
          category: dest.category,
          price: dest.price,
          size: (dest.rating || dest.average_rating) >= 4.5 ? "large" : "small"
        }));
        setDestinations(transformedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching destinations:", err);
        setError("Gagal memuat destinasi. Silakan coba lagi.");
        setDestinations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  };

  // Loading state
  if (loading) {
    return (
      <section className="bg-white py-20 text-center min-h-screen flex items-center justify-center">
        <div className="text-teal-600">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading destinations...</p>
        </div>
      </section>
    );
  }

  // Error state
  if (error && destinations.length === 0) {
    return (
      <section className="bg-white py-20 text-center min-h-screen flex items-center justify-center">
        <div className="text-red-600 max-w-md mx-auto">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Oops! Terjadi Kesalahan</h3>
            <p className="text-gray-600 mb-4">{error}</p>
          </div>
          <div className="space-y-3">
            <button 
              onClick={retryFetch}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Coba Lagi
            </button>
            <div className="text-sm text-gray-500">
              Pastikan koneksi internet Anda stabil
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (!loading && destinations.length === 0) {
    return (
      <section className="bg-white py-20 text-center min-h-screen flex items-center justify-center">
        <div className="text-gray-600 max-w-md mx-auto">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum Ada Destinasi</h3>
            <p className="text-gray-600 mb-4">Destinasi populer belum tersedia saat ini</p>
          </div>
          <button 
            onClick={retryFetch}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Muat Ulang
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-white py-20 text-center min-h-screen">
        <h2 className="text-4xl font-bold text-teal-600 mb-2">
          Popular Destinations
        </h2>
        <p className="text-gray-600 mb-12 text-lg">
          The most beautiful place in Yogyakarta for your holiday
        </p>

        {error && destinations.length > 0 && (
          <div className="max-w-6xl mx-auto px-4 mb-4">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              <p className="text-sm">Menampilkan data tersimpan karena koneksi bermasalah</p>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 overflow-hidden">
          {/* Grid Layout with Smooth Slide Animation */}
          <motion.div
            key={currentSlide}
            initial={{ x: 100, opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.6,
            }}
            className="grid grid-cols-3 gap-3 h-[780px] mb-8"
          >
            {/* Left Column */}
            <div className="flex flex-col gap-3">
              {/* First Large Card */}
              {currentDestinations[0] && (
                <Link 
                  to={`/destination/${currentDestinations[0].id}`} 
                  className="block flex-1 cursor-pointer transform hover:scale-[1.02] transition-transform duration-300"
                >
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="relative rounded-3xl overflow-hidden shadow-lg group h-full"
                  >
                    <img
                      src={currentDestinations[0].image}
                      alt={currentDestinations[0].name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://picsum.photos/400/600?random=${currentDestinations[0].id}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-yellow-400 text-sm">★</span>
                        <span className="text-white/90 text-sm">{currentDestinations[0].rating}</span>
                      </div>
                      <h3 className="text-xl font-bold">
                        {currentDestinations[0].name}
                      </h3>
                      <p className="text-white/80 text-sm mt-1">
                        {currentDestinations[0].location}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              )}

              {/* First Small Card */}
              {currentDestinations[1] && (
                <Link 
                  to={`/destination/${currentDestinations[1].id}`} 
                  className="block cursor-pointer transform hover:scale-[1.02] transition-transform duration-300"
                >
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="relative rounded-3xl overflow-hidden shadow-lg group h-[300px]"
                  >
                    <img
                      src={currentDestinations[1].image}
                      alt={currentDestinations[1].name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://picsum.photos/400/300?random=${currentDestinations[1].id}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-yellow-400 text-xs">★</span>
                        <span className="text-white/90 text-xs">{currentDestinations[1].rating}</span>
                      </div>
                      <h3 className="text-lg font-bold">
                        {currentDestinations[1].name}
                      </h3>
                      <p className="text-white/80 text-xs mt-1">
                        {currentDestinations[1].location}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              )}
            </div>

            {/* Middle Column */}
            <div className="flex flex-col gap-3 items-center">
              {/* Second Small Card */}
              {currentDestinations[2] && (
                <Link 
                  to={`/destination/${currentDestinations[2].id}`} 
                  className="block w-full cursor-pointer transform hover:scale-[1.02] transition-transform duration-300"
                >
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="relative rounded-3xl overflow-hidden shadow-lg group h-[300px] w-full"
                  >
                    <img
                      src={currentDestinations[2].image}
                      alt={currentDestinations[2].name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://picsum.photos/400/300?random=${currentDestinations[2].id}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-yellow-400 text-xs">★</span>
                        <span className="text-white/90 text-xs">{currentDestinations[2].rating}</span>
                      </div>
                      <h3 className="text-lg font-bold">
                        {currentDestinations[2].name}
                      </h3>
                      <p className="text-white/80 text-xs mt-1">
                        {currentDestinations[2].location}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              )}

              {/* Second Large Card */}
              {currentDestinations[3] && (
                <Link 
                  to={`/destination/${currentDestinations[3].id}`} 
                  className="block flex-1 w-full cursor-pointer transform hover:scale-[1.02] transition-transform duration-300"
                >
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                    className="relative rounded-3xl overflow-hidden shadow-lg group h-full max-h-[380px] w-full"
                  >
                    <img
                      src={currentDestinations[3].image}
                      alt={currentDestinations[3].name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://picsum.photos/400/380?random=${currentDestinations[3].id}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-yellow-400 text-sm">★</span>
                        <span className="text-white/90 text-sm">{currentDestinations[3].rating}</span>
                      </div>
                      <h3 className="text-xl font-bold">
                        {currentDestinations[3].name}
                      </h3>
                      <p className="text-white/80 text-sm mt-1">
                        {currentDestinations[3].location}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              )}
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-3">
              {/* Third Large Card */}
              {currentDestinations[4] && (
                <Link 
                  to={`/destination/${currentDestinations[4].id}`} 
                  className="block flex-1 cursor-pointer transform hover:scale-[1.02] transition-transform duration-300"
                >
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="relative rounded-3xl overflow-hidden shadow-lg group h-full"
                  >
                    <img
                      src={currentDestinations[4].image}
                      alt={currentDestinations[4].name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://picsum.photos/400/600?random=${currentDestinations[4].id}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-yellow-400 text-sm">★</span>
                        <span className="text-white/90 text-sm">{currentDestinations[4].rating}</span>
                      </div>
                      <h3 className="text-xl font-bold">
                        {currentDestinations[4].name}
                      </h3>
                      <p className="text-white/80 text-sm mt-1">
                        {currentDestinations[4].location}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              )}

              {/* Third Small Card */}
              {currentDestinations[5] && (
                <Link 
                  to={`/destination/${currentDestinations[5].id}`} 
                  className="block cursor-pointer"
                >
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="relative rounded-3xl overflow-hidden shadow-lg group h-[300px]"
                  >
                    <img
                      src={currentDestinations[5].image}
                      alt={currentDestinations[5].name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://picsum.photos/400/300?random=${currentDestinations[5].id}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-yellow-400 text-xs">★</span>
                        <span className="text-white/90 text-xs">{currentDestinations[5].rating}</span>
                      </div>
                      <h3 className="text-lg font-bold">
                        {currentDestinations[5].name}
                      </h3>
                    </div>
                  </motion.div>
                </Link>
              )}
            </div>
          </motion.div>

          {/* Navigation Arrows */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="flex justify-center items-center space-x-4 mt-8 pb-8"
          >
            {/* Left Arrow */}
            <button
              onClick={goToPrevious}
              disabled={destinations.length === 0}
              aria-label="Previous"
              className="w-12 h-12 cursor-pointer rounded-full bg-white shadow-md ring-1 ring-gray-200 flex items-center justify-center hover:bg-gray-100 hover:shadow-xl transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-6 h-6 text-gray-600 group-hover:text-teal-600 group-hover:-translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Slide Indicator */}
            <div className="flex items-center space-x-2">
              {destinations.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "bg-teal-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={goToNext}
              disabled={destinations.length === 0}
              aria-label="Next"
              className="w-12 h-12 cursor-pointer rounded-full bg-white shadow-md ring-1 ring-gray-200 flex items-center justify-center hover:bg-gray-100 hover:shadow-xl transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-6 h-6 text-gray-600 group-hover:text-teal-600 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </motion.div>
        </div>
      </section>
    </>
  );
}

export default DestinationPopular;