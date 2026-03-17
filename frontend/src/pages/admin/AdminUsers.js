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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Users</h1>
        <p className="text-gray-500">Manage user accounts and permissions</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : users.length > 0 ? (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.user_id} className="p-4 bg-white border border-gray-200 rounded-xl" data-testid={`user-row-${user.user_id}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center overflow-hidden">
                    {user.picture ? (
                      <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-white">{user.name?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{user.name}</h3>
                      {user.is_admin && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-purple-100 text-purple-600 rounded">
                          Admin
                        </span>
                      )}
                      {user.user_id === currentUser?.user_id && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-gray-100 text-gray-500 rounded">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Shield className={`w-4 h-4 ${user.is_admin ? 'text-purple-600' : 'text-gray-300'}`} />
                    <span className="text-sm text-gray-500">Admin</span>
                    {updatingUser === user.user_id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
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
        <div className="text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-xl">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No users found</p>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
