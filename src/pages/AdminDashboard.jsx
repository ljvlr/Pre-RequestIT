import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import LogoutModal from '../components/LogoutModal';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [activeSemester, setActiveSemester] = useState('2nd');
  const [loading, setLoading] = useState(true);
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const { data: usersData } = await supabase.from('profiles').select('*').order('full_name');
    if (usersData) setUsers(usersData);

    const { data: settingsData } = await supabase.from('system_settings').select('active_semester').eq('id', 1).single();
    if (settingsData) setActiveSemester(settingsData.active_semester);
    
    setLoading(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    fetchDashboardData();
  };

  const handleSemesterChange = async (newSemester) => {
    await supabase.from('system_settings').update({ active_semester: newSemester }).eq('id', 1);
    setActiveSemester(newSemester);
    alert(`System successfully updated to ${newSemester} Semester.`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete data from previous semesters?')) {
      const { error } = await supabase.from('courses').delete().neq('semester', activeSemester);
      if (!error) alert('Previous semester data has been permanently deleted.');
    }
  };

  const handleLogoutConfirm = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading admin dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12 relative">
      {showLogoutPrompt && (
        <LogoutModal onCancel={() => setShowLogoutPrompt(false)} onConfirm={handleLogoutConfirm} />
      )}

      <Navbar 
        title="Pre-RequestIT (Admin)"
        navItems={[{ label: 'System Management', onClick: () => {}, isActive: true }]}
        onLogoutClick={() => setShowLogoutPrompt(true)}
      />

      <div className="max-w-6xl mx-auto p-6 mt-4 space-y-8">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Global System Settings</h2>
          <div className="flex items-center gap-4">
            <label className="font-semibold text-gray-700">Current Active Semester:</label>
            <select
              value={activeSemester}
              onChange={(e) => handleSemesterChange(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 font-medium rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 w-48"
            >
              <option value="1st">1st Semester</option>
              <option value="2nd">2nd Semester</option>
              <option value="Summer">Summer</option>
            </select>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">User Role Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Program</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{user.full_name}</td>
                    <td className="p-4 font-medium text-gray-900">{user.program}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <select
                        value={user.role || 'student'}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2"
                      >
                        <option value="student">Student</option>
                        <option value="coordinator">Coordinator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Archive Management</h2>
          <p className="text-gray-500 mb-6 text-sm">Manage database performance by permanently deleting petitions from previous semesters.</p>
          <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors">
            Delete Past Data
          </button>
        </div>

      </div>
    </div>
  );
}