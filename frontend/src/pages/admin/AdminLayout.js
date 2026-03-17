import React, { useEffect, useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, Tag, LogOut, 
  ChevronRight, Menu, X, BarChart3 
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AdminLayout = ({ children }) => {
  const { user, logout, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API}/admin/stats`, {
          withCredentials: true,
          headers: getHeaders()
        });
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, [token]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', href: '/admin' },
    { icon: <Package className="w-5 h-5" />, label: 'Products', href: '/admin/products' },
    { icon: <ShoppingCart className="w-5 h-5" />, label: 'Orders', href: '/admin/orders' },
    { icon: <Tag className="w-5 h-5" />, label: 'Discounts', href: '/admin/discounts' },
    { icon: <Users className="w-5 h-5" />, label: 'Users', href: '/admin/users' },
  ];

  const isActive = (href) => {
    if (href === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a0a0a] border-b border-white/5 z-50 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="https://customer-assets.emergentagent.com/job_gaming-hub-471/artifacts/xqaigfjd_trustvault%20logo.png" 
            alt="Trust Vault" 
            className="h-8 w-auto object-contain"
          />
          <span className="font-bold">Admin</span>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0a0a0a] border-r border-white/5 z-40 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/5 hidden lg:block">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_gaming-hub-471/artifacts/xqaigfjd_trustvault%20logo.png" 
              alt="Trust Vault" 
              className="h-12 w-auto object-contain"
            />
            <div>
              <span className="font-bold block bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">TRUST VAULT</span>
              <span className="text-xs text-white/50">Admin Panel</span>
            </div>
          </Link>
        </div>

        <nav className="p-4 mt-16 lg:mt-0">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                isActive(item.href)
                  ? 'bg-[#00F0FF]/10 text-[#00F0FF] border-l-2 border-[#00F0FF]'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
              data-testid={`admin-nav-${item.label.toLowerCase()}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#7000FF] flex items-center justify-center">
              <span className="text-sm font-bold">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-white/50 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-white/70 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const getHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API}/admin/stats`, {
          withCredentials: true,
          headers: getHeaders()
        });
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  const statCards = stats ? [
    { label: 'Total Products', value: stats.total_products, icon: <Package className="w-6 h-6" />, color: 'text-[#00F0FF]' },
    { label: 'Total Orders', value: stats.total_orders, icon: <ShoppingCart className="w-6 h-6" />, color: 'text-[#7000FF]' },
    { label: 'Completed Orders', value: stats.completed_orders, icon: <BarChart3 className="w-6 h-6" />, color: 'text-[#00FF94]' },
    { label: 'Total Users', value: stats.total_users, icon: <Users className="w-6 h-6" />, color: 'text-[#FFD600]' },
  ] : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-white/50">Overview of your store performance</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 bg-[#121212] border border-white/5 rounded-lg">
              <div className="skeleton h-12 w-12 rounded-lg mb-4" />
              <div className="skeleton h-8 w-20 mb-2" />
              <div className="skeleton h-4 w-24" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, index) => (
              <div key={index} className="p-6 bg-[#121212] border border-white/5 rounded-lg">
                <div className={`w-12 h-12 rounded-lg bg-white/5 ${stat.color} flex items-center justify-center mb-4`}>
                  {stat.icon}
                </div>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-white/50 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Revenue Section */}
          {stats && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-6 bg-[#121212] border border-white/5 rounded-lg">
                <h3 className="text-lg font-bold mb-4">Revenue (INR)</h3>
                <p className="text-4xl font-bold text-[#00F0FF]">
                  ₹{stats.total_revenue_inr.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-6 bg-[#121212] border border-white/5 rounded-lg">
                <h3 className="text-lg font-bold mb-4">Revenue (USD)</h3>
                <p className="text-4xl font-bold text-[#00F0FF]">
                  ${stats.total_revenue_usd.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Quick Links */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <Link to="/admin/products" className="p-4 bg-[#121212] border border-white/5 rounded-lg hover:border-white/10 transition-colors flex items-center justify-between">
          <span className="font-medium">Manage Products</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
        <Link to="/admin/orders" className="p-4 bg-[#121212] border border-white/5 rounded-lg hover:border-white/10 transition-colors flex items-center justify-between">
          <span className="font-medium">View Orders</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
        <Link to="/admin/discounts" className="p-4 bg-[#121212] border border-white/5 rounded-lg hover:border-white/10 transition-colors flex items-center justify-between">
          <span className="font-medium">Manage Discounts</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default AdminLayout;
