import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { authService } from '../../services/auth.service';

interface OtpVerificationProps {
  email: string;
  onVerify: (otp: string) => void;
  onResendOtp: () => void;
}

export const OtpVerification = ({ email, onVerify, onResendOtp }: OtpVerificationProps) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsResending(true);
    setError('');
    onVerify(otp);
  };


  try {
    await authService.verifyOTP(email, otp);
    onVerify(otp);
  } catch (error: any) {
    setError(error.message);
  } finally {
    setIsResending(false);
  }
};

  // const handleResend = async () => {
  //   setIsResending(true);
  //   await onResendOtp();
  //   setIsResending(false);
  // };
  const handleResendOTP = async () => {
    try {
      await authService.resendOTP(email);
      alert('New OTP sent successfully');
    } catch (error: any) {
      setError(error.message);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a verification code to {email}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <input
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter verification code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
            />
            {error && <p className="text-red-500 mb-4">{error}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isResending}
              className="text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
            >
              {isResending ? 'Sending...' : "Didn't receive the code? Resend"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};