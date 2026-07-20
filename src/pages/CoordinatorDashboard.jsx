import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import LogoutModal from '../components/LogoutModal';
import CoordinatorTable from '../components/CoordinatorTable';
import CoordinatorModal from '../components/CoordinatorModal';

export default function CoordinatorDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expansion');

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [requestDetails, setRequestDetails] = useState([]);
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);

  const ACTIVE_SEMESTER = '2nd';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'coordinator') { navigate('/dashboard'); return; }

      const { data: coursesData, error } = await supabase
        .from('courses')
        .select('*')
        .gt('requests', 0)
        .order('requests', { ascending: false });

      if (error) throw error;
      setCourses(coursesData);
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

  const handleRowDoubleClick = async (course) => {
    setSelectedCourse(course);
    setRequestDetails([]);

    if (course.semester === ACTIVE_SEMESTER) {
      const { data, error } = await supabase
        .from('requests')
        .select(`preferred_schedule, profiles (full_name, email, program)`)
        .eq('course_id', course.id);

      if (!error && data) setRequestDetails(data);
    }
  };

  const expansionRequests = courses.filter(c => c.semester === ACTIVE_SEMESTER);
  const petitions = courses.filter(c => c.semester !== ACTIVE_SEMESTER);
  const displayedCourses = activeTab === 'expansion' ? expansionRequests : petitions;

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12 relative">
      
      {showLogoutPrompt && (
        <LogoutModal onCancel={() => setShowLogoutPrompt(false)} onConfirm={handleLogoutConfirm} />
      )}

      <CoordinatorModal 
        selectedCourse={selectedCourse} 
        requestDetails={requestDetails} 
        activeSemester={ACTIVE_SEMESTER} 
        onClose={() => { setSelectedCourse(null); setRequestDetails([]); }} 
      />

      <Navbar 
        title="Pre-RequestIT (Coordinator)"
        navItems={[{ label: 'Demand Dashboard', onClick: () => {}, isActive: true }]}
        onLogoutClick={() => setShowLogoutPrompt(true)}
      />

      <div className="max-w-6xl mx-auto p-6 mt-4">
        <div className="flex gap-6 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('expansion')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'expansion' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Expansion Requests
          </button>
          <button
            onClick={() => setActiveTab('petitions')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'petitions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Off-Semester Petitions
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4 font-medium flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Double-click a row to view details.
        </p>

        <CoordinatorTable 
          courses={displayedCourses} 
          activeTab={activeTab} 
          onRowDoubleClick={handleRowDoubleClick} 
        />
      </div>
    </div>
  );
}