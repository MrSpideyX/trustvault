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
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-700';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-24 md:py-32">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8">
        <div className="mb-12">
          <p className="text-purple-600 text-sm uppercase tracking-widest font-medium mb-4">Account</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">MY ORDERS</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-xl border border-gray-200">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
            <Link to="/products">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full px-6">
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
                className="block p-6 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-lg transition-all"
                data-testid={`order-${order.order_id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Order #{order.order_id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">
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
                      <div key={idx} className="w-10 h-10 rounded bg-gray-100 border-2 border-white" />
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-10 h-10 rounded bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-600">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-gray-500 text-sm">{order.items.length} item(s)</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Total</span>
                  <span className="text-xl font-bold text-purple-600">
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
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
        <Link to="/orders">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-24 md:py-32">
      <div className="max-w-[800px] mx-auto px-4 md:px-8">
        <Link to="/orders" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>

        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-purple-600 text-sm uppercase tracking-widest font-medium mb-2">Order Details</p>
              <h1 className="text-3xl font-bold text-gray-900">#{order.order_id.slice(-8).toUpperCase()}</h1>
              <p className="text-gray-500 mt-2">
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
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-medium">
                Your order has been completed! You will receive your game account credentials via email within 24 hours.
              </p>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Items</h3>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-bold text-gray-900">{item.name}</p>
                    <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-gray-900">
                    {order.currency === 'INR' ? `₹${(item.price * item.quantity).toLocaleString('en-IN')}` : `$${(item.price * item.quantity).toFixed(2)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-gray-200">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{order.currency === 'INR' ? `₹${order.subtotal.toLocaleString('en-IN')}` : `$${order.subtotal.toFixed(2)}`}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({order.discount_code})</span>
                <span>-{order.currency === 'INR' ? `₹${order.discount_amount.toLocaleString('en-IN')}` : `$${order.discount_amount.toFixed(2)}`}</span>
              </div>
            )}
            <div className="flex justify-between text-2xl font-bold pt-3 border-t border-gray-200">
              <span className="text-gray-900">Total</span>
              <span className="text-purple-600">
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
