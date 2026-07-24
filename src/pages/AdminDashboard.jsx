import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import LogoutModal from '../components/LogoutModal';
import YesNoModal from '../components/YesNoModal';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);
  const [showRoleChangePrompt, setShowRoleChangePrompt] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }

      const {data: usersData, error: usersError} = await supabase.from('profiles').select('*');

      const usersFromDB = usersData.map(user => ({
        ...user,
        originalRole: user.role,
      }));

      setUsers(usersFromDB);

      } catch (error) {
      console.error(error.message);
    } 
  };

  const handleLogoutConfirm = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleRoleChange = (id, newRole) => {
    setUsers(users =>
      users.map(user =>
        user.id === id
          ? { ...user, role: newRole }
          : user
      )
    );
  };

  const changeRole = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole, originalRole: newRole } : user
        )
      );
    } catch (error) {
      console.error('Error updating role:', error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12 relative">
      {showLogoutPrompt && (
            <LogoutModal onCancel={() => setShowLogoutPrompt(false)} onConfirm={handleLogoutConfirm} />
          )}

      <Navbar 
          title="Pre-RequestIT (Admin)"
          navItems={[{ label: 'Users', onClick: () => {}, isActive: true },
            { label: 'Courses', onClick: () => {navigate('/admin/courses');}, isActive: false },
            { label: 'Expansion/Petitions', onClick: () => {}, isActive: false }
          ]}
          onLogoutClick={() => setShowLogoutPrompt(true)}
        />

      {showRoleChangePrompt && (
        <YesNoModal 
          onCancel={() => setShowRoleChangePrompt(false)}
          onConfirm={() => {
            changeRole(selectedUser.id, selectedUser.role);
            setShowRoleChangePrompt(false);
          }}
          title={`Are you sure you want to change ${selectedUser?.full_name} role from ${selectedUser?.originalRole} to ${selectedUser?.role}?`}
        />
      )}

      <div className="mx-4 mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">Email</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">Student ID</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">Program</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">Role</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">Created At</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">{user.full_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{user.student_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{user.program}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="student">Student</option>
                      <option value="coordinator">Coordinator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(user.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded disabled:bg-gray-500 disabled:text-gray-300"
                      disabled={user.role === user.originalRole}
                      onClick={() => {
                        setSelectedUser(user);
                        setShowRoleChangePrompt(true);
                      }}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}