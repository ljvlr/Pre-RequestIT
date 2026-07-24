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
  const [activeSemester, setActiveSemester] = useState('2nd');
  
  const [notifState, setNotifState] = useState({});
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  
  const [withdrawPopup, setWithdrawPopup] = useState({ isOpen: false, requestId: null });

  useEffect(() => {
    let subscription;

    const initializeDashboard = async () => {
      await fetchDashboardData();

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        subscription = supabase.channel('schema-db-changes')
          .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'requests', 
            filter: `profile_id=eq.${user.id}` 
          }, () => {
            fetchDashboardData();
          })
          .subscribe();
      }
    };

    initializeDashboard();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }

      const { data: settings } = await supabase.from('system_settings').select('active_semester').eq('id', 1).single();
      if (settings) setActiveSemester(settings.active_semester);

      const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: requestsData, error: requestsError } = await supabase
        .from('requests')
        .select(`id, preferred_schedule, status, remarks, courses (id, course_code, description, semester, requests)`)
        .eq('profile_id', user.id);

      if (requestsError) throw requestsError;

      const savedNotifs = JSON.parse(localStorage.getItem(`notifData_${user.id}`)) || {};
      let updatedNotifs = { ...savedNotifs };
      let hasChanges = false;

      requestsData.forEach(req => {
        if (req.status === 'Approved' || req.status === 'Rejected') {
          const existing = updatedNotifs[req.id];
          
          if (!existing || existing.status !== req.status) {
            updatedNotifs[req.id] = {
              status: req.status, 
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              ts: Date.now(),
              isRead: false,
              isDismissed: false
            };
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        localStorage.setItem(`notifData_${user.id}`, JSON.stringify(updatedNotifs));
      }

      setNotifState(updatedNotifs);
      setMyRequests(requestsData);

    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const notifications = myRequests
    .filter(req => (req.status === 'Approved' || req.status === 'Rejected') && notifState[req.id] && !notifState[req.id].isDismissed)
    .map(req => ({
      id: req.id,
      status: req.status,
      message: req.status === 'Rejected' 
        ? `Your petition for ${req.courses.course_code} was Rejected. Remarks: ${req.remarks}` 
        : `Your petition for ${req.courses.course_code} was Approved!`,
      time: notifState[req.id].time,
      ts: notifState[req.id].ts,
      isRead: notifState[req.id].isRead
    }))
    .sort((a, b) => b.ts - a.ts);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (reqId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const newData = {
        ...notifState,
        [reqId]: { ...notifState[reqId], isRead: true }
      };
      localStorage.setItem(`notifData_${user.id}`, JSON.stringify(newData));
      setNotifState(newData);
    }
  };

  const handleClearNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const newData = { ...notifState };
      notifications.forEach(n => {
        if (newData[n.id]) newData[n.id].isDismissed = true;
      });
      localStorage.setItem(`notifData_${user.id}`, JSON.stringify(newData));
      setNotifState(newData);
      setIsNotificationModalOpen(false);
    }
  };

  const initiateWithdraw = (requestId) => {
    setWithdrawPopup({ isOpen: true, requestId });
  };

  const confirmWithdraw = async () => {
    try {
      await supabase.from('requests').delete().eq('id', withdrawPopup.requestId);
      fetchDashboardData();
    } catch (error) {
      console.error(error.message);
    } finally {
      setWithdrawPopup({ isOpen: false, requestId: null });
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

      {withdrawPopup.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Withdrawal</h3>
            <p className="text-gray-500 mb-6 text-sm">Are you sure you want to withdraw from this request?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setWithdrawPopup({ isOpen: false, requestId: null })}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmWithdraw}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}

      {isNotificationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Notifications</h3>
              <button onClick={() => setIsNotificationModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="max-h-72 overflow-y-auto space-y-3 pr-2">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                  <p className="text-gray-500 text-sm">No new notifications</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    onClick={() => handleMarkAsRead(notif.id)}
                    className={`p-4 border rounded-xl shadow-sm cursor-pointer transition-colors ${
                      notif.isRead 
                        ? 'bg-white border-gray-200 opacity-80' 
                        : notif.status === 'Approved' 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {notif.status === 'Approved' ? (
                         <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${notif.isRead ? 'text-gray-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      ) : (
                         <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${notif.isRead ? 'text-gray-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className={`text-sm leading-snug pr-2 ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                            {notif.message}
                          </p>
                          {!notif.isRead && <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 flex-shrink-0"></span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {notifications.length > 0 && (
              <button 
                onClick={handleClearNotifications} 
                className="w-full mt-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
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
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Welcome, {profile?.full_name}!</h2>
          
          <button 
            onClick={() => setIsNotificationModalOpen(true)}
            className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] font-bold text-white items-center justify-center">
                  {unreadCount}
                </span>
              </span>
            )}
          </button>
        </div>

        {myRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 px-6 py-12 flex flex-col items-center justify-center text-center mt-4 shadow-sm">
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
                <RequestCard 
                  key={req.id} 
                  req={req} 
                  activeSemester={activeSemester}
                  onWithdraw={() => initiateWithdraw(req.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}