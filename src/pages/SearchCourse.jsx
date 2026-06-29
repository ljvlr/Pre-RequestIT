import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function SearchCourse() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('course_code', { ascending: true });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const filteredCourses = courses.filter(course => 
    course.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const CourseCard = ({ course }) => (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col justify-between border border-gray-100">
      <div>
        <h3 className="font-bold text-gray-800 text-sm">{course.course_code}</h3>
        <p className="text-xs text-gray-500 mt-1">{course.description}</p>
        <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md">
          {course.program} | {course.semester} Sem
        </span>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-gray-50 min-h-screen pb-6 font-sans">
      <div className="bg-white p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <h1 className="font-bold text-lg text-gray-800">Available Courses</h1>
        <button onClick={handleLogout} className="text-sm text-red-500 hover:underline font-medium">
          Log Out
        </button>
      </div>

      <div className="p-4">
        <input 
          type="text" 
          placeholder="Search by course code or description..." 
          className="w-full py-3 px-4 rounded-xl border border-gray-200 outline-none text-sm bg-white focus:border-blue-500 shadow-sm transition-colors"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-500 mt-10">Loading curriculum...</p>
      ) : (
        <div className="px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCourses.length > 0 ? (
            filteredCourses.map(course => <CourseCard key={course.id} course={course} />)
          ) : (
            <p className="text-sm text-gray-400 italic">No courses match your search.</p>
          )}
        </div>
      )}
    </div>
  );
}