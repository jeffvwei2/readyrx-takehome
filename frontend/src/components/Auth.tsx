import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { configureAxios } from '../utils/serverDetection';

interface AuthContextType {
  user: any | null;
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Configure axios with detected server
      await configureAxios();
      
      // Check for stored token on app load
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setTokenState(storedToken);
        // Set default axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        // Verify token and get user info
        verifyToken(storedToken);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setLoading(false);
    }
  };

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await axios.get('/api/auth/info', {
        headers: { Authorization: `Bearer ${tokenToVerify}` }
      });
      setUser(response.data.user);
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem('authToken');
      setTokenState(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const setToken = (newToken: string) => {
    setTokenState(newToken);
    localStorage.setItem('authToken', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    // Verify the new token
    verifyToken(newToken);
  };

  const logout = () => {
    setUser(null);
    setTokenState(null);
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value: AuthContextType = {
    user,
    token,
    setToken,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// API Token Input Component
export const ApiTokenForm: React.FC = () => {
  const { setToken } = useAuth();
  const [token, setTokenInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Test the token by making a request
      await axios.get('/api/auth/info', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // If successful, set the token
      setToken(token);
    } catch (error) {
      setError('Invalid API token. Please check your token and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ReadyRx API Access
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your API token to access the system
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="token" className="sr-only">
              API Token
            </label>
            <input
              id="token"
              name="token"
              type="text"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Enter your API token"
              value={token}
              onChange={(e) => setTokenInput(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Access System'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <div className="text-sm text-gray-600">
            <p className="font-medium">Need an API token?</p>
            <p className="mt-1">
              Contact your administrator to get an API token for your role.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <ApiTokenForm />;
  }

  return <>{children}</>;
};
