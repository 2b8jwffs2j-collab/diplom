import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Search, Palette, ShoppingCart, Menu, X } from 'lucide-react';
import { ME } from '../lib/graphql';
import { isAuthenticated } from '../lib/auth';
import { getCart } from '../lib/cart';
import UserDropdown from './UserDropdown';

function Navbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data } = useQuery(ME, {
    skip: !isAuthenticated(),
    fetchPolicy: 'network-only',
  });
  const cartItems = getCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Top Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Logo */}
            <Link
              to="/"
              className="flex items-center space-x-2 text-xl sm:text-2xl font-bold gradient-text hover:scale-105 transition-transform"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Palette className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
              <span className="hidden sm:inline">Гар урлал</span>
            </Link>

            {/* Right: User Dropdown + Cart */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Search - only for non-admin users */}
              {data?.me?.role !== 'ADMIN' && (
                <form onSubmit={handleSearch} className="hidden md:flex">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Бүтээгдэхүүн хайх..."
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm focus:shadow-md w-64"
                    />
                  </div>
                </form>
              )}

              {/* Cart - only for buyers or not logged in */}
              {(!data?.me || data?.me?.role === 'BUYER') && (
                <Link
                  to="/cart"
                  className="relative text-gray-700 hover:text-blue-600 transition-all hover:scale-110"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shadow-lg animate-pulse-slow text-[10px] sm:text-xs">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
              )}

              {/* User Dropdown or Login/Register */}
              {data?.me ? (
                <UserDropdown user={data.me} />
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-sm text-gray-700 hover:text-blue-600 font-medium transition"
                  >
                    Нэвтрэх
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Бүртгүүлэх
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-gray-700 hover:text-blue-600 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {data?.me?.role !== 'ADMIN' && (
            <form onSubmit={handleSearch} className="md:hidden mt-3">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Бүтээгдэхүүн хайх..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm focus:shadow-md text-sm"
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default Navbar;
