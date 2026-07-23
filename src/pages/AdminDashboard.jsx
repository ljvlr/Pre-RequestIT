import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import LogoutModal from '../components/LogoutModal';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }

      const {data: usersData, error: usersError} = await supabase.from('profiles').select('*');
      setUsers(usersData);

      } catch (error) {
      console.error(error.message);
    } 
  };

  const handleLogoutConfirm = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
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
            { label: 'Courses', onClick: () => {}, isActive: false },
            { label: 'Expansion/Petitions', onClick: () => {}, isActive: false }
          ]}
          onLogoutClick={() => setShowLogoutPrompt(true)}
        />

        <table border="1">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Student ID</th>
              <th>Program</th>
              <th>Role</th>
              <th>Created At</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>{user.student_id}</td>
                <td>{user.program}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="student">Student</option>
                    <option value="coordinator">Coordinator</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>{new Date(user.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      
    </div>
  );
}