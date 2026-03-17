import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Loader2 } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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
        className={`w-3 h-3 ${i < Math.round(rating) ? 'text-[#FFD600] fill-[#FFD600]' : 'text-white/20'}`}
      />
    ));
  };

  return (
    <Link 
      to={`/products/${product.product_id}`}
      className="product-card group relative bg-[#0a0a0a] border border-white/5 overflow-hidden block"
      data-testid={`product-card-${product.product_id}`}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400'}
          alt={product.name}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 scale-100 group-hover:scale-105"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        
        {/* Platform Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded ${
            product.platform === 'Steam' ? 'bg-[#1b2838]' : 
            product.platform === 'Epic' ? 'bg-[#2a2a2a]' : 'bg-white/20'
          }`}>
            {product.platform}
          </span>
        </div>

        {/* Stock Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded ${
            product.stock > 0 ? 'bg-[#00FF94]/20 text-[#00FF94]' : 'bg-[#FF0055]/20 text-[#FF0055]'
          }`}>
            {product.stock > 0 ? `${product.stock} In Stock` : 'Sold Out'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleWishlist}
            className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-colors ${
              isWishlisted ? 'bg-[#FF0055] text-white' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            data-testid={`wishlist-btn-${product.product_id}`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleAddToCart}
            disabled={loading || product.stock <= 0}
            className="w-10 h-10 rounded-full bg-[#00F0FF] text-black flex items-center justify-center hover:bg-[#00F0FF]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid={`add-cart-btn-${product.product_id}`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <p className="text-xs text-white/50 uppercase tracking-wider">{product.game_title}</p>
        <h3 className="font-bold text-lg leading-tight line-clamp-2">{product.name}</h3>
        
        {/* Rating */}
        {product.review_count > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex">{renderStars(product.avg_rating)}</div>
            <span className="text-xs text-white/50">({product.review_count})</span>
          </div>
        )}
        
        {/* Price */}
        <div className="pt-2">
          <span className="text-xl font-bold text-[#00F0FF]">
            {formatPrice(product.price_inr, product.price_usd)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
