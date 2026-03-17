import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Package, Check, Clock, X, Loader2, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AdminOrders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const getHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchOrders = async () => {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const response = await axios.get(`${API}/admin/orders${params}`, {
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

  useEffect(() => {
    fetchOrders();
  }, [filter, token]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId);
      await axios.put(`${API}/admin/orders/${orderId}/status`, 
        { status: newStatus },
        { withCredentials: true, headers: getHeaders() }
      );
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

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
      case 'cancelled': return <X className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Orders</h1>
          <p className="text-white/50">Manage customer orders</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px] bg-[#0a0a0a] border-white/10" data-testid="order-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-[#0a0a0a] border-white/10">
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 bg-[#121212] border border-white/5 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="skeleton h-5 w-32" />
                  <div className="skeleton h-4 w-48" />
                </div>
                <div className="skeleton h-8 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.order_id} className="p-4 bg-[#121212] border border-white/5 rounded-lg" data-testid={`order-row-${order.order_id}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold">#{order.order_id.slice(-8).toUpperCase()}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-white/50 text-sm mb-1">{order.user_email}</p>
                  <p className="text-white/30 text-xs">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-sm text-white/50">{order.items.length} item(s)</span>
                    <span className="text-lg font-bold text-[#00F0FF]">
                      {order.currency === 'INR' ? `₹${order.total.toLocaleString('en-IN')}` : `$${order.total.toFixed(2)}`}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                    className="border-white/10"
                    data-testid={`view-order-${order.order_id}`}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  
                  <Select 
                    value={order.status} 
                    onValueChange={(value) => handleUpdateStatus(order.order_id, value)}
                    disabled={updatingStatus === order.order_id}
                  >
                    <SelectTrigger className="w-[130px] bg-black/50 border-white/10" data-testid={`status-select-${order.order_id}`}>
                      {updatingStatus === order.order_id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <SelectValue />
                      )}
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-white/10">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-white/50">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No orders found</p>
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.order_id.slice(-8).toUpperCase()}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-white/50">Customer</span>
                <span>{selectedOrder.user_email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Date</span>
                <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Status</span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </span>
              </div>
              
              <div className="border-t border-white/10 pt-4">
                <h4 className="font-bold mb-3">Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between p-3 bg-black/30 rounded">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-white/50">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold">
                        {selectedOrder.currency === 'INR' ? `₹${(item.price * item.quantity).toLocaleString()}` : `$${(item.price * item.quantity).toFixed(2)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-white/50">
                  <span>Subtotal</span>
                  <span>{selectedOrder.currency === 'INR' ? `₹${selectedOrder.subtotal.toLocaleString()}` : `$${selectedOrder.subtotal.toFixed(2)}`}</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-[#00FF94]">
                    <span>Discount ({selectedOrder.discount_code})</span>
                    <span>-{selectedOrder.currency === 'INR' ? `₹${selectedOrder.discount_amount.toLocaleString()}` : `$${selectedOrder.discount_amount.toFixed(2)}`}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-[#00F0FF]">
                    {selectedOrder.currency === 'INR' ? `₹${selectedOrder.total.toLocaleString()}` : `$${selectedOrder.total.toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
