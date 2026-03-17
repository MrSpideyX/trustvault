import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gamepad2, Shield, Zap, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import ProductCard from '../components/ProductCard';
import { SalesNotification, TrustBadges, FloatingContactButton } from '../components/Widgets';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await axios.get(`${API}/products?featured=true`);
        setFeaturedProducts(response.data.slice(0, 8));
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure Transactions',
      description: 'All payments are processed securely via Razorpay with full buyer protection.'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Instant Delivery',
      description: 'Receive your game account credentials within 24 hours of purchase.'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: '24/7 Support',
      description: 'Our team is available around the clock to assist with any issues.'
    },
    {
      icon: <Gamepad2 className="w-6 h-6" />,
      title: 'Premium Accounts',
      description: 'All accounts are verified and come with full access to game content.'
    }
  ];

  return (
    <div>
      {/* Live Sales Notification */}
      <SalesNotification />
      
      {/* Floating Contact Button */}
      <FloatingContactButton />

      {/* Hero Section */}
      <section className="hero-bg min-h-[90vh] flex items-center relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-24 md:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-4">
                <p className="text-purple-600 text-sm uppercase tracking-widest font-medium">
                  Premium Digital Gaming
                </p>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.9] text-gray-900">
                  LEVEL UP<br />
                  <span className="bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent">YOUR GAME</span>
                </h1>
              </div>
              <p className="text-lg md:text-xl text-gray-600 max-w-lg leading-relaxed">
                Access premium game accounts for Steam, Epic Games, and more. 
                Instant delivery, secure payments, and 24/7 support.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products">
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700 text-white h-14 px-8 font-bold uppercase tracking-wider rounded-full"
                    data-testid="hero-cta-button"
                  >
                    <span className="flex items-center gap-2">
                      Browse Store <ArrowRight className="w-4 h-4" />
                    </span>
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    variant="outline" 
                    className="h-14 px-8 border-gray-300 text-gray-700 hover:bg-gray-100 uppercase tracking-wider rounded-full"
                    data-testid="hero-signup-button"
                  >
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Hero Image - Leon Resident Evil */}
            <div className="relative hidden lg:block animate-fade-in-up">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-teal-500/20 blur-3xl rounded-3xl" />
                <img
                  src="https://customer-assets.emergentagent.com/job_gaming-hub-471/artifacts/h35mi6vl_leon%20wallpaper.jpg"
                  alt="Resident Evil - Leon"
                  className="relative rounded-2xl border border-gray-200 shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />
      </section>

      {/* Trust Badges Section */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <TrustBadges />
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-purple-600 text-sm uppercase tracking-widest font-medium mb-3">Featured</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">TOP PICKS</h2>
            </div>
            <Link to="/products">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 uppercase tracking-wider" data-testid="view-all-products">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="product-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="aspect-[3/4] skeleton" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 skeleton w-1/2" />
                    <div className="h-4 skeleton w-3/4" />
                    <div className="h-5 skeleton w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <Gamepad2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-xl">No featured products yet</p>
              <Link to="/products" className="text-purple-600 hover:underline mt-2 inline-block">
                Browse all products
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section - Why Choose Us */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center mb-14">
            <p className="text-purple-600 text-sm uppercase tracking-widest font-medium mb-3">Why Choose Us</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              THE TRUST VAULT<br />ADVANTAGE
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 bg-gray-50 border border-gray-100 rounded-xl hover:bg-white hover:shadow-lg hover:border-purple-200 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Ready to Start */}
      <section className="py-20 md:py-28 bg-gradient-to-r from-purple-600 to-purple-800 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5 text-white">
            READY TO START<br />YOUR JOURNEY?
          </h2>
          <p className="text-base text-purple-100 max-w-lg mx-auto mb-7">
            Join thousands of gamers who trust Trust Vault for their digital game accounts.
          </p>
          <Link to="/register">
            <Button 
              className="bg-white text-purple-700 hover:bg-gray-100 h-12 px-8 font-bold uppercase tracking-wider rounded-full"
              data-testid="cta-signup-button"
            >
              <span>Get Started Now</span>
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
