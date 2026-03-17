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
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Noise Overlay */}
      <div className="noise-overlay" />

      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.4)] bg-black/50 flex items-center justify-center p-1">
              <img 
                src="https://customer-assets.emergentagent.com/job_gaming-hub-471/artifacts/xqaigfjd_trustvault%20logo.png" 
                alt="Trust Vault" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:block bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">TRUST VAULT</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/products" 
              className={`text-sm uppercase tracking-wider transition-colors ${isActive('/products') ? 'text-[#00F0FF]' : 'text-white/70 hover:text-white'}`}
              data-testid="nav-products"
            >
              Store
            </Link>
            {user && (
              <Link 
                to="/wishlist" 
                className={`text-sm uppercase tracking-wider transition-colors ${isActive('/wishlist') ? 'text-[#00F0FF]' : 'text-white/70 hover:text-white'}`}
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
              <Link to="/cart" className="relative p-2 hover:bg-white/5 rounded-lg transition-colors" data-testid="nav-cart">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#00F0FF] text-black text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg transition-colors" data-testid="user-menu-trigger">
                    <div className="w-8 h-8 rounded-full bg-[#7000FF] flex items-center justify-center overflow-hidden">
                      {user.picture ? (
                        <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold">{user.name?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-white/50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#0a0a0a] border-white/10">
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-white/50">{user.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer" data-testid="menu-dashboard">
                      <User className="w-4 h-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center gap-2 cursor-pointer" data-testid="menu-orders">
                      <Package className="w-4 h-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist" className="flex items-center gap-2 cursor-pointer" data-testid="menu-wishlist">
                      <Heart className="w-4 h-4" />
                      Wishlist
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2 cursor-pointer text-[#00F0FF]" data-testid="menu-admin">
                          <Settings className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-red-400" data-testid="menu-logout">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" className="text-white/70 hover:text-white" data-testid="nav-login">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="btn-skew bg-[#00F0FF] text-black hover:bg-[#00F0FF]/90 font-bold" data-testid="nav-register">
                    <span>Sign Up</span>
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 hover:bg-white/5 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0a0a0a] border-t border-white/5 px-4 py-4 space-y-4">
            <Link 
              to="/products" 
              className="block text-sm uppercase tracking-wider py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Store
            </Link>
            {user && (
              <Link 
                to="/wishlist" 
                className="block text-sm uppercase tracking-wider py-2"
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
      <footer className="bg-[#0a0a0a] border-t border-white/5 py-12">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-4">TRUST VAULT</h4>
              <p className="text-sm text-white/50">Your trusted source for premium digital game accounts.</p>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-white/50">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/products" className="text-white/70 hover:text-white transition-colors">Store</Link></li>
                <li><Link to="/cart" className="text-white/70 hover:text-white transition-colors">Cart</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-white/50">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="text-white/70">Contact Us</span></li>
                <li><span className="text-white/70">FAQ</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-white/50">Currency</h4>
              <div className="currency-toggle flex w-fit">
                <button onClick={toggleCurrency} className={currency === 'INR' ? 'active' : ''}>INR</button>
                <button onClick={toggleCurrency} className={currency === 'USD' ? 'active' : ''}>USD</button>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 text-center text-sm text-white/30">
            © 2024 Trust Vault. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
