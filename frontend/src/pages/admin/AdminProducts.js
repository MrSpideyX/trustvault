import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Switch } from '../../components/ui/switch';
import { Plus, Pencil, Trash2, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AdminProducts = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    platform: 'Steam',
    game_title: '',
    price_inr: '',
    price_usd: '',
    stock: '',
    image_url: '',
    category: 'Game Account',
    featured: false
  });

  const platforms = ['Steam', 'Epic', 'PlayStation', 'Xbox', 'Nintendo', 'Origin', 'Ubisoft', 'Battle.net'];

  const getHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        price_inr: parseFloat(formData.price_inr),
        price_usd: parseFloat(formData.price_usd),
        stock: parseInt(formData.stock)
      };

      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct.product_id}`, payload, {
          withCredentials: true,
          headers: getHeaders()
        });
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${API}/products`, payload, {
          withCredentials: true,
          headers: getHeaders()
        });
        toast.success('Product created successfully');
      }

      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      platform: product.platform,
      game_title: product.game_title,
      price_inr: product.price_inr.toString(),
      price_usd: product.price_usd.toString(),
      stock: product.stock.toString(),
      image_url: product.image_url || '',
      category: product.category,
      featured: product.featured
    });
    setDialogOpen(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await axios.delete(`${API}/products/${productId}`, {
        withCredentials: true,
        headers: getHeaders()
      });
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      platform: 'Steam',
      game_title: '',
      price_inr: '',
      price_usd: '',
      stock: '',
      image_url: '',
      category: 'Game Account',
      featured: false
    });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.game_title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-white/50">Manage your game account inventory</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-[#00F0FF] text-black font-bold" data-testid="add-product-btn">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0a0a0a] border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="God of War Ragnarok Account"
                    className="bg-black/50 border-white/10"
                    required
                    data-testid="product-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Game Title</Label>
                  <Input
                    value={formData.game_title}
                    onChange={(e) => setFormData({ ...formData, game_title: e.target.value })}
                    placeholder="God of War Ragnarok"
                    className="bg-black/50 border-white/10"
                    required
                    data-testid="game-title-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Full game access with all DLCs..."
                  className="bg-black/50 border-white/10 min-h-[100px]"
                  required
                  data-testid="product-description-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={formData.platform} onValueChange={(v) => setFormData({ ...formData, platform: v })}>
                    <SelectTrigger className="bg-black/50 border-white/10" data-testid="platform-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-white/10">
                      {platforms.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="10"
                    className="bg-black/50 border-white/10"
                    required
                    min="0"
                    data-testid="stock-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (INR)</Label>
                  <Input
                    type="number"
                    value={formData.price_inr}
                    onChange={(e) => setFormData({ ...formData, price_inr: e.target.value })}
                    placeholder="2999"
                    className="bg-black/50 border-white/10"
                    required
                    min="0"
                    step="0.01"
                    data-testid="price-inr-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price (USD)</Label>
                  <Input
                    type="number"
                    value={formData.price_usd}
                    onChange={(e) => setFormData({ ...formData, price_usd: e.target.value })}
                    placeholder="39.99"
                    className="bg-black/50 border-white/10"
                    required
                    min="0"
                    step="0.01"
                    data-testid="price-usd-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="bg-black/50 border-white/10"
                  data-testid="image-url-input"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                <div>
                  <Label>Featured Product</Label>
                  <p className="text-sm text-white/50">Show on homepage</p>
                </div>
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  data-testid="featured-switch"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1 bg-[#00F0FF] text-black font-bold" data-testid="save-product-btn">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingProduct ? 'Update' : 'Create'} Product
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="pl-10 bg-[#0a0a0a] border-white/10"
          data-testid="search-products"
        />
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 bg-[#121212] border border-white/5 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="skeleton w-16 h-20 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-5 w-48" />
                  <div className="skeleton h-4 w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <div key={product.product_id} className="p-4 bg-[#121212] border border-white/5 rounded-lg" data-testid={`product-row-${product.product_id}`}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-20 rounded overflow-hidden flex-shrink-0 bg-white/5">
                  {product.image_url && (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg truncate">{product.name}</h3>
                      <p className="text-white/50 text-sm">{product.game_title} • {product.platform}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-[#00F0FF]">₹{product.price_inr.toLocaleString()}</span>
                        <span className="text-white/30">|</span>
                        <span className="text-[#00F0FF]">${product.price_usd}</span>
                        <span className="text-white/30">|</span>
                        <span className={product.stock > 0 ? 'text-[#00FF94]' : 'text-[#FF0055]'}>
                          {product.stock} in stock
                        </span>
                        {product.featured && (
                          <>
                            <span className="text-white/30">|</span>
                            <span className="text-[#FFD600]">Featured</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        className="border-white/10"
                        data-testid={`edit-product-${product.product_id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.product_id)}
                        className="border-white/10 text-[#FF0055] hover:bg-[#FF0055]/10"
                        data-testid={`delete-product-${product.product_id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-white/50">
          <p>No products found</p>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
