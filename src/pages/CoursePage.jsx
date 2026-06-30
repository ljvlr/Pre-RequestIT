import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import LogoutModal from '../components/LogoutModal';
import CourseCard from '../components/CourseCard';

export default function SearchCourse() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);
  const [viewAllCategory, setViewAllCategory] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [preferredSchedule, setPreferredSchedule] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ACTIVE_SEMESTER = '2nd';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .ilike('program', `%${profileData.program}%`)
        .order('requests', { ascending: false });

      if (coursesError) throw coursesError;
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

  const handleActionClick = (course) => {
    setSelectedCourse(course);
    setPreferredSchedule('');
  };

  const handleCancel = () => {
    setSelectedCourse(null);
    setPreferredSchedule('');
  };

  const handleContinue = async () => {
    if (!selectedCourse || !profile) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('requests')
        .insert([
          {
            profile_id: profile.id,
            course_id: selectedCourse.id,
            preferred_schedule: preferredSchedule
          }
        ]);

      if (error) {
        if (error.code === '23505') {
          alert('You have already submitted a request for this course.');
        } else {
          throw error;
        }
      } else {
        alert('Successfully joined the petition.');
        navigate('/dashboard');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
      setSelectedCourse(null);
    }
  };

  const filteredCourses = courses.filter(course => 
    course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const expansionRequests = filteredCourses.filter(c => c.semester === ACTIVE_SEMESTER);
  const offSemesterPetitions = filteredCourses.filter(c => c.semester !== ACTIVE_SEMESTER);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading courses...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-gray-50 min-h-screen font-sans relative pb-12 shadow-sm border-x border-gray-200">
      
      {showLogoutPrompt && (
        <LogoutModal 
          onCancel={() => setShowLogoutPrompt(false)} 
          onConfirm={handleLogoutConfirm} 
        />
      )}

      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedCourse.course_code}</h3>
            <p className="text-sm text-gray-500 mb-4">{selectedCourse.description}</p>
            
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Preferred Schedule (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. MWF 9:00AM - 10:30AM"
              value={preferredSchedule}
              onChange={(e) => setPreferredSchedule(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 mb-6"
            />
            
            <div className="flex gap-3">
              <button 
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleContinue}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:bg-blue-400"
              >
                {isSubmitting ? 'Saving...' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Navbar 
        title="Pre-RequestIT"
        navItems={[
          { label: 'My Requests', onClick: () => navigate('/dashboard'), isActive: false },
          { label: 'Courses', onClick: () => {}, isActive: true }
        ]}
        onLogoutClick={() => setShowLogoutPrompt(true)}
      />

      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Discover Courses</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search course code or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-300 pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      {!viewAllCategory ? (
        <>
          <div className="px-6 py-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Expansion Request</h2>
              <button onClick={() => setViewAllCategory('expansion')} className="text-sm font-semibold text-blue-600 hover:underline">see all</button>
            </div>
            
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
              {expansionRequests.length > 0 ? expansionRequests.map(course => (
                <div key={course.id} className="snap-start">
                  <CourseCard course={course} onActionClick={handleActionClick} />
                </div>
              )) : (
                <p className="text-sm text-gray-500 w-full py-4 bg-white rounded-xl text-center border border-gray-200">No expansion courses match your search.</p>
              )}
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Petitions</h2>
              <button onClick={() => setViewAllCategory('petitions')} className="text-sm font-semibold text-blue-600 hover:underline">see all</button>
            </div>
            
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
              {offSemesterPetitions.length > 0 ? offSemesterPetitions.map(course => (
                <div key={course.id} className="snap-start">
                  <CourseCard course={course} onActionClick={handleActionClick} />
                </div>
              )) : (
                <p className="text-sm text-gray-500 w-full py-4 bg-white rounded-xl text-center border border-gray-200">No petition courses match your search.</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="px-6 py-2">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => setViewAllCategory(null)}
              className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-semibold bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to categories
            </button>
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {viewAllCategory === 'expansion' ? 'All Expansion Requests' : 'All Petitions'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(viewAllCategory === 'expansion' ? expansionRequests : offSemesterPetitions).length > 0 ? (
              (viewAllCategory === 'expansion' ? expansionRequests : offSemesterPetitions).map(course => (
                <CourseCard key={course.id} course={course} onActionClick={handleActionClick} />
              ))
            ) : (
              <p className="text-sm text-gray-500 col-span-full text-center py-8 bg-white rounded-xl border border-gray-200">
                No courses match your search in this category.
              </p>
            )}
          </div>
        </div>
      )}
      
    </div>
  );
}