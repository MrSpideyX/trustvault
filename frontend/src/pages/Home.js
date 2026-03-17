import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gamepad2, Shield, Zap, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import ProductCard from '../components/ProductCard';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await axios.get(`${API}/products?featured=true`);
        setFeaturedProducts(response.data.slice(0, 6));
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
      {/* Hero Section */}
      <section className="hero-bg min-h-[90vh] flex items-center relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-24 md:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-4">
                <p className="text-[#00F0FF] text-sm uppercase tracking-widest font-medium">
                  Premium Digital Gaming
                </p>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.9]">
                  LEVEL UP<br />
                  <span className="text-[#7000FF]">YOUR GAME</span>
                </h1>
              </div>
              <p className="text-lg md:text-xl text-white/70 max-w-lg leading-relaxed">
                Access premium game accounts for Steam, Epic Games, and more. 
                Instant delivery, secure payments, and 24/7 support.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products">
                  <Button 
                    className="btn-skew bg-[#00F0FF] text-black h-14 px-8 font-bold uppercase tracking-wider"
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
                    className="h-14 px-8 border-white/20 text-white hover:bg-white/10 uppercase tracking-wider"
                    data-testid="hero-signup-button"
                  >
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative hidden lg:block animate-fade-in-up stagger-2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#00F0FF]/20 to-[#7000FF]/20 blur-3xl" />
                <img
                  src="https://images.unsplash.com/photo-1613974089244-916ec6dda17c?w=800"
                  alt="Gaming Setup"
                  className="relative rounded-lg border border-white/10"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-[#00F0FF]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-[#7000FF]/5 rounded-full blur-[100px] pointer-events-none" />
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 bg-[#0a0a0a]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <p className="text-[#00F0FF] text-sm uppercase tracking-widest font-medium mb-4">Why Choose Us</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              THE TRUST VAULT<br />ADVANTAGE
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-8 bg-[#121212] border border-white/5 rounded-xl hover:bg-white/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[#00F0FF] text-sm uppercase tracking-widest font-medium mb-4">Featured</p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">TOP PICKS</h2>
            </div>
            <Link to="/products">
              <Button variant="ghost" className="text-white/70 hover:text-white uppercase tracking-wider" data-testid="view-all-products">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="product-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-[#0a0a0a] border border-white/5 rounded-lg overflow-hidden">
                  <div className="aspect-[3/4] skeleton" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 skeleton w-1/2" />
                    <div className="h-6 skeleton w-3/4" />
                    <div className="h-8 skeleton w-1/3" />
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
            <div className="text-center py-16 text-white/50">
              <Gamepad2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-xl">No featured products yet</p>
              <Link to="/products" className="text-[#00F0FF] hover:underline mt-2 inline-block">
                Browse all products
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 bg-gradient-to-r from-[#00F0FF]/10 to-[#7000FF]/10 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            READY TO START<br />YOUR JOURNEY?
          </h2>
          <p className="text-lg text-white/70 max-w-xl mx-auto mb-8">
            Join thousands of gamers who trust Trust Vault for their digital game accounts.
          </p>
          <Link to="/register">
            <Button 
              className="btn-skew bg-[#00F0FF] text-black h-14 px-10 font-bold uppercase tracking-wider"
              data-testid="cta-signup-button"
            >
              <span>Get Started Now</span>
            </Button>
          </Link>
        </div>
        
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </section>
    </div>
  );
};

export default Home;
