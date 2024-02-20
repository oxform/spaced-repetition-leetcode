import React, { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { doSignOut } from '../auth/firebase/auth';

const Header = () => {
  const [redirectTo, setRedirectTo] = useState(null);
  const { userLoggedIn } = useAuth();

  const handleLogout = async () => {
    await doSignOut();
    setRedirectTo('/sign_in');
  };

  if (redirectTo) {
    return <Redirect to={redirectTo} />
  }

  return (
    <nav className="flex flex-row gap-x-2 w-full z-20 fixed top-0 left-0 h-12 border-b place-content-center items-center bg-gray-200">
      {
        userLoggedIn
          ? (
            <>
              <button onClick={handleLogout} className="text-sm text-blue-600 underline">Logout</button>
            </>
          )
          : (
            <>
              <Link className="text-sm text-blue-600 underline" to="/sign_in">Login</Link>
              <Link className="text-sm text-blue-600 underline" to="/sign_up">Register New Account</Link>
            </>
          )
      }
    </nav>
  );
};

export default Header;