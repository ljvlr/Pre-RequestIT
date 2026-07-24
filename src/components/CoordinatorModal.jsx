export default function CoordinatorModal({ selectedCourse, requestDetails, onClose }) {
  if (!selectedCourse) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{selectedCourse.course_code}</h3>
            <p className="text-gray-500">{selectedCourse.description}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="mb-2">
          <h4 className="font-semibold text-gray-800 mb-3">Requesting Students ({requestDetails.length})</h4>
          <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-3 font-semibold">Name</th>
                  <th className="p-3 font-semibold">Program</th>
                  <th className="p-3 font-semibold">Preferred Schedule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requestDetails.map((req, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="p-3 text-gray-900">{req.profiles.full_name}</td>
                    <td className="p-3 text-gray-600">{req.profiles.program}</td>
                    <td className="p-3 text-gray-600">{req.preferred_schedule || 'None provided'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}