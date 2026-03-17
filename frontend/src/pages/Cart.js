import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Button } from '../components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export const Cart = () => {
  const { cart, removeFromCart, updateQuantity, loading } = useCart();
  const { currency, formatPrice } = useCurrency();

  const total = currency === 'INR' ? cart.total_inr : cart.total_usd;

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-24 bg-gray-50">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some games to get started</p>
        <Link to="/products">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full px-8" data-testid="continue-shopping">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 md:py-32 bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="mb-12">
          <p className="text-purple-600 text-sm uppercase tracking-widest font-medium mb-4">Your Cart</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">SHOPPING CART</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div 
                key={item.product_id} 
                className="flex gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm"
                data-testid={`cart-item-${item.product_id}`}
              >
                <div className="w-24 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  <img
                    src={item.product?.image_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200'}
                    alt={item.product?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                      {item.product?.platform}
                    </p>
                    <h3 className="font-bold text-lg text-gray-900">{item.product?.name}</h3>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        data-testid={`decrease-qty-${item.product_id}`}
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-8 text-center font-bold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        data-testid={`increase-qty-${item.product_id}`}
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    
                    <span className="text-lg font-bold text-purple-600">
                      {formatPrice(
                        item.product?.price_inr * item.quantity,
                        item.product?.price_usd * item.quantity
                      )}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => removeFromCart(item.product_id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors self-start"
                  data-testid={`remove-item-${item.product_id}`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span>{formatPrice(cart.total_inr, cart.total_usd)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-purple-600">{formatPrice(cart.total_inr, cart.total_usd)}</span>
                  </div>
                </div>
              </div>

              <Link to="/checkout">
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white h-14 font-bold uppercase tracking-wider rounded-full"
                  data-testid="proceed-to-checkout"
                >
                  <span className="flex items-center justify-center gap-2">
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </span>
                </Button>
              </Link>

              <Link to="/products">
                <Button 
                  variant="ghost" 
                  className="w-full mt-4 text-gray-600 hover:text-gray-900"
                >
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
