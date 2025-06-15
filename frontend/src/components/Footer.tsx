import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#1F1B3A] text-white py-10 px-6 md:px-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img src="/icon.png" alt="Jogjadventure Logo" className="h-32 mb-2" />
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h4 className="font-semibold mb-3">About</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/about">About us</Link></li>
              <li><Link to="/destination">Features</Link></li>
              <li><a href="#">News & Blogs</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="https://www.instagram.com/jogjaku/" target='blank'>Instagram</a></li>
              <li><a href="https://x.com/Jogja24Jam" target='blank'>Twitter</a></li>
              <li><a href="https://www.facebook.com/groups/955498851537421" target='blank'>Facebook</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/faq">FAQs</Link></li>
              <li><a  href="tel:+6281234567890">Support Centre</a></li>
              <li><a href="#">Feedback</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
