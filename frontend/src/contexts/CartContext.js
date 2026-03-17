import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [cart, setCart] = useState({ items: [], total_inr: 0, total_usd: 0 });
  const [loading, setLoading] = useState(false);

  const getHeaders = useCallback(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [], total_inr: 0, total_usd: 0 });
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get(`${API}/cart`, {
        withCredentials: true,
        headers: getHeaders()
      });
      setCart(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user, getHeaders]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      await axios.post(`${API}/cart/add`, { product_id: productId, quantity }, {
        withCredentials: true,
        headers: getHeaders()
      });
      await fetchCart();
      return true;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.post(`${API}/cart/remove`, { product_id: productId }, {
        withCredentials: true,
        headers: getHeaders()
      });
      await fetchCart();
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await axios.post(`${API}/cart/update`, { product_id: productId, quantity }, {
        withCredentials: true,
        headers: getHeaders()
      });
      await fetchCart();
    } catch (error) {
      console.error('Failed to update cart:', error);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${API}/cart/clear`, {
        withCredentials: true,
        headers: getHeaders()
      });
      setCart({ items: [], total_inr: 0, total_usd: 0 });
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    fetchCart,
    itemCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
