'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  Twitter, 
  Facebook, 
  Instagram, 
  Shield,
  CheckCircle,
  AlertCircle,
  Trash2,
  Eye,
  EyeOff,
  TestTube
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CredentialsPageProps {
  onBack: () => void;
}

export default function CredentialsPage({ onBack }: CredentialsPageProps) {
  const [credentials, setCredentials] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [formData, setFormData] = useState({
    platform: '',
    username: '',
    password: '',
    email: ''
  });

  const platforms = [
    { 
      id: 'twitter', 
      name: 'Twitter/X', 
      icon: Twitter, 
      color: 'bg-blue-500',
      fields: ['username', 'password']
    },
    { 
      id: 'facebook', 
      name: 'Facebook', 
      icon: Facebook, 
      color: 'bg-blue-600',
      fields: ['email', 'password']
    },
    { 
      id: 'instagram', 
      name: 'Instagram', 
      icon: Instagram, 
      color: 'bg-pink-500',
      fields: ['username', 'password']
    }
  ];

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const response = await fetch('/api/credentials/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setCredentials(data.credentials);
      }
    } catch (error) {
      console.error('Error fetching credentials:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.platform || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.platform === 'facebook' && !formData.email) {
      toast.error('Email is required for Facebook');
      return;
    }

    if ((formData.platform === 'twitter' || formData.platform === 'instagram') && !formData.username) {
      toast.error('Username is required for this platform');
      return;
    }

    try {
      const response = await fetch('/api/credentials/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Credentials saved successfully!');
        setFormData({ platform: '', username: '', password: '', email: '' });
        setShowAddForm(false);
        fetchCredentials();
      } else {
        toast.error(data.message || 'Failed to save credentials');
      }
    } catch (error) {
      toast.error('Error saving credentials');
    }
  };

  const testCredentials = async (credentialId: string, platform: string) => {
    setTesting(credentialId);
    try {
      const response = await fetch('/api/credentials/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ credentialId, platform })
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Credentials verified successfully!');
      } else {
        toast.error(data.message || 'Credential verification failed');
      }
    } catch (error) {
      toast.error('Error testing credentials');
    } finally {
      setTesting(null);
    }
  };

  const deleteCredentials = async (credentialId: string) => {
    if (!confirm('Are you sure you want to delete these credentials?')) {
      return;
    }

    try {
      const response = await fetch('/api/credentials/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ credentialId })
      });

      if (response.ok) {
        toast.success('Credentials deleted successfully');
        fetchCredentials();
      } else {
        toast.error('Failed to delete credentials');
      }
    } catch (error) {
      toast.error('Error deleting credentials');
    }
  };

  const togglePasswordVisibility = (credentialId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [credentialId]: !prev[credentialId]
    }));
  };

  const selectedPlatform = platforms.find(p => p.id === formData.platform);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-6">
      {/* Header */}
      <div className="container mx-auto mb-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="mb-6 flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </motion.button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Social Media Credentials</h1>
            <p className="text-gray-300">Manage your social media account credentials securely</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Account</span>
          </motion.button>
        </div>
      </div>

      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-500/20 border border-blue-500/30 rounded-2xl p-6"
          >
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-blue-400 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-300 mb-2">Security & Privacy</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• All credentials are encrypted using industry-standard encryption</li>
                  <li>• Passwords are never stored in plain text</li>
                  <li>• Only you can access your stored credentials</li>
                  <li>• We recommend using app-specific passwords when available</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Connected Accounts</h3>
            <div className="grid grid-cols-3 gap-4">
              {platforms.map(platform => {
                const isConnected = credentials.some((c: any) => c.platform === platform.id);
                return (
                  <div key={platform.id} className="text-center">
                    <div className={`w-12 h-12 ${platform.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                      <platform.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm font-medium">{platform.name}</div>
                    <div className={`text-xs ${isConnected ? 'text-green-400' : 'text-gray-400'}`}>
                      {isConnected ? 'Connected' : 'Not Connected'}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Credentials List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold mb-6">Your Connected Accounts</h2>

          {credentials.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No accounts connected</h3>
              <p className="text-gray-400 mb-6">Add your first social media account to get started</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-xl font-semibold"
              >
                Add Account
              </motion.button>
            </div>
          ) : (
            <div className="space-y-4">
              {credentials.map((credential: any) => {
                const platform = platforms.find(p => p.id === credential.platform);
                if (!platform) return null;

                return (
                  <motion.div
                    key={credential._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${platform.color} rounded-xl flex items-center justify-center`}>
                          <platform.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{platform.name}</h3>
                          <p className="text-sm text-gray-400">
                            {credential.username || credential.email}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-gray-400">Password:</span>
                              <span className="text-xs font-mono">
                                {showPasswords[credential._id] 
                                  ? credential.password 
                                  : '•'.repeat(credential.password?.length || 8)
                                }
                              </span>
                              <button
                                onClick={() => togglePasswordVisibility(credential._id)}
                                className="text-gray-400 hover:text-white transition-colors"
                              >
                                {showPasswords[credential._id] ? (
                                  <EyeOff className="w-3 h-3" />
                                ) : (
                                  <Eye className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {credential.verified ? (
                          <div className="flex items-center space-x-1 text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-yellow-400">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">Unverified</span>
                          </div>
                        )}

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => testCredentials(credential._id, credential.platform)}
                          disabled={testing === credential._id}
                          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center space-x-1"
                        >
                          <TestTube className="w-3 h-3" />
                          <span>{testing === credential._id ? 'Testing...' : 'Test'}</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => deleteCredentials(credential._id)}
                          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg text-sm transition-colors flex items-center space-x-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Add Form Modal */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 w-full max-w-md"
            >
              <h3 className="text-2xl font-bold mb-6">Add Social Media Account</h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Platform
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({...formData, platform: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    required
                  >
                    <option value="">Select Platform</option>
                    {platforms.map(platform => (
                      <option key={platform.id} value={platform.id} className="bg-gray-800">
                        {platform.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPlatform && (
                  <>
                    {selectedPlatform.fields.includes('username') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({...formData, username: e.target.value})}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                          placeholder="Enter your username"
                          required
                        />
                      </div>
                    )}

                    {selectedPlatform.fields.includes('email') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </>
                )}

                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                  >
                    Save Account
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}