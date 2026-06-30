export default function Navbar({ title, navItems, onLogoutClick }) {
  return (
    <div className="bg-white px-6 py-4 flex items-center gap-6 sticky top-0 z-10 shadow-sm border-b border-gray-200">
      <h1 className="font-bold text-xl text-blue-600 mr-auto">{title}</h1>
      {navItems.map((item, index) => (
        <button
          key={index}
          onClick={item.onClick}
          className={`text-sm pb-1 transition-colors ${
            item.isActive 
              ? 'font-bold text-blue-600 border-b-2 border-blue-600' 
              : 'font-medium text-gray-500 hover:text-gray-800'
          }`}
        >
          {item.label}
        </button>
      ))}
      <button 
        onClick={onLogoutClick} 
        className="text-sm font-medium text-red-500 hover:underline pb-1 ml-4"
      >
        Logout
      </button>
    </div>
  );
}