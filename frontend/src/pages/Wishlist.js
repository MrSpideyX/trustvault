import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Heart, Loader2 } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const Wishlist = () => {
  const { token } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const getHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`${API}/wishlist`, {
        withCredentials: true,
        headers: getHeaders()
      });
      setWishlistItems(response.data.items);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="mb-12">
          <p className="text-purple-600 text-sm uppercase tracking-widest font-medium mb-4">Account</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">MY WISHLIST</h1>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-xl border border-gray-200">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save items you love for later</p>
            <Link to="/products">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full px-6">
                <span>Browse Products</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {wishlistItems.map((product) => (
              <ProductCard 
                key={product.product_id} 
                product={product} 
                onWishlistChange={fetchWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
