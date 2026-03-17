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
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Wishlist',
      description: 'View and manage your saved items',
      href: '/wishlist',
      color: 'bg-pink-100 text-pink-600'
    },
    {
      icon: <ShoppingCart className="w-6 h-6" />,
      title: 'Shopping Cart',
      description: 'Review items in your cart',
      href: '/cart',
      color: 'bg-blue-100 text-blue-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-24 md:py-32">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center overflow-hidden">
              {user?.picture ? (
                <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white">{user?.name?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <div>
              <p className="text-purple-600 text-sm uppercase tracking-widest font-medium">Welcome back</p>
              <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
            </div>
          </div>
          <p className="text-gray-500">{user?.email}</p>
        </div>

        {/* Admin Panel Link */}
        {isAdmin && (
          <Link 
            to="/admin" 
            className="block mb-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl hover:border-purple-300 transition-colors"
            data-testid="admin-panel-link"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Admin Panel</h3>
                  <p className="text-gray-500 text-sm">Manage products, orders, and discounts</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-purple-600" />
            </div>
          </Link>
        )}

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4">
          {dashboardLinks.map((link, index) => (
            <Link
              key={index}
              to={link.href}
              className="p-6 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-lg transition-all group"
              data-testid={`dashboard-link-${link.title.toLowerCase().replace(' ', '-')}`}
            >
              <div className={`w-12 h-12 rounded-lg ${link.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {link.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{link.title}</h3>
              <p className="text-gray-500 text-sm">{link.description}</p>
            </Link>
          ))}
        </div>

        {/* Browse Products CTA */}
        <div className="mt-12 text-center">
          <Link to="/products">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white h-12 px-8 font-bold uppercase tracking-wider rounded-full">
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
