
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface ExploreProps {
  className?: string;
  destinationPath?: string; // Flexible path untuk navigasi
}

function Explore({ className = '', destinationPath = '/destination' }: ExploreProps) {
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const handleDestinationClick = () => {
    // Small delay to ensure navigation completes before scrolling
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <section className={`relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 py-12 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="mx-auto w-full max-w-xl">
        <div className="relative w-full h-44 sm:h-52 md:h-56 lg:h-64 rounded-3xl overflow-hidden shadow-xl transition-shadow duration-300">
          {/* Background Image + Gradient Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(0, 0, 0, 0.5), rgba(0,0,0,0.2)), url('/tugujogja.jpg')",
            }}
          />

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-between px-5 sm:px-8">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
                Explore Jogja
              </h2>
              <p className="text-white/80 text-sm sm:text-base">
                Temukan keajaiban kota istimewa
              </p>
            </div>

            {/* Arrow Button  */}
            <Link 
              to={destinationPath}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/50 flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
                isButtonHovered 
                  ? 'bg-white/30 border-white/80 scale-110 shadow-lg' 
                  : 'hover:bg-white/20 hover:border-white/70'
              }`}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              aria-label="Explore destinations in Jogja"
              onClick={handleDestinationClick}
              // Optional: Preload route untuk performance
              onMouseOver={(e) => e.currentTarget.focus()}
            >
              <svg
                className={`w-5 h-5 text-white transition-transform duration-300 ${
                  isButtonHovered ? 'translate-x-0.5' : ''
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-16 h-16 border border-white/20 rounded-full opacity-50" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border border-white/20 rounded-full opacity-30" />
        </div>

        {/* Quick Stats - Bisa diklik untuk navigasi juga */}
        <div className="mt-4 flex justify-center space-x-6 text-white/80 text-sm">
          <Link to={destinationPath} className="text-center hover:text-white transition-colors duration-200">
            <div className="font-semibold">150+</div>
            <div className="text-xs">Destinasi</div>
          </Link>
          <div className="text-center">
            <div className="font-semibold">4.8★</div>
            <div className="text-xs">Rating</div>
          </div>
          <Link to={destinationPath} className="text-center hover:text-white transition-colors duration-200">
            <div className="font-semibold">50K+</div>
            <div className="text-xs">Wisatawan</div>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Explore;
