import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Destination from './DestinationPopular';
import Testimonial from './Testimonial';
import Jelajah from './Jelajah';
import Footer from "./Footer";
import Rekomendasi from "./Rekomendasi";

function Hero() {
  const navigate = useNavigate();
  const [placeholderText, setPlaceholderText] = useState("Search...");
  const [searchValue, setSearchValue] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  interface Suggestion {
    name: string;
    image?: string;
    location?: string;
    category?: string;
  }
  const [searchSuggestions, setSearchSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fullText = "Search beautiful places...";

  // Typing effect for placeholder
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setPlaceholderText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) {
        index = 0;
      }
    }, 120);
    return () => clearInterval(interval);
  }, []);

  // Load recent searches from memory (replacing localStorage)
  useEffect(() => {
    // Simulated initial data
    setRecentSearches(["Prambanan", "Borobudur"]);
  }, []);

  // Fetch search suggestions from MongoDB
  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/destinations/search-suggestions?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (response.ok) {
        setSearchSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue.trim()) {
        fetchSuggestions(searchValue.trim());
      } else {
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleClear = () => {
    setSearchValue("");
    setShowSuggestions(false);
  };

  const handleSearch = (query: string) => {
    if (query.trim() === "") return;

    const searchQuery = query.trim();
    
    // Add to recent searches
    let updatedSearches = [
      searchQuery,
      ...recentSearches.filter((term) => term !== searchQuery),
    ];

    // Limit to 5 recent searches
    if (updatedSearches.length > 5)
      updatedSearches = updatedSearches.slice(0, 5);

    setRecentSearches(updatedSearches);
    setSearchValue("");
    navigate(`/destination?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    handleSearch(suggestion.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(searchValue);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleRecentSearchClick = (term: string) => {
    handleSearch(term);
  };

  return (
    <>
      {/* Hero Section */}
      <div
        className="relative w-full h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      >
        <div className="flex flex-col justify-center items-center text-center h-full text-white px-4 bg-black/40">
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative mb-6 w-[320px] sm:w-[480px]"
          >
            <div className="relative">
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => searchValue.length >= 2 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={placeholderText}
                className="shadow-lg border border-gray-300 px-5 pr-12 py-3 rounded-full w-full transition-all duration-300 outline-none text-black bg-white placeholder-gray-400 focus:ring-2 focus:ring-secondary hover:shadow-xl"
                name="search"
                type="text"
              />
              <svg
                onClick={searchValue ? handleClear : undefined}
                className={`w-5 h-5 absolute top-3.5 right-4 text-gray-500 ${
                  searchValue
                    ? "cursor-pointer hover:text-gray-700"
                    : "pointer-events-none"
                }`}
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {searchValue ? (
                  <path
                    d="M6 6l12 12M6 18L18 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <path
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-64 overflow-y-auto z-50">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    Mencari...
                  </div>
                ) : searchSuggestions.length > 0 ? (
                  <>
                    <div className="p-2 text-xs text-gray-500 border-b border-gray-100">
                      Saran Pencarian
                    </div>
                    {searchSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {suggestion.image && (
                              <img
                                src={suggestion.image}
                                alt={suggestion.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {suggestion.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {suggestion.location}
                            </div>
                            {suggestion.category && (
                              <div className="text-xs text-blue-600 capitalize">
                                {suggestion.category}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : searchValue.length >= 2 ? (
                  <div className="p-4 text-center text-gray-500">
                    Tidak ada hasil untuk "{searchValue}"
                  </div>
                ) : null}
              </div>
            )}
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="text-4xl md:text-5xl font-bold leading-snug"
          >
            Explore The Beauty <br />
            of <span className="text-secondary">Jogja</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="mt-2 text-sm md:text-base text-white/80"
          >
            The wonderful of Jogja
          </motion.p>
        </div>
      </div>
      
      {/* Urutan komponen yang direkomendasikan */}
      <Destination />
      
      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <section className="bg-gray-50 py-14 text-center">
          <h2 className="text-2xl font-bold text-secondary mb-4">
            Your Recent Searches
          </h2>
          <p className="text-gray-500 mb-6">
            Here are some of the places you have searched
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {recentSearches.map((term, i) => (
              <button
                key={i}
                onClick={() => handleRecentSearchClick(term)}
                className="px-4 py-2 cursor-pointer bg-white shadow rounded-full border hover:bg-gray-200 text-sm transition-colors hover:text-blue-600"
              >
                {term}
              </button>
            ))}
          </div>
        </section>
      )}
      
      <Rekomendasi />
      <Testimonial />
      <Jelajah />
      <Footer />
    </>
  );
}

export default Hero;