export default function CoordinatorModal({ selectedCourse, requestDetails, activeSemester, onClose }) {
  if (!selectedCourse) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-4xl">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedCourse.course_code}</h3>
        <p className="text-gray-500 mb-6">{selectedCourse.description}</p>
        
        <div className="flex items-center gap-2 mb-6">
          <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold">Total Demand: {selectedCourse.requests}</span>
        </div>
        
        {selectedCourse.semester === activeSemester ? (
          <>
            <h4 className="font-semibold text-gray-800 mb-3 border-b pb-2">Student Request Details</h4>
            <div className="max-h-96 overflow-y-auto mb-6 hide-scrollbar border border-gray-200 rounded-xl">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-bold">Student Name</th>
                    <th className="px-4 py-3 font-bold">Email Address</th>
                    <th className="px-4 py-3 font-bold">Program</th>
                    <th className="px-4 py-3 font-bold">Preferred Schedule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requestDetails.length > 0 ? (
                    requestDetails.map((req, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-900 font-medium">{req.profiles?.full_name}</td>
                        <td className="px-4 py-3">{req.profiles?.email}</td>
                        <td className="px-4 py-3 font-semibold">{req.profiles?.program}</td>
                        <td className="px-4 py-3">
                          {req.preferred_schedule ? req.preferred_schedule : <span className="text-gray-400 italic">None provided</span>}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-gray-500 italic">
                        Loading student details...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 italic mb-6">Decision controls for Off-Semester Petitions will be available in Sprint 3.</p>
        )}

        <button onClick={onClose} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors">Close View</button>
      </div>
    </div>
  );
}