export default function CoordinatorTable({ courses, activeTab, onRowDoubleClick, onActionClick }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
          <tr>
            <th className="p-4 font-semibold">Course Code</th>
            <th className="p-4 font-semibold">Description</th>
            <th className="p-4 font-semibold">Demand</th>
            {activeTab === 'petitions' && <th className="p-4 font-semibold text-center">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {courses.map(course => (
            <tr 
              key={course.id} 
              onDoubleClick={() => onRowDoubleClick(course)}
              className="hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <td className="p-4 font-bold text-gray-900">{course.course_code}</td>
              <td className="p-4 text-gray-500">{course.description}</td>
              <td className="p-4 font-bold text-orange-600">{course.requests}</td>
              {activeTab === 'petitions' && (
                <td className="p-4 flex justify-center gap-2">
                  {course.overall_status === 'Pending' ? (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onActionClick(course, 'Approved'); }}
                        className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 px-4 py-1.5 rounded-lg font-semibold text-xs transition-colors"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onActionClick(course, 'Rejected'); }}
                        className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 px-4 py-1.5 rounded-lg font-semibold text-xs transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className={`px-4 py-1.5 rounded-lg font-semibold text-xs ${course.overall_status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {course.overall_status}
                    </span>
                  )}
                </td>
              )}
            </tr>
          ))}
          {courses.length === 0 && (
            <tr>
              <td colSpan={activeTab === 'petitions' ? 4 : 3} className="p-8 text-center text-gray-500">
                No active {activeTab} found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}