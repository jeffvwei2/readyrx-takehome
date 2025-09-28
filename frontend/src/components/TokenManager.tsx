import React, { useState, useEffect } from 'react';
import { useAuth } from './Auth';
import { configureAxios } from '../utils/serverDetection';

interface TokenManagerProps {
  className?: string;
}

const TokenManager: React.FC<TokenManagerProps> = ({ className = '' }) => {
  const { user, token, setToken, logout, isAuthenticated } = useAuth();
  const [tokenInput, setTokenInput] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user is authenticated, hide the token input
    if (isAuthenticated) {
      setShowTokenInput(false);
    }
  }, [isAuthenticated]);

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Ensure axios is configured with the correct server
      await configureAxios();
      
      // Test the token by making a request
      const response = await fetch('/api/auth/info', {
        headers: { 
          'Authorization': `Bearer ${tokenInput}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // If successful, set the token
        setToken(tokenInput);
        setTokenInput('');
        setShowTokenInput(false);
      } else {
        setError('Invalid API token. Please check your token and try again.');
      }
    } catch (error) {
      setError('Failed to verify token. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowTokenInput(true);
  };

  const toggleTokenInput = () => {
    setShowTokenInput(!showTokenInput);
    setError('');
  };

  if (isAuthenticated && user) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">API Access</h3>
          <button
            onClick={handleLogout}
            className="text-xs text-red-600 hover:text-red-800 transition-colors"
          >
            Logout
          </button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              user.role === 'admin' ? 'bg-red-500' :
              user.role === 'doctor' ? 'bg-blue-500' :
              user.role === 'lab_tech' ? 'bg-green-500' :
              'bg-gray-500'
            }`}></div>
            <span className="text-sm font-medium text-gray-900 capitalize">
              {user.name}
            </span>
          </div>
          
          <div className="text-xs text-gray-500">
            Role: <span className="font-medium capitalize">{user.role}</span>
          </div>
          
          <div className="text-xs text-gray-500">
            Token: <span className="font-mono text-xs bg-gray-100 px-1 rounded">
              {token?.substring(0, 20)}...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">API Access</h3>
        <button
          onClick={toggleTokenInput}
          className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
        >
          {showTokenInput ? 'Cancel' : 'Enter Token'}
        </button>
      </div>

      {showTokenInput ? (
        <form onSubmit={handleTokenSubmit} className="space-y-3">
          <div>
            <label htmlFor="token" className="block text-xs font-medium text-gray-700 mb-1">
              API Token
            </label>
            <input
              id="token"
              type="text"
              required
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your API token"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading || !tokenInput.trim()}
              className="flex-1 px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Connect'}
            </button>
            <button
              type="button"
              onClick={toggleTokenInput}
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-2">
            No API token configured
          </div>
          <button
            onClick={toggleTokenInput}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            Enter API Token
          </button>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p className="font-medium mb-1">Need a token?</p>
          <p className="text-xs">
            Contact your administrator to get an API token for your role.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TokenManager;
