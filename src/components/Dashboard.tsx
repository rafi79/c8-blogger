'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Settings, 
  LogOut, 
  PlusCircle, 
  History, 
  Users, 
  TrendingUp,
  Calendar,
  Image,
  Type,
  Send,
  Twitter,
  Facebook,
  Instagram,
  Globe,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Credential {
  id: string;
  platform: string;
  username: string;
  isActive: boolean;
  createdAt: string;
}

interface Post {
  id: string;
  content: string;
  platforms: string[];
  status: 'success' | 'failed' | 'pending';
  createdAt: string;
  topic?: string;
  tone?: string;
}

interface PostContent {
  topic: string;
  tone: string;
  length: string;
  generatedText: string;
  selectedImage: File | null;
}

interface Platform {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface Tone {
  id: string;
  name: string;
  description: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardProps {
  user: User;
  onNavigateToCredentials: () => void;
  onLogout: () => void;
}

export default function Dashboard({ user, onNavigateToCredentials, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<string>('create');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const [postHistory, setPostHistory] = useState<Post[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [postContent, setPostContent] = useState<PostContent>({
    topic: '',
    tone: 'professional',
    length: 'medium',
    generatedText: '',
    selectedImage: null
  });

  const platforms: Platform[] = [
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'bg-blue-500' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-500' }
  ];

  const tones: Tone[] = [
    { id: 'professional', name: 'Professional', description: 'Formal and business-oriented' },
    { id: 'casual', name: 'Casual', description: 'Friendly and conversational' },
    { id: 'humorous', name: 'Humorous', description: 'Light-hearted and funny' },
    { id: 'inspirational', name: 'Inspirational', description: 'Motivating and uplifting' }
  ];

  const navItems: NavItem[] = [
    { id: 'create', label: 'Create Post', icon: PlusCircle },
    { id: 'history', label: 'Post History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  useEffect(() => {
    fetchCredentials();
    fetchPostHistory();
  }, []);

  const fetchCredentials = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch('/api/credentials/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setCredentials(data.credentials || []);
      } else {
        console.error('Failed to fetch credentials:', data.message);
      }
    } catch (error) {
      console.error('Error fetching credentials:', error);
    }
  };

  const fetchPostHistory = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch('/api/posts/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setPostHistory(data.posts || []);
      } else {
        console.error('Failed to fetch post history:', data.message);
      }
    } catch (error) {
      console.error('Error fetching post history:', error);
    }
  };

  const generateContent = async (): Promise<void> => {
    if (!postContent.topic.trim()) {
      toast.error('Please enter a topic for your post');
      return;
    }

    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topic: postContent.topic,
          tone: postContent.tone,
          length: postContent.length,
          platforms: selectedPlatforms
        })
      });

      const data = await response.json();
      if (response.ok) {
        setPostContent(prev => ({
          ...prev,
          generatedText: data.content || ''
        }));
        toast.success('Content generated successfully!');
      } else {
        toast.error(data.message || 'Failed to generate content');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Error generating content');
    } finally {
      setIsGenerating(false);
    }
  };

  const postToSocialMedia = async (): Promise<void> => {
    if (!postContent.generatedText.trim()) {
      toast.error('Please generate content first');
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    setIsPosting(true);
    const results: Array<{ platform: string; success: boolean; message: string }> = [];

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      for (const platform of selectedPlatforms) {
        const response = await fetch(`/api/automation/${platform}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            content: postContent.generatedText,
            image: postContent.selectedImage
          })
        });

        const data = await response.json();
        results.push({
          platform,
          success: response.ok,
          message: data.message || 'Unknown error'
        });
      }

      const successCount = results.filter(r => r.success).length;
      if (successCount > 0) {
        toast.success(`Posted to ${successCount} platform(s) successfully!`);
        await fetchPostHistory(); // Refresh history
      } else {
        toast.error('Failed to post to any platform');
      }
    } catch (error) {
      console.error('Error posting to social media:', error);
      toast.error('Error posting to social media');
    } finally {
      setIsPosting(false);
    }
  };

  const togglePlatform = (platformId: string): void => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleTopicChange = (value: string): void => {
    setPostContent(prev => ({ ...prev, topic: value }));
  };

  const handleToneChange = (toneId: string): void => {
    setPostContent(prev => ({ ...prev, tone: toneId }));
  };

  const handleGeneratedTextChange = (value: string): void => {
    setPostContent(prev => ({ ...prev, generatedText: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="border-b border-white/20 bg-white/5 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">C8 Blogger</h1>
                <p className="text-sm text-gray-300">Welcome back, {user?.name || 'User'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNavigateToCredentials}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-gray-300'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </nav>

            {/* Stats */}
            <div className="mt-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Total Posts</span>
                  <span className="font-semibold">{postHistory.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Connected Accounts</span>
                  <span className="font-semibold">{credentials.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">This Month</span>
                  <span className="font-semibold text-green-400">+12</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'create' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Create Post */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    <span>Create AI-Powered Post</span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column - Content Generation */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          Topic or Idea
                        </label>
                        <textarea
                          value={postContent.topic}
                          onChange={(e) => handleTopicChange(e.target.value)}
                          placeholder="What would you like to post about?"
                          className="w-full h-24 px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          Tone
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {tones.map((tone) => (
                            <button
                              key={tone.id}
                              onClick={() => handleToneChange(tone.id)}
                              className={`p-3 rounded-lg text-left transition-all ${
                                postContent.tone === tone.id
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-white/5 hover:bg-white/10 text-gray-300'
                              }`}
                            >
                              <div className="font-medium">{tone.name}</div>
                              <div className="text-xs opacity-75">{tone.description}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={generateContent}
                        disabled={isGenerating}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50"
                      >
                        {isGenerating ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Generating...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <Sparkles className="w-5 h-5" />
                            <span>Generate Content</span>
                          </div>
                        )}
                      </motion.button>
                    </div>

                    {/* Right Column - Preview & Platforms */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          Generated Content
                        </label>
                        <textarea
                          value={postContent.generatedText}
                          onChange={(e) => handleGeneratedTextChange(e.target.value)}
                          placeholder="Your AI-generated content will appear here..."
                          className="w-full h-32 px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-3">
                          Select Platforms
                        </label>
                        <div className="space-y-2">
                          {platforms.map((platform) => {
                            const isConnected = credentials.find(c => c.platform === platform.id);
                            return (
                              <motion.button
                                key={platform.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => togglePlatform(platform.id)}
                                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                                  selectedPlatforms.includes(platform.id)
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                                }`}
                              >
                                <div className={`w-8 h-8 ${platform.color} rounded-lg flex items-center justify-center`}>
                                  <platform.icon className="w-4 h-4 text-white" />
                                </div>
                                <span>{platform.name}</span>
                                {isConnected ? (
                                  <span className="ml-auto text-green-400 text-sm">Connected</span>
                                ) : (
                                  <span className="ml-auto text-yellow-400 text-sm">Not Connected</span>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={postToSocialMedia}
                        disabled={isPosting || !postContent.generatedText || selectedPlatforms.length === 0}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50"
                      >
                        {isPosting ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Posting...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <Send className="w-5 h-5" />
                            <span>Post to Selected Platforms</span>
                          </div>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                  <History className="w-6 h-6 text-purple-400" />
                  <span>Post History</span>
                </h2>

                {postHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                    <p className="text-gray-400">Create your first post to see it here!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {postHistory.map((post, index) => (
                      <div key={post.id || index} className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-400">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {post.platforms?.map((platformId) => {
                              const platformData = platforms.find(p => p.id === platformId);
                              return platformData ? (
                                <div key={platformId} className={`w-6 h-6 ${platformData.color} rounded flex items-center justify-center`}>
                                  <platformData.icon className="w-3 h-3 text-white" />
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                        <p className="text-gray-200">{post.content}</p>
                        <div className="mt-3 flex items-center space-x-4 text-sm text-gray-400">
                          <span>Status: {post.status}</span>
                          <span>Platforms: {post.platforms?.length || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                  <span>Analytics</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">{postHistory.length}</div>
                    <div className="text-gray-400">Total Posts</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">{credentials.length}</div>
                    <div className="text-gray-400">Connected Accounts</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">94%</div>
                    <div className="text-gray-400">Success Rate</div>
                  </div>
                </div>

                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Analytics Coming Soon</h3>
                  <p className="text-gray-400">Detailed analytics and insights will be available in future updates.</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}