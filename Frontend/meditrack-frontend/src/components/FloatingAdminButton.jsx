import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const FloatingAdminButton = () => {
  const { user } = useAuth();
  const location = useLocation();

  // 1. Must be logged in as ADMIN
  // 2. Must NOT be on an admin route already
  if (user?.role !== 'ADMIN' || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <Link
      to="/admin"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-full shadow-2xl hover:scale-105 hover:bg-black transition-all duration-300 animate-in slide-in-from-bottom-5 border-2 border-slate-800"
    >
      <LayoutDashboard size={20} />
      <span className="font-bold text-sm">Back to Admin</span>
    </Link>
  );
};

export default FloatingAdminButton;