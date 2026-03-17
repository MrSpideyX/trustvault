import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Shield, Users, Clock, Star } from 'lucide-react';

// Live Sales Notification Popup
export const SalesNotification = () => {
  const [visible, setVisible] = useState(false);
  const [sale, setSale] = useState(null);

  const names = ['Rahul', 'John', 'Priya', 'Mike', 'Ankit', 'Sarah', 'Raj', 'Emma', 'Vikram', 'Alex'];
  const cities = ['Mumbai', 'Delhi', 'New York', 'London', 'Bangalore', 'Chicago', 'Pune', 'Toronto'];
  const products = ['God of War Ragnarok', 'Resident Evil 4', 'Elden Ring', 'Cyberpunk 2077', 'GTA V Premium', 'Red Dead Redemption 2'];

  useEffect(() => {
    const showNotification = () => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      
      setSale({ name: randomName, city: randomCity, product: randomProduct });
      setVisible(true);

      setTimeout(() => setVisible(false), 4000);
    };

    // Show first notification after 5 seconds
    const initialTimeout = setTimeout(showNotification, 5000);
    
    // Then show every 15-25 seconds
    const interval = setInterval(() => {
      showNotification();
    }, Math.random() * 10000 + 15000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  if (!visible || !sale) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-slide-in">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4 shadow-xl max-w-xs">
        <button 
          onClick={() => setVisible(false)}
          className="absolute top-2 right-2 text-white/30 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00FF94]/20 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5 text-[#00FF94]" />
          </div>
          <div>
            <p className="text-sm">
              <span className="font-bold text-white">{sale.name}</span>
              <span className="text-white/50"> from </span>
              <span className="text-white">{sale.city}</span>
            </p>
            <p className="text-sm text-white/70">
              just purchased <span className="text-[#00F0FF] font-medium">{sale.product}</span>
            </p>
            <p className="text-xs text-white/30 mt-1">A few seconds ago</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Trust Badges Component
export const TrustBadges = () => {
  const badges = [
    { icon: <Users className="w-5 h-5" />, value: '2,500+', label: 'Happy Customers' },
    { icon: <Shield className="w-5 h-5" />, value: '100%', label: 'Secure Payments' },
    { icon: <Clock className="w-5 h-5" />, value: '24/7', label: 'Support Available' },
    { icon: <Star className="w-5 h-5" />, value: '4.9/5', label: 'Customer Rating' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {badges.map((badge, index) => (
        <div 
          key={index}
          className="flex items-center gap-3 p-4 bg-[#0a0a0a] border border-white/5 rounded-lg"
        >
          <div className="w-10 h-10 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF] flex items-center justify-center">
            {badge.icon}
          </div>
          <div>
            <p className="text-xl font-bold">{badge.value}</p>
            <p className="text-xs text-white/50">{badge.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Floating WhatsApp Button
export const FloatingChatButton = () => {
  return (
    <a
      href="https://wa.me/919999999999?text=Hi, I need help with Trust Vault"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      data-testid="whatsapp-button"
    >
      <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-current">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  );
};

// Platform Quick Filters
export const PlatformFilters = ({ onFilter, activeFilter }) => {
  const platforms = [
    { name: 'All', value: '' },
    { name: 'Steam', value: 'Steam' },
    { name: 'Epic', value: 'Epic' },
    { name: 'PlayStation', value: 'PlayStation' },
    { name: 'Xbox', value: 'Xbox' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map((platform) => (
        <button
          key={platform.value}
          onClick={() => onFilter(platform.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeFilter === platform.value
              ? 'bg-[#00F0FF] text-black'
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
          }`}
        >
          {platform.name}
        </button>
      ))}
    </div>
  );
};

// Stock Alert Badge
export const StockBadge = ({ stock }) => {
  if (stock > 5) return null;
  
  if (stock === 0) {
    return (
      <span className="px-2 py-1 text-xs font-bold bg-[#FF0055]/20 text-[#FF0055] rounded">
        Sold Out
      </span>
    );
  }
  
  return (
    <span className="px-2 py-1 text-xs font-bold bg-[#FFD600]/20 text-[#FFD600] rounded animate-pulse">
      Only {stock} left!
    </span>
  );
};
