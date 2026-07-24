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
            <div id="container" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div id="add-course-container" className="flex justify-end pt-6">
                    <button
                        id="add-course-button"
                        onClick={() => navigate('/admin/courses/0')}
                        className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700"
                    >
                        Add Course
                    </button>
                </div>

                <div id="courses-container" className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {courses.map(course => (
                        <div
                            key={course.id}
                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.45)]"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <h3 className="text-base font-semibold text-slate-900">{course.course_code}</h3>
                            </div>

                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{course.description}</p>

                            <div id="program-tags" className="mt-4 flex flex-wrap gap-2">
                                {(course.program ? course.program.split(",") : []).map(p => (
                                    <span
                                        key={p}
                                        className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700"
                                    >
                                        {p.trim()}
                                    </span>
                                ))}
                            </div>

                            <button
                                onClick={() => navigate(`/admin/courses/${course.id}`)}
                                className="mt-4 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                            >
                                Edit
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}