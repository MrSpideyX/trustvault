import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Loader2 } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Platform logos mapping
const platformLogos = {
  'Steam': 'https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg',
  'Epic': 'https://upload.wikimedia.org/wikipedia/commons/3/31/Epic_Games_logo.svg',
  'PlayStation': 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Playstation_logo_colour.svg',
  'Xbox': 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg',
  'Nintendo': 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg',
  'Origin': 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Origin.svg',
  'Ubisoft': 'https://upload.wikimedia.org/wikipedia/commons/7/78/Ubisoft_logo.svg',
  'Battle.net': 'https://upload.wikimedia.org/wikipedia/commons/2/23/Blizzard_Entertainment_Logo_2015.svg'
};

export const ProductCard = ({ product, onWishlistChange }) => {
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const { user, token } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    try {
      setLoading(true);
      await addToCart(product.product_id);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      if (isWishlisted) {
        await axios.delete(`${API}/wishlist/remove/${product.product_id}`, {
          withCredentials: true,
          headers
        });
        toast.success('Removed from wishlist');
      } else {
        await axios.post(`${API}/wishlist/add/${product.product_id}`, {}, {
          withCredentials: true,
          headers
        });
        toast.success('Added to wishlist!');
      }
      setIsWishlisted(!isWishlisted);
      onWishlistChange?.();
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <Link 
      to={`/products/${product.product_id}`}
      className="product-card group relative bg-white border border-gray-200 rounded-xl overflow-hidden block hover:shadow-xl transition-all duration-300"
      data-testid={`product-card-${product.product_id}`}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
        />
        
        {/* Platform Logo */}
        <div className="absolute top-3 left-3">
          <div className="w-10 h-10 rounded-lg bg-white/95 backdrop-blur-sm shadow-lg flex items-center justify-center p-2">
            {platformLogos[product.platform] ? (
              <img 
                src={platformLogos[product.platform]} 
                alt={product.platform}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : null}
            <span 
              className="text-xs font-bold text-gray-800 hidden"
              style={{ display: platformLogos[product.platform] ? 'none' : 'block' }}
            >
              {product.platform?.substring(0, 2).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
            product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
          }`}>
            {product.stock > 0 ? `${product.stock} In Stock` : 'Sold Out'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleWishlist}
            className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-colors shadow-lg ${
              isWishlisted ? 'bg-red-500 text-white' : 'bg-white/90 hover:bg-white text-gray-700'
            }`}
            data-testid={`wishlist-btn-${product.product_id}`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleAddToCart}
            disabled={loading || product.stock <= 0}
            className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid={`add-cart-btn-${product.product_id}`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-1.5">
        <p className="text-xs text-gray-500 uppercase tracking-wider">{product.game_title}</p>
        <h3 className="font-bold text-sm leading-tight line-clamp-2 text-gray-900">{product.name}</h3>
        
        {/* Rating */}
        {product.review_count > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex">{renderStars(product.avg_rating)}</div>
            <span className="text-xs text-gray-500">({product.review_count})</span>
          </div>
        )}
        
        {/* Price */}
        <div className="pt-1">
          <span className="text-lg font-bold text-purple-600">
            {formatPrice(product.price_inr, product.price_usd)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
