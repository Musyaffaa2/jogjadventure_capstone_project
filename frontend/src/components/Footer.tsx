import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#1F1B3A] text-white py-10 px-6 md:px-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20"></div>
      <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10 relative z-10">
        {/* Logo & Description */}
        <div className="flex-shrink-0 md:max-w-md group">
          <div className="flex items-center gap-6">
            <div className="relative overflow-hidden rounded-2xl p-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-500">
              <img 
                src="/icon.png" 
                alt="Jogjadventure Logo" 
                className="h-32 transform group-hover:scale-110 transition-transform duration-500 ease-out" 
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                Jelajahi keindahan Yogyakarta dengan panduan terpercaya. Temukan destinasi wisata terbaik dan pengalaman tak terlupakan di kota istimewa ini.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quick Links */}
          <div className="group">
            <h4 className="font-semibold mb-4 text-lg relative">
              Quick Links
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 group-hover:w-full transition-all duration-500 ease-out"></span>
            </h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <Link 
                  to="/" 
                  className="relative inline-block hover:text-white transition-all duration-300 group/link"
                >
                  <span className="relative z-10">Home</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-left rounded"></span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/destination" 
                  className="relative inline-block hover:text-white transition-all duration-300 group/link"
                >
                  <span className="relative z-10">Destinations</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-left rounded"></span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="relative inline-block hover:text-white transition-all duration-300 group/link"
                >
                  <span className="relative z-10">About Us</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-left rounded"></span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className="relative inline-block hover:text-white transition-all duration-300 group/link"
                >
                  <span className="relative z-10">FAQ & Help</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-left rounded"></span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="group">
            <h4 className="font-semibold mb-4 text-lg relative">
              Follow Us
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 group-hover:w-full transition-all duration-500 ease-out"></span>
            </h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <a 
                  href="https://www.instagram.com/jogjaku/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-all duration-300 flex items-center gap-2 group/social hover:translate-x-2"
                >
                  <div className="p-2 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 group-hover/social:from-pink-500/40 group-hover/social:to-purple-500/40 transition-all duration-300 group-hover/social:scale-110 group-hover/social:rotate-6">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <span className="group-hover/social:font-medium transition-all duration-300">Instagram</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://x.com/Jogja24Jam" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-all duration-300 flex items-center gap-2 group/social hover:translate-x-2"
                >
                  <div className="p-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 group-hover/social:from-blue-500/40 group-hover/social:to-cyan-500/40 transition-all duration-300 group-hover/social:scale-110 group-hover/social:rotate-6">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <span className="group-hover/social:font-medium transition-all duration-300">Twitter</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.facebook.com/groups/955498851537421" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-all duration-300 flex items-center gap-2 group/social hover:translate-x-2"
                >
                  <div className="p-2 rounded-full bg-gradient-to-r from-blue-600/20 to-indigo-600/20 group-hover/social:from-blue-600/40 group-hover/social:to-indigo-600/40 transition-all duration-300 group-hover/social:scale-110 group-hover/social:rotate-6">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <span className="group-hover/social:font-medium transition-all duration-300">Facebook</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="group">
            <h4 className="font-semibold mb-4 text-lg relative">
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 group-hover:w-full transition-all duration-500 ease-out"></span>
            </h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2 group/contact hover:translate-x-2 transition-transform duration-300">
                <div className="p-2 rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 group-hover/contact:from-red-500/40 group-hover/contact:to-pink-500/40 transition-all duration-300 group-hover/contact:scale-110 group-hover/contact:rotate-6">
                  <svg className="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <span className="group-hover/contact:text-white group-hover/contact:font-medium transition-all duration-300">Yogyakarta, Indonesia</span>
              </li>
              <li>
                <a 
                  href="https://wa.me/6287766958303"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-all duration-300 flex items-center gap-2 group/contact hover:translate-x-2"
                >
                  <div className="p-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 group-hover/contact:from-green-500/40 group-hover/contact:to-emerald-500/40 transition-all duration-300 group-hover/contact:scale-110 group-hover/contact:rotate-6">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </div>
                  <span className="group-hover/contact:font-medium transition-all duration-300">WhatsApp</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:musyaffaarwin@gmail.com"
                  className="hover:text-white transition-all duration-300 flex items-center gap-2 group/contact hover:translate-x-2"
                >
                  <div className="p-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 group-hover/contact:from-yellow-500/40 group-hover/contact:to-orange-500/40 transition-all duration-300 group-hover/contact:scale-110 group-hover/contact:rotate-6">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                  </div>
                  <span className="group-hover/contact:font-medium transition-all duration-300">Email</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-gray-600 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p className="hover:text-gray-300 transition-colors duration-300">&copy; 2024 Jogjadventure. All rights reserved.</p>
          <p className="mt-2 md:mt-0 hover:text-gray-300 transition-colors duration-300 group">
            Made with <span className="text-red-400 group-hover:animate-pulse group-hover:scale-125 inline-block transition-transform duration-300">❤️</span> for Yogyakarta Tourism
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;