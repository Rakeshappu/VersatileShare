import React from 'react';

interface GoogleLoginButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const GoogleLoginButton = ({ onClick, disabled }: GoogleLoginButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex justify-center items-center space-x-2 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* Use an img tag for the Google logo instead */}
      <img 
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google"
        className="w-5 h-5"
      />
      <span>{disabled ? 'Signing in...' : 'Continue with Google'}</span>
    </button>
  );
}