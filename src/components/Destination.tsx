import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Search,
  MapPin,
  Star,
  Clock,
  Camera,
  ArrowLeft,
  Phone,
  Globe,
  Calendar,
  Users,
  Wallet,
  Navigation,
} from "lucide-react";
import Navbar from "./Navbar";

interface Destination {
  id: number;
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
}

// Interface untuk rekomendasi dari ML API
interface Recommendation {
  Place_Name: string;
  Description: string;
  Category: string;
  Price: number;
  Rating: number;
  City: string;
  Place_Id: number;
  Address: string;
  Latitude: number;
  Longitude: number;
}

function DestinationApp() {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentView, setCurrentView] = useState<"list" | "detail">("list");
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [recommendationResults, setRecommendationResults] = useState<
    Recommendation[]
  >([]);
  const [isFromRecommendation, setIsFromRecommendation] = useState(false);
  const [originalSearchQuery, setOriginalSearchQuery] = useState("");

  const destinations: Destination[] = [
    {
      id: 1,
      name: "Candi Borobudur",
      description:
        "Candi Buddha terbesar di dunia dengan arsitektur yang menakjubkan",
      detailedDescription:
        "Candi Borobudur adalah monumen Buddha terbesar di dunia yang dibangun pada abad ke-8 dan ke-9 pada masa pemerintahan wangsa Syailendra. Candi ini memiliki 2.672 panel relief dan 504 stupa Buddha. Borobudur tidak hanya merupakan tempat ibadah, tetapi juga sebuah ensiklopedia Buddha yang menggambarkan ajaran Buddha dalam bentuk batu.",
      location: "Magelang, Jawa Tengah",
      rating: 4.8,
      duration: "3-4 jam",
      image: "https://picsum.photos/400/300?random=1",
      category: "heritage",
      price: "Rp 50.000",
      gallery: [
        "https://picsum.photos/600/400?random=11",
        "https://picsum.photos/600/400?random=12",
        "https://picsum.photos/600/400?random=13",
        "https://picsum.photos/600/400?random=14",
      ],
      facilities: [
        "Parkir",
        "Toilet",
        "Mushola",
        "Restoran",
        "Souvenir Shop",
        "Guide",
      ],
      activities: ["Foto sunrise", "Tur sejarah", "Meditasi", "Workshop batik"],
      openingHours: "06:00 - 17:00 WIB",
      contact: "+62 293 788266",
      website: "borobudurpark.com",
      bestTime: "Pagi hari (sunrise) atau sore hari",
      capacity: "1200 orang/hari",
      tips: [
        "Datang pagi untuk menghindari keramaian",
        "Bawa topi dan sunscreen",
        "Kenakan sepatu yang nyaman",
        "Bawa air minum yang cukup",
      ],
      coordinates: { lat: -7.6079, lng: 110.2038 },
    },
    {
      id: 2,
      name: "Candi Prambanan",
      description: "Kompleks candi Hindu terbesar dengan relief yang memukau",
      detailedDescription:
        "Candi Prambanan adalah kompleks candi Hindu terbesar di Indonesia yang dibangun pada abad ke-9. Kompleks ini terdiri dari 240 candi yang tersebar dalam area seluas 39,8 hektar. Candi utama didedikasikan untuk Trimurti Hindu: Brahma, Wisnu, dan Siwa. Relief pada dinding candi menceritakan kisah Ramayana dan Krishnayana.",
      location: "Sleman, Yogyakarta",
      rating: 4.7,
      duration: "2-3 jam",
      image: "https://picsum.photos/400/300?random=2",
      category: "heritage",
      price: "Rp 40.000",
      gallery: [
        "https://picsum.photos/600/400?random=21",
        "https://picsum.photos/600/400?random=22",
        "https://picsum.photos/600/400?random=23",
        "https://picsum.photos/600/400?random=24",
      ],
      facilities: ["Parkir", "Toilet", "Mushola", "Café", "Museum", "Teater"],
      activities: [
        "Tur heritage",
        "Pertunjukan Ramayana",
        "Fotografi",
        "Cycling tour",
      ],
      openingHours: "06:00 - 18:00 WIB",
      contact: "+62 274 496401",
      website: "prambanan.kemdikbud.go.id",
      bestTime: "Sore hari untuk sunset",
      capacity: "800 orang/hari",
      tips: [
        "Tonton pertunjukan Ramayana di malam hari",
        "Gunakan guide untuk memahami sejarah",
        "Bawa kamera dengan lensa wide",
        "Hindari hari libur nasional",
      ],
      coordinates: { lat: -7.752, lng: 110.4915 },
    },
    {
      id: 3,
      name: "Pantai Parangtritis",
      description: "Pantai eksotis dengan pemandangan sunset yang menawan",
      detailedDescription:
        "Pantai Parangtritis adalah pantai paling terkenal di Yogyakarta dengan pasir hitam vulkanis dan ombak yang tinggi. Pantai ini memiliki legenda mistis tentang Ratu Pantai Selatan. Selain menikmati sunset, pengunjung dapat menaiki ATV, naik delman, atau berkuda di sepanjang pantai.",
      location: "Bantul, Yogyakarta",
      rating: 4.5,
      duration: "2-3 jam",
      image: "https://picsum.photos/400/300?random=3",
      category: "nature",
      price: "Gratis",
      gallery: [
        "https://picsum.photos/600/400?random=31",
        "https://picsum.photos/600/400?random=32",
        "https://picsum.photos/600/400?random=33",
        "https://picsum.photos/600/400?random=34",
      ],
      facilities: [
        "Parkir",
        "Toilet",
        "Warung makan",
        "Persewaan ATV",
        "Delman",
      ],
      activities: [
        "Sunset viewing",
        "ATV riding",
        "Berkuda",
        "Surfing",
        "Sand boarding",
      ],
      openingHours: "24 jam",
      contact: "+62 274 367055",
      bestTime: "Sore hari (16:00-18:00)",
      capacity: "Unlimited",
      tips: [
        "Hati-hati dengan ombak yang besar",
        "Jangan berenang di laut",
        "Bawa jaket untuk angin pantai",
        "Parkir agak jauh dari pantai",
      ],
      coordinates: { lat: -8.0247, lng: 110.3294 },
    },
    {
      id: 4,
      name: "Malioboro Street",
      description: "Jalan legendaris dengan berbagai toko, kuliner, dan budaya",
      detailedDescription:
        "Jalan Malioboro adalah jantung kota Yogyakarta dan pusat aktivitas ekonomi, budaya, dan sosial. Sepanjang 2,5 km, jalan ini dipenuhi toko batik, pedagang kaki lima, hotel, dan restoran. Di malam hari, Malioboro berubah menjadi surga kuliner dengan lesehan yang menjual gudeg, bakpia, dan makanan khas Yogya lainnya.",
      location: "Yogyakarta",
      rating: 4.6,
      duration: "2-4 jam",
      image: "https://picsum.photos/400/300?random=4",
      category: "culture",
      price: "Gratis",
      gallery: [
        "https://picsum.photos/600/400?random=41",
        "https://picsum.photos/600/400?random=42",
        "https://picsum.photos/600/400?random=43",
        "https://picsum.photos/600/400?random=44",
      ],
      facilities: ["ATM", "Toilet umum", "Parkir", "WiFi gratis", "Pos polisi"],
      activities: [
        "Shopping batik",
        "Street food hunting",
        "Naik andong",
        "Fotografi jalanan",
      ],
      openingHours: "24 jam",
      contact: "+62 274 566677",
      bestTime: "Sore dan malam hari",
      capacity: "Unlimited",
      tips: [
        "Tawar harga saat berbelanja",
        "Coba gudeg di angkringan",
        "Hindari jam sibuk (17:00-19:00)",
        "Bawa tas anti maling",
      ],
      coordinates: { lat: -7.7932, lng: 110.3656 },
    },
    {
      id: 5,
      name: "Goa Jomblang",
      description: "Goa vertikal dengan cahaya surga yang memukau",
      detailedDescription:
        "Goa Jomblang adalah goa vertikal dengan kedalaman 60 meter yang terkenal dengan fenomena 'cahaya surga' - sinar matahari yang menembus lubang goa dan menciptakan pemandangan spektakuler. Goa ini terbentuk akibat runtuhnya tanah karst dan memiliki sungai bawah tanah. Aktivitas caving di sini membutuhkan peralatan khusus dan panduan profesional.",
      location: "Gunung Kidul, Yogyakarta",
      rating: 4.9,
      duration: "5-6 jam",
      image: "https://picsum.photos/400/300?random=5",
      category: "adventure",
      price: "Rp 450.000",
      gallery: [
        "https://picsum.photos/600/400?random=51",
        "https://picsum.photos/600/400?random=52",
        "https://picsum.photos/600/400?random=53",
        "https://picsum.photos/600/400?random=54",
      ],
      facilities: [
        "Basecamp",
        "Peralatan caving",
        "Guide",
        "P3K",
        "Toilet",
        "Mushola",
      ],
      activities: [
        "Vertical caving",
        "Fotografi cahaya surga",
        "River tubing",
        "Eksplorasi goa",
      ],
      openingHours: "08:00 - 15:00 WIB",
      contact: "+62 812 2726 4596",
      bestTime: "Pagi hari (10:00-12:00) untuk cahaya terbaik",
      capacity: "50 orang/hari",
      tips: [
        "Kondisi fisik harus prima",
        "Pakai sepatu anti slip",
        "Bawa baju ganti",
        "Booking minimal H-1",
      ],
      coordinates: { lat: -7.9617, lng: 110.6754 },
    },
    {
      id: 6,
      name: "Keraton Yogyakarta",
      description: "Istana Sultan dengan arsitektur Jawa yang megah",
      detailedDescription:
        "Keraton Ngayogyakarta Hadiningrat adalah istana resmi Kesultanan Yogyakarta yang masih berfungsi hingga saat ini. Dibangun pada 1755 oleh Sultan Hamengku Buwono I, keraton ini merupakan pusat kebudayaan Jawa dengan koleksi gamelan, wayang, batik, dan berbagai artefak kerajaan. Arsitektur keraton memadukan gaya Jawa, Eropa, dan Tiongkok.",
      location: "Yogyakarta",
      rating: 4.4,
      duration: "1-2 jam",
      image: "https://picsum.photos/400/300?random=6",
      category: "culture",
      price: "Rp 15.000",
      gallery: [
        "https://picsum.photos/600/400?random=61",
        "https://picsum.photos/600/400?random=62",
        "https://picsum.photos/600/400?random=63",
        "https://picsum.photos/600/400?random=64",
      ],
      facilities: ["Museum", "Toilet", "Parkir", "Souvenir shop", "Mushola"],
      activities: [
        "Tur istana",
        "Museum gamelan",
        "Pertunjukan budaya",
        "Workshop batik",
      ],
      openingHours: "08:30 - 14:00 WIB (Tutup Jumat)",
      contact: "+62 274 373721",
      website: "kratonjogja.id",
      bestTime: "Pagi hari setelah jam 9",
      capacity: "500 orang/hari",
      tips: [
        "Berpakaian sopan dan tertutup",
        "Tidak boleh foto di area tertentu",
        "Ikuti tur guided untuk info lengkap",
        "Kunjungi museum gamelan",
      ],
      coordinates: { lat: -7.8051, lng: 110.3644 },
    },
  ];

  const categories = [
    { id: "all", name: "Semua", icon: "🗺️" },
    { id: "heritage", name: "Heritage", icon: "🏛️" },
    { id: "nature", name: "Alam", icon: "🌿" },
    { id: "culture", name: "Budaya", icon: "🎭" },
    { id: "adventure", name: "Petualangan", icon: "⛰️" },
  ];

  // Handle data dari Hero component (rekomendasi ML)
  useEffect(() => {
    if (location.state) {
      const {
        recommendations,
        searchQuery,
        isFromRecommendation: fromRec,
      } = location.state;
      if (fromRec && recommendations) {
        setRecommendationResults(recommendations);
        setIsFromRecommendation(true);
        setOriginalSearchQuery(searchQuery || "");
        setSearchTerm(""); // Clear search term untuk menampilkan semua hasil rekomendasi
      }
    }
  }, [location.state]);

  // Function to convert recommendation to destination format
  const convertRecommendationToDestination = (
    rec: Recommendation
  ): Destination => {
    return {
      id: rec.Place_Id,
      name: rec.Place_Name,
      description:
        rec.Description.length > 150
          ? `${rec.Description.substring(0, 150)}...`
          : rec.Description,
      detailedDescription: rec.Description,
      location: rec.City,
      rating: rec.Rating,
      duration: "2-3 jam", // Default value
      image: `https://picsum.photos/400/300?random=${rec.Place_Id}`,
      category: rec.Category.toLowerCase(),
      price: `Rp ${rec.Price.toLocaleString("id-ID")}`,
      gallery: [
        `https://picsum.photos/600/400?random=${rec.Place_Id}1`,
        `https://picsum.photos/600/400?random=${rec.Place_Id}2`,
        `https://picsum.photos/600/400?random=${rec.Place_Id}3`,
        `https://picsum.photos/600/400?random=${rec.Place_Id}4`,
      ],
      facilities: ["Toilet", "Parkir", "Mushola", "Souvenir shop"],
      activities: ["Wisata foto", "Jelajah lokasi", "Edukasi"],
      openingHours: "08:00 - 17:00 WIB",
      contact: "+62 274 000000",
      bestTime: "Pagi hingga sore hari",
      capacity: "100 orang/hari",
      tips: [
        "Datang pagi untuk menghindari keramaian",
        "Bawa kamera untuk foto",
        "Pakai pakaian yang nyaman",
      ],
      coordinates: { lat: rec.Latitude, lng: rec.Longitude },
    };
  };

  // Determine which destinations to show
  const displayDestinations = isFromRecommendation
    ? recommendationResults.map(convertRecommendationToDestination)
    : destinations;

  const filteredDestinations = displayDestinations.filter((dest) => {
    const matchesSearch =
      dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || dest.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleViewDetail = (destination: Destination) => {
    setSelectedDestination(destination);
    setCurrentView("detail");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedDestination(null);
  };

  if (currentView === "detail" && selectedDestination) {
    return (
      <DestinationDetail
        destination={selectedDestination}
        onBack={handleBackToList}
      />
    );
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
            backgroundImage: "url(https://picsum.photos/1200/400?random=10)",
          }}
        ></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">
            {isFromRecommendation ? "Rekomendasi Wisata" : "Destinations"}
          </h1>
          <p className="text-xl drop-shadow-md">
            {isFromRecommendation
              ? `Rekomendasi berdasarkan pencarian "${originalSearchQuery}"`
              : "Temukan keajaiban tersembunyi di Yogyakarta"}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Recommendation Info Banner */}
        {isFromRecommendation && (
          <div className="mb-8 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-teal-800 mb-2">
                  🤖 Hasil Rekomendasi AI
                </h3>
                <p className="text-teal-600">
                  Menampilkan {recommendationResults.length} rekomendasi wisata
                  berdasarkan pencarian "{originalSearchQuery}"
                </p>
              </div>
              <button
                onClick={() => {
                  setIsFromRecommendation(false);
                  setRecommendationResults([]);
                  setOriginalSearchQuery("");
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="bg-white text-teal-600 px-4 py-2 rounded-lg border border-teal-200 hover:bg-teal-50 transition-colors font-medium"
              >
                Lihat Semua Destinasi
              </button>
            </div>
          </div>
        )}

        {/* Search & Filter Section */}
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
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDestinations.map((destination) => (
            <div
              key={destination.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="relative">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://picsum.photos/400/300?random=${
                      destination.id + 10
                    }`;
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
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {destination.name}
                </h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {destination.description}
                </p>

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
                    <span className="text-gray-700 font-medium">
                      {destination.rating}/5
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

        {/* No Results */}
        {filteredDestinations.length === 0 && (
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
      </div>
    </div>
  );
}

function DestinationDetail({
  destination,
  onBack,
}: {
  destination: Destination;
  onBack: () => void;
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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
          src={destination.gallery[activeImageIndex]}
          alt={destination.name}
          className="w-full h-full object-cover"
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
      <div className="container mx-auto px-6 py-6">
        <div className="flex gap-2 overflow-x-auto">
          {destination.gallery.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveImageIndex(index)}
              className={`flex-shrink-0 rounded-lg overflow-hidden ${
                activeImageIndex === index ? "ring-3 ring-blue-500" : ""
              }`}
            >
              <img
                src={image}
                alt={`${destination.name} ${index + 1}`}
                className="w-20 h-20 object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Tentang Destinasi
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {destination.detailedDescription}
              </p>
            </div>

            {/* Activities */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Aktivitas
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {destination.activities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">{activity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Facilities */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Fasilitas
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {destination.facilities.map((facility, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-green-50 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{facility}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Tips Berkunjung
              </h2>
              <div className="space-y-3">
                {destination.tips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg"
                  >
                    <div className="w-6 h-6 bg-yellow-400 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Informasi Cepat
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-sm text-gray-500">Harga Tiket</div>
                    <div className="font-semibold text-green-600">
                      {destination.price}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-500">Jam Operasional</div>
                    <div className="font-semibold">
                      {destination.openingHours}
                    </div>
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
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-500" />
                  <a
                    href={`tel:${destination.contact}`}
                    className="text-blue-600 hover:underline"
                  >
                    {destination.contact}
                  </a>
                </div>

                {destination.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <a
                      href={`https://${destination.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
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
