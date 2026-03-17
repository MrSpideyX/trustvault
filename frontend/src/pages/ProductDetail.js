import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Star, Loader2, Package, Shield, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const ProductDetail = () => {
  const { productId } = useParams();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const { user, token } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const [productRes, reviewsRes] = await Promise.all([
          axios.get(`${API}/products/${productId}`),
          axios.get(`${API}/reviews/${productId}`)
        ]);
        setProduct(productRes.data);
        setReviews(reviewsRes.data);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    
    try {
      setAddingToCart(true);
      await addToCart(product.product_id);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
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
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }
    
    try {
      setSubmittingReview(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${API}/reviews`, {
        product_id: productId,
        rating: reviewRating,
        comment: reviewText
      }, {
        withCredentials: true,
        headers
      });
      
      toast.success('Review submitted!');
      setReviewText('');
      setReviewRating(5);
      
      // Refresh reviews
      const reviewsRes = await axios.get(`${API}/reviews/${productId}`);
      setReviews(reviewsRes.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating, interactive = false, onClick = null) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 cursor-pointer transition-colors ${
          i < rating ? 'text-[#FFD600] fill-[#FFD600]' : 'text-white/20 hover:text-[#FFD600]/50'
        }`}
        onClick={interactive ? () => onClick(i + 1) : undefined}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00F0FF]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Link to="/products">
          <Button className="bg-[#00F0FF] text-black">Back to Store</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        {/* Back Button */}
        <Link to="/products" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors" data-testid="back-to-products">
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative">
            <div className="sticky top-28">
              <div className="relative aspect-[4/5] rounded-lg overflow-hidden border border-white/10">
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded ${
                    product.platform === 'Steam' ? 'bg-[#1b2838]' : 
                    product.platform === 'Epic' ? 'bg-[#2a2a2a]' : 'bg-white/20'
                  }`}>
                    {product.platform}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            <div>
              <p className="text-[#00F0FF] text-sm uppercase tracking-widest font-medium mb-2">
                {product.game_title}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" data-testid="product-title">
                {product.name}
              </h1>
              
              {/* Rating */}
              {product.review_count > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex">{renderStars(Math.round(product.avg_rating))}</div>
                  <span className="text-white/50">
                    {product.avg_rating.toFixed(1)} ({product.review_count} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="text-4xl font-bold text-[#00F0FF]" data-testid="product-price">
                {formatPrice(product.price_inr, product.price_usd)}
              </div>
            </div>

            {/* Stock Status */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
              product.stock > 0 ? 'bg-[#00FF94]/20 text-[#00FF94]' : 'bg-[#FF0055]/20 text-[#FF0055]'
            }`}>
              <Package className="w-4 h-4" />
              {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-bold mb-3">Description</h3>
              <p className="text-white/70 leading-relaxed">{product.description}</p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-[#0a0a0a] rounded-lg border border-white/5">
                <Shield className="w-5 h-5 text-[#00F0FF]" />
                <span className="text-sm">Secure Purchase</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-[#0a0a0a] rounded-lg border border-white/5">
                <Clock className="w-5 h-5 text-[#00F0FF]" />
                <span className="text-sm">24h Delivery</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock <= 0}
                className="flex-1 btn-skew bg-[#00F0FF] text-black h-14 font-bold uppercase tracking-wider disabled:opacity-50"
                data-testid="add-to-cart-btn"
              >
                <span className="flex items-center justify-center gap-2">
                  {addingToCart ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </>
                  )}
                </span>
              </Button>
              <Button
                onClick={handleWishlist}
                variant="outline"
                className={`h-14 px-6 border-white/20 ${isWishlisted ? 'bg-[#FF0055]/20 text-[#FF0055] border-[#FF0055]' : ''}`}
                data-testid="wishlist-btn"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-24 border-t border-white/10 pt-12">
          <h2 className="text-3xl font-bold mb-8">Customer Reviews</h2>
          
          {/* Review Form */}
          {user && (
            <form onSubmit={handleSubmitReview} className="mb-12 p-6 bg-[#0a0a0a] rounded-lg border border-white/5">
              <h3 className="text-lg font-bold mb-4">Write a Review</h3>
              <div className="mb-4">
                <label className="block text-sm text-white/70 mb-2">Rating</label>
                <div className="flex gap-1">
                  {renderStars(reviewRating, true, setReviewRating)}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm text-white/70 mb-2">Your Review</label>
                <Textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience..."
                  className="bg-black/50 border-white/10 min-h-[100px]"
                  data-testid="review-textarea"
                />
              </div>
              <Button
                type="submit"
                disabled={submittingReview || !reviewText.trim()}
                className="bg-[#00F0FF] text-black font-bold"
                data-testid="submit-review-btn"
              >
                {submittingReview ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Submit Review
              </Button>
            </form>
          )}

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.review_id} className="p-6 bg-[#0a0a0a] rounded-lg border border-white/5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-bold">{review.user_name}</p>
                      <div className="flex gap-1 mt-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <span className="text-sm text-white/50">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-white/70">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/50">
              <Star className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
