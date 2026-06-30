import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import LogoutModal from '../components/LogoutModal';
import RequestCard from '../components/RequestCard';

export default function MyRequestsDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);

  const ACTIVE_SEMESTER = '2nd';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }

      const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: requestsData, error: requestsError } = await supabase
        .from('requests')
        .select(`id, preferred_schedule, courses (id, course_code, description, semester, requests)`)
        .eq('profile_id', user.id);

      if (requestsError) throw requestsError;
      setMyRequests(requestsData);

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
    <div className="max-w-2xl mx-auto bg-gray-50 min-h-screen font-sans relative pb-12 shadow-sm border-x border-gray-200">
      
      {showLogoutPrompt && (
        <LogoutModal onCancel={() => setShowLogoutPrompt(false)} onConfirm={handleLogoutConfirm} />
      )}

      <Navbar 
        title="Pre-RequestIT"
        navItems={[
          { label: 'My Requests', onClick: () => {}, isActive: true },
          { label: 'Courses', onClick: () => navigate('/courses'), isActive: false }
        ]}
        onLogoutClick={() => setShowLogoutPrompt(true)}
      />

      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome, {profile?.full_name}!</h2>

        {myRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 px-6 py-12 flex flex-col items-center justify-center text-center mt-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
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
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Active Petitions & Requests</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myRequests.map((req) => (
                <RequestCard key={req.id} req={req} activeSemester={ACTIVE_SEMESTER} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}