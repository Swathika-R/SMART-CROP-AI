import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CropRecommend from './pages/CropRecommend';
import DiseaseDetect from './pages/DiseaseDetect';
import MarketIntel from './pages/MarketIntel';
import Profile from './pages/Profile';
import Feedback from './pages/Feedback';

// Guard wrapper for private/authenticated routes
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center flex-col gap-4 text-slate-500">
        <div className="w-12 h-12 border-4 border-farm-green border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-medium">Authenticating Session...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Guard wrapper to prevent logged-in users from accessing Login/Register pages
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center flex-col gap-4 text-slate-500">
        <div className="w-12 h-12 border-4 border-farm-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <div className="flex flex-col min-h-screen bg-slate-900">
            <Navbar />
            <main className="flex-grow pb-16">
              <Routes>
                {/* Public Route */}
                <Route path="/" element={<Home />} />
                
                {/* Guest-only Routes */}
                <Route path="/login" element={
                  <GuestRoute>
                    <Login />
                  </GuestRoute>
                } />
                <Route path="/register" element={
                  <GuestRoute>
                    <Register />
                  </GuestRoute>
                } />

                {/* Authenticated/Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/predict" element={
                  <ProtectedRoute>
                    <CropRecommend />
                  </ProtectedRoute>
                } />
                <Route path="/detect" element={
                  <ProtectedRoute>
                    <DiseaseDetect />
                  </ProtectedRoute>
                } />
                <Route path="/market" element={
                  <ProtectedRoute>
                    <MarketIntel />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/feedback" element={
                  <ProtectedRoute>
                    <Feedback />
                  </ProtectedRoute>
                } />

                {/* Fallback Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}
