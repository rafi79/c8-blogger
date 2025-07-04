'use client';

import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import LandingPage from '@/components/LandingPage';
import AuthPage from '@/components/AuthPage';
import Dashboard from '@/components/Dashboard';
import CredentialsPage from '@/components/CredentialsPage';

type Page = 'landing' | 'auth' | 'dashboard' | 'credentials';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setCurrentPage('dashboard');
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleGetStarted = () => {
    setCurrentPage('auth');
  };

  const handleBack = () => {
    setCurrentPage('landing');
  };

  const handleAuthenticated = (userData: any) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleNavigateToCredentials = () => {
    setCurrentPage('credentials');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading C8 Blogger...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        }}
      />
      
      {currentPage === 'landing' && (
        <LandingPage onGetStarted={handleGetStarted} />
      )}
      
      {currentPage === 'auth' && (
        <AuthPage 
          onBack={handleBack} 
          onAuthenticated={handleAuthenticated} 
        />
      )}
      
      {currentPage === 'dashboard' && user && (
        <Dashboard 
          user={user}
          onNavigateToCredentials={handleNavigateToCredentials}
          onLogout={handleLogout}
        />
      )}
      
      {currentPage === 'credentials' && (
        <CredentialsPage onBack={handleBackToDashboard} />
      )}
    </>
  );
}