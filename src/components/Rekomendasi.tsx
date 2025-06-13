import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

// Definisikan tipe data untuk rekomendasi agar lebih aman
interface Recommendation {
  Place_Name: string;
  Description: string;
  Category: string;
  Price: number;
  Rating: number;
  City: string;
}

type TabName = "Rekomendasi" | "Rating" | "Sering Dikunjungi" | "Cari Rekomendasi";

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
  
  // State untuk fitur pencarian rekomendasi
  const [placeName, setPlaceName] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const tabs: TabName[] = ["Rekomendasi", "Rating", "Sering Dikunjungi", "Cari Rekomendasi"];

  // Variants untuk animasi
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  // Data untuk setiap tab
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
        {
          src: "/parangtritis1.jpg",
          alt: "Parangtritis",
          label: "Parangtritis",
        },
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
        {
          src: "/parangtritis1.jpg",
          alt: "Parangtritis",
          label: "Parangtritis",
        },
      ],
    },
    "Cari Rekomendasi": {
      title: "Dapatkan Rekomendasi\nWisata Personal",
      subtitle:
        "Masukkan nama tempat wisata dan dapatkan rekomendasi tempat serupa yang mungkin Anda sukai.",
      mainImage: "/search-travel.jpg",
      mainImageAlt: "Pencarian Wisata",
      borderColor: "border-green-400",
      stats: [
        { label: "Akurasi AI", value: "95%" },
        { label: "Database", value: "1000+" },
        { label: "Rekomendasi", value: "Real-time" },
      ],
      galleryImages: [
        { src: "/ai-search.jpg", alt: "AI Search", label: "AI Powered" },
        { src: "/data-analysis.jpg", alt: "Data Analysis", label: "Smart Analysis" },
        { src: "/personalized.jpg", alt: "Personalized", label: "Personalized" },
        { src: "/instant.jpg", alt: "Instant", label: "Instant Results" },
      ],
    },
  };

  // Handler untuk input pencarian
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlaceName(event.target.value);
  };

  // Fungsi untuk mendapatkan rekomendasi dari API
  const getRecommendations = async () => {
    if (!placeName) {
      setError("Silakan masukkan nama tempat wisata.");
      return;
    }

    setIsLoading(true);
    setError("");
    setRecommendations([]);

    try {
      // Kirim request ke backend Flask
      const response = await fetch("http://127.0.0.1:5000/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ place_name: placeName }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Terjadi kesalahan pada server.");
      }

      const data: Recommendation[] = await response.json();
      setRecommendations(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan yang tidak diketahui.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const currentContent = tabContent[activeTab];

  return (
    <section id="rekomendasi" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
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

        {/* Content berdasarkan tab yang aktif */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="w-full"
          >
            {activeTab === "Cari Rekomendasi" ? (
              // Konten khusus untuk tab Cari Rekomendasi
              <div className="max-w-4xl mx-auto">
                <motion.div
                  variants={itemVariants}
                  className="text-center mb-8"
                >
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-6">
                    {currentContent.title.split("\n").map((line, index) => (
                      <span key={index}>
                        {line}
                        {index < currentContent.title.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </h1>
                  <p className="text-gray-700 text-lg lg:text-xl mb-8">
                    {currentContent.subtitle}
                  </p>
                </motion.div>

                {/* Form Pencarian */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      value={placeName}
                      onChange={handleInputChange}
                      placeholder="Contoh: Candi Borobudur"
                      className="flex-1 px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
                    />
                    <motion.button
                      onClick={getRecommendations}
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Mencari...
                        </div>
                      ) : (
                        "Cari Rekomendasi"
                      )}
                    </motion.button>
                  </div>
                  
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-center mt-4 bg-red-50 p-3 rounded-lg"
                    >
                      {error}
                    </motion.p>
                  )}
                </motion.div>

                {/* Hasil Rekomendasi */}
                {recommendations.length > 0 && (
                  <motion.div
                    variants={itemVariants}
                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {recommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800 flex-1">
                              {rec.Place_Name}
                            </h3>
                            <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                              <span className="text-yellow-600">★</span>
                              <span className="text-sm font-semibold text-yellow-800">
                                {rec.Rating}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {rec.Description.length > 120
                              ? `${rec.Description.substring(0, 120)}...`
                              : rec.Description}
                          </p>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Kategori:</span>
                              <span className="font-medium bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs">
                                {rec.Category}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Kota:</span>
                              <span className="font-medium">{rec.City}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Harga:</span>
                              <span className="font-bold text-green-600">
                                Rp{rec.Price.toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            ) : (
              // Konten untuk tab lainnya (tampilan asli)
              <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-8 lg:gap-12">
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
                        <div key={index} className="text-center">
                          <div className="text-2xl lg:text-3xl font-bold text-teal-600">
                            {stat.value}
                          </div>
                          <div className="text-sm lg:text-base text-gray-600">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </div>

                  {/* Image Gallery - 4 small images in a row */}
                  <motion.div
                    variants={itemVariants}
                    className="flex gap-3 sm:gap-4 lg:gap-6 justify-center lg:justify-start"
                  >
                    {currentContent.galleryImages.map((image, index) => (
                      <motion.div
                        key={index}
                        variants={imageVariants}
                        whileHover={{ scale: 1.1, rotate: 2 }}
                        className="group relative"
                      >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 rounded-xl lg:rounded-2xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl bg-gradient-to-br from-white to-gray-100 p-1">
                          <img
                            src={image.src}
                            alt={image.alt}
                            className="w-full h-full object-cover rounded-lg lg:rounded-xl"
                          />
                        </div>
                        {/* Tooltip */}
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                          {image.label}
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
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                      >
                        Jelajahi Sekarang
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </motion.button>
                    </Link>
                  </motion.div>
                </motion.div>

                {/* Right Content - Large Hero Image */}
                <motion.div
                  variants={imageVariants}
                  className="flex-shrink-0 relative order-first lg:order-last"
                >
                  {/* Floating elements */}
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 2, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full opacity-70 z-10"
                  />
                  <motion.div
                    animate={{
                      y: [0, 10, 0],
                      rotate: [0, -2, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                    className="absolute -top-2 -right-6 w-6 h-6 bg-gradient-to-r from-teal-400 to-blue-400 rounded-full opacity-70 z-10"
                  />

                  {/* Main image container */}
                  <div
                    className={`w-72 h-96 sm:w-80 sm:h-104 lg:w-96 lg:h-120 rounded-t-full rounded-b-3xl ${currentContent.borderColor} border-4 p-3 bg-white shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-3xl relative overflow-hidden`}
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-t-full rounded-b-3xl z-10 pointer-events-none" />

                    {/* Inner image container */}
                    <div className="w-full h-full rounded-t-full rounded-b-2xl overflow-hidden relative">
                      <motion.img
                        key={currentContent.mainImage}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        src={currentContent.mainImage}
                        alt={currentContent.mainImageAlt}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                      />

                      {/* Image overlay with location info */}
                      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 z-20">
                        <h3 className="font-semibold text-gray-800 text-sm">
                          {currentContent.mainImageAlt}
                        </h3>
                        <p className="text-xs text-gray-600">
                          Yogyakarta, Indonesia
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Rekomendasi;