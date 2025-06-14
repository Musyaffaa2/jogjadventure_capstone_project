
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";

function Destination() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
    
    // Data untuk destinasi
    const destinations = [
      {
        id: 1,
        name: "Prambanan",
        image: "/prambanan2.jpg",
        description:
          "Ancient Hindu temple complex featuring stunning architecture",
        size: "large",
      },
      {
        id: 2,
        name: "Malioboro",
        image: "/malioboro.jpg",
        description: "Famous shopping street with local culture",
        size: "small",
      },
      {
        id: 3,
        name: "Tugu Jogja",
        image: "/tugujogja.jpg",
        description: "Iconic monument representing the spirit of Yogyakarta",
        size: "small",
      },
      {
        id: 4,
        name: "Titik Nol Km Jogja",
        image: "/nolkm.jpg",
        description: "Historical landmark marking the heart of Yogyakarta",
        size: "large",
      },
      {
        id: 5,
        name: "Parangtritis",
        image: "/parangtritis1.jpg",
        description: "Beautiful beach with mystical legends",
        size: "large",
      },
      {
        id: 6,
        name: "Taman Sari",
        image: "/tamansari.jpg",
        description: "Royal garden complex with beautiful pools",
        size: "small",
      },
      {
        id: 7,
        name: "Borobudur",
        image: "/borobudur.jpg",
        description: "World's largest Buddhist temple complex",
        size: "large",
      },
      {
        id: 8,
        name: "Keraton Yogyakarta",
        image: "/keraton.jpg",
        description: "Sultan's palace with rich Javanese culture",
        size: "small",
      },
    ];
  
  const handleDestinationClick = () => {
    // Small delay to ensure navigation completes before scrolling
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // Navigation functions - bergeser satu card per satu
  const goToPrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) =>
      prev === 0 ? destinations.length - 1 : prev - 1
    );
    setTimeout(() => setIsAnimating(false), 600);
  };

  const goToNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) =>
      prev === destinations.length - 1 ? 0 : prev + 1
    );
    setTimeout(() => setIsAnimating(false), 600);
  };

  // Get current set of destinations to display (6 cards starting from currentSlide)
  const getCurrentDestinations = () => {
    const result = [];
    for (let i = 0; i < 6; i++) {
      const index = (currentSlide + i) % destinations.length;
      result.push(destinations[index]);
    }
    return result;
  };

  const currentDestinations = getCurrentDestinations();

  return (
    <>
      <section className="bg-white py-20 text-center min-h-screen">
        <h2 className="text-4xl font-bold text-teal-600 mb-2">
          Popular Destinations
        </h2>
        <p className="text-gray-600 mb-12 text-lg">
          The most beautiful place in Yogyakarta for your holiday
        </p>

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
                  className="block flex-1 cursor-pointer"
                  onClick={handleDestinationClick}
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
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-xl font-bold mb-2">
                        {currentDestinations[0].name}
                      </h3>
                      <p className="text-white/90 text-sm leading-relaxed">
                        {currentDestinations[0].description}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              )}

              {/* First Small Card */}
              {currentDestinations[1] && (
                <Link 
                  to={`/destination/${currentDestinations[1].id}`} 
                  className="block cursor-pointer"
                  onClick={handleDestinationClick}
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
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-lg font-bold mb-1">
                        {currentDestinations[1].name}
                      </h3>
                      <p className="text-white/90 text-xs leading-relaxed">
                        {currentDestinations[1].description}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              )}
            </div>

            {/* Middle Column with Navigation Arrows */}
            <div className="flex flex-col gap-3 items-center">
              {/* Second Small Card */}
              {currentDestinations[2] && (
                <Link 
                  to={`/destination/${currentDestinations[2].id}`} 
                  className="block w-full cursor-pointer"
                  onClick={handleDestinationClick}
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
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-lg font-bold mb-1">
                        {currentDestinations[2].name}
                      </h3>
                      <p className="text-white/90 text-xs leading-relaxed">
                        {currentDestinations[2].description}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              )}

              {/* Second Large Card */}
              {currentDestinations[3] && (
                <Link 
                  to={`/destination/${currentDestinations[3].id}`} 
                  className="block flex-1 w-full cursor-pointer"
                  onClick={handleDestinationClick}
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
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-xl font-bold mb-2">
                        {currentDestinations[3].name}
                      </h3>
                      <p className="text-white/90 text-sm leading-relaxed">
                        {currentDestinations[3].description}
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
                  className="block flex-1 cursor-pointer"
                  onClick={handleDestinationClick}
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
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-xl font-bold mb-2">
                        {currentDestinations[4].name}
                      </h3>
                      <p className="text-white/90 text-sm leading-relaxed">
                        {currentDestinations[4].description}
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
                  onClick={handleDestinationClick}
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
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-lg font-bold mb-1">
                        {currentDestinations[5].name}
                      </h3>
                      <p className="text-white/90 text-xs leading-relaxed">
                        {currentDestinations[5].description}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              )}
            </div>
          </motion.div>

          {/* Navigation Arrows - Moved outside the motion.div */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="flex justify-center items-center space-x-4 mt-8 pb-8"
          >
            {/* Left Arrow */}
            <button
              onClick={goToPrevious}
              aria-label="Previous"
              className="w-12 h-12 cursor-pointer rounded-full bg-white shadow-md ring-1 ring-gray-200 flex items-center justify-center hover:bg-gray-100 hover:shadow-xl transition-all duration-300 group"
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
              aria-label="Next"
              className="w-12 h-12 cursor-pointer rounded-full bg-white shadow-md ring-1 ring-gray-200 flex items-center justify-center hover:bg-gray-100 hover:shadow-xl transition-all duration-300 group"
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
  
  export default Destination;
