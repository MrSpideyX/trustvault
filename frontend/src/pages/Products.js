import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [platform, setPlatform] = useState(searchParams.get('platform') || '');
  const [showFilters, setShowFilters] = useState(false);

  const platforms = ['Steam', 'Epic', 'PlayStation', 'Xbox', 'Nintendo', 'Origin', 'Ubisoft', 'Battle.net'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (platform) params.append('platform', platform);
        
        const response = await axios.get(`${API}/products?${params.toString()}`);
        setProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [search, platform]);

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchValue = formData.get('search');
    setSearch(searchValue);
    
    const params = new URLSearchParams(searchParams);
    if (searchValue) {
      params.set('search', searchValue);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handlePlatformChange = (value) => {
    setPlatform(value === 'all' ? '' : value);
    
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set('platform', value);
    } else {
      params.delete('platform');
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch('');
    setPlatform('');
    setSearchParams({});
  };

  const hasFilters = search || platform;

  return (
    <div className="min-h-screen py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[#00F0FF] text-sm uppercase tracking-widest font-medium mb-4">Store</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">ALL PRODUCTS</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <Input
                name="search"
                placeholder="Search games..."
                defaultValue={search}
                className="pl-10 bg-[#0a0a0a] border-white/10 h-12"
                data-testid="search-input"
              />
            </div>
            <Button type="submit" className="bg-[#00F0FF] text-black h-12 px-6 font-bold" data-testid="search-button">
              Search
            </Button>
          </form>

          <div className="flex gap-2">
            <Select value={platform || 'all'} onValueChange={handlePlatformChange}>
              <SelectTrigger className="w-[160px] bg-[#0a0a0a] border-white/10 h-12" data-testid="platform-filter">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a0a] border-white/10">
                <SelectItem value="all">All Platforms</SelectItem>
                {platforms.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="h-12 border-white/10 text-white/70 hover:text-white"
                data-testid="clear-filters"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-white/50 text-sm">
          {loading ? 'Loading...' : `${products.length} products found`}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="product-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#0a0a0a] border border-white/5 rounded-lg overflow-hidden">
                <div className="aspect-[3/4] skeleton" />
                <div className="p-4 space-y-3">
                  <div className="h-4 skeleton w-1/2" />
                  <div className="h-6 skeleton w-3/4" />
                  <div className="h-8 skeleton w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <Search className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-xl font-bold mb-2">No products found</h3>
            <p className="text-white/50 mb-6">Try adjusting your search or filters</p>
            {hasFilters && (
              <Button onClick={clearFilters} className="bg-[#00F0FF] text-black">
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
