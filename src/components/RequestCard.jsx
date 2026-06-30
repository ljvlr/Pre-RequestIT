export default function RequestCard({ req, activeSemester }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-gray-900 text-lg">{req.courses.course_code}</h4>
        <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-md uppercase tracking-wider">
          {req.courses.semester === activeSemester ? 'Expansion' : 'Petition'}
        </span>
      </div>
      <p className="text-sm text-gray-500 line-clamp-2 mb-4">{req.courses.description}</p>
      
      {req.preferred_schedule && (
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
          <span className="text-xs font-semibold text-gray-400 block mb-1 uppercase tracking-wide">My Schedule</span>
          <p className="text-sm text-gray-800 font-medium">{req.preferred_schedule}</p>
        </div>
      )}
      
      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
         <div className="flex items-center gap-1.5">
           <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
           </svg>
           <span className="text-sm font-bold text-black">{req.courses.requests} total</span>
         </div>
         <span className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-lg">Requested</span>
      </div>
    </div>
  );
}