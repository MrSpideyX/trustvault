import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Loader2, Tag, Check, X, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useRazorpay } from 'react-razorpay';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const RAZORPAY_KEY = 'rzp_test_SSDd4w7buBhmEM';

export const Checkout = () => {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCart();
  const { currency, formatPrice, getPrice } = useCurrency();
  const { user, token } = useAuth();
  const { Razorpay } = useRazorpay();
  
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(null);
  const [validatingDiscount, setValidatingDiscount] = useState(false);
  const [processing, setProcessing] = useState(false);

  const subtotal = getPrice(cart.total_inr, cart.total_usd);
  const discountAmount = discountApplied ? subtotal * (discountApplied.discount_percent / 100) : 0;
  const total = subtotal - discountAmount;

  const getHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleValidateDiscount = async () => {
    if (!discountCode.trim()) return;
    
    try {
      setValidatingDiscount(true);
      const response = await axios.post(`${API}/discounts/validate`, 
        { code: discountCode },
        { withCredentials: true, headers: getHeaders() }
      );
      setDiscountApplied({ code: discountCode.toUpperCase(), ...response.data });
      toast.success(`Discount applied: ${response.data.discount_percent}% off!`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid discount code');
      setDiscountApplied(null);
    } finally {
      setValidatingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscountApplied(null);
    setDiscountCode('');
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to checkout');
      return;
    }

    try {
      setProcessing(true);
      
      // Create order
      const orderResponse = await axios.post(`${API}/orders/create`, {
        currency,
        discount_code: discountApplied?.code || null
      }, {
        withCredentials: true,
        headers: getHeaders()
      });

      const { razorpay_order_id, amount, order_id } = orderResponse.data;

      // Open Razorpay
      const options = {
        key: RAZORPAY_KEY,
        amount: amount,
        currency: currency,
        order_id: razorpay_order_id,
        name: 'Trust Vault',
        description: 'Game Account Purchase',
        handler: async (response) => {
          try {
            // Verify payment
            await axios.post(`${API}/orders/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }, {
              withCredentials: true,
              headers: getHeaders()
            });

            toast.success('Payment successful!');
            await fetchCart();
            navigate(`/orders/${order_id}`);
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: {
          color: '#00F0FF'
        }
      };

      const razorpay = new Razorpay(options);
      razorpay.on('payment.failed', (response) => {
        toast.error('Payment failed. Please try again.');
      });
      razorpay.open();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  if (cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen py-24 md:py-32">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8">
        <div className="mb-12">
          <p className="text-[#00F0FF] text-sm uppercase tracking-widest font-medium mb-4">Checkout</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">COMPLETE YOUR ORDER</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Items */}
          <div>
            <h2 className="text-xl font-bold mb-6">Order Items</h2>
            <div className="space-y-4 mb-8">
              {cart.items.map((item) => (
                <div key={item.product_id} className="flex gap-4 p-4 bg-[#0a0a0a] border border-white/5 rounded-lg">
                  <div className="w-16 h-20 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={item.product?.image_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100'}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-white/50 uppercase">{item.product?.platform}</p>
                    <h3 className="font-bold">{item.product?.name}</h3>
                    <p className="text-white/50 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#00F0FF]">
                      {formatPrice(
                        item.product?.price_inr * item.quantity,
                        item.product?.price_usd * item.quantity
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Discount Code */}
            <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-lg">
              <Label className="text-sm text-white/70 mb-2 block">Discount Code</Label>
              {discountApplied ? (
                <div className="flex items-center justify-between p-3 bg-[#00FF94]/10 border border-[#00FF94]/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00FF94]" />
                    <span className="font-bold text-[#00FF94]">{discountApplied.code}</span>
                    <span className="text-white/50">({discountApplied.discount_percent}% off)</span>
                  </div>
                  <button onClick={handleRemoveDiscount} className="text-white/50 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="Enter code"
                      className="pl-10 bg-black/50 border-white/10 h-12"
                      data-testid="discount-input"
                    />
                  </div>
                  <Button
                    onClick={handleValidateDiscount}
                    disabled={validatingDiscount || !discountCode.trim()}
                    className="h-12 px-6 bg-white/10 hover:bg-white/20"
                    data-testid="apply-discount-btn"
                  >
                    {validatingDiscount ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="sticky top-28 bg-[#0a0a0a] border border-white/5 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">Payment Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.total_inr, cart.total_usd)}</span>
                </div>
                {discountApplied && (
                  <div className="flex justify-between text-[#00FF94]">
                    <span>Discount ({discountApplied.discount_percent}%)</span>
                    <span>-{currency === 'INR' ? `₹${discountAmount.toLocaleString('en-IN')}` : `$${discountAmount.toFixed(2)}`}</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between text-2xl font-bold">
                    <span>Total</span>
                    <span className="text-[#00F0FF]">
                      {currency === 'INR' ? `₹${total.toLocaleString('en-IN')}` : `$${total.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={processing}
                className="w-full btn-skew bg-[#00F0FF] text-black h-14 font-bold uppercase tracking-wider"
                data-testid="pay-now-btn"
              >
                <span className="flex items-center justify-center gap-2">
                  {processing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Pay with Razorpay
                    </>
                  )}
                </span>
              </Button>

              <div className="mt-6 flex items-center justify-center gap-2 text-white/50 text-sm">
                <Shield className="w-4 h-4" />
                <span>Secure payment powered by Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
