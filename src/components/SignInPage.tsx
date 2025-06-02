// src/components/SignInPage.tsx
import React from 'react';

interface SignInPageProps {
  backendGoogleAuthUrl: string; // The URL to your backend's Google OAuth initiation endpoint
}

const SignInPage: React.FC<SignInPageProps> = ({ backendGoogleAuthUrl }) => {
  const handleGoogleSignInClick = () => {
    // When the button is clicked, redirect the browser to the backend's Google OAuth URL.
    // The backend will then handle the Google sign-in process and eventually
    // redirect back to the frontend (e.g., to http://localhost:3000/?auth_status=success)
    window.location.href = backendGoogleAuthUrl;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h1 className="text-4xl font-bold mb-8">Welcome to SCX</h1>
      <p className="text-lg text-gray-400 mb-10">Sign in to discover, create, and shop from engaging video content.</p>

      <div className="bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700">
        <h2 className="text-2xl font-semibold mb-6 text-center">Sign In</h2>
        <div className="flex justify-center">
          <button
            onClick={handleGoogleSignInClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg flex items-center justify-center space-x-2 transition duration-300 ease-in-out"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M12.24 10.27c.43-.88.75-1.92.75-3.04C13 5.48 11.83 4 10 4c-3.31 0-6 2.69-6 6s2.69 6 6 6c1.78 0 3.31-.77 4.4-1.99L18 16c-1.28 1.6-3.22 2.67-5.5 2.67C8.17 18.67 4 14.5 4 10S8.17 1.33 13 1.33c2.78 0 5.08 1.45 6.27 3.56L18 6l-.54-.54c-.6-.6-1.57-.96-2.58-.96-1.78 0-3.31.77-4.4 1.99L12.24 10.27z"
              />
              <path d="M12.24 10.27h.01zm-2.24 0h.01z" />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-6 text-center">
          By signing in, you agree to our Terms of Service.
        </p>
      </div>

      <p className="absolute bottom-4 text-gray-600">© 2025 SCX. All rights reserved.</p>
    </div>
  );
};

export default SignInPage;