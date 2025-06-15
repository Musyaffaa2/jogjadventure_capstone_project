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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const searchBarVariants = {
    initial: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 12,
        delay: 0.3
      }
    }
  };

  const suggestionVariants = {
    hidden: { 
      opacity: 0, 
      y: -10,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  const recentSearchItemVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 15,
      },
    },
    hover: {
      scale: 1.05,
      y: -2,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1,
      },
    },
  };

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
        className="relative w-full h-screen bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      >
        {/* Animated background overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50"
        />
        
        {/* Floating particles animation */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>

        <div className="flex flex-col justify-center items-center text-center h-full text-white px-4 relative z-10">
          {/* Search Bar */}
          <motion.div
            variants={searchBarVariants}
            initial="initial"
            animate="animate"
            className="relative mb-6 w-[320px] sm:w-[480px]"
          >
            <div className="relative group">
              <motion.input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => searchValue.length >= 2 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={placeholderText}
                className="shadow-lg border border-gray-300 px-5 pr-12 py-3 rounded-full w-full transition-all duration-300 outline-none text-black bg-white/95 backdrop-blur-sm placeholder-gray-400 focus:ring-2 focus:ring-secondary hover:shadow-xl hover:bg-white focus:bg-white group-hover:shadow-2xl"
                name="search"
                type="text"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
              <motion.svg
                onClick={searchValue ? handleClear : undefined}
                className={`w-5 h-5 absolute top-3.5 right-4 text-gray-500 transition-colors duration-200 ${
                  searchValue
                    ? "cursor-pointer hover:text-gray-700"
                    : "pointer-events-none"
                }`}
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
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
              </motion.svg>
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && (
              <motion.div
                variants={suggestionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 max-h-64 overflow-y-auto z-50"
              >
                {isLoading ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 text-center text-gray-500"
                  >
                    <motion.div 
                      className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Mencari...
                  </motion.div>
                ) : searchSuggestions.length > 0 ? (
                  <>
                    <div className="p-2 text-xs text-gray-500 border-b border-gray-100">
                      Saran Pencarian
                    </div>
                    {searchSuggestions.map((suggestion, index) => (
                      <motion.div
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ 
                          backgroundColor: "rgba(59, 130, 246, 0.05)",
                          x: 5,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-3">
                          <motion.div 
                            className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0"
                            whileHover={{ scale: 1.05 }}
                          >
                            {suggestion.image && (
                              <img
                                src={suggestion.image}
                                alt={suggestion.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </motion.div>
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
                      </motion.div>
                    ))}
                  </>
                ) : searchValue.length >= 2 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 text-center text-gray-500"
                  >
                    Tidak ada hasil untuk "{searchValue}"
                  </motion.div>
                ) : null}
              </motion.div>
            )}
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: 0.6, 
              duration: 0.8,
              type: "spring",
              stiffness: 100,
              damping: 10
            }}
            className="text-4xl md:text-5xl font-bold leading-snug"
          >
            Explore The Beauty <br />
            of <motion.span 
              className="text-secondary"
              initial={{ color: "#ffffff" }}
              animate={{ color: "#f59e0b" }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              Jogja
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="mt-2 text-sm md:text-base text-white/80"
          >
            The wonderful of Jogja
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-1 h-3 bg-white/70 rounded-full mt-2"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Urutan komponen yang direkomendasikan */}
      <Destination />
      
      {/* Recent Searches with Enhanced Animations */}
      {recentSearches.length > 0 && (
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-gray-50 to-blue-50/30 py-14 text-center relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200/20 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-200/20 rounded-full blur-xl"></div>
          </div>
          
          <div className="relative z-10">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-2xl font-bold text-secondary mb-4"
            >
              Your Recent Searches
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-gray-500 mb-8"
            >
              Here are some of the places you have searched
            </motion.p>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-4 px-4"
            >
              {recentSearches.map((term, i) => (
                <motion.button
                  key={i}
                  variants={recentSearchItemVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => handleRecentSearchClick(term)}
                  className="px-6 py-3 cursor-pointer bg-white shadow-md rounded-full border border-gray-200 text-sm transition-all duration-300 hover:shadow-lg hover:border-blue-300 relative group overflow-hidden"
                >
                  <span className="relative z-10 group-hover:text-blue-600 transition-colors duration-300">
                    {term}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                  />
                  
                  {/* Search icon on hover */}
                  <motion.svg
                    className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ x: 10 }}
                    whileHover={{ x: 0 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </motion.svg>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </motion.section>
      )}
      
      <Rekomendasi />
      <Testimonial />
      <Jelajah />
      <Footer />
    </>
  );
}

export default Hero;