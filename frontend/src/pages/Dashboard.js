import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Package, Heart, ShoppingCart, User, Settings, ArrowRight } from 'lucide-react';

export const Dashboard = () => {
  const { user, isAdmin } = useAuth();

  const dashboardLinks = [
    {
      icon: <Package className="w-6 h-6" />,
      title: 'My Orders',
      description: 'View your order history and track deliveries',
      href: '/orders',
      color: 'bg-[#00F0FF]/10 text-[#00F0FF]'
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Wishlist',
      description: 'View and manage your saved items',
      href: '/wishlist',
      color: 'bg-[#FF0055]/10 text-[#FF0055]'
    },
    {
      icon: <ShoppingCart className="w-6 h-6" />,
      title: 'Shopping Cart',
      description: 'Review items in your cart',
      href: '/cart',
      color: 'bg-[#7000FF]/10 text-[#7000FF]'
    }
  ];

  return (
    <div className="min-h-screen py-24 md:py-32">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-[#7000FF] flex items-center justify-center overflow-hidden">
              {user?.picture ? (
                <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold">{user?.name?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <div>
              <p className="text-[#00F0FF] text-sm uppercase tracking-widest font-medium">Welcome back</p>
              <h1 className="text-3xl font-bold">{user?.name}</h1>
            </div>
          </div>
          <p className="text-white/50">{user?.email}</p>
        </div>

        {/* Admin Panel Link */}
        {isAdmin && (
          <Link 
            to="/admin" 
            className="block mb-8 p-6 bg-gradient-to-r from-[#00F0FF]/20 to-[#7000FF]/20 border border-[#00F0FF]/30 rounded-lg hover:border-[#00F0FF]/50 transition-colors"
            data-testid="admin-panel-link"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#00F0FF]/20 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-[#00F0FF]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Admin Panel</h3>
                  <p className="text-white/50 text-sm">Manage products, orders, and discounts</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#00F0FF]" />
            </div>
          </Link>
        )}

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4">
          {dashboardLinks.map((link, index) => (
            <Link
              key={index}
              to={link.href}
              className="p-6 bg-[#0a0a0a] border border-white/5 rounded-lg hover:border-white/10 transition-colors group"
              data-testid={`dashboard-link-${link.title.toLowerCase().replace(' ', '-')}`}
            >
              <div className={`w-12 h-12 rounded-lg ${link.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {link.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{link.title}</h3>
              <p className="text-white/50 text-sm">{link.description}</p>
            </Link>
          ))}
        </div>

        {/* Browse Products CTA */}
        <div className="mt-12 text-center">
          <Link to="/products">
            <Button className="btn-skew bg-[#00F0FF] text-black h-12 px-8 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-2">
                Browse Products <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
