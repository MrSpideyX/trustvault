import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { ShoppingCart, Heart, User, Menu, X, LogOut, Settings, Package, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';

export const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { currency, toggleCurrency } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">TRUST VAULT</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/products" 
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${isActive('/products') ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400'}`}
              data-testid="nav-products"
            >
              All Products
            </Link>
            {user && (
              <Link 
                to="/wishlist" 
                className={`text-sm font-medium transition-colors ${isActive('/wishlist') ? 'text-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
                data-testid="nav-wishlist"
              >
                Wishlist
              </Link>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Currency Toggle */}
            <div className="currency-toggle hidden sm:flex">
              <button
                onClick={() => toggleCurrency()}
                className={currency === 'INR' ? 'active' : ''}
                data-testid="currency-inr"
              >
                INR
              </button>
              <button
                onClick={() => toggleCurrency()}
                className={currency === 'USD' ? 'active' : ''}
                data-testid="currency-usd"
              >
                USD
              </button>
            </div>

            {/* Cart */}
            {user && (
              <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors" data-testid="nav-cart">
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors" data-testid="user-menu-trigger">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center overflow-hidden">
                      {user.picture ? (
                        <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-white">{user.name?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer text-gray-700" data-testid="menu-dashboard">
                      <User className="w-4 h-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center gap-2 cursor-pointer text-gray-700" data-testid="menu-orders">
                      <Package className="w-4 h-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist" className="flex items-center gap-2 cursor-pointer text-gray-700" data-testid="menu-wishlist">
                      <Heart className="w-4 h-4" />
                      Wishlist
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-gray-100" />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2 cursor-pointer text-purple-600" data-testid="menu-admin">
                          <Settings className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-gray-100" />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-red-500" data-testid="menu-logout">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" className="text-gray-600 hover:text-gray-900" data-testid="nav-login">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-purple-600 text-white hover:bg-purple-700 font-medium rounded-full px-6" data-testid="nav-register">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-4">
            <Link 
              to="/products" 
              className="block text-sm font-medium py-2 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              All Products
            </Link>
            {user && (
              <Link 
                to="/wishlist" 
                className="block text-sm font-medium py-2 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Wishlist
              </Link>
            )}
            <div className="currency-toggle flex w-fit">
              <button onClick={toggleCurrency} className={currency === 'INR' ? 'active' : ''}>INR</button>
              <button onClick={toggleCurrency} className={currency === 'USD' ? 'active' : ''}>USD</button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-gray-900 mb-4">TRUST VAULT</h4>
              <p className="text-sm text-gray-500">Your trusted source for premium digital game accounts.</p>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-500">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/products" className="text-gray-600 hover:text-gray-900 transition-colors">Store</Link></li>
                <li><Link to="/cart" className="text-gray-600 hover:text-gray-900 transition-colors">Cart</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-500">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact Us</Link></li>
                <li><Link to="/faq" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-500">Currency</h4>
              <div className="currency-toggle flex w-fit">
                <button onClick={toggleCurrency} className={currency === 'INR' ? 'active' : ''}>INR</button>
                <button onClick={toggleCurrency} className={currency === 'USD' ? 'active' : ''}>USD</button>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-400">
            © 2024 Trust Vault. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
