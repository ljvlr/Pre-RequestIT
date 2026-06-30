export default function CourseCard({ course, onActionClick }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-48 min-w-[200px]">
      <h3 className="font-bold text-gray-900 text-lg">{course.course_code}</h3>
      <p className="text-sm text-gray-500 mt-1 line-clamp-2 mb-auto">{course.description}</p>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <span className="text-sm font-bold text-black">{course.requests} requests</span>
        <button 
          onClick={() => onActionClick(course)}
          className="bg-green-400 hover:bg-green-500 text-grey-950 text-sm font-bold px-5 py-2 rounded-xl transition-colors"
        >
          {course.requests > 0 ? 'JOIN' : 'Initiate'}
        </button>
      </div>
    </div>
  );
}