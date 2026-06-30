export default function CoordinatorTable({ courses, activeTab, onRowDoubleClick }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm text-gray-600">
        <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 font-bold">Course Code</th>
            <th className="px-6 py-4 font-bold">Description</th>
            <th className="px-6 py-4 font-bold">Demand</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {courses.length > 0 ? courses.map(course => (
            <tr 
              key={course.id} 
              onDoubleClick={() => onRowDoubleClick(course)} 
              className="hover:bg-blue-50 cursor-pointer transition-colors group"
            >
              <td className="px-6 py-4 font-bold text-gray-900">{course.course_code}</td>
              <td className="px-6 py-4 text-xs">{course.description}</td>
              <td className="px-6 py-4 font-bold text-orange-600">{course.requests}</td>
            </tr>
          )) : (
            <tr>
              <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                No active {activeTab === 'expansion' ? 'expansion requests' : 'petitions'} currently require your attention.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}