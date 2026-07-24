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
  const [activeSemester, setActiveSemester] = useState('2nd');

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [requestDetails, setRequestDetails] = useState([]);
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);

  const [decisionPopup, setDecisionPopup] = useState({ isOpen: false, course: null, type: null });
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }

      const { data: profile } = await supabase.from('profiles').select('role, program').eq('id', user.id).single();
      if (profile?.role !== 'coordinator') { navigate('/dashboard'); return; }

      const { data: settings } = await supabase.from('system_settings').select('active_semester').eq('id', 1).single();
      if (settings) setActiveSemester(settings.active_semester);

      const { data: coursesData, error } = await supabase
        .from('courses')
        .select('*')
        .ilike('program', `%${profile.program}%`)
        .gt('requests', 0)
        .order('requests', { ascending: false });

      if (error) throw error;

      const { data: allRequests } = await supabase.from('requests').select('course_id, status');

      const processedCourses = coursesData.map(course => {
        const courseRequests = allRequests?.filter(r => r.course_id === course.id) || [];
        const decided = courseRequests.find(r => r.status && r.status !== 'Pending');
        return {
          ...course,
          overall_status: decided ? decided.status : 'Pending'
        };
      });

      setCourses(processedCourses);
    } catch (err) {
      console.error(err.message);
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

    const { data, error } = await supabase
      .from('requests')
      .select(`preferred_schedule, profiles (full_name, email, program)`)
      .eq('course_id', course.id);

    if (!error && data) setRequestDetails(data);
  };

  const handleActionClick = (course, type) => {
    setDecisionPopup({ isOpen: true, course, type });
    setRemarks('');
    setError('');
  };

  const handleDecisionSubmit = async () => {
    if (decisionPopup.type === 'Rejected' && !remarks.trim()) {
      setError('Missing input. Remarks are required for rejection.');
      return;
    }

    setIsProcessing(true);
    try {
      await supabase.from('requests').update({ status: decisionPopup.type, remarks }).eq('course_id', decisionPopup.course.id);
      alert(`Petition successfully ${decisionPopup.type.toLowerCase()}`);
      setDecisionPopup({ isOpen: false, course: null, type: null });
      setRemarks('');
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const expansionRequests = courses.filter(c => c.semester === activeSemester);
  const petitions = courses.filter(c => c.semester !== activeSemester);
  const displayedCourses = activeTab === 'expansion' ? expansionRequests : petitions;

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12 relative">
      
      {showLogoutPrompt && (
        <LogoutModal onCancel={() => setShowLogoutPrompt(false)} onConfirm={handleLogoutConfirm} />
      )}

      {decisionPopup.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{decisionPopup.course.course_code}</h3>
            <p className="text-sm text-gray-500 mb-4">{decisionPopup.course.description}</p>
            
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Message {decisionPopup.type === 'Approved' ? '(Optional)' : '(Required)'}
            </label>
            <input
              type="text"
              placeholder="Add remarks for the students..."
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value);
                if (e.target.value) setError('');
              }}
              className={`w-full p-3 border rounded-xl focus:outline-none mb-2 ${error ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
            />
            {error && <p className="text-red-500 text-xs mb-4 font-medium">{error}</p>}
            {!error && <div className="mb-6"></div>}
            
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setDecisionPopup({ isOpen: false, course: null, type: null });
                  setRemarks('');
                  setError('');
                }}
                disabled={isProcessing}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDecisionSubmit}
                disabled={isProcessing}
                className={`flex-1 py-3 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 ${decisionPopup.type === 'Approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {isProcessing ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <CoordinatorModal 
        selectedCourse={selectedCourse} 
        requestDetails={requestDetails} 
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
          onActionClick={handleActionClick}
        />
      </div>
    </div>
  );
}