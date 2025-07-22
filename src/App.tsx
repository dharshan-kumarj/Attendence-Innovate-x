import { useState } from 'react';
import MobileBootcamp from './MobileBootcamp';
import { Login } from './components/ui/Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-900 gap-4">
      {!isLoggedIn ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="w-full">
          <div className="absolute top-4 right-4">
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
          <MobileBootcamp />
        </div>
      )}
    </div>
  );
}

export default App;
