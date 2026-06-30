export default function LogoutModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Logout from System?</h3>
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
          >
            No
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}