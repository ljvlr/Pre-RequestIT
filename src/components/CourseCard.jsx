export default function CourseCard({ course, onActionClick }) {
  const hasRequests = course.requests > 0;
  const isDecided = course.overall_status && course.overall_status !== 'Pending';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm min-w-[260px] flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-xl font-bold text-gray-900">{course.course_code}</h4>
        </div>
        <p className="text-sm text-gray-500 uppercase h-10 overflow-hidden line-clamp-2">
          {course.description}
        </p>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900">{course.requests} requests</span>
          {isDecided && (
            <span className={`text-[10px] font-extrabold tracking-wide uppercase mt-1 ${course.overall_status === 'Approved' ? 'text-green-600' : 'text-red-600'}`}>
              {course.overall_status}
            </span>
          )}
        </div>
        <button 
          onClick={() => onActionClick(course)}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-1.5 px-5 rounded-lg transition-colors text-sm"
        >
          {hasRequests ? 'JOIN' : 'Initiate'}
        </button>
      </div>
    </div>
  );
}