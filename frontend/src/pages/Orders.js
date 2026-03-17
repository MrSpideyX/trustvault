import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Button } from '../components/ui/button';
import { Package, Check, Clock, ArrowLeft, Loader2 } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const Orders = () => {
  const { user, token } = useAuth();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const getHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API}/orders`, {
          withCredentials: true,
          headers: getHeaders()
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-[#00FF94]/20 text-[#00FF94]';
      case 'pending': return 'bg-[#FFD600]/20 text-[#FFD600]';
      case 'cancelled': return 'bg-[#FF0055]/20 text-[#FF0055]';
      default: return 'bg-white/20 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <Check className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00F0FF]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 md:py-32">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8">
        <div className="mb-12">
          <p className="text-[#00F0FF] text-sm uppercase tracking-widest font-medium mb-4">Account</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">MY ORDERS</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-white/20" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
            <p className="text-white/50 mb-6">Start shopping to see your orders here</p>
            <Link to="/products">
              <Button className="btn-skew bg-[#00F0FF] text-black font-bold">
                <span>Browse Products</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link 
                key={order.order_id} 
                to={`/orders/${order.order_id}`}
                className="block p-6 bg-[#0a0a0a] border border-white/5 rounded-lg hover:border-white/10 transition-colors"
                data-testid={`order-${order.order_id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-white/50 mb-1">Order #{order.order_id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-white/30">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="w-10 h-10 rounded bg-white/10 border-2 border-[#0a0a0a]" />
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-10 h-10 rounded bg-white/10 border-2 border-[#0a0a0a] flex items-center justify-center text-xs font-bold">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-white/50 text-sm">{order.items.length} item(s)</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Total</span>
                  <span className="text-xl font-bold text-[#00F0FF]">
                    {order.currency === 'INR' ? `₹${order.total.toLocaleString('en-IN')}` : `$${order.total.toFixed(2)}`}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const OrderDetail = () => {
  const { orderId } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const getHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`${API}/orders/${orderId}`, {
          withCredentials: true,
          headers: getHeaders()
        });
        setOrder(response.data);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, token]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-[#00FF94]/20 text-[#00FF94]';
      case 'pending': return 'bg-[#FFD600]/20 text-[#FFD600]';
      case 'cancelled': return 'bg-[#FF0055]/20 text-[#FF0055]';
      default: return 'bg-white/20 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00F0FF]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Order not found</h2>
        <Link to="/orders">
          <Button className="bg-[#00F0FF] text-black">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 md:py-32">
      <div className="max-w-[800px] mx-auto px-4 md:px-8">
        <Link to="/orders" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>

        <div className="bg-[#0a0a0a] border border-white/5 rounded-lg p-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-[#00F0FF] text-sm uppercase tracking-widest font-medium mb-2">Order Details</p>
              <h1 className="text-3xl font-bold">#{order.order_id.slice(-8).toUpperCase()}</h1>
              <p className="text-white/50 mt-2">
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
              {order.status === 'completed' ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          {order.status === 'completed' && (
            <div className="mb-8 p-4 bg-[#00FF94]/10 border border-[#00FF94]/30 rounded-lg">
              <p className="text-[#00FF94] font-medium">
                Your order has been completed! You will receive your game account credentials via email within 24 hours.
              </p>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4">Items</h3>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between p-4 bg-black/30 rounded-lg">
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="text-white/50 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold">
                    {order.currency === 'INR' ? `₹${(item.price * item.quantity).toLocaleString('en-IN')}` : `$${(item.price * item.quantity).toFixed(2)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-white/10">
            <div className="flex justify-between text-white/70">
              <span>Subtotal</span>
              <span>{order.currency === 'INR' ? `₹${order.subtotal.toLocaleString('en-IN')}` : `$${order.subtotal.toFixed(2)}`}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-[#00FF94]">
                <span>Discount ({order.discount_code})</span>
                <span>-{order.currency === 'INR' ? `₹${order.discount_amount.toLocaleString('en-IN')}` : `$${order.discount_amount.toFixed(2)}`}</span>
              </div>
            )}
            <div className="flex justify-between text-2xl font-bold pt-3 border-t border-white/10">
              <span>Total</span>
              <span className="text-[#00F0FF]">
                {order.currency === 'INR' ? `₹${order.total.toLocaleString('en-IN')}` : `$${order.total.toFixed(2)}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
