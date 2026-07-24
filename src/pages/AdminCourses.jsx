import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import LogoutModal from '../components/LogoutModal';

export default function AdminCourses() {
    const navigate = useNavigate();
    const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);


    async function fetchData() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/'); return; }

            const {data: coursesData, error: coursesError} = await supabase.from('courses').select('*');
            setCourses(coursesData);
        }
        catch (error) {
            console.error(error.message);
        } 
    }

    const handleLogoutConfirm = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };
            
    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-12 relative">
            {showLogoutPrompt && (
                <LogoutModal onCancel={() => setShowLogoutPrompt(false)} onConfirm={handleLogoutConfirm} />
                )}

            <Navbar 
                title="Pre-RequestIT (Admin)"
                navItems={[{ label: 'Users', onClick: () => {navigate('/admin');}, isActive: false },
                { label: 'Courses', onClick: () => {}, isActive: true },
                { label: 'Expansion/Petitions', onClick: () => {navigate('/admin/requests');}, isActive: false }
                ]}
                onLogoutClick={() => setShowLogoutPrompt(true)}
            />
            <div id="add-course-container" className="flex justify-end px-6 pt-6">
                <button
                    id="add-course-button"
                    onClick={() => navigate('/admin/courses/0')}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                    Add Course
                </button>
            </div>

            <div id="courses-container" className="mt-6 grid gap-4 px-6 md:grid-cols-2 xl:grid-cols-3">
                {courses.map(course => (
                    <div key={course.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900">{course.course_code}</h3>
                        <p className="mt-2 text-sm text-gray-600">{course.description}</p>

                        <div id="program-tags" className="mt-4 flex flex-wrap gap-2">
                            {course.program.split(",").map(p => (
                                <span key={p} className="mr-2 mt-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                                    {p.trim()}
                                </span>
                            ))}
                        </div>

                        <button
                            onClick={() => navigate(`/admin/courses/${course.id}`)}
                            className="mt-4 rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200"
                        >
                            Edit
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}