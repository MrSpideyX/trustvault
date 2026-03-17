import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Users, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AdminUsers = () => {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState(null);

  const getHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`, {
        withCredentials: true,
        headers: getHeaders()
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleToggleAdmin = async (userId, isAdmin) => {
    if (userId === currentUser?.user_id) {
      toast.error("You cannot change your own admin status");
      return;
    }

    try {
      setUpdatingUser(userId);
      await axios.put(`${API}/admin/users/${userId}/admin`, 
        { is_admin: isAdmin },
        { withCredentials: true, headers: getHeaders() }
      );
      toast.success(`User ${isAdmin ? 'promoted to' : 'removed from'} admin`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    } finally {
      setUpdatingUser(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Users</h1>
        <p className="text-white/50">Manage user accounts and permissions</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 bg-[#121212] border border-white/5 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="skeleton w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-5 w-32" />
                  <div className="skeleton h-4 w-48" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : users.length > 0 ? (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.user_id} className="p-4 bg-[#121212] border border-white/5 rounded-lg" data-testid={`user-row-${user.user_id}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#7000FF] flex items-center justify-center overflow-hidden">
                    {user.picture ? (
                      <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold">{user.name?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{user.name}</h3>
                      {user.is_admin && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-[#00F0FF]/20 text-[#00F0FF] rounded">
                          Admin
                        </span>
                      )}
                      {user.user_id === currentUser?.user_id && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-white/10 text-white/50 rounded">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-white/50 text-sm">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Shield className={`w-4 h-4 ${user.is_admin ? 'text-[#00F0FF]' : 'text-white/30'}`} />
                    <span className="text-sm text-white/50">Admin</span>
                    {updatingUser === user.user_id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Switch
                        checked={user.is_admin}
                        onCheckedChange={(checked) => handleToggleAdmin(user.user_id, checked)}
                        disabled={user.user_id === currentUser?.user_id}
                        data-testid={`admin-toggle-${user.user_id}`}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-white/50">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No users found</p>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
