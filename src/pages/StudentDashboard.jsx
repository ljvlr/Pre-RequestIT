import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function MyRequestsDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutConfirm = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading your dashboard...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-gray-50 min-h-screen font-sans relative">
      
      {showLogoutPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Are you sure you want to logout?</h3>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutPrompt(false)}
                className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg"
              >
                No
              </button>
              <button 
                onClick={handleLogoutConfirm}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 flex items-center gap-6 sticky top-0 z-10 shadow-sm border-b border-gray-200">
        <h1 className="font-bold text-xl text-blue-600 mr-auto">Pre-RequestIT</h1>
        <button className="text-sm font-bold text-blue-600 border-b-2 border-blue-600 pb-1">My Requests</button>
        <button onClick={() => navigate('/courses')} className="text-sm font-medium text-gray-500 hover:text-gray-800 pb-1">Courses</button>
        <button onClick={() => setShowLogoutPrompt(true)} className="text-sm font-medium text-red-500 hover:underline pb-1 ml-4">Logout</button>
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {profile?.full_name}!</h2>
      </div>

      <div className="px-6 py-12 flex flex-col items-center justify-center text-center mt-10">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">No active requests</h3>
        <p className="text-gray-500 text-sm mb-6">You haven't joined or initiated any course petitions yet.</p>
        
        <button 
          onClick={() => navigate('/courses')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-colors"
        >
          Browse Courses
        </button>
      </div>
    </div>
  );
}