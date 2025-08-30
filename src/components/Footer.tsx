import React from "react";
import { Watch, Phone, Instagram } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Watch className="h-8 w-8 text-white" strokeWidth={1.5} />
              <span className="text-3xl font-thin text-white tracking-tight">
                Twins Accessories
              </span>
            </div>
            <p className="text-gray-400 font-light leading-relaxed max-w-sm">
              Premium accessories for the modern man. Each timepiece tells a
              story of elegance and precision.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-xl font-light text-white tracking-wide">
              Contact
            </h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
                <a
                  href="tel:+33123456789"
                  className="text-gray-300 hover:text-white transition-colors font-light"
                >
                  +212 617-373442
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Instagram
                  className="h-5 w-5 text-gray-400"
                  strokeWidth={1.5}
                />
                <a
                  href="https://instagram.com/twins_asc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors font-light"
                >
                  @twinaccessories
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xl font-light text-white tracking-wide">
              Navigation
            </h4>
            <div className="space-y-4">
              <button
                onClick={() =>
                  document
                    .getElementById("collection")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="block text-gray-300 hover:text-white transition-colors font-light text-left"
              >
                Collection
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 font-light">
            © 2025 Twins Accessories. All rights reserved. Made with ❤️.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
