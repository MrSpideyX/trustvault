import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Shield, Users, Clock, Star, MessageCircle } from 'lucide-react';

// Live Sales Notification Popup - Fixed for location-appropriate names
export const SalesNotification = () => {
  const [visible, setVisible] = useState(false);
  const [sale, setSale] = useState(null);

  // Indian names for Indian cities
  const indianData = {
    names: ['Rahul', 'Priya', 'Ankit', 'Sneha', 'Vikram', 'Pooja', 'Amit', 'Neha', 'Raj', 'Kavya', 'Arjun', 'Riya'],
    cities: ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Jaipur', 'Ahmedabad', 'Lucknow']
  };

  // Foreign names for foreign cities
  const foreignData = {
    names: ['John', 'Emma', 'Michael', 'Sarah', 'James', 'Emily', 'David', 'Olivia', 'Chris', 'Sophia', 'Alex', 'Mia'],
    cities: ['New York', 'London', 'Toronto', 'Sydney', 'Chicago', 'Los Angeles', 'Berlin', 'Paris', 'Dubai', 'Singapore']
  };

  const products = ['God of War Ragnarok', 'Resident Evil 4', 'Elden Ring', 'Cyberpunk 2077', 'GTA V Premium', 'Red Dead Redemption 2', 'Hogwarts Legacy', 'Spider-Man 2'];

  useEffect(() => {
    const showNotification = () => {
      // Randomly choose Indian or Foreign
      const isIndian = Math.random() > 0.5;
      const data = isIndian ? indianData : foreignData;
      
      const randomName = data.names[Math.floor(Math.random() * data.names.length)];
      const randomCity = data.cities[Math.floor(Math.random() * data.cities.length)];
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      
      setSale({ name: randomName, city: randomCity, product: randomProduct });
      setVisible(true);

      setTimeout(() => setVisible(false), 4000);
    };

    const initialTimeout = setTimeout(showNotification, 5000);
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
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xl max-w-xs">
        <button 
          onClick={() => setVisible(false)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm">
              <span className="font-bold text-gray-900">{sale.name}</span>
              <span className="text-gray-500"> from </span>
              <span className="text-gray-900">{sale.city}</span>
            </p>
            <p className="text-sm text-gray-600">
              just purchased <span className="text-purple-600 font-medium">{sale.product}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">A few seconds ago</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Trust Badges Component - Light Theme
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
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
            {badge.icon}
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{badge.value}</p>
            <p className="text-xs text-gray-500">{badge.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Floating Contact Button with Social Links
export const FloatingContactButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const socials = [
    {
      name: 'WhatsApp',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      href: 'https://wa.me/918824647379?text=Hi, I need help with Trust Vault',
      color: 'bg-[#25D366] hover:bg-[#20bd5a]',
    },
    {
      name: 'Discord',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      ),
      href: 'https://discord.gg/K2mvJ8fGmR',
      color: 'bg-[#5865F2] hover:bg-[#4752c4]',
    },
  ];

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Social Links */}
      <div className={`flex flex-col gap-3 mb-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {socials.map((social, index) => (
          <a
            key={index}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-12 h-12 ${social.color} text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110`}
            title={social.name}
          >
            {social.icon}
          </a>
        ))}
      </div>

      {/* Main Contact Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
          isOpen 
            ? 'bg-gray-800 text-white rotate-45' 
            : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800'
        }`}
        data-testid="contact-button"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </div>
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
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
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
      <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-600 rounded">
        Sold Out
      </span>
    );
  }
  
  return (
    <span className="px-2 py-1 text-xs font-bold bg-yellow-100 text-yellow-700 rounded animate-pulse">
      Only {stock} left!
    </span>
  );
};
