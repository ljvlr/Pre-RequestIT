import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import LogoutModal from '../components/LogoutModal';
import YesNoModal from '../components/YesNoModal';

export default function AddEditCourse() {
    const navigate = useNavigate();
    const { id = 0 } = useParams();
    const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [course, setCourse] = useState({
        course_code: '',
        description: '',
        program: '',
        semester: '',
        requests: 0,
        status: 'active',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (id != 0) {
            fetchData();
        }
    }, []);


    async function fetchData() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/'); return; }

            const { data, error } = await supabase
                .from("courses")
                .select("*")
                .eq("id", id)
                .single();

            if (!error) {
                setCourse(data);
                setIsEdit(true);
            }
        }
        catch (error) {
            console.error(error.message);
        } 
    }

    const programOptions = ['BSCS', 'BSIT', 'BSIS'];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCourse((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleProgramToggle = (programName) => {
        setCourse((prev) => {
            const selectedPrograms = prev.program
                ? prev.program.split(',').map((p) => p.trim()).filter(Boolean)
                : [];

            const updatedPrograms = selectedPrograms.includes(programName)
                ? selectedPrograms.filter((p) => p !== programName)
                : [...selectedPrograms, programName];

            return {
                ...prev,
                program: updatedPrograms.join(', '),
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!course.course_code.trim() || !course.description.trim() || !course.program.trim() || !course.semester) {
            alert('Please fill in all fields.');
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                course_code: course.course_code.trim(),
                description: course.description.trim(),
                program: course.program.trim(),
                semester: course.semester,
                requests: course.requests ?? 0,
                status: course.status ?? 'active',
            };

            const { error } = isEdit
                ? await supabase
                    .from('courses')
                    .update(payload)
                    .eq('id', id)
                : await supabase
                    .from('courses')
                    .insert([payload]);

            if (error) throw error;

            navigate('/admin/courses');
        } catch (error) {
            console.error(error.message);
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                { label: 'Courses', onClick: () => {navigate('/admin/courses');}, isActive: true },
                { label: 'Expansion/Petitions', onClick: () => {navigate('/admin/requests');}, isActive: false }
                ]}
                onLogoutClick={() => setShowLogoutPrompt(true)}
            />

            <form id="add-edit-course-form" className="mx-auto mt-6 max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Course Code</label>
                        <input
                            type="text"
                            name="course_code"
                            value={course.course_code}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            value={course.description}
                            onChange={handleInputChange}
                            rows="4"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Program</label>
                        <div className="flex flex-wrap gap-4">
                            {programOptions.map((programName) => {
                                const isChecked = course.program
                                    .split(',')
                                    .map((p) => p.trim())
                                    .includes(programName);

                                return (
                                    <label key={programName} className="flex items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => handleProgramToggle(programName)}
                                        />
                                        {programName}
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Semester</label>
                        <select
                            name="semester"
                            value={course.semester}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        >
                            <option value="">Select semester</option>
                            <option value="1st">1st</option>
                            <option value="2nd">2nd</option>
                            <option value="Summer">Summer</option>
                        </select>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            {isSubmitting ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Edit Course' : 'Add Course')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
        
    );
}