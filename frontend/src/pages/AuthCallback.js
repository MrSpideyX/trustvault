import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { exchangeSession } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      const hash = location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);
      
      if (sessionIdMatch) {
        const sessionId = sessionIdMatch[1];
        try {
          const user = await exchangeSession(sessionId);
          // Clear the hash and navigate
          window.history.replaceState(null, '', window.location.pathname);
          navigate(user.is_admin ? '/admin' : '/dashboard', { replace: true, state: { user } });
        } catch (error) {
          console.error('Auth failed:', error);
          navigate('/login', { replace: true });
        }
      } else {
        navigate('/login', { replace: true });
      }
    };

    processAuth();
  }, [location.hash, exchangeSession, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#00F0FF] mx-auto mb-4" />
        <p className="text-white/70">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
