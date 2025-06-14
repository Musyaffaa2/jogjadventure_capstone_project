import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

type TabName = "Rekomendasi" | "Rating" | "Sering Dikunjungi";

type TabContent = {
  title: string;
  subtitle: string;
  mainImage: string;
  mainImageAlt: string;
  borderColor: string;
  stats: { label: string; value: string }[];
  galleryImages: { src: string; alt: string; label: string }[];
};

const Rekomendasi = () => {
  const [activeTab, setActiveTab] = useState<TabName>("Rekomendasi");

  const tabs: TabName[] = ["Rekomendasi", "Rating", "Sering Dikunjungi"];

  // Optimized animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  // Floating animation for gallery images
  const floatingVariants = {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // Tab content data
  const tabContent: Record<TabName, TabContent> = {
    Rekomendasi: {
      title: "Kami Menyediakan Wisata\nSightseeing Terbaik di Jogja",
      subtitle:
        "Temukan pengalaman wisata tak terlupakan di Jogja, dari candi bersejarah hingga alam yang menawan.",
      mainImage: "/tugujogja.jpg",
      mainImageAlt: "Tugu Jogja",
      borderColor: "border-pink-300",
      stats: [
        { label: "Destinasi", value: "50+" },
        { label: "Pelanggan", value: "1000+" },
        { label: "Rating", value: "4.9★" },
      ],
      galleryImages: [
        { src: "/tamansari.jpg", alt: "Taman Sari", label: "Taman Sari" },
        { src: "/malioboro.jpg", alt: "Malioboro", label: "Malioboro" },
        { src: "/parangtritis1.jpg", alt: "Parangtritis", label: "Parangtritis" },
        { src: "/prambanan2.jpg", alt: "Prambanan", label: "Prambanan" },
      ],
    },
    Rating: {
      title: "Destinasi dengan Rating\nTertinggi di Jogja",
      subtitle:
        "Pilihan wisata terbaik berdasarkan ulasan dan rating dari ribuan pengunjung yang puas.",
      mainImage: "/borobudur.jpg",
      mainImageAlt: "Borobudur",
      borderColor: "border-yellow-400",
      stats: [
        { label: "Rating Rata-rata", value: "4.8★" },
        { label: "Total Review", value: "2500+" },
        { label: "Kepuasan", value: "98%" },
      ],
      galleryImages: [
        { src: "/borobudur.jpg", alt: "Borobudur", label: "Borobudur 4.9★" },
        { src: "/prambanan2.jpg", alt: "Prambanan", label: "Prambanan 4.8★" },
        { src: "/keraton.jpg", alt: "Keraton", label: "Keraton 4.7★" },
        { src: "/tamansari.jpg", alt: "Taman Sari", label: "Taman Sari 4.6★" },
      ],
    },
    "Sering Dikunjungi": {
      title: "Destinasi Paling Populer\ndi Kalangan Wisatawan",
      subtitle:
        "Tempat-tempat wisata favorit yang selalu ramai dikunjungi dan menjadi pilihan utama wisatawan.",
      mainImage: "/malioboro.jpg",
      mainImageAlt: "Malioboro",
      borderColor: "border-blue-400",
      stats: [
        { label: "Pengunjung/Bulan", value: "50K+" },
        { label: "Foto Diambil", value: "100K+" },
        { label: "Repeat Visit", value: "85%" },
      ],
      galleryImages: [
        { src: "/malioboro.jpg", alt: "Malioboro", label: "Malioboro" },
        { src: "/tugujogja.jpg", alt: "Tugu Jogja", label: "Tugu Jogja" },
        { src: "/nolkm.jpg", alt: "Titik Nol Km", label: "Titik Nol Km" },
        { src: "/parangtritis1.jpg", alt: "Parangtritis", label: "Parangtritis" },
      ],
    },
  };

  const currentContent = tabContent[activeTab];

  // First, add a function to handle the click and scrolling
  const handleImageClick = (label: string) => {
    // Small delay to ensure navigation completes before scrolling
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <section 
      id="rekomendasi" 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header dengan Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-8 bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            Eksplorasi Wisata Jogja
          </h2>
          
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tabs.map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 sm:px-6 sm:py-3 rounded-full font-semibold transition-all duration-300 text-sm sm:text-base ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 shadow-md"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tab}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex flex-col lg:flex-row items-center lg:justify-between gap-8 lg:gap-12"
          >
            {/* Left Content */}
            <motion.div
              variants={itemVariants}
              className="flex-1 text-center lg:text-left lg:pr-8"
            >
              <div className="mb-8 lg:mb-10">
                <motion.h1
                  variants={itemVariants}
                  className="text-3xl sm:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-6 lg:mb-8 leading-tight"
                >
                  {currentContent.title.split("\n").map((line, index) => (
                    <span key={index}>
                      {line}
                      {index < currentContent.title.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </motion.h1>
                
                <motion.p
                  variants={itemVariants}
                  className="text-gray-700 text-base sm:text-lg lg:text-xl leading-relaxed mb-6"
                >
                  {currentContent.subtitle}
                </motion.p>

                {/* Statistics */}
                <motion.div
                  variants={itemVariants}
                  className="flex justify-center lg:justify-start gap-6 mb-8"
                >
                  {currentContent.stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      className="text-center"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-2xl lg:text-3xl font-bold text-teal-600">
                        {stat.value}
                      </div>
                      <div className="text-sm lg:text-base text-gray-600">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Enhanced Image Gallery with floating animations */}
              <motion.div
                variants={itemVariants}
                className="flex gap-3 sm:gap-4 lg:gap-6 justify-center lg:justify-start"
              >
                {currentContent.galleryImages.map((image, index) => (
                  <motion.div
                    key={index}
                    variants={{
                      ...imageVariants,
                      ...floatingVariants,
                    }}
                    animate={{
                      y: [0, -6 + (index * 2), 0],
                      transition: {
                        duration: 3 + (index * 0.5),
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.2,
                      },
                    }}
                    whileHover={{ 
                      scale: 1.15, 
                      rotate: index % 2 === 0 ? 3 : -3,
                      zIndex: 10,
                    }}
                    className="group relative"
                  >
                    <Link 
                      to={`/destination?search=${encodeURIComponent(image.label.split(' ')[0])}`}
                      onClick={() => handleImageClick(image.label)}
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 rounded-xl lg:rounded-2xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl bg-gradient-to-br from-white to-gray-100 p-1">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-full object-cover rounded-lg lg:rounded-xl"
                          loading="lazy"
                        />
                      </div>
                    </Link>
                    
                    {/* Enhanced Tooltip */}
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-lg">
                      {image.label}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Button */}
              <motion.div
                variants={itemVariants}
                className="mt-8 flex justify-center lg:justify-start"
              >
                <Link to="/destination">
                  <motion.button
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 20px 40px rgba(0,0,0,0.12)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                  >
                    Jelajahi Sekarang
                    <motion.svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </motion.svg>
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Content - Enhanced Hero Image */}
            <motion.div
              variants={imageVariants}
              className="flex-shrink-0 relative order-first lg:order-last"
            >
              {/* Enhanced floating elements */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full opacity-70 z-10 blur-sm"
              />
              
              <motion.div
                animate={{
                  y: [0, 12, 0],
                  rotate: [0, -3, 0],
                  scale: [1, 0.9, 1],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -top-2 -right-6 w-6 h-6 bg-gradient-to-r from-teal-400 to-blue-400 rounded-full opacity-70 z-10 blur-sm"
              />
              
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, 2, 0],
                  x: [0, 5, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                }}
                className="absolute top-1/2 -right-8 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60 z-10 blur-sm"
              />

              {/* Main image container with enhanced effects */}
              <motion.div
                whileHover={{ 
                  scale: 1.02,
                  rotate: 1,
                }}
                transition={{ duration: 0.3 }}
                className={`w-72 h-96 sm:w-80 sm:h-104 lg:w-96 lg:h-120 rounded-t-full rounded-b-3xl ${currentContent.borderColor} border-4 p-3 bg-white shadow-2xl relative overflow-hidden`}
              >
                {/* Enhanced gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-t-full rounded-b-3xl z-10 pointer-events-none" />

                {/* Inner image container */}
                <div className="w-full h-full rounded-t-full rounded-b-2xl overflow-hidden relative">
                  <motion.img
                    key={currentContent.mainImage}
                    initial={{ opacity: 0, scale: 1.2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    src={currentContent.mainImage}
                    alt={currentContent.mainImageAlt}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    loading="lazy"
                  />

                  {/* Enhanced image overlay */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-3 z-20 shadow-lg"
                  >
                    <h3 className="font-semibold text-gray-800 text-sm">
                      {currentContent.mainImageAlt}
                    </h3>
                    <p className="text-xs text-gray-600">
                      Yogyakarta, Indonesia
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Rekomendasi;
