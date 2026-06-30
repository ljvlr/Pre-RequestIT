import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Panel</h1>
        <p className="text-gray-500 mb-6">Sprint 3 soon</p>
        <button 
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}