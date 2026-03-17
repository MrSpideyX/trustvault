import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Calendar } from '../../components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import { Plus, Trash2, Loader2, Tag, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AdminDiscounts = () => {
  const { token } = useAuth();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_percent: '',
    max_uses: '100',
    expires_at: null
  });

  const getHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchDiscounts = async () => {
    try {
      const response = await axios.get(`${API}/discounts`, {
        withCredentials: true,
        headers: getHeaders()
      });
      setDiscounts(response.data);
    } catch (error) {
      console.error('Failed to fetch discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        code: formData.code.toUpperCase(),
        discount_percent: parseFloat(formData.discount_percent),
        max_uses: parseInt(formData.max_uses),
        expires_at: formData.expires_at ? formData.expires_at.toISOString() : null
      };

      await axios.post(`${API}/discounts`, payload, {
        withCredentials: true,
        headers: getHeaders()
      });

      toast.success('Discount code created');
      setDialogOpen(false);
      setFormData({ code: '', discount_percent: '', max_uses: '100', expires_at: null });
      fetchDiscounts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create discount');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (code) => {
    if (!window.confirm('Are you sure you want to delete this discount code?')) return;
    
    try {
      await axios.delete(`${API}/discounts/${code}`, {
        withCredentials: true,
        headers: getHeaders()
      });
      toast.success('Discount code deleted');
      fetchDiscounts();
    } catch (error) {
      toast.error('Failed to delete discount');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Discount Codes</h1>
          <p className="text-white/50">Create and manage promotional codes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#00F0FF] text-black font-bold" data-testid="add-discount-btn">
              <Plus className="w-4 h-4 mr-2" />
              Add Discount
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0a0a0a] border-white/10">
            <DialogHeader>
              <DialogTitle>Create Discount Code</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER20"
                  className="bg-black/50 border-white/10 uppercase"
                  required
                  data-testid="discount-code-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount (%)</Label>
                  <Input
                    type="number"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                    placeholder="20"
                    className="bg-black/50 border-white/10"
                    required
                    min="1"
                    max="100"
                    data-testid="discount-percent-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Uses</Label>
                  <Input
                    type="number"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    placeholder="100"
                    className="bg-black/50 border-white/10"
                    required
                    min="1"
                    data-testid="max-uses-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Expiration Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-black/50 border-white/10"
                      data-testid="expiry-date-btn"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.expires_at ? format(formData.expires_at, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#0a0a0a] border-white/10">
                    <Calendar
                      mode="single"
                      selected={formData.expires_at}
                      onSelect={(date) => setFormData({ ...formData, expires_at: date })}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1 bg-[#00F0FF] text-black font-bold" data-testid="create-discount-btn">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Discount
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-[#121212] border border-white/5 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="skeleton h-6 w-24" />
                  <div className="skeleton h-4 w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : discounts.length > 0 ? (
        <div className="space-y-4">
          {discounts.map((discount) => (
            <div key={discount.code} className="p-4 bg-[#121212] border border-white/5 rounded-lg" data-testid={`discount-row-${discount.code}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#7000FF]/20 text-[#7000FF] flex items-center justify-center">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{discount.code}</h3>
                    <div className="flex items-center gap-4 text-sm text-white/50">
                      <span className="text-[#00F0FF] font-bold">{discount.discount_percent}% off</span>
                      <span>•</span>
                      <span>{discount.current_uses} / {discount.max_uses} uses</span>
                      {discount.expires_at && (
                        <>
                          <span>•</span>
                          <span>Expires: {new Date(discount.expires_at).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(discount.code)}
                  className="border-white/10 text-[#FF0055] hover:bg-[#FF0055]/10"
                  data-testid={`delete-discount-${discount.code}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-white/50">
          <Tag className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No discount codes yet</p>
        </div>
      )}
    </div>
  );
};

export default AdminDiscounts;
