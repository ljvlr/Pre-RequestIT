export default function RequestCard({ req, activeSemester, onWithdraw }) {
  const isOffSemester = req.courses.semester !== activeSemester;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-xl font-bold text-gray-900">{req.courses.course_code}</h4>
          <span className={`text-[11px] tracking-wide font-bold px-2.5 py-1 rounded uppercase ${isOffSemester ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-600'}`}>
            {isOffSemester ? 'Petition' : 'Expansion'}
          </span>
        </div>
        <p className="text-sm text-gray-500 uppercase">{req.courses.description}</p>
        
        <hr className="border-gray-100 my-4" />
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
            <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{req.courses.requests} total</span>
          </div>
          <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-md">
            Requested
          </span>
        </div>

        {req.status && (
          <p className="text-sm font-semibold mb-3 text-gray-800">
            Status: <span className={req.status === 'Rejected' ? 'text-red-600' : req.status === 'Approved' ? 'text-green-600' : 'text-gray-500'}>{req.status}</span>
          </p>
        )}
      </div>
      
      <button 
        onClick={onWithdraw}
        className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2.5 rounded-lg transition-colors text-sm"
      >
        Withdraw Request
      </button>
    </div>
  );
}