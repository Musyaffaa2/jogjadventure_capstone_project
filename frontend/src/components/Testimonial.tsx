import { motion } from "framer-motion";
import { useState } from "react";

function Testimonial() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Data untuk testimonial - diperbaiki dengan data testimonial yang benar
  const testimonials = [
    {
      id: 1,
      name: "Bang Upin",
      image: "/prambanan2.jpg",
      description:
        "Pengalaman yang sangat menyenangkan, di tambah pelayannya ramah banget, top banget, rekomen buat yang mau cobain!",
      rating: 5,
    },
    {
      id: 2,
      name: "Siti Maharani",
      image: "/malioboro.jpg",
      description:
        "Tour guide-nya profesional dan sangat memahami sejarah Jogja. Destinasi yang dipilih juga pas banget!",
      rating: 5,
    },
    {
      id: 3,
      name: "Andi Pratama",
      image: "/tugujogja.jpg",
      description:
        "Pelayanan memuaskan dari awal sampai akhir. Harga juga sangat reasonable untuk kualitas yang diberikan.",
      rating: 5,
    },
    {
      id: 4,
      name: "Maya Sari",
      image: "/nolkm.jpg",
      description:
        "Liburan keluarga jadi sangat berkesan! Anak-anak senang banget dan banyak spot foto yang bagus.",
      rating: 5,
    },
    {
      id: 5,
      name: "Budi Santoso",
      image: "/parangtritis1.jpg",
      description:
        "Recommended banget! Transportasi nyaman, jadwal tepat waktu, dan pemandu wisata yang friendly.",
      rating: 5,
    },
    {
      id: 6,
      name: "Dewi Lestari",
      image: "/tamansari.jpg",
      description:
        "Paket wisatanya lengkap dan terorganisir dengan baik. Pasti akan booking lagi untuk trip selanjutnya!",
      rating: 4,
    },
    {
      id: 7,
      name: "Rizki Hakim",
      image: "/borobudur.jpg",
      description:
        "Trip ke Borobudur sunrise-nya amazing! Tim Jogjadventure sangat membantu dan informatif.",
      rating: 5,
    },
    {
      id: 8,
      name: "Linda Wijaya",
      image: "/keraton.jpg",
      description:
        "Sudah 3 kali pakai jasa Jogjadventure, selalu puas! Pelayanan konsisten dan selalu ada inovasi baru.",
      rating: 5,
    },
  ];

  const itemsPerSlide = 3;
  const totalSlides = Math.ceil(testimonials.length / itemsPerSlide);

  // Navigation functions
  const goToPrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 600);
  };

  const goToNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 600);
  };

  // Get current testimonials to display
  const getCurrentTestimonials = () => {
    const startIndex = currentSlide * itemsPerSlide;
    return testimonials.slice(startIndex, startIndex + itemsPerSlide);
  };

  const currentTestimonials = getCurrentTestimonials();

  // Render stars based on rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={index < rating ? "text-yellow-500" : "text-gray-300"}
      >
        ★
      </span>
    ));
  };

  return (
    <section className="bg-gradient-to-br from-teal-50 to-blue-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.h3
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-teal-600 mb-4"
          >
            Testimoni Jogjadventure
          </motion.h3>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-gray-600 text-lg max-w-2xl mx-auto"
          >
            Apa sih yang pelanggan kami rasakan ketika bersama Jogjadventure?
            Simak testimoni mereka di bawah ini!
          </motion.p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="relative">
          <motion.div
            key={currentSlide}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
            className="grid md:grid-cols-3 gap-8 mb-8"
          >
            {currentTestimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Profile Section */}
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full border-3 border-teal-100 shadow-md mr-4 object-cover"
                  />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {testimonial.name}
                    </h4>
                    <div className="text-lg">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                </div>

                {/* Testimonial Text */}
                <div className="relative">
                  <div className="text-teal-600 text-4xl font-serif absolute -top-2 -left-1">
                    "
                  </div>
                  <p className="text-gray-700 leading-relaxed pl-6 italic">
                    {testimonial.description}
                  </p>
                  <div className="text-teal-600 text-4xl font-serif absolute -bottom-4 -right-1">
                    "
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Navigation Controls */}
          <div className="flex justify-center items-center space-x-6">
            {/* Left Arrow */}
            <button
              onClick={goToPrevious}
              disabled={isAnimating}
              aria-label="Previous testimonials"
              className="w-14 h-14 rounded-full bg-white shadow-lg ring-1 ring-teal-100 flex items-center justify-center hover:bg-teal-50 hover:shadow-xl transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-6 h-6 text-teal-600 group-hover:-translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Slide Indicators */}
            <div className="flex space-x-2">
              {Array.from({ length: totalSlides }, (_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!isAnimating) {
                      setIsAnimating(true);
                      setCurrentSlide(index);
                      setTimeout(() => setIsAnimating(false), 600);
                    }
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "bg-teal-600 w-8"
                      : "bg-gray-300 hover:bg-teal-300"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={goToNext}
              disabled={isAnimating}
              aria-label="Next testimonials"
              className="w-14 h-14 rounded-full bg-white shadow-lg ring-1 ring-teal-100 flex items-center justify-center hover:bg-teal-50 hover:shadow-xl transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-6 h-6 text-teal-600 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Additional Trust Indicators */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <div className="flex justify-center items-center space-x-8 text-gray-600">
            <div className="flex items-center">
              <span className="text-2xl text-yellow-500 mr-2">★</span>
              <span className="font-semibold">4.9/5 Rating</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-gray-300"></div>
            <div className="flex items-center">
              <span className="text-2xl text-teal-600 mr-2">👥</span>
              <span className="font-semibold">500+ Happy Customers</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-gray-300"></div>
            <div className="flex items-center">
              <span className="text-2xl text-green-600 mr-2">✓</span>
              <span className="font-semibold">100% Recommended</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Testimonial;